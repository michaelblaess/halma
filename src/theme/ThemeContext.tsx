import React, { createContext, useContext, useState, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { THEMES, type ThemeId, type ThemeTokens } from './themes';

interface ThemeContextValue {
  theme: ThemeTokens;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'halma-theme';

function detectDefaultTheme(): ThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in THEMES) return stored as ThemeId;
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'hell';
  return 'holz';
}

/**
 * Inject/update a <style id="theme-vars"> element in <head>.
 * A later <style> in <head> beats the static :root in index.css
 * (same specificity, later source order wins).
 */
function applyCssProperties(tokens: ThemeTokens) {
  let style = document.getElementById('theme-vars') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'theme-vars';
    document.head.appendChild(style);
  }
  style.textContent = `:root {
  --bg-primary: ${tokens.bgPrimary};
  --bg-panel: ${tokens.bgPanel};
  --bg-input: ${tokens.bgInput};
  --bg-button: ${tokens.bgButton};
  --bg-button-active: ${tokens.bgButtonActive};
  --bg-overlay: ${tokens.bgOverlay};
  --text-primary: ${tokens.textPrimary};
  --text-secondary: ${tokens.textSecondary};
  --text-muted: ${tokens.textMuted};
  --border-default: ${tokens.borderDefault};
  --border-active: ${tokens.borderActive};
  --accent-blue: ${tokens.accentBlue};
  --accent-blue-light: ${tokens.accentBlueLight};
  --accent-blue-bg: ${tokens.accentBlueBg};
  --accent-red: ${tokens.accentRed};
  --accent-gold: ${tokens.accentGold};
  --accent-gold-faded: ${tokens.accentGoldFaded};
  --accent-green: ${tokens.accentGreen};
  --accent-green-bg: ${tokens.accentGreenBg};
  --accent-link: ${tokens.accentLinkColor};
  --win-banner-bg: ${tokens.winBannerBg};
  --win-banner-color: ${tokens.winBannerColor};
  --loss-banner-bg: ${tokens.lossBannerBg};
  --loss-banner-color: ${tokens.lossBannerColor};
  --panel-shadow: ${tokens.panelShadow};
  --title-gradient: ${tokens.titleGradient};
}`;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(detectDefaultTheme);
  const theme = THEMES[themeId];

  const setThemeId = useCallback((id: ThemeId) => {
    applyCssProperties(THEMES[id]);
    setThemeIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  // Synchronous apply on mount and when theme changes (e.g. HMR)
  const appliedRef = useRef<ThemeId | null>(null);
  if (appliedRef.current !== themeId) {
    appliedRef.current = themeId;
    applyCssProperties(theme);
  }

  // Backup: also in layout effect for StrictMode double-render
  useLayoutEffect(() => {
    applyCssProperties(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, themeId, setThemeId }),
    [theme, themeId, setThemeId],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
