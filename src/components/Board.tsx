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
import type { ThemeId } from '../theme/themes';
import Piece from './Piece';
import styles from './Board.module.css';

interface BoardProps {
  state: GameState;
  onSelectPiece: (pos: string) => void;
  onMovePiece: (to: string) => void;
}

/* ===== SVG Board Backgrounds ===== */

function WoodBackground({ w, h }: { w: number; h: number }) {
  return (
    <>
      <defs>
        <filter id="wood-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.14"
            numOctaves={5}
            seed={7}
            result="grain"
          />
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
        <radialGradient id="wood-vignette" cx="50%" cy="50%" r="52%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill="#8a6322" />
      <rect width={w} height={h} filter="url(#wood-grain)" />
      <rect width={w} height={h} fill="url(#wood-vignette)" />
      <rect x={3} y={3} width={w - 6} height={h - 6} rx={9}
        fill="none" stroke="rgba(40,22,8,0.6)" strokeWidth={3} />
      <rect x={6} y={6} width={w - 12} height={h - 12} rx={7}
        fill="none" stroke="rgba(200,160,90,0.15)" strokeWidth={1} />
    </>
  );
}

/* Star tile definitions (static, outside component) */
const FAR_TILE = 160;
const FAR_STARS = [
  { x: 14, y: 22, r: 0.7, c: '255,255,255', a: 0.3 },
  { x: 48, y: 85, r: 0.5, c: '255,255,255', a: 0.2 },
  { x: 92, y: 8,  r: 0.6, c: '200,220,255', a: 0.25 },
  { x: 135, y: 48, r: 0.4, c: '255,255,255', a: 0.15 },
  { x: 75, y: 132, r: 0.7, c: '255,240,220', a: 0.22 },
  { x: 115, y: 100, r: 0.5, c: '255,255,255', a: 0.18 },
  { x: 28, y: 115, r: 0.6, c: '220,230,255', a: 0.2 },
  { x: 145, y: 140, r: 0.4, c: '255,255,255', a: 0.15 },
  { x: 60, y: 55, r: 0.3, c: '255,255,255', a: 0.12 },
  { x: 105, y: 148, r: 0.5, c: '200,210,255', a: 0.18 },
];

const NEAR_TILE = 240;
const NEAR_STARS = [
  { x: 35, y: 55,  r: 1.3, c: '255,255,255', a: 0.55 },
  { x: 125, y: 18, r: 1.0, c: '200,220,255', a: 0.45 },
  { x: 205, y: 95, r: 0.9, c: '255,240,220', a: 0.4 },
  { x: 82, y: 185, r: 1.2, c: '255,255,255', a: 0.5 },
  { x: 185, y: 215, r: 0.8, c: '220,230,255', a: 0.35 },
  { x: 230, y: 155, r: 1.0, c: '255,255,255', a: 0.45 },
  { x: 55, y: 225, r: 0.7, c: '255,240,200', a: 0.35 },
  { x: 155, y: 130, r: 0.6, c: '255,255,255', a: 0.3 },
];

function buildStarGrid(
  stars: typeof FAR_STARS, tile: number, w: number, h: number,
) {
  const cols = Math.ceil(w / tile) + 2;
  const rows = Math.ceil(h / tile) + 2;
  const out: React.JSX.Element[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        out.push(
          <circle
            key={`${r}-${c}-${i}`}
            cx={s.x + c * tile}
            cy={s.y + r * tile}
            r={s.r}
            fill={`rgba(${s.c},${s.a})`}
          />,
        );
      }
    }
  }
  return out;
}

function KosmosBackground({ w, h }: { w: number; h: number }) {
  const farGrid = useMemo(() => buildStarGrid(FAR_STARS, FAR_TILE, w, h), [w, h]);
  const nearGrid = useMemo(() => buildStarGrid(NEAR_STARS, NEAR_TILE, w, h), [w, h]);

  return (
    <>
      <defs>
        <radialGradient id="kosmos-nebula1" cx="30%" cy="25%" r="40%">
          <stop offset="0%" stopColor="rgba(40,20,80,0.3)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <radialGradient id="kosmos-nebula2" cx="75%" cy="70%" r="35%">
          <stop offset="0%" stopColor="rgba(20,40,80,0.2)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <clipPath id="board-clip">
          <rect width={w} height={h} />
        </clipPath>
      </defs>

      <style>{`
        .stars-far  { animation: drift-far  50s linear infinite; }
        .stars-near { animation: drift-near 25s linear infinite; }
        @keyframes drift-far {
          from { transform: translate(0, 0); }
          to   { transform: translate(-${FAR_TILE}px, -${FAR_TILE / 2}px); }
        }
        @keyframes drift-near {
          from { transform: translate(0, 0); }
          to   { transform: translate(-${NEAR_TILE}px, -${NEAR_TILE / 2}px); }
        }
      `}</style>

      {/* Deep space base */}
      <rect width={w} height={h} fill="#030310" />
      {/* Nebula haze */}
      <rect width={w} height={h} fill="url(#kosmos-nebula1)" />
      <rect width={w} height={h} fill="url(#kosmos-nebula2)" />

      {/* Star layers — clipped to board, animated via CSS */}
      <g clipPath="url(#board-clip)">
        <g className="stars-far">{farGrid}</g>
        <g className="stars-near">{nearGrid}</g>
      </g>
    </>
  );
}

function NeonBackground({ w, h }: { w: number; h: number }) {
  const spacing = 30;
  return (
    <>
      <defs>
        <pattern id="neon-grid" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <line x1={0} y1={spacing} x2={spacing} y2={spacing}
            stroke="rgba(0,212,255,0.045)" strokeWidth={0.5} />
          <line x1={spacing} y1={0} x2={spacing} y2={spacing}
            stroke="rgba(0,212,255,0.045)" strokeWidth={0.5} />
        </pattern>
        <radialGradient id="neon-glow" cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor="rgba(0,212,255,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill="#08081a" />
      <rect width={w} height={h} fill="url(#neon-grid)" />
      <rect width={w} height={h} fill="url(#neon-glow)" />
    </>
  );
}

function EleganzBackground({ w, h }: { w: number; h: number }) {
  return (
    <>
      <defs>
        <filter id="brushed-metal" x="0" y="0" width="100%" height="100%">
          {/* Horizontal streaks = brushed metal effect */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.4 0.008"
            numOctaves={3}
            seed={12}
            result="metal"
          />
          <feColorMatrix
            type="matrix"
            in="metal"
            values="
              0.15 0 0 0 0.15
              0.12 0 0 0 0.14
              0.1  0 0 0 0.13
              0    0 0 0 1
            "
          />
        </filter>
        <radialGradient id="eleganz-light" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="rgba(200,180,140,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill="#222230" />
      <rect width={w} height={h} filter="url(#brushed-metal)" opacity={0.5} />
      <rect width={w} height={h} fill="url(#eleganz-light)" />
    </>
  );
}

/** Render themed SVG background if applicable. */
function BoardBackground({ id, w, h }: { id: ThemeId; w: number; h: number }) {
  switch (id) {
    case 'holz': return <WoodBackground w={w} h={h} />;
    case 'kosmos': return <KosmosBackground w={w} h={h} />;
    case 'neon': return <NeonBackground w={w} h={h} />;
    case 'eleganz': return <EleganzBackground w={w} h={h} />;
    default: return null;
  }
}

/* ===== Board Component ===== */

const Board: React.FC<BoardProps> = ({ state, onSelectPiece, onMovePiece }) => {
  const { theme, themeId } = useTheme();
  const { board, selectedPiece, validMoves, humanPlayer } = state;
  const validMoveSet = new Set(validMoves);

  const humanStartsTop = humanPlayer === 1;
  const isWood = themeId === 'holz';

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
        <BoardBackground id={themeId} w={SVG_WIDTH} h={SVG_HEIGHT} />

        {/* Connection lines */}
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
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
              <circle
                cx={x} cy={y} r={theme.cellRadius}
                fill={getCellFill(posId)}
                stroke={theme.cellStroke}
                strokeWidth={isWood ? 1 : 0.5}
              />

              {isValid && cell === 0 && (
                <circle
                  cx={x} cy={y} r={theme.validMoveRadius}
                  fill={theme.validMoveFill}
                  stroke={theme.validMoveStroke}
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onMovePiece(posId)}
                />
              )}

              {isValid && cell === 0 && (
                <circle
                  cx={x} cy={y} r={theme.clickTargetRadius}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onMovePiece(posId)}
                />
              )}

              {cell !== 0 && (
                <Piece
                  cx={x} cy={y}
                  color={getPieceColor(cell)}
                  selected={isSelected}
                  radius={theme.pieceRadius}
                  selectionRadius={theme.selectionRingRadius}
                  selectionStrokeWidth={theme.selectionStrokeWidth}
                  shadowColor={theme.pieceShadow}
                  highlightColor={theme.pieceHighlight}
                  selectionColor={theme.selectionColor}
                  glowRadius={theme.pieceGlowRadius}
                  glowOpacity={theme.pieceGlowOpacity}
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
