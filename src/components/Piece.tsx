import React from 'react';

interface PieceProps {
  cx: number;
  cy: number;
  color: string;
  selected: boolean;
  onClick: () => void;
}

const Piece: React.FC<PieceProps> = ({ cx, cy, color, selected, onClick }) => {
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Shadow */}
      <circle cx={cx} cy={cy + 2} r={12} fill="rgba(0,0,0,0.2)" />
      {/* Main piece */}
      <circle cx={cx} cy={cy} r={12} fill={color} />
      {/* Highlight gradient */}
      <circle cx={cx - 3} cy={cy - 3} r={5} fill="rgba(255,255,255,0.3)" />
      {/* Selection ring */}
      {selected && (
        <circle
          cx={cx}
          cy={cy}
          r={15}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={3}
        />
      )}
    </g>
  );
};

export default React.memo(Piece);
