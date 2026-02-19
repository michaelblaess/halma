import type { CellState, Difficulty, Move, Player } from '../model/types';
import { getAllMoves, applyMove } from '../model/gameLogic';
import { evaluate } from './evaluate';
import { minimax } from './minimax';
import { opponent } from '../model/gameLogic';

function greedyMove(board: Map<string, CellState>, player: Player): Move {
  const moves = getAllMoves(board, player);
  const opp = opponent(player);

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newBoard = applyMove(board, move.from, move.to);
    const score = evaluate(newBoard, player) - evaluate(newBoard, opp);
    // Add slight randomness for easy mode
    const randomized = score + (Math.random() - 0.5) * 15;
    if (randomized > bestScore) {
      bestScore = randomized;
      bestMove = move;
    }
  }

  return bestMove;
}

export function computeAiMove(
  board: Map<string, CellState>,
  player: Player,
  difficulty: Difficulty
): Move {
  const moves = getAllMoves(board, player);

  if (moves.length === 0) {
    throw new Error('No moves available');
  }

  if (moves.length === 1) {
    return moves[0];
  }

  switch (difficulty) {
    case 'easy':
      return greedyMove(board, player);

    case 'medium': {
      const { move } = minimax(board, 3, -Infinity, Infinity, true, player);
      return move ?? moves[0];
    }

    case 'hard': {
      const { move } = minimax(board, 4, -Infinity, Infinity, true, player);
      return move ?? moves[0];
    }
  }
}
