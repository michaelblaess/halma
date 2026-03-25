import type { CellState, Move, Player } from '../model/types';
import { getAllMoves, applyMove, checkWin, opponent } from '../model/gameLogic';
import { parsePos, getGx } from '../model/board';
import { evaluate } from './evaluate';

// Maximum moves to evaluate at each depth level.
// Root + depth 3: evaluate more; deeper inner nodes: prune aggressively.
const MAX_MOVES_BY_DEPTH: Record<number, number> = {
  4: 20,
  3: 18,
  2: 15,
  1: 60, // leaf evaluations are cheap, keep more
};

function advancementDelta(player: Player, fromRow: number, fromGx: number, toRow: number, toGx: number): number {
  switch (player) {
    case 1: return toRow - fromRow;
    case 2: return fromRow - toRow;
    case 3: return (toRow + toGx) - (fromRow + fromGx);
    case 4: return (toRow + (12 - toGx)) - (fromRow + (12 - fromGx));
  }
}

function moveHeuristic(move: Move, player: Player): number {
  const from = parsePos(move.from);
  const to = parsePos(move.to);
  const fromGx = getGx(from.row, from.col);
  const toGx = getGx(to.row, to.col);
  // Prefer moves that advance toward the goal
  const adv = advancementDelta(player, from.row, fromGx, to.row, toGx);
  // Prefer jumps (multi-hop = even better)
  const jumpBonus = move.path.length > 2 ? (move.path.length - 1) * 4 : 0;
  // Penalize backward moves more strongly
  const backwardPenalty = adv < 0 ? adv * 2 : 0;
  return adv * 3 + jumpBonus + backwardPenalty;
}

function getSortedMoves(
  board: Map<string, CellState>,
  player: Player,
  maxMoves: number,
): Move[] {
  const moves = getAllMoves(board, player);
  moves.sort((a, b) => moveHeuristic(b, player) - moveHeuristic(a, player));
  return moves.length > maxMoves ? moves.slice(0, maxMoves) : moves;
}

export function minimax(
  board: Map<string, CellState>,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiPlayer: Player
): { score: number; move: Move | null } {
  const opp = opponent(aiPlayer);

  if (checkWin(board, aiPlayer)) {
    return { score: 10000 + depth, move: null };
  }
  if (checkWin(board, opp)) {
    return { score: -10000 - depth, move: null };
  }
  if (depth === 0) {
    return {
      score: evaluate(board, aiPlayer) - evaluate(board, opp),
      move: null,
    };
  }

  const currentPlayer = maximizing ? aiPlayer : opp;
  const maxMoves = MAX_MOVES_BY_DEPTH[depth] ?? 25;
  const moves = getSortedMoves(board, currentPlayer, maxMoves);

  if (moves.length === 0) {
    return { score: 0, move: null };
  }

  let bestMove: Move | null = null;

  if (maximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move.from, move.to);
      const { score } = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer);
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move.from, move.to);
      const { score } = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer);
      if (score < minScore) {
        minScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return { score: minScore, move: bestMove };
  }
}
