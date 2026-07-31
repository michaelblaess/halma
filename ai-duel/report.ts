// Auswertung einer gespielten Partie.
//
// Liest den Zustand (laufend oder archiviert) und erhebt Kennzahlen zum
// Spielverlauf: Zugarten, Ketteneffizienz, Fortschritt ueber die Zeit und
// Taktung. Der Tokenverbrauch steckt in tokens.ts, weil er aus einer anderen
// Quelle stammt.
//
// Aufruf:
//   npx tsx ai-duel/report.ts                 laufende Partie
//   npx tsx ai-duel/report.ts <pfad.json>     archivierte Partie

import { readFileSync } from 'node:fs';
import { getGoalZone, createInitialBoard, deserializeBoard } from '../src/model/board.ts';
import { applyMove } from '../src/model/gameLogic.ts';
import type { Player } from '../src/model/types.ts';
import { statePath, type DuelState, type MoveRecord } from './state.ts';

const pfad = process.argv[2] ?? statePath();
const state = JSON.parse(readFileSync(pfad, 'utf8')) as DuelState;

function n(x: number): string {
  return x.toLocaleString('de-DE');
}

function zeile(label: string, ...werte: (string | number)[]): void {
  console.log(`  ${label.padEnd(26)}${werte.map((w) => String(w).padStart(12)).join('')}`);
}

// ---------------------------------------------------------------------------
// Kennzahlen je Spieler
// ---------------------------------------------------------------------------

interface Stat {
  zuege: number;
  schritte: number;
  einzelspruenge: number;
  ketten: number;
  spruengeGesamt: number;
  laengsteKette: number;
  reihenFortschritt: number;
  begruendungLaenge: number;
}

function leer(): Stat {
  return {
    zuege: 0, schritte: 0, einzelspruenge: 0, ketten: 0,
    spruengeGesamt: 0, laengsteKette: 0, reihenFortschritt: 0, begruendungLaenge: 0,
  };
}

/** Reihengewinn in Zielrichtung. Spieler 1 will groessere Reihen, Spieler 2 kleinere. */
function fortschritt(m: MoveRecord): number {
  const von = Number(m.from.split(',')[0]);
  const nach = Number(m.to.split(',')[0]);
  return m.player === 1 ? nach - von : von - nach;
}

const stats = new Map<number, Stat>();
for (const p of state.players) stats.set(p, leer());

for (const m of state.history) {
  const s = stats.get(m.player);
  if (!s) continue;
  s.zuege += 1;
  if (m.jumps === 0) s.schritte += 1;
  else if (m.jumps === 1) s.einzelspruenge += 1;
  else s.ketten += 1;
  s.spruengeGesamt += m.jumps;
  s.laengsteKette = Math.max(s.laengsteKette, m.jumps);
  s.reihenFortschritt += fortschritt(m);
  s.begruendungLaenge += (m.why ?? '').length;
}

// ---------------------------------------------------------------------------
// Ausgabe
// ---------------------------------------------------------------------------

const start = Date.parse(state.startedAt);
const ende = state.history.length > 0 ? Date.parse(state.history[state.history.length - 1].ts) : start;
const dauerMin = (ende - start) / 60000;

console.log('');
console.log('  Partieauswertung');
console.log(`  ${new Date(start).toLocaleString('de-DE')} bis ${new Date(ende).toLocaleString('de-DE')}`);
console.log('');
zeile('', 'Spieler 1', 'Spieler 2');
console.log('  ' + '-'.repeat(50));

const p1 = stats.get(1) ?? leer();
const p2 = stats.get(2) ?? leer();

zeile('Züge', p1.zuege, p2.zuege);
zeile('davon Schritte', p1.schritte, p2.schritte);
zeile('davon 1 Sprung', p1.einzelspruenge, p2.einzelspruenge);
zeile('davon Ketten', p1.ketten, p2.ketten);
zeile('Sprünge gesamt', p1.spruengeGesamt, p2.spruengeGesamt);
zeile('längste Kette', p1.laengsteKette, p2.laengsteKette);
zeile('Reihengewinn netto', p1.reihenFortschritt, p2.reihenFortschritt);
zeile(
  'Reihen je Zug',
  p1.zuege ? (p1.reihenFortschritt / p1.zuege).toFixed(2) : '-',
  p2.zuege ? (p2.reihenFortschritt / p2.zuege).toFixed(2) : '-',
);
zeile(
  'Begründung Ø Zeichen',
  p1.zuege ? Math.round(p1.begruendungLaenge / p1.zuege) : '-',
  p2.zuege ? Math.round(p2.begruendungLaenge / p2.zuege) : '-',
);

console.log('');
console.log('  Ergebnis');
console.log(`    Sieger          ${state.winner ? `Spieler ${state.winner} (${state.seats[state.winner] ?? ''})` : 'offen'}`);
console.log(`    Züge gesamt     ${state.moveNumber}`);
console.log(`    Dauer           ${dauerMin.toFixed(0)} Minuten (${(state.moveNumber / dauerMin).toFixed(2)} Züge/Minute)`);

// ---------------------------------------------------------------------------
// Wann kamen die Steine ins Ziel
// ---------------------------------------------------------------------------

console.log('');
console.log('  Zieleinläufe (Zugnummer, ab der n Steine im Ziel standen)');

{
  // Das Brett wird Zug fuer Zug nachgespielt und nach jedem Zug ausgezaehlt.
  // Ein blosses Mitzaehlen der Zuege MIT Ziel im Zielfeld waere falsch, weil
  // Steine sich innerhalb der Zielzone weiterbewegen duerfen und dann doppelt
  // gezaehlt wuerden.
  let brett = deserializeBoard(createInitialBoard(state.playerCount));
  const marken = new Map<number, number[]>();
  for (const p of state.players) marken.set(p, []);

  for (const m of state.history) {
    brett = applyMove(brett, m.from, m.to);
    for (const p of state.players) {
      const goal = getGoalZone(p as Player);
      let drin = 0;
      for (const pos of goal) {
        if (brett.get(pos) === p) drin++;
      }
      const liste = marken.get(p)!;
      while (liste.length < drin) liste.push(m.n);
    }
  }

  for (const p of state.players) {
    const liste = marken.get(p)!;
    const auszug = [1, 3, 5, 7, 9, 10]
      .filter((k) => liste.length >= k)
      .map((k) => `${k}: Zug ${String(liste[k - 1]).padStart(3)}`)
      .join('  ');
    console.log(`    Spieler ${p}  ${auszug || 'keiner'}`);
  }
}

// ---------------------------------------------------------------------------
// Taktung
// ---------------------------------------------------------------------------

const abstaende: number[] = [];
for (let i = 1; i < state.history.length; i++) {
  abstaende.push((Date.parse(state.history[i].ts) - Date.parse(state.history[i - 1].ts)) / 1000);
}
if (abstaende.length > 0) {
  const sortiert = [...abstaende].sort((a, b) => a - b);
  const median = sortiert[Math.floor(sortiert.length / 2)];
  console.log('');
  console.log('  Taktung zwischen zwei Zügen');
  console.log(`    Median          ${median.toFixed(0)} s`);
  console.log(`    kürzester       ${sortiert[0].toFixed(0)} s`);
  console.log(`    längster        ${sortiert[sortiert.length - 1].toFixed(0)} s`);
  console.log(`    unter 10 s      ${n(abstaende.filter((a) => a < 10).length)} von ${n(abstaende.length)}`);
}

console.log('');
