// Tokenverbrauch der laufenden Partie auswerten.
//
// Die Zuordnung Spieler -> Session kommt aus state.json: jeder MoveRecord traegt
// in "by" die verkuerzte Session-ID der Instanz, die den Zug gemacht hat. Damit
// laesst sich das passende Transkript unter ~/.claude/projects/ finden.
//
// Gezaehlt wird nur, was NACH dem Partiestart liegt. Die Sessions haben eine
// Vorgeschichte (Loop einrichten, Skill laden), die nicht zur Partie gehoert.

import { homedir } from 'node:os';
import { join } from 'node:path';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';

import { loadState, hasState } from './state.ts';

interface Verbrauch {
  aufrufe: number;
  output: number;
  frischerInput: number;
  cacheNeu: number;
  cacheGelesen: number;
}

function leer(): Verbrauch {
  return { aufrufe: 0, output: 0, frischerInput: 0, cacheNeu: 0, cacheGelesen: 0 };
}

function projektWurzel(): string {
  return join(homedir(), '.claude', 'projects');
}

/** Sucht das Transkript zu einer verkuerzten Session-ID. */
function findeTranskript(kurzId: string): string | null {
  const wurzel = projektWurzel();
  if (!existsSync(wurzel)) return null;

  for (const projekt of readdirSync(wurzel)) {
    const dir = join(wurzel, projekt);
    try {
      if (!statSync(dir).isDirectory()) continue;
      for (const datei of readdirSync(dir)) {
        if (datei.startsWith(kurzId) && datei.endsWith('.jsonl')) {
          return join(dir, datei);
        }
      }
    } catch {
      // Unlesbares Projektverzeichnis ueberspringen.
    }
  }
  return null;
}

/** Summiert die Usage aller Assistant-Nachrichten ab einem Zeitpunkt. */
function auswerten(pfad: string, abIso: string, verlauf?: number[]): Verbrauch {
  const ab = Date.parse(abIso);
  const v = leer();

  const zeilen = readFileSync(pfad, 'utf8').split('\n');
  for (const zeile of zeilen) {
    if (!zeile.trim()) continue;
    let e: {
      type?: string;
      timestamp?: string;
      message?: { usage?: Record<string, number> };
    };
    try {
      e = JSON.parse(zeile);
    } catch {
      continue;
    }

    if (e.type !== 'assistant') continue;
    const u = e.message?.usage;
    if (!u) continue;
    if (e.timestamp && Date.parse(e.timestamp) < ab) continue;

    v.aufrufe += 1;
    v.output += u.output_tokens ?? 0;
    v.frischerInput += u.input_tokens ?? 0;
    v.cacheNeu += u.cache_creation_input_tokens ?? 0;
    v.cacheGelesen += u.cache_read_input_tokens ?? 0;
    if (verlauf) verlauf.push(u.cache_read_input_tokens ?? 0);
  }
  return v;
}

/** Mittelwert eines Ausschnitts, zum Sichtbarmachen des Kontextwachstums. */
function mittel(werte: number[], von: number, bis: number): number {
  const teil = werte.slice(von, bis);
  if (teil.length === 0) return 0;
  return Math.round(teil.reduce((a, b) => a + b, 0) / teil.length);
}

function n(x: number): string {
  return x.toLocaleString('de-DE');
}

// ---------------------------------------------------------------------------

if (!hasState()) {
  console.log('  Keine laufende Partie.');
  process.exit(0);
}

const state = loadState();

// Spieler -> Session-ID aus dem Zugprotokoll
const sitze = new Map<number, string>();
for (const m of state.history) {
  if (m.by && m.by !== 'unbekannt') sitze.set(m.player, m.by);
}

if (sitze.size === 0) {
  console.log('  Noch keine Zuege mit erkennbarer Session. Nichts auszuwerten.');
  process.exit(0);
}

const gesamt = leer();
const zeilen: string[] = [];
const alleVerlaeufe: number[][] = [];

console.log('');
console.log(`  Tokenverbrauch - Partie seit ${new Date(state.startedAt).toLocaleString('de-DE')}`);
console.log(`  Stand: Zug ${state.moveNumber}${state.winner ? `, Sieger Spieler ${state.winner}` : ''}`);
console.log('');

for (const [spieler, kurzId] of [...sitze].sort((a, b) => a[0] - b[0])) {
  const pfad = findeTranskript(kurzId);
  const zuege = state.history.filter((m) => m.player === spieler).length;

  if (!pfad) {
    zeilen.push(`  Spieler ${spieler} (${kurzId}): Transkript nicht gefunden`);
    continue;
  }

  const verlauf: number[] = [];
  const v = auswerten(pfad, state.startedAt, verlauf);
  alleVerlaeufe.push(verlauf);
  gesamt.aufrufe += v.aufrufe;
  gesamt.output += v.output;
  gesamt.frischerInput += v.frischerInput;
  gesamt.cacheNeu += v.cacheNeu;
  gesamt.cacheGelesen += v.cacheGelesen;

  const name = state.seats[spieler] ?? '';
  zeilen.push(`  Spieler ${spieler}  ${name}  (Session ${kurzId})`);
  zeilen.push(`    Züge gemacht    ${String(zuege).padStart(9)}`);
  zeilen.push(`    Modellaufrufe   ${String(v.aufrufe).padStart(9)}   ${zuege > 0 ? `(${(v.aufrufe / zuege).toFixed(1)} je Zug)` : ''}`);
  zeilen.push(`    Output          ${n(v.output).padStart(9)}   ${zuege > 0 ? `(${Math.round(v.output / zuege)} je Zug)` : ''}`);
  zeilen.push(`    Input frisch    ${n(v.frischerInput).padStart(9)}`);
  zeilen.push(`    Cache neu       ${n(v.cacheNeu).padStart(9)}`);
  zeilen.push(`    Cache gelesen   ${n(v.cacheGelesen).padStart(9)}`);
  zeilen.push('');
}

console.log(zeilen.join('\n'));

const abrechenbar = gesamt.output + gesamt.frischerInput + gesamt.cacheNeu;
console.log('  Gesamt');
console.log(`    Modellaufrufe   ${String(gesamt.aufrufe).padStart(9)}`);
console.log(`    Output          ${n(gesamt.output).padStart(9)}`);
console.log(`    Input frisch    ${n(gesamt.frischerInput).padStart(9)}`);
console.log(`    Cache neu       ${n(gesamt.cacheNeu).padStart(9)}`);
console.log(`    Cache gelesen   ${n(gesamt.cacheGelesen).padStart(9)}   (guenstigster Anteil)`);
console.log(`    Summe roh       ${n(abrechenbar + gesamt.cacheGelesen).padStart(9)}`);
console.log('');

// Kontextwachstum. Das ist der eigentliche Kostentreiber: jeder Loop-Durchlauf
// haengt an die Session an, und jeder Modellaufruf liest den gewachsenen
// Kontext komplett aus dem Cache.
const zusammen = alleVerlaeufe.flat();
if (zusammen.length >= 30) {
  const ersten = mittel(zusammen, 0, 20);
  const letzten = mittel(zusammen, zusammen.length - 20, zusammen.length);
  console.log('  Kontextwachstum (cache_read je Aufruf)');
  console.log(`    erste 20        ${n(ersten).padStart(9)}`);
  console.log(`    letzte 20       ${n(letzten).padStart(9)}`);
  if (ersten > 0) {
    console.log(`    Faktor          ${(letzten / ersten).toFixed(1).padStart(9)}x`);
  }
  console.log('');
}

if (state.moveNumber > 0 && !state.winner) {
  const proZug = (abrechenbar + gesamt.cacheGelesen) / state.moveNumber;
  const rest = Math.max(0, 104 - state.moveNumber);
  console.log('  Hochrechnung (Messlatte: 104 Züge aus dem Minimax-Selbstspiel)');
  console.log(`    je Zug bisher   ${n(Math.round(proZug)).padStart(9)}`);
  console.log(`    noch offen      ${String(rest).padStart(9)} Züge`);
  console.log(`    linear          ${n(Math.round(proZug * 104)).padStart(9)}   UNTERGRENZE`);
  console.log('');
  console.log('    Die lineare Rechnung unterschätzt, weil der Kontext mit jedem Zug wächst');
  console.log('    und jeder Aufruf ihn komplett liest - der Verbrauch steigt quadratisch.');
  console.log('    Nach oben begrenzt wird das nur durch die Kompaktierung, die greift,');
  console.log('    sobald eine Session an ihr Kontextfenster stößt. Wann das passiert und');
  console.log('    wie viel es einspart, ist hier nicht gemessen.');
  console.log('');
}
