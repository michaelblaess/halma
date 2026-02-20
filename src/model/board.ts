import type { CellState, Player } from './types';

// Row sizes for the 17-row star board (121 positions total)
// The star is widest at rows 4 and 12 where the side arms extend
export const ROW_SIZE: number[] = [1, 2, 3, 4, 13, 12, 11, 10, 9, 10, 11, 12, 13, 4, 3, 2, 1];

// Starting gx (grid-x) for each row - rows 4 and 12 (widest) start at 0
export const START_GX: number[] = [6, 5.5, 5, 4.5, 0, 0.5, 1, 1.5, 2, 1.5, 1, 0.5, 0, 4.5, 5, 5.5, 6];

export function posId(row: number, col: number): string {
  return `${row},${col}`;
}

export function parsePos(id: string): { row: number; col: number } {
  const [row, col] = id.split(',').map(Number);
  return { row, col };
}

export function getGx(row: number, col: number): number {
  return START_GX[row] + col;
}

// All valid positions on the board
export const ALL_POSITIONS: string[] = [];
for (let row = 0; row < 17; row++) {
  for (let col = 0; col < ROW_SIZE[row]; col++) {
    ALL_POSITIONS.push(posId(row, col));
  }
}

// Top triangle: rows 0-3 (Player 1 start, Player 2 goal)
export const TRIANGLE_TOP: string[] = [];
for (let row = 0; row <= 3; row++) {
  for (let col = 0; col < ROW_SIZE[row]; col++) {
    TRIANGLE_TOP.push(posId(row, col));
  }
}

// Bottom triangle: rows 13-16 (Player 2 start, Player 1 goal)
export const TRIANGLE_BOTTOM: string[] = [];
for (let row = 13; row <= 16; row++) {
  for (let col = 0; col < ROW_SIZE[row]; col++) {
    TRIANGLE_BOTTOM.push(posId(row, col));
  }
}

export const TRIANGLE_TOP_SET = new Set(TRIANGLE_TOP);
export const TRIANGLE_BOTTOM_SET = new Set(TRIANGLE_BOTTOM);

// Build adjacency map
function buildAdjacencyMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();

  // Create a lookup: given (row, gx) -> posId, for finding neighbors
  const gxToPos = new Map<string, string>();
  for (const id of ALL_POSITIONS) {
    const { row, col } = parsePos(id);
    const gx = getGx(row, col);
    gxToPos.set(`${row},${gx}`, id);
  }

  for (const id of ALL_POSITIONS) {
    const { row, col } = parsePos(id);
    const gx = getGx(row, col);
    const neighbors: string[] = [];

    // Same row neighbors (gx +/- 1)
    const left = gxToPos.get(`${row},${gx - 1}`);
    if (left) neighbors.push(left);
    const right = gxToPos.get(`${row},${gx + 1}`);
    if (right) neighbors.push(right);

    // Adjacent rows (row +/- 1, gx +/- 0.5)
    for (const dr of [-1, 1]) {
      const nr = row + dr;
      if (nr < 0 || nr > 16) continue;
      for (const dgx of [-0.5, 0.5]) {
        const ngx = gx + dgx;
        const neighbor = gxToPos.get(`${nr},${ngx}`);
        if (neighbor) neighbors.push(neighbor);
      }
    }

    map.set(id, neighbors);
  }

  return map;
}

export const adjacencyMap = buildAdjacencyMap();

// Also build a reverse lookup from (row, gx) to posId for jump calculations
const gxLookup = new Map<string, string>();
for (const id of ALL_POSITIONS) {
  const { row, col } = parsePos(id);
  const gx = getGx(row, col);
  gxLookup.set(`${row},${gx}`, id);
}

export function posFromRowGx(row: number, gx: number): string | undefined {
  return gxLookup.get(`${row},${gx}`);
}

// Pixel coordinates for SVG rendering
const SPACING_X = 44;
const SPACING_Y = SPACING_X * Math.sin(Math.PI / 3); // ~38.1
const MARGIN = 36;

export function positionToPixel(row: number, col: number): { x: number; y: number } {
  const gx = getGx(row, col);
  return {
    x: MARGIN + gx * SPACING_X,
    y: MARGIN + row * SPACING_Y,
  };
}

export const SVG_WIDTH = MARGIN * 2 + 12 * SPACING_X;
export const SVG_HEIGHT = MARGIN * 2 + 16 * SPACING_Y;

// Create initial board state
export function createInitialBoard(): Map<string, CellState> {
  const board = new Map<string, CellState>();

  for (const id of ALL_POSITIONS) {
    board.set(id, 0);
  }

  // Player 1 starts in the top triangle
  for (const id of TRIANGLE_TOP) {
    board.set(id, 1);
  }

  // Player 2 starts in the bottom triangle
  for (const id of TRIANGLE_BOTTOM) {
    board.set(id, 2);
  }

  return board;
}

// Get goal zone for a player
export function getGoalZone(player: Player): Set<string> {
  return player === 1 ? TRIANGLE_BOTTOM_SET : TRIANGLE_TOP_SET;
}

export function getStartZone(player: Player): Set<string> {
  return player === 1 ? TRIANGLE_TOP_SET : TRIANGLE_BOTTOM_SET;
}

// Serialize/deserialize board for worker communication
export function serializeBoard(board: Map<string, CellState>): [string, CellState][] {
  return Array.from(board.entries());
}

export function deserializeBoard(data: [string, CellState][]): Map<string, CellState> {
  return new Map(data);
}
