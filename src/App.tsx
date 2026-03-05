import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useGame } from './hooks/useGame';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import styles from './App.module.css';
import {
  soundSelect,
  soundDeselect,
  soundMove,
  soundAiMove,
  soundWin,
  soundLoss,
  soundRestart,
} from './audio/sounds';
import { musicAutoStart } from './audio/music';
import { useHaptics } from './hooks/useHaptics';

const PLAYER_NAME_KEY = 'halma-player-name';

function loadPlayerName(): string {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) || '';
  } catch {
    return '';
  }
}

function App() {
  const [playerName, setPlayerName] = useState(loadPlayerName);

  const handlePlayerNameChange = useCallback((name: string) => {
    setPlayerName(name);
    try {
      localStorage.setItem(PLAYER_NAME_KEY, name);
    } catch { /* ignore */ }
  }, []);

  const {
    state,
    selectPiece,
    movePiece,
    endTurn,
    setDifficulty,
    setSide,
    restart,
    elapsedMs,
    highscores,
  } = useGame(playerName);

  const {
    hapticSelect, hapticDeselect, hapticMove, hapticAiMove,
    hapticWin, hapticLoss, hapticRestart,
  } = useHaptics();

  // Auto-start music on first user interaction
  useEffect(() => { musicAutoStart(); }, []);

  // --- Sound-wrapped callbacks ---

  const handleSelectPiece = useCallback((pos: string) => {
    // Detect deselect: clicking the already-selected piece
    if (state.selectedPiece === pos && state.jumpPath.length === 0) {
      soundDeselect();
      hapticDeselect();
    } else if (state.board.get(pos) === state.humanPlayer && !state.selectedPiece || state.selectedPiece !== pos) {
      soundSelect();
      hapticSelect();
    }
    selectPiece(pos);
  }, [selectPiece, state.selectedPiece, state.jumpPath, state.board, state.humanPlayer, hapticSelect, hapticDeselect]);

  const handleMovePiece = useCallback((to: string) => {
    soundMove();
    hapticMove();
    movePiece(to);
  }, [movePiece, hapticMove]);

  const handleRestart = useCallback(() => {
    soundRestart();
    hapticRestart();
    restart();
  }, [restart, hapticRestart]);

  // --- Sound effects on state changes ---

  // AI move completed
  const prevAiThinking = useRef(state.isAiThinking);
  useEffect(() => {
    if (prevAiThinking.current && !state.isAiThinking && !state.winner) {
      soundAiMove();
      hapticAiMove();
    }
    prevAiThinking.current = state.isAiThinking;
  }, [state.isAiThinking, state.winner, hapticAiMove]);

  // Win or loss
  const prevWinner = useRef(state.winner);
  useEffect(() => {
    if (!prevWinner.current && state.winner) {
      if (state.winner === state.humanPlayer) {
        soundWin();
        hapticWin();
      } else {
        soundLoss();
        hapticLoss();
      }
    }
    prevWinner.current = state.winner;
  }, [state.winner, state.humanPlayer, hapticWin, hapticLoss]);

  const statusText = useMemo(() => {
    if (!state.started) return '';
    if (state.winner) {
      return state.winner === state.humanPlayer ? 'Gewonnen!' : 'Verloren!';
    }
    if (state.isAiThinking) return 'KI denkt nach';
    return state.currentPlayer === state.humanPlayer ? 'Du bist dran' : 'KI ist dran';
  }, [state.started, state.winner, state.humanPlayer, state.isAiThinking, state.currentPlayer]);

  return (
    <div className={styles.app}>
      <a href="#game-board" className="skip-link">Zum Spielbrett springen</a>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusText}
      </div>
      <header className={styles.mobileHeader}>
        <h1>Blitzhalma</h1>
      </header>
      <Board state={state} onSelectPiece={handleSelectPiece} onMovePiece={handleMovePiece} />
      <GameInfo
        state={state}
        onEndTurn={endTurn}
        onSetDifficulty={setDifficulty}
        onSetSide={setSide}
        onRestart={handleRestart}
        elapsedMs={elapsedMs}
        highscores={highscores}
        playerName={playerName}
        onPlayerNameChange={handlePlayerNameChange}
      />
    </div>
  );
}

export default App;
