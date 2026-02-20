import React from 'react';

interface PieceProps {
  cx: number;
  cy: number;
  color: string;
  selected: boolean;
  onClick: () => void;
  radius?: number;
  selectionRadius?: number;
  selectionStrokeWidth?: number;
  shadowColor?: string;
  highlightColor?: string;
  selectionColor?: string;
  glowRadius?: number;
  glowOpacity?: number;
}

const Piece: React.FC<PieceProps> = ({
  cx,
  cy,
  color,
  selected,
  onClick,
  radius = 14,
  selectionRadius = 18,
  selectionStrokeWidth = 3,
  shadowColor = 'rgba(0,0,0,0.2)',
  highlightColor = 'rgba(255,255,255,0.3)',
  selectionColor = '#fbbf24',
  glowRadius = 0,
  glowOpacity = 0,
}) => {
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Colored glow (Kosmos/Neon/Eleganz) */}
      {glowRadius > 0 && (
        <>
          <circle cx={cx} cy={cy} r={glowRadius} fill={color} opacity={glowOpacity * 0.5} />
          <circle cx={cx} cy={cy} r={glowRadius * 0.75} fill={color} opacity={glowOpacity} />
        </>
      )}
      {/* Shadow */}
      <circle cx={cx} cy={cy + 2} r={radius} fill={shadowColor} />
      {/* Main piece */}
      <circle cx={cx} cy={cy} r={radius} fill={color} />
      {/* Highlight gradient */}
      <circle cx={cx - 3} cy={cy - 3} r={Math.round(radius * 0.43)} fill={highlightColor} />
      {/* Selection ring */}
      {selected && (
        <circle
          cx={cx}
          cy={cy}
          r={selectionRadius}
          fill="none"
          stroke={selectionColor}
          strokeWidth={selectionStrokeWidth}
        />
      )}
    </g>
  );
};

export default React.memo(Piece);
