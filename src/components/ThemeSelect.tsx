import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { THEME_IDS, THEME_LABELS } from '../theme/themes';

const ThemeSelect: React.FC = () => {
  const { themeId, setThemeId } = useTheme();

  return (
    <div className="difficulty-select">
      <label>Design:</label>
      <div className="difficulty-buttons">
        {THEME_IDS.map((id) => (
          <button
            key={id}
            className={`diff-btn ${themeId === id ? 'active' : ''}`}
            onClick={() => setThemeId(id)}
          >
            {THEME_LABELS[id]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelect;
