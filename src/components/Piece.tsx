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
  // Accessibility props
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  role?: string;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  focused?: boolean;
}

const Piece = React.forwardRef<SVGGElement, PieceProps>(({
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
  tabIndex,
  onKeyDown,
  role,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  focused,
}, ref) => {
  return (
    <g
      ref={ref}
      onClick={onClick}
      style={{ cursor: 'pointer', outline: 'none' }}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      role={role}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      focusable="false"
    >
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
      {/* Keyboard focus ring (dashed, shown when focused but not selected) */}
      {focused && !selected && (
        <circle
          cx={cx}
          cy={cy}
          r={selectionRadius}
          fill="none"
          stroke={selectionColor}
          strokeWidth={2}
          strokeDasharray="4 3"
          opacity={0.8}
        />
      )}
    </g>
  );
});

Piece.displayName = 'Piece';

export default React.memo(Piece);
