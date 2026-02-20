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
import { useTheme } from '../theme/ThemeContext';
import Piece from './Piece';
import styles from './Board.module.css';

interface BoardProps {
  state: GameState;
  onSelectPiece: (pos: string) => void;
  onMovePiece: (to: string) => void;
}

/** Procedural wood-grain background rendered as SVG filter + rects. */
function WoodBackground({ w, h }: { w: number; h: number }) {
  return (
    <>
      <defs>
        <filter id="wood-grain" x="0" y="0" width="100%" height="100%">
          {/* Horizontal grain: low x-freq, high y-freq */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.14"
            numOctaves="5"
            seed="7"
            result="grain"
          />
          {/* Map noise → warm brown palette */}
          <feColorMatrix
            type="matrix"
            in="grain"
            values="
              0.45 0.1  0 0 0.24
              0.3  0.06 0 0 0.15
              0.12 0.02 0 0 0.05
              0    0    0 0 1
            "
          />
        </filter>
        {/* Subtle vignette for depth / raised-edge feel */}
        <radialGradient id="wood-vignette" cx="50%" cy="50%" r="52%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
        </radialGradient>
      </defs>
      {/* Base warm wood color */}
      <rect width={w} height={h} fill="#8a6322" />
      {/* Grain texture overlay */}
      <rect width={w} height={h} filter="url(#wood-grain)" />
      {/* Edge vignette */}
      <rect width={w} height={h} fill="url(#wood-vignette)" />
      {/* Outer frame (dark groove) */}
      <rect
        x={3} y={3}
        width={w - 6} height={h - 6}
        rx={9}
        fill="none"
        stroke="rgba(40,22,8,0.6)"
        strokeWidth={3}
      />
      {/* Inner frame highlight */}
      <rect
        x={6} y={6}
        width={w - 12} height={h - 12}
        rx={7}
        fill="none"
        stroke="rgba(200,160,90,0.15)"
        strokeWidth={1}
      />
    </>
  );
}

const Board: React.FC<BoardProps> = ({ state, onSelectPiece, onMovePiece }) => {
  const { theme, themeId } = useTheme();
  const { board, selectedPiece, validMoves, humanPlayer } = state;
  const validMoveSet = new Set(validMoves);

  // Zone coloring: human's start zone = blue tint, AI's = red tint
  // Player 1 always starts top, Player 2 always starts bottom
  const humanStartsTop = humanPlayer === 1;

  function getCellFill(posId: string): string {
    if (TRIANGLE_TOP_SET.has(posId)) {
      return humanStartsTop ? theme.humanZoneFill : theme.aiZoneFill;
    }
    if (TRIANGLE_BOTTOM_SET.has(posId)) {
      return humanStartsTop ? theme.aiZoneFill : theme.humanZoneFill;
    }
    return theme.emptyCellFill;
  }

  function getPieceColor(cell: CellState): string {
    return cell === humanPlayer ? theme.humanColor : theme.aiColor;
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

  const isWood = themeId === 'holz';

  return (
    <div className={styles.boardContainer}>
      <svg
        className={styles.board}
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      >
        {/* Wood texture background (Holz theme only) */}
        {isWood && <WoodBackground w={SVG_WIDTH} h={SVG_HEIGHT} />}

        {/* Connection lines */}
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={theme.lineStroke}
            strokeWidth={isWood ? 1.5 : 1}
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
                r={theme.cellRadius}
                fill={getCellFill(posId)}
                stroke={theme.cellStroke}
                strokeWidth={isWood ? 1 : 0.5}
              />

              {/* Valid move indicator */}
              {isValid && cell === 0 && (
                <circle
                  cx={x}
                  cy={y}
                  r={theme.validMoveRadius}
                  fill={theme.validMoveFill}
                  stroke={theme.validMoveStroke}
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
                  r={theme.clickTargetRadius}
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
                  radius={theme.pieceRadius}
                  selectionRadius={theme.selectionRingRadius}
                  selectionStrokeWidth={theme.selectionStrokeWidth}
                  shadowColor={theme.pieceShadow}
                  highlightColor={theme.pieceHighlight}
                  selectionColor={theme.selectionColor}
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

export default Board;
