import type { CellState, Move, Player } from './types';
import {
  adjacencyMap,
  getGx,
  getGoalZone,
  parsePos,
  posFromRowGx,
  ALL_POSITIONS,
} from './board';

// Get simple (single-step) moves for a piece
export function getSimpleMoves(
  pos: string,
  board: Map<string, CellState>
): string[] {
  return adjacencyMap.get(pos)!.filter((neighbor) => board.get(neighbor) === 0);
}

// Get all jump moves via BFS, returns map of destination -> path
export function getJumpMoves(
  pos: string,
  board: Map<string, CellState>
): Map<string, string[]> {
  const result = new Map<string, string[]>();
  const visited = new Set<string>([pos]);
  const queue: Array<{ current: string; path: string[] }> = [
    { current: pos, path: [pos] },
  ];

  while (queue.length > 0) {
    const { current, path } = queue.shift()!;
    const { row: curRow, col: curCol } = parsePos(current);
    const curGx = getGx(curRow, curCol);

    for (const neighbor of adjacencyMap.get(current)!) {
      if (board.get(neighbor) === 0) continue; // must jump over an occupied cell

      const { row: nRow, col: nCol } = parsePos(neighbor);
      const nGx = getGx(nRow, nCol);

      // Landing position is the mirror of current across neighbor
      const landingRow = 2 * nRow - curRow;
      const landingGx = 2 * nGx - curGx;

      const landingId = posFromRowGx(landingRow, landingGx);
      if (!landingId) continue; // off the board
      if (board.get(landingId) !== 0) continue; // landing must be empty
      if (visited.has(landingId)) continue; // already visited

      visited.add(landingId);
      const newPath = [...path, landingId];
      result.set(landingId, newPath);
      queue.push({ current: landingId, path: newPath });
    }
  }

  return result;
}

// Get all valid moves for a piece, respecting goal zone rules
export function getValidMoves(
  pos: string,
  board: Map<string, CellState>,
  player: Player
): { simpleMoves: string[]; jumpMoves: Map<string, string[]> } {
  const simple = getSimpleMoves(pos, board);
  const jumps = getJumpMoves(pos, board);
  const goalZone = getGoalZone(player);
  const inGoal = goalZone.has(pos);

  // If piece is in goal zone, it can't leave
  const filteredSimple = inGoal
    ? simple.filter((m) => goalZone.has(m))
    : simple;

  const filteredJumps = new Map<string, string[]>();
  for (const [dest, path] of jumps) {
    if (inGoal && !goalZone.has(dest)) continue;
    filteredJumps.set(dest, path);
  }

  return { simpleMoves: filteredSimple, jumpMoves: filteredJumps };
}

// Get continuing jumps from a position during a chain jump
export function getContinuingJumps(
  pos: string,
  board: Map<string, CellState>,
  player: Player,
  visited: Set<string>
): string[] {
  const { row: curRow, col: curCol } = parsePos(pos);
  const curGx = getGx(curRow, curCol);
  const goalZone = getGoalZone(player);
  const inGoalAtStart = goalZone.has(pos);
  const results: string[] = [];

  for (const neighbor of adjacencyMap.get(pos)!) {
    if (board.get(neighbor) === 0) continue;

    const { row: nRow, col: nCol } = parsePos(neighbor);
    const nGx = getGx(nRow, nCol);

    const landingRow = 2 * nRow - curRow;
    const landingGx = 2 * nGx - curGx;

    const landingId = posFromRowGx(landingRow, landingGx);
    if (!landingId) continue;
    if (board.get(landingId) !== 0) continue;
    if (visited.has(landingId)) continue;

    // Goal zone rule
    if (inGoalAtStart && !goalZone.has(landingId)) continue;

    results.push(landingId);
  }

  return results;
}

// Check if a player has won
export function checkWin(board: Map<string, CellState>, player: Player): boolean {
  const goalZone = getGoalZone(player);
  for (const pos of goalZone) {
    if (board.get(pos) !== player) return false;
  }
  return true;
}

// Apply a move to the board (returns new board)
export function applyMove(
  board: Map<string, CellState>,
  from: string,
  to: string
): Map<string, CellState> {
  const newBoard = new Map(board);
  const piece = newBoard.get(from)!;
  newBoard.set(from, 0);
  newBoard.set(to, piece);
  return newBoard;
}

// Get all possible moves for a player
export function getAllMoves(
  board: Map<string, CellState>,
  player: Player
): Move[] {
  const moves: Move[] = [];

  for (const pos of ALL_POSITIONS) {
    if (board.get(pos) !== player) continue;

    const { simpleMoves, jumpMoves } = getValidMoves(pos, board, player);

    for (const dest of simpleMoves) {
      moves.push({ from: pos, to: dest, path: [pos, dest] });
    }

    for (const [dest, path] of jumpMoves) {
      moves.push({ from: pos, to: dest, path });
    }
  }

  return moves;
}

export function opponent(player: Player): Player {
  return player === 1 ? 2 : 1;
}
