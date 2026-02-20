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
}) => {
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
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
