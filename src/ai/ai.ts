import type { CellState, Difficulty, Move, Player, PlayerCount } from '../model/types';
import { getAllMoves, applyMove } from '../model/gameLogic';
import { evaluate } from './evaluate';
import { minimax } from './minimax';

function greedyMove(board: Map<string, CellState>, player: Player, randomness: number): Move {
  const moves = getAllMoves(board, player);

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newBoard = applyMove(board, move.from, move.to);
    const score = evaluate(newBoard, player);
    const randomized = score + (Math.random() - 0.5) * randomness;
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
  difficulty: Difficulty,
  playerCount: PlayerCount = 2,
): Move {
  const moves = getAllMoves(board, player);

  if (moves.length === 0) {
    throw new Error('No moves available');
  }

  if (moves.length === 1) {
    return moves[0];
  }

  // For multi-player (3-4), use simpler AI to keep it fast
  if (playerCount > 2) {
    switch (difficulty) {
      case 'easy':
        return greedyMove(board, player, 15);
      case 'medium':
        return greedyMove(board, player, 3);
      case 'hard': {
        // Shallow minimax for multi-player
        const { move } = minimax(board, 2, -Infinity, Infinity, true, player);
        return move ?? moves[0];
      }
    }
  }

  // 2-player mode (original logic)
  switch (difficulty) {
    case 'easy':
      return greedyMove(board, player, 15);

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
