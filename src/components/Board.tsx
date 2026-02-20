import React, { useMemo } from 'react';
import type { GameState, CellState } from '../model/types';
import {
  ALL_POSITIONS,
  adjacencyMap,
  parsePos,
  positionToPixel,
  SVG_WIDTH,
  SVG_HEIGHT,
  TRIANGLE_TOP_SET,
  TRIANGLE_BOTTOM_SET,
} from '../model/board';
import Piece from './Piece';
import styles from './Board.module.css';

interface BoardProps {
  state: GameState;
  onSelectPiece: (pos: string) => void;
  onMovePiece: (to: string) => void;
}

const HUMAN_COLOR = '#3b82f6'; // blue
const AI_COLOR = '#ef4444';    // red

const Board: React.FC<BoardProps> = ({ state, onSelectPiece, onMovePiece }) => {
  const { board, selectedPiece, validMoves, humanPlayer } = state;
  const validMoveSet = new Set(validMoves);

  // Zone coloring: human's start zone = blue tint, AI's = red tint
  // Player 1 always starts top, Player 2 always starts bottom
  const humanStartsTop = humanPlayer === 1;

  function getCellFill(posId: string): string {
    if (TRIANGLE_TOP_SET.has(posId)) {
      return humanStartsTop
        ? 'rgba(59,130,246,0.15)'   // blue (human)
        : 'rgba(239,68,68,0.15)';   // red (AI)
    }
    if (TRIANGLE_BOTTOM_SET.has(posId)) {
      return humanStartsTop
        ? 'rgba(239,68,68,0.15)'    // red (AI)
        : 'rgba(59,130,246,0.15)';  // blue (human)
    }
    return 'rgba(255,255,255,0.05)';
  }

  function getPieceColor(cell: CellState): string {
    return cell === humanPlayer ? HUMAN_COLOR : AI_COLOR;
  }

  // Connection lines (static, compute once)
  const lines = useMemo(() => {
    const result: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const seenEdges = new Set<string>();

    for (const posId of ALL_POSITIONS) {
      const { row, col } = parsePos(posId);
      const { x, y } = positionToPixel(row, col);
      const neighbors = adjacencyMap.get(posId)!;
      for (const nId of neighbors) {
        const edgeKey = posId < nId ? `${posId}|${nId}` : `${nId}|${posId}`;
        if (seenEdges.has(edgeKey)) continue;
        seenEdges.add(edgeKey);
        const { row: nr, col: nc } = parsePos(nId);
        const { x: nx, y: ny } = positionToPixel(nr, nc);
        result.push({ x1: x, y1: y, x2: nx, y2: ny });
      }
    }
    return result;
  }, []);

  return (
    <div className={styles.boardContainer}>
      <svg
        className={styles.board}
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      >
        {/* Connection lines */}
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        ))}

        {/* Cells and pieces */}
        {ALL_POSITIONS.map((posId) => {
          const { row, col } = parsePos(posId);
          const { x, y } = positionToPixel(row, col);
          const cell = board.get(posId) as CellState;
          const isValid = validMoveSet.has(posId);
          const isSelected = selectedPiece === posId;

          return (
            <g key={posId}>
              {/* Empty cell background */}
              <circle
                cx={x}
                cy={y}
                r={10}
                fill={getCellFill(posId)}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={0.5}
              />

              {/* Valid move indicator */}
              {isValid && cell === 0 && (
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="rgba(34,197,94,0.4)"
                  stroke="#22c55e"
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onMovePiece(posId)}
                />
              )}

              {/* Click target for empty valid move cells */}
              {isValid && cell === 0 && (
                <circle
                  cx={x}
                  cy={y}
                  r={17}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onMovePiece(posId)}
                />
              )}

              {/* Piece */}
              {cell !== 0 && (
                <Piece
                  cx={x}
                  cy={y}
                  color={getPieceColor(cell)}
                  selected={isSelected}
                  onClick={() => {
                    if (cell === humanPlayer) onSelectPiece(posId);
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default React.memo(Board);
