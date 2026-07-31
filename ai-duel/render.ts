// ANSI-Renderer fuer das Sternbrett.
//
// Die 17 Reihen werden ueber getGx() eingerueckt: gx laeuft von 0 bis 12 in
// halben Schritten, ein halber Schritt ist ein Zeichen. Das Brett ist damit
// 25 Zeichen breit und behaelt die Sternform.

import type { CellState, Player } from '../src/model/types.ts';
import { ROW_SIZE, getGx, posId, getGoalZone } from '../src/model/board.ts';
import type { DuelState, MoveRecord } from './state.ts';

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';

// Spieler 1 = Nord (rot), Spieler 2 = Sued (cyan)
const FARBE: Record<number, string> = {
  1: '\x1b[38;5;203m',
  2: '\x1b[38;5;80m',
};
const GRAU = '\x1b[38;5;240m';
const GELB = '\x1b[38;5;221m';

export function renderBoard(state: DuelState, board: Map<string, CellState>): string {
  const letzter = state.history[state.history.length - 1];
  const hervor = new Set<string>(letzter ? letzter.path : []);
  const ziel = letzter ? letzter.to : null;

  const goal1 = getGoalZone(1);
  const goal2 = getGoalZone(2);

  const zeilen: string[] = [];

  for (let row = 0; row < 17; row++) {
    // Zeichenpuffer fuer die Zeile, 25 Spalten breit
    const puffer: string[] = new Array(25).fill(' ');

    for (let col = 0; col < ROW_SIZE[row]; col++) {
      const id = posId(row, col);
      const spalte = Math.round(getGx(row, col) * 2);
      const wert = board.get(id) ?? 0;

      puffer[spalte] = zelle(id, wert, hervor, ziel, goal1, goal2);
    }

    zeilen.push('  ' + puffer.join('').replace(/\s+$/, ''));
  }

  return zeilen.join('\n');
}

function zelle(
  id: string,
  wert: CellState,
  hervor: Set<string>,
  ziel: string | null,
  goal1: Set<string>,
  goal2: Set<string>,
): string {
  if (wert === 0) {
    // Leeres Feld. Zielzonen bleiben schwach sichtbar, damit man den
    // Fortschritt beider Seiten am Brett ablesen kann.
    if (goal1.has(id)) return `${DIM}${FARBE[1]}·${RESET}`;
    if (goal2.has(id)) return `${DIM}${FARBE[2]}·${RESET}`;
    return `${GRAU}·${RESET}`;
  }

  const farbe = FARBE[wert] ?? '';
  const imZiel = (wert === 1 && goal1.has(id)) || (wert === 2 && goal2.has(id));

  if (id === ziel) {
    // Landefeld des letzten Zugs
    return `${GELB}${BOLD}◉${RESET}`;
  }
  if (hervor.has(id)) {
    return `${GELB}●${RESET}`;
  }
  if (imZiel) {
    return `${farbe}${BOLD}●${RESET}`;
  }
  return `${farbe}●${RESET}`;
}

export function renderHeader(state: DuelState): string {
  if (state.winner) {
    const name = state.seats[state.winner] ?? `Spieler ${state.winner}`;
    return `${BOLD}${FARBE[state.winner]}Sieg für Spieler ${state.winner} (${name}) nach ${state.moveNumber} Zügen${RESET}`;
  }
  const name = state.seats[state.currentPlayer] ?? `Spieler ${state.currentPlayer}`;
  return `Zug ${state.moveNumber + 1} - ${FARBE[state.currentPlayer]}${BOLD}Spieler ${state.currentPlayer}${RESET} (${name}) ist am Zug`;
}

export function renderProgress(state: DuelState, board: Map<string, CellState>): string {
  const teile: string[] = [];
  for (const p of state.players) {
    const goal = getGoalZone(p as Player);
    let drin = 0;
    for (const pos of goal) {
      if (board.get(pos) === p) drin++;
    }
    const balken = '█'.repeat(drin) + `${GRAU}░${RESET}`.repeat(goal.size - drin);
    const name = state.seats[p] ?? `Spieler ${p}`;
    teile.push(
      `  ${FARBE[p]}Spieler ${p}${RESET} ${name.padEnd(22)} ${FARBE[p]}${balken}${RESET} ${drin}/${goal.size}`,
    );
  }
  return teile.join('\n');
}

/** Benennt einen Zug: Schritt, einzelner Sprung oder Kette. */
export function zugArt(jumps: number): string {
  if (jumps === 0) return 'Schritt';
  if (jumps === 1) return '1 Sprung';
  return `Kette, ${jumps} Sprünge`;
}

export function renderLastMove(letzter: MoveRecord | undefined): string {
  if (!letzter) return `  ${GRAU}noch kein Zug${RESET}`;

  const zeilen = [
    `  ${GRAU}Letzter Zug:${RESET} ${letzter.from} → ${letzter.to}  ${GRAU}(${zugArt(letzter.jumps)})${RESET}`,
  ];
  if (letzter.why) {
    zeilen.push(`  ${GRAU}Begründung:${RESET} ${letzter.why}`);
  }
  return zeilen.join('\n');
}

export function renderAll(state: DuelState, board: Map<string, CellState>): string {
  return [
    '',
    '  ' + renderHeader(state),
    '',
    renderBoard(state, board),
    '',
    renderProgress(state, board),
    '',
    renderLastMove(state.history[state.history.length - 1]),
    '',
  ].join('\n');
}
