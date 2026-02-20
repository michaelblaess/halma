export interface ThemeTokens {
  // Backgrounds
  bgPrimary: string;
  bgPanel: string;
  bgInput: string;
  bgButton: string;
  bgButtonActive: string;
  bgOverlay: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Borders
  borderDefault: string;
  borderActive: string;

  // Accent
  accentBlue: string;
  accentBlueLight: string;
  accentBlueBg: string;
  accentRed: string;
  accentGold: string;
  accentGoldFaded: string;
  accentGreen: string;
  accentGreenBg: string;
  accentLinkColor: string;

  // Game pieces (SVG inline styles)
  humanColor: string;
  aiColor: string;
  humanZoneFill: string;
  aiZoneFill: string;
  emptyCellFill: string;
  cellStroke: string;
  lineStroke: string;
  validMoveFill: string;
  validMoveStroke: string;
  pieceShadow: string;
  pieceHighlight: string;
  selectionColor: string;

  // Piece geometry (SVG)
  pieceRadius: number;
  selectionRingRadius: number;
  selectionStrokeWidth: number;
  cellRadius: number;
  validMoveRadius: number;
  clickTargetRadius: number;

  // Piece glow (0 = off)
  pieceGlowRadius: number;
  pieceGlowOpacity: number;

  // Banners
  winBannerBg: string;
  winBannerColor: string;
  lossBannerBg: string;
  lossBannerColor: string;

  // Shadow
  panelShadow: string;

  // Title gradient
  titleGradient: string;
}

export type ThemeId =
  | 'standard'
  | 'kosmos'
  | 'neon'
  | 'eleganz'
  | 'holz'
  | 'highContrast'
  | 'hell';

const standard: ThemeTokens = {
  bgPrimary: '#0f0f23',
  bgPanel: '#1a1a2e',
  bgInput: '#0f172a',
  bgButton: '#1e293b',
  bgButtonActive: '#1e3a5f',
  bgOverlay: 'rgba(0, 0, 0, 0.7)',

  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  borderDefault: '#334155',
  borderActive: '#3b82f6',

  accentBlue: '#3b82f6',
  accentBlueLight: '#60a5fa',
  accentBlueBg: '#1e3a5f',
  accentRed: '#ef4444',
  accentGold: '#fbbf24',
  accentGoldFaded: 'rgba(251, 191, 36, 0.3)',
  accentGreen: '#34d399',
  accentGreenBg: 'rgba(52, 211, 153, 0.1)',
  accentLinkColor: '#60a5fa',

  humanColor: '#3b82f6',
  aiColor: '#ef4444',
  humanZoneFill: 'rgba(59,130,246,0.15)',
  aiZoneFill: 'rgba(239,68,68,0.15)',
  emptyCellFill: 'rgba(255,255,255,0.05)',
  cellStroke: 'rgba(255,255,255,0.15)',
  lineStroke: 'rgba(255,255,255,0.08)',
  validMoveFill: 'rgba(34,197,94,0.4)',
  validMoveStroke: '#22c55e',
  pieceShadow: 'rgba(0,0,0,0.2)',
  pieceHighlight: 'rgba(255,255,255,0.3)',
  selectionColor: '#fbbf24',

  pieceRadius: 14,
  selectionRingRadius: 18,
  selectionStrokeWidth: 3,
  cellRadius: 10,
  validMoveRadius: 12,
  clickTargetRadius: 17,

  pieceGlowRadius: 0,
  pieceGlowOpacity: 0,

  winBannerBg: 'linear-gradient(135deg, #065f46, #064e3b)',
  winBannerColor: '#34d399',
  lossBannerBg: 'linear-gradient(135deg, #7f1d1d, #450a0a)',
  lossBannerColor: '#fca5a5',

  panelShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',

  titleGradient: 'linear-gradient(135deg, #3b82f6, #ef4444)',
};

// ---------- Kosmos ----------

const kosmos: ThemeTokens = {
  bgPrimary: '#030310',
  bgPanel: '#0a0a22',
  bgInput: '#06061a',
  bgButton: '#141435',
  bgButtonActive: '#1e3a6a',
  bgOverlay: 'rgba(4, 4, 15, 0.8)',

  textPrimary: '#d8dff0',
  textSecondary: '#8890b0',
  textMuted: '#555a80',

  borderDefault: '#2a2a55',
  borderActive: '#4a9eff',

  accentBlue: '#4a9eff',
  accentBlueLight: '#70b4ff',
  accentBlueBg: '#1a2a55',
  accentRed: '#ff5566',
  accentGold: '#ffcc44',
  accentGoldFaded: 'rgba(255, 204, 68, 0.3)',
  accentGreen: '#44ddaa',
  accentGreenBg: 'rgba(68, 221, 170, 0.1)',
  accentLinkColor: '#70b4ff',

  humanColor: '#4a9eff',
  aiColor: '#ff5566',
  humanZoneFill: 'rgba(74,158,255,0.12)',
  aiZoneFill: 'rgba(255,85,102,0.12)',
  emptyCellFill: 'rgba(100,140,255,0.05)',
  cellStroke: 'rgba(100,140,255,0.18)',
  lineStroke: 'rgba(80,120,255,0.1)',
  validMoveFill: 'rgba(68,221,170,0.4)',
  validMoveStroke: '#44ddaa',
  pieceShadow: 'rgba(0,0,0,0.15)',
  pieceHighlight: 'rgba(255,255,255,0.35)',
  selectionColor: '#ffcc44',

  pieceRadius: 14,
  selectionRingRadius: 18,
  selectionStrokeWidth: 3,
  cellRadius: 10,
  validMoveRadius: 12,
  clickTargetRadius: 17,

  pieceGlowRadius: 20,
  pieceGlowOpacity: 0.25,

  winBannerBg: 'linear-gradient(135deg, #0a3a3a, #063030)',
  winBannerColor: '#44ddaa',
  lossBannerBg: 'linear-gradient(135deg, #4a1525, #300a15)',
  lossBannerColor: '#ff8899',

  panelShadow: '0 8px 32px rgba(0, 0, 20, 0.6)',

  titleGradient: 'linear-gradient(135deg, #4a9eff, #ff5566)',
};

// ---------- Neon ----------

const neon: ThemeTokens = {
  bgPrimary: '#050510',
  bgPanel: '#0a0a1a',
  bgInput: '#08081a',
  bgButton: '#12122a',
  bgButtonActive: '#0a2a3a',
  bgOverlay: 'rgba(2, 2, 8, 0.85)',

  textPrimary: '#e0e8f0',
  textSecondary: '#7888a0',
  textMuted: '#445060',

  borderDefault: '#1a2a3a',
  borderActive: '#00d4ff',

  accentBlue: '#00d4ff',
  accentBlueLight: '#40e0ff',
  accentBlueBg: '#0a2535',
  accentRed: '#ff2d78',
  accentGold: '#ffee00',
  accentGoldFaded: 'rgba(255, 238, 0, 0.3)',
  accentGreen: '#00ff88',
  accentGreenBg: 'rgba(0, 255, 136, 0.1)',
  accentLinkColor: '#40e0ff',

  humanColor: '#00d4ff',
  aiColor: '#ff2d78',
  humanZoneFill: 'rgba(0,212,255,0.1)',
  aiZoneFill: 'rgba(255,45,120,0.1)',
  emptyCellFill: 'rgba(0,212,255,0.03)',
  cellStroke: 'rgba(0,212,255,0.14)',
  lineStroke: 'rgba(0,212,255,0.07)',
  validMoveFill: 'rgba(0,255,136,0.35)',
  validMoveStroke: '#00ff88',
  pieceShadow: 'rgba(0,0,0,0.15)',
  pieceHighlight: 'rgba(255,255,255,0.4)',
  selectionColor: '#ffee00',

  pieceRadius: 14,
  selectionRingRadius: 18,
  selectionStrokeWidth: 3,
  cellRadius: 10,
  validMoveRadius: 12,
  clickTargetRadius: 17,

  pieceGlowRadius: 22,
  pieceGlowOpacity: 0.3,

  winBannerBg: 'linear-gradient(135deg, #003322, #002218)',
  winBannerColor: '#00ff88',
  lossBannerBg: 'linear-gradient(135deg, #3a0a20, #250515)',
  lossBannerColor: '#ff6699',

  panelShadow: '0 8px 32px rgba(0, 0, 10, 0.7)',

  titleGradient: 'linear-gradient(135deg, #00d4ff, #ff2d78)',
};

// ---------- Eleganz ----------

const eleganz: ThemeTokens = {
  bgPrimary: '#1a1a1f',
  bgPanel: '#242430',
  bgInput: '#1a1a25',
  bgButton: '#2e2e3a',
  bgButtonActive: '#3a3530',
  bgOverlay: 'rgba(10, 10, 14, 0.8)',

  textPrimary: '#e8e4dd',
  textSecondary: '#a09888',
  textMuted: '#706858',

  borderDefault: '#3a3830',
  borderActive: '#c9a84c',

  accentBlue: '#c9a84c',
  accentBlueLight: '#ddc070',
  accentBlueBg: '#3a3520',
  accentRed: '#d94a4a',
  accentGold: '#c9a84c',
  accentGoldFaded: 'rgba(201, 168, 76, 0.3)',
  accentGreen: '#6abf7b',
  accentGreenBg: 'rgba(106, 191, 123, 0.1)',
  accentLinkColor: '#ddc070',

  humanColor: '#4a90d9',
  aiColor: '#d94a4a',
  humanZoneFill: 'rgba(74,144,217,0.12)',
  aiZoneFill: 'rgba(217,74,74,0.12)',
  emptyCellFill: 'rgba(200,180,140,0.04)',
  cellStroke: 'rgba(200,180,140,0.14)',
  lineStroke: 'rgba(200,180,140,0.08)',
  validMoveFill: 'rgba(106,191,123,0.4)',
  validMoveStroke: '#6abf7b',
  pieceShadow: 'rgba(0,0,0,0.25)',
  pieceHighlight: 'rgba(255,255,255,0.4)',
  selectionColor: '#c9a84c',

  pieceRadius: 14,
  selectionRingRadius: 18,
  selectionStrokeWidth: 3,
  cellRadius: 10,
  validMoveRadius: 12,
  clickTargetRadius: 17,

  pieceGlowRadius: 18,
  pieceGlowOpacity: 0.15,

  winBannerBg: 'linear-gradient(135deg, #1a3a1a, #0f2a0f)',
  winBannerColor: '#6abf7b',
  lossBannerBg: 'linear-gradient(135deg, #4a1a1a, #300f0f)',
  lossBannerColor: '#e8a0a0',

  panelShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',

  titleGradient: 'linear-gradient(135deg, #4a90d9, #d94a4a)',
};

// ---------- Holz ----------

const holz: ThemeTokens = {
  bgPrimary: '#2c1e0f',
  bgPanel: '#3d2b1a',
  bgInput: '#1f150a',
  bgButton: '#4a3525',
  bgButtonActive: '#5c4a35',
  bgOverlay: 'rgba(20, 12, 5, 0.75)',

  textPrimary: '#f5e6d3',
  textSecondary: '#c4a882',
  textMuted: '#8b7355',

  borderDefault: '#5c4a35',
  borderActive: '#d4a04a',

  accentBlue: '#5b9bd5',
  accentBlueLight: '#7bb8e8',
  accentBlueBg: '#3a4a5c',
  accentRed: '#d4644a',
  accentGold: '#d4a04a',
  accentGoldFaded: 'rgba(212, 160, 74, 0.3)',
  accentGreen: '#6abf7b',
  accentGreenBg: 'rgba(106, 191, 123, 0.1)',
  accentLinkColor: '#7bb8e8',

  humanColor: '#1a6fca',
  aiColor: '#c0392b',
  humanZoneFill: 'rgba(26,111,202,0.2)',
  aiZoneFill: 'rgba(192,57,43,0.2)',
  emptyCellFill: 'rgba(0,0,0,0.12)',
  cellStroke: 'rgba(0,0,0,0.3)',
  lineStroke: 'rgba(0,0,0,0.18)',
  validMoveFill: 'rgba(46,204,64,0.45)',
  validMoveStroke: '#27ae60',
  pieceShadow: 'rgba(0,0,0,0.4)',
  pieceHighlight: 'rgba(255,255,255,0.45)',
  selectionColor: '#f1c40f',

  pieceRadius: 14,
  selectionRingRadius: 18,
  selectionStrokeWidth: 3,
  cellRadius: 10,
  validMoveRadius: 12,
  clickTargetRadius: 17,

  pieceGlowRadius: 0,
  pieceGlowOpacity: 0,

  winBannerBg: 'linear-gradient(135deg, #2d4a2d, #1f3a1f)',
  winBannerColor: '#6abf7b',
  lossBannerBg: 'linear-gradient(135deg, #5c2a1a, #3d1a0f)',
  lossBannerColor: '#e8a090',

  panelShadow: '0 8px 32px rgba(20, 12, 5, 0.5)',

  titleGradient: 'linear-gradient(135deg, #5b9bd5, #d4644a)',
};

// ---------- High Contrast ----------

const highContrast: ThemeTokens = {
  bgPrimary: '#000000',
  bgPanel: '#1a1a1a',
  bgInput: '#0a0a0a',
  bgButton: '#2a2a2a',
  bgButtonActive: '#1a3a6a',
  bgOverlay: 'rgba(0, 0, 0, 0.85)',

  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  textMuted: '#999999',

  borderDefault: '#555555',
  borderActive: '#4dabf7',

  accentBlue: '#4dabf7',
  accentBlueLight: '#74c0fc',
  accentBlueBg: '#1a3a6a',
  accentRed: '#ff6b6b',
  accentGold: '#ffd43b',
  accentGoldFaded: 'rgba(255, 212, 59, 0.3)',
  accentGreen: '#51cf66',
  accentGreenBg: 'rgba(81, 207, 102, 0.15)',
  accentLinkColor: '#74c0fc',

  humanColor: '#4dabf7',
  aiColor: '#ff6b6b',
  humanZoneFill: 'rgba(77,171,247,0.2)',
  aiZoneFill: 'rgba(255,107,107,0.2)',
  emptyCellFill: 'rgba(255,255,255,0.08)',
  cellStroke: 'rgba(255,255,255,0.25)',
  lineStroke: 'rgba(255,255,255,0.12)',
  validMoveFill: 'rgba(81,207,102,0.5)',
  validMoveStroke: '#51cf66',
  pieceShadow: 'rgba(0,0,0,0.3)',
  pieceHighlight: 'rgba(255,255,255,0.35)',
  selectionColor: '#ffd43b',

  pieceRadius: 16,
  selectionRingRadius: 20,
  selectionStrokeWidth: 3,
  cellRadius: 11,
  validMoveRadius: 14,
  clickTargetRadius: 19,

  pieceGlowRadius: 0,
  pieceGlowOpacity: 0,

  winBannerBg: 'linear-gradient(135deg, #0a5a0a, #043a04)',
  winBannerColor: '#51cf66',
  lossBannerBg: 'linear-gradient(135deg, #8a1a1a, #5a0a0a)',
  lossBannerColor: '#ffa0a0',

  panelShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',

  titleGradient: 'linear-gradient(135deg, #4dabf7, #ff6b6b)',
};

// ---------- Hell ----------

const hell: ThemeTokens = {
  bgPrimary: '#f1f5f9',
  bgPanel: '#ffffff',
  bgInput: '#f1f5f9',
  bgButton: '#e2e8f0',
  bgButtonActive: '#bfdbfe',
  bgOverlay: 'rgba(0, 0, 0, 0.4)',

  textPrimary: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#94a3b8',

  borderDefault: '#cbd5e1',
  borderActive: '#2563eb',

  accentBlue: '#2563eb',
  accentBlueLight: '#3b82f6',
  accentBlueBg: '#dbeafe',
  accentRed: '#dc2626',
  accentGold: '#d97706',
  accentGoldFaded: 'rgba(217, 119, 6, 0.3)',
  accentGreen: '#16a34a',
  accentGreenBg: 'rgba(22, 163, 74, 0.1)',
  accentLinkColor: '#2563eb',

  humanColor: '#2563eb',
  aiColor: '#dc2626',
  humanZoneFill: 'rgba(37,99,235,0.15)',
  aiZoneFill: 'rgba(220,38,38,0.15)',
  emptyCellFill: 'rgba(0,0,0,0.08)',
  cellStroke: 'rgba(0,0,0,0.25)',
  lineStroke: 'rgba(0,0,0,0.15)',
  validMoveFill: 'rgba(22,163,74,0.3)',
  validMoveStroke: '#16a34a',
  pieceShadow: 'rgba(0,0,0,0.12)',
  pieceHighlight: 'rgba(255,255,255,0.5)',
  selectionColor: '#d97706',

  pieceRadius: 14,
  selectionRingRadius: 18,
  selectionStrokeWidth: 3,
  cellRadius: 10,
  validMoveRadius: 12,
  clickTargetRadius: 17,

  pieceGlowRadius: 0,
  pieceGlowOpacity: 0,

  winBannerBg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
  winBannerColor: '#16a34a',
  lossBannerBg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
  lossBannerColor: '#dc2626',

  panelShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',

  titleGradient: 'linear-gradient(135deg, #2563eb, #dc2626)',
};

export const THEMES: Record<ThemeId, ThemeTokens> = {
  standard,
  kosmos,
  neon,
  eleganz,
  holz,
  highContrast,
  hell,
};

export const THEME_IDS: ThemeId[] = [
  'standard', 'kosmos', 'neon', 'eleganz',
  'holz', 'highContrast', 'hell',
];

export const THEME_LABELS: Record<ThemeId, string> = {
  standard: 'Standard',
  kosmos: 'Kosmos',
  neon: 'Neon',
  eleganz: 'Eleganz',
  holz: 'Holz',
  highContrast: 'Kontrast',
  hell: 'Hell',
};
