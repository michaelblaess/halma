// Schiedsrichter und CLI fuer das KI-Duell.
//
// Die Sprachmodelle kennen die Regeln nicht. Sie bekommen ueber "show" das Brett
// und die fertige Liste der legalen Zuege aus getAllMoves() und waehlen daraus
// aus. "move" prueft die Wahl gegen dieselbe Liste. Damit kann kein illegaler
// Zug ins Spiel gelangen, egal was das Modell behauptet.

import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

import type { Move, Player } from '../src/model/types.ts';
import { adjacencyMap, getGoalZone, nextPlayer } from '../src/model/board.ts';
import { getAllMoves, applyMove, checkWin } from '../src/model/gameLogic.ts';
import { computeAiMove } from '../src/ai/ai.ts';
import { serializeBoard } from '../src/model/board.ts';
import {
  boardOf, hasState, loadState, newState, saveState, statePath,
  type DuelState, type MoveRecord,
} from './state.ts';
import { renderAll, renderBoard, renderProgress, zugArt } from './render.ts';

// ---------------------------------------------------------------------------
// Argumente
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const befehl = argv[0] ?? 'status';

function arg(name: string, fallback?: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  if (i >= 0 && i + 1 < argv.length) return argv[i + 1];
  return fallback;
}

function hatFlag(name: string): boolean {
  return argv.includes(`--${name}`);
}

// ---------------------------------------------------------------------------
// Hilfen
// ---------------------------------------------------------------------------

/**
 * Zaehlt die Spruenge eines Zuges. Ein Zug auf ein Nachbarfeld ist ein Schritt
 * (0 Spruenge), alles andere ist eine Kette mit path.length-1 Spruengen.
 */
function jumpCount(move: Move): number {
  const nachbarn = adjacencyMap.get(move.from) ?? [];
  if (nachbarn.includes(move.to)) return 0;
  return move.path.length - 1;
}

function formatMove(m: Move): string {
  const j = jumpCount(m);
  const art = j > 0 ? ` (${j} Spr.)` : '';
  return `${m.from} → ${m.to}${art}`;
}

function goalCount(state: DuelState, player: Player): { drin: number; gesamt: number } {
  const board = boardOf(state);
  const goal = getGoalZone(player);
  let drin = 0;
  for (const pos of goal) {
    if (board.get(pos) === player) drin++;
  }
  return { drin, gesamt: goal.size };
}

/** Postet in den claude-bus, falls vorhanden. Fehler sind bewusst folgenlos. */
function busPost(text: string): void {
  const bus = join(homedir(), '.claude', 'skills', 'claude-bus', 'bus.ps1');
  if (!existsSync(bus)) return;
  try {
    spawnSync('powershell.exe', [
      '-NoProfile', '-NonInteractive', '-File', bus,
      'post', text, '-Topic', 'halma',
    ], { stdio: 'ignore', timeout: 15000 });
  } catch {
    // Der Bus ist Komfort, kein Teil der Spiellogik.
  }
}

function abbruch(nachricht: string): never {
  console.error(`FEHLER: ${nachricht}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Befehle
// ---------------------------------------------------------------------------

function cmdNew(): void {
  if (hasState() && !hatFlag('force')) {
    abbruch('Es läuft bereits eine Partie. Mit --force überschreiben.');
  }
  const seats: Record<number, string> = {
    1: arg('p1', 'Claude A') as string,
    2: arg('p2', 'Claude B') as string,
  };
  const state = newState(seats);
  saveState(state);

  console.log(renderAll(state, boardOf(state)));
  console.log(`  Neue Partie angelegt: ${statePath()}`);
  busPost(`Neue Halma-Partie: Spieler 1 = ${seats[1]}, Spieler 2 = ${seats[2]}`);
}

function cmdShow(): void {
  const state = loadState();
  const board = boardOf(state);

  const spielerArg = arg('player');
  const player = (spielerArg ? Number(spielerArg) : state.currentPlayer) as Player;

  console.log(renderAll(state, board));

  if (state.winner) {
    console.log(`  Die Partie ist entschieden. Spieler ${state.winner} hat gewonnen.`);
    return;
  }

  if (player !== state.currentPlayer) {
    console.log(`  Du bist NICHT am Zug. Spieler ${state.currentPlayer} ist dran. Warte ab.`);
    return;
  }

  const moves = getAllMoves(board, player);
  const { drin, gesamt } = goalCount(state, player);

  console.log(`  Du spielst Spieler ${player}. Deine Zielzone ist ${player === 1 ? 'unten (Süd)' : 'oben (Nord)'}, ${drin}/${gesamt} besetzt.`);
  console.log('  Regel: Ein Stein, der in der Zielzone steht, darf sie nicht wieder verlassen.');
  console.log('');
  console.log(`  ${moves.length} legale Züge:`);
  console.log('');

  // Nach Startfeld gruppieren, Ketten zuerst - das sind die interessanten Zuege.
  const sortiert = [...moves].sort((a, b) => jumpCount(b) - jumpCount(a));
  const zeilen = sortiert.map((m, i) => `  ${String(i + 1).padStart(3)}. ${formatMove(m)}`);

  // In Spalten ausgeben, damit lange Listen lesbar bleiben.
  const spalten = 3;
  const proSpalte = Math.ceil(zeilen.length / spalten);
  for (let r = 0; r < proSpalte; r++) {
    const teile: string[] = [];
    for (let c = 0; c < spalten; c++) {
      const idx = c * proSpalte + r;
      if (idx < zeilen.length) teile.push(zeilen[idx].padEnd(26));
    }
    console.log(teile.join(''));
  }

  console.log('');
  console.log('  Zug ausführen mit:');
  console.log(`  npx tsx ai-duel/duel.ts move --player ${player} --from <VON> --to <NACH> --why "<ein Satz>"`);
}

function cmdMove(): void {
  const state = loadState();
  if (state.winner) abbruch(`Die Partie ist entschieden, Spieler ${state.winner} hat gewonnen.`);

  const player = Number(arg('player', String(state.currentPlayer))) as Player;
  const from = arg('from');
  const to = arg('to');
  const why = arg('why', '') as string;
  const by = arg('by', process.env.CLAUDE_CODE_SESSION_ID?.slice(0, 8) ?? 'unbekannt') as string;

  if (player !== state.currentPlayer) {
    abbruch(`Spieler ${state.currentPlayer} ist am Zug, nicht Spieler ${player}.`);
  }
  if (!from || !to) abbruch('--from und --to sind erforderlich.');

  const board = boardOf(state);
  const moves = getAllMoves(board, player);
  const gewaehlt = moves.find((m) => m.from === from && m.to === to);

  if (!gewaehlt) {
    console.error(`FEHLER: ${from} → ${to} ist kein legaler Zug für Spieler ${player}.`);
    console.error(`Es gibt ${moves.length} legale Züge. Mit "show" die Liste neu holen.`);
    process.exit(1);
  }

  const neu = applyMove(board, gewaehlt.from, gewaehlt.to);
  const gewonnen = checkWin(neu, player);

  const eintrag: MoveRecord = {
    n: state.moveNumber + 1,
    player,
    from: gewaehlt.from,
    to: gewaehlt.to,
    path: gewaehlt.path,
    jumps: jumpCount(gewaehlt),
    why,
    by,
    ts: new Date().toISOString(),
  };

  state.board = serializeBoard(neu);
  state.history.push(eintrag);
  state.moveNumber += 1;
  state.winner = gewonnen ? player : null;
  if (!gewonnen) {
    state.currentPlayer = nextPlayer(player, state.players as Player[]);
  }
  saveState(state);

  console.log(renderAll(state, neu));

  const kette = eintrag.jumps > 0 ? ` (${zugArt(eintrag.jumps)})` : '';
  busPost(`Zug ${eintrag.n}: Spieler ${player} ${from} → ${to}${kette}. ${why}`);

  if (gewonnen) {
    console.log(`  Spieler ${player} hat gewonnen.`);
    busPost(`Partie beendet: Spieler ${player} gewinnt nach ${state.moveNumber} Zügen.`);
  }
}

function cmdStatus(): void {
  if (!hasState()) {
    console.log('  Keine laufende Partie. Anlegen mit: npx tsx ai-duel/duel.ts new');
    return;
  }
  const state = loadState();
  console.log(renderAll(state, boardOf(state)));
  console.log(`  Zustand: ${statePath()}`);
}

/**
 * Smoke-Test ohne Modellkosten: die vorhandene Minimax-KI spielt gegen sich
 * selbst. Prueft Schiedsrichter, Zustandshaltung und Renderer in einem Lauf.
 */
function cmdAuto(): void {
  const limit = Number(arg('limit', '200'));
  const stufe = (arg('difficulty', 'medium') ?? 'medium') as 'easy' | 'medium' | 'hard';
  const still = hatFlag('quiet');

  if (!hasState() || hatFlag('force')) {
    saveState(newState({ 1: `minimax:${stufe}`, 2: `minimax:${stufe}` }));
  }

  let state = loadState();
  const start = Date.now();

  while (!state.winner && state.moveNumber < limit) {
    const board = boardOf(state);
    const player = state.currentPlayer;
    const move = computeAiMove(board, player, stufe, 2);

    const neu = applyMove(board, move.from, move.to);
    const gewonnen = checkWin(neu, player);

    state.board = serializeBoard(neu);
    state.history.push({
      n: state.moveNumber + 1,
      player,
      from: move.from,
      to: move.to,
      path: move.path,
      jumps: jumpCount(move),
      why: `minimax:${stufe}`,
      by: 'auto',
      ts: new Date().toISOString(),
    });
    state.moveNumber += 1;
    state.winner = gewonnen ? player : null;
    if (!gewonnen) state.currentPlayer = nextPlayer(player, state.players as Player[]);
    saveState(state);

    if (!still) {
      process.stdout.write('\x1b[2J\x1b[H');
      console.log(renderAll(state, neu));
    }
    state = loadState();
  }

  const dauer = ((Date.now() - start) / 1000).toFixed(1);
  if (still) {
    console.log(renderBoard(state, boardOf(state)));
    console.log('');
    console.log(renderProgress(state, boardOf(state)));
  }
  console.log('');
  if (state.winner) {
    console.log(`  Selbstspiel beendet: Spieler ${state.winner} gewinnt nach ${state.moveNumber} Zügen (${dauer}s).`);
  } else {
    console.log(`  Zuglimit ${limit} erreicht, kein Sieger (${dauer}s).`);
  }
}

function cmdHelp(): void {
  console.log(`
  Halma KI-Duell

    new     [--p1 NAME] [--p2 NAME] [--force]     Neue Partie anlegen
    show    [--player N]                          Brett und legale Züge anzeigen
    move    --player N --from A --to B --why "…"  Zug ausführen
    status                                        Aktuellen Stand anzeigen
    auto    [--difficulty easy|medium|hard]        Minimax gegen sich selbst
            [--limit N] [--quiet] [--force]        (Test ohne Modellkosten)

  Zustand: ${statePath()}
`);
}

// ---------------------------------------------------------------------------

switch (befehl) {
  case 'new': cmdNew(); break;
  case 'show': cmdShow(); break;
  case 'move': cmdMove(); break;
  case 'status': cmdStatus(); break;
  case 'auto': cmdAuto(); break;
  case 'help': case '--help': case '-h': cmdHelp(); break;
  default:
    console.error(`Unbekannter Befehl: ${befehl}`);
    cmdHelp();
    process.exit(1);
}
