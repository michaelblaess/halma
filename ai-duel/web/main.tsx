import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import Spectator from './Spectator';
import './spectator-base.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Spectator />
    </ThemeProvider>
  </StrictMode>,
);
