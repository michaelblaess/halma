export type Player = 1 | 2 | 3 | 4;

export type CellState = 0 | 1 | 2 | 3 | 4; // empty, player1-4

export type Difficulty = 'easy' | 'medium' | 'hard';

export type PlayerCount = 2 | 3 | 4;

export interface GameState {
  board: Map<string, CellState>;
  currentPlayer: Player;
  humanPlayer: Player;   // always 2 (bottom start)
  playerCount: PlayerCount;
  players: Player[];     // all players in turn order
  aiPlayers: Player[];   // all AI players
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
  lastMoveJumps: number; // number of jumps in the last completed human move
}

export interface Move {
  from: string;
  to: string;
  path: string[];
}
