import type { CellState, Move, Player } from '../model/types';
import { getAllMoves, applyMove, checkWin, opponent } from '../model/gameLogic';
import { parsePos } from '../model/board';
import { evaluate } from './evaluate';

function moveHeuristic(move: Move, player: Player): number {
  const from = parsePos(move.from);
  const to = parsePos(move.to);
  // Prefer moves that advance toward the goal
  const advancement = player === 1 ? to.row - from.row : from.row - to.row;
  // Prefer jumps over simple moves
  const isJump = move.path.length > 2 ? 5 : 0;
  return advancement * 3 + isJump;
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
  const moves = getAllMoves(board, currentPlayer);

  if (moves.length === 0) {
    return { score: 0, move: null };
  }

  // Move ordering: sort by heuristic for better pruning
  moves.sort((a, b) => moveHeuristic(b, currentPlayer) - moveHeuristic(a, currentPlayer));

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
