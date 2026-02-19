import type { CellState, Difficulty, Player } from '../model/types';
import { deserializeBoard } from '../model/board';
import { computeAiMove } from './ai';

self.onmessage = (e: MessageEvent<{
  board: [string, CellState][];
  currentPlayer: Player;
  difficulty: Difficulty;
}>) => {
  const { board: boardData, currentPlayer, difficulty } = e.data;
  const board = deserializeBoard(boardData);
  const move = computeAiMove(board, currentPlayer, difficulty);
  self.postMessage({ move });
};
