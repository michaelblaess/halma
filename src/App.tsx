import { useState, useCallback, useEffect, useRef } from 'react';
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

  // Auto-start music on first user interaction
  useEffect(() => { musicAutoStart(); }, []);

  // --- Sound-wrapped callbacks ---

  const handleSelectPiece = useCallback((pos: string) => {
    // Detect deselect: clicking the already-selected piece
    if (state.selectedPiece === pos && state.jumpPath.length === 0) {
      soundDeselect();
    } else if (state.board.get(pos) === state.humanPlayer && !state.selectedPiece || state.selectedPiece !== pos) {
      soundSelect();
    }
    selectPiece(pos);
  }, [selectPiece, state.selectedPiece, state.jumpPath, state.board, state.humanPlayer]);

  const handleMovePiece = useCallback((to: string) => {
    soundMove();
    movePiece(to);
  }, [movePiece]);

  const handleRestart = useCallback(() => {
    soundRestart();
    restart();
  }, [restart]);

  // --- Sound effects on state changes ---

  // AI move completed
  const prevAiThinking = useRef(state.isAiThinking);
  useEffect(() => {
    if (prevAiThinking.current && !state.isAiThinking && !state.winner) {
      soundAiMove();
    }
    prevAiThinking.current = state.isAiThinking;
  }, [state.isAiThinking, state.winner]);

  // Win or loss
  const prevWinner = useRef(state.winner);
  useEffect(() => {
    if (!prevWinner.current && state.winner) {
      if (state.winner === state.humanPlayer) {
        soundWin();
      } else {
        soundLoss();
      }
    }
    prevWinner.current = state.winner;
  }, [state.winner, state.humanPlayer]);

  return (
    <div className={styles.app}>
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
