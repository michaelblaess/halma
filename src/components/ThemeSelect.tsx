import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { THEME_IDS, THEME_LABELS } from '../theme/themes';

// TODO: Kosmos, Neon, Eleganz werden noch überarbeitet — vorerst ausgeblendet
const HIDDEN_THEMES: Set<string> = new Set(['kosmos', 'neon', 'eleganz']);
const VISIBLE = THEME_IDS.filter((id) => !HIDDEN_THEMES.has(id));
const ROW1 = VISIBLE.slice(0, 4); // Standard, Holz, Kontrast, Hell
const ROW2 = VISIBLE.slice(4);

const ThemeSelect: React.FC = () => {
  const { themeId, setThemeId } = useTheme();

  const renderRow = (ids: typeof THEME_IDS) => (
    <div className="difficulty-buttons theme-buttons">
      {ids.map((id) => (
        <button
          key={id}
          className={`diff-btn ${themeId === id ? 'active' : ''}`}
          onClick={() => setThemeId(id)}
          aria-pressed={themeId === id}
        >
          {THEME_LABELS[id]}
        </button>
      ))}
    </div>
  );

  return (
    <div className="difficulty-select">
      <label>Design:</label>
      {renderRow(ROW1)}
      <div style={{ marginTop: 6 }}>
        {renderRow(ROW2)}
      </div>
    </div>
  );
};

export default ThemeSelect;
