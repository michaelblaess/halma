export type Player = 1 | 2;

export type CellState = 0 | 1 | 2; // empty, player1, player2

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameState {
  board: Map<string, CellState>;
  currentPlayer: Player;
  humanPlayer: Player;   // 1 = top start, 2 = bottom start
  selectedPiece: string | null;
  validMoves: string[];
  jumpPath: string[];
  winner: Player | null;
  difficulty: Difficulty;
  isAiThinking: boolean;
  fastMode: boolean;
  started: boolean;
  startTime: number | null;
  endTime: number | null;
}

export interface Move {
  from: string;
  to: string;
  path: string[];
}
