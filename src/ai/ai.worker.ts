import type { CellState, Difficulty, Player, PlayerCount } from '../model/types';
import { deserializeBoard } from '../model/board';
import { computeAiMove } from './ai';

self.onmessage = (e: MessageEvent<{
  board: [string, CellState][];
  currentPlayer: Player;
  difficulty: Difficulty;
  playerCount?: PlayerCount;
}>) => {
  const { board: boardData, currentPlayer, difficulty, playerCount = 2 } = e.data;
  const board = deserializeBoard(boardData);
  const move = computeAiMove(board, currentPlayer, difficulty, playerCount);
  self.postMessage({ move });
};
