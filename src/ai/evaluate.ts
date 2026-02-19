import type { CellState, Player } from '../model/types';
import { adjacencyMap, getGx, getGoalZone, parsePos, ALL_POSITIONS } from '../model/board';

export function evaluate(board: Map<string, CellState>, player: Player): number {
  let score = 0;
  const goalZone = getGoalZone(player);

  for (const pos of ALL_POSITIONS) {
    const cell = board.get(pos)!;
    if (cell !== player) continue;

    const { row, col } = parsePos(pos);
    const gx = getGx(row, col);

    // 1. Advancement toward goal (main factor)
    const advancement = player === 1 ? row : 16 - row;
    score += advancement * 10;

    // 2. Bonus for being in the goal zone
    if (goalZone.has(pos)) {
      score += 50;
    }

    // 3. Center control - pieces near center line (gx ≈ 6) can jump better
    const centerDist = Math.abs(gx - 6);
    score -= centerDist * 2;

    // 4. Clustering - occupied neighbors = jump opportunities
    const neighbors = adjacencyMap.get(pos)!;
    let occupiedNeighbors = 0;
    for (const n of neighbors) {
      if (board.get(n) !== 0) occupiedNeighbors++;
    }
    score += occupiedNeighbors * 3;
  }

  return score;
}
