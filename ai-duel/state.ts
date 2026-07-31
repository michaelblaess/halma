// Zustandshaltung fuer das KI-Duell.
//
// Die Laufzeitdaten liegen bewusst NICHT im Repo, sondern neben dem claude-bus
// unter ~/.claude/bus/<RECHNER>/halma-duel/. Dieser Bereich ist garantiert nicht
// synchronisiert und nicht in Git, damit ein Spielstand nicht versehentlich
// committet werden kann.

import { homedir, hostname } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

import type { CellState, Player, PlayerCount } from '../src/model/types.ts';
import { createInitialBoard, serializeBoard, deserializeBoard } from '../src/model/board.ts';

export interface MoveRecord {
  n: number;
  player: Player;
  from: string;
  to: string;
  path: string[];
  jumps: number;
  why: string;
  by: string;
  ts: string;
}

export interface DuelState {
  version: 1;
  host: string;
  startedAt: string;
  updatedAt: string;
  playerCount: PlayerCount;
  players: Player[];
  currentPlayer: Player;
  winner: Player | null;
  moveNumber: number;
  /** Wer steuert welchen Spieler: Instanzname, 'minimax:hard' o.ae. */
  seats: Record<number, string>;
  board: [string, CellState][];
  history: MoveRecord[];
}

export function duelDir(): string {
  const dir = join(homedir(), '.claude', 'bus', hostname().toUpperCase(), 'halma-duel');
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function statePath(): string {
  return join(duelDir(), 'state.json');
}

export function hasState(): boolean {
  return existsSync(statePath());
}

export function loadState(): DuelState {
  if (!hasState()) {
    throw new Error('Keine laufende Partie. Erst "duel.ts new" aufrufen.');
  }
  return JSON.parse(readFileSync(statePath(), 'utf8')) as DuelState;
}

export function saveState(state: DuelState): void {
  state.updatedAt = new Date().toISOString();
  // Atomar genug: erst daneben schreiben, dann umbenennen waere sauberer, aber
  // der Zuschauer toleriert eine halb geschriebene Datei ohnehin (try/catch).
  writeFileSync(statePath(), JSON.stringify(state, null, 1), 'utf8');
}

export function boardOf(state: DuelState): Map<string, CellState> {
  return deserializeBoard(state.board);
}

export function newState(seats: Record<number, string>): DuelState {
  const now = new Date().toISOString();
  return {
    version: 1,
    host: hostname().toUpperCase(),
    startedAt: now,
    updatedAt: now,
    playerCount: 2,
    players: [1, 2],
    currentPlayer: 1,
    winner: null,
    moveNumber: 0,
    seats,
    board: serializeBoard(createInitialBoard(2)),
    history: [],
  };
}
