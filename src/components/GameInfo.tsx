import React from 'react';
import type { GameState, Difficulty, Player } from '../model/types';
import DifficultySelect from './DifficultySelect';

interface HighscoreEntry {
  time: number;
  date: string;
}

type Highscores = Record<Difficulty, HighscoreEntry[]>;

interface GameInfoProps {
  state: GameState;
  onEndTurn: () => void;
  onSetDifficulty: (d: Difficulty) => void;
  onSetSide: (p: Player) => void;
  onRestart: () => void;
  onToggleFastMode: () => void;
  elapsedMs: number;
  highscores: Highscores;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Leicht',
  medium: 'Mittel',
  hard: 'Schwer',
};

const GameInfo: React.FC<GameInfoProps> = ({
  state,
  onEndTurn,
  onSetDifficulty,
  onSetSide,
  onRestart,
  onToggleFastMode,
  elapsedMs,
  highscores,
}) => {
  const { currentPlayer, humanPlayer, winner, isAiThinking, jumpPath, difficulty, fastMode } = state;
  const isHumanTurn = currentPlayer === humanPlayer;
  const currentHighscores = highscores[difficulty];

  return (
    <div className="game-info">
      <h1>Sternhalma</h1>

      {/* Timer */}
      <div className="timer-display">
        <span className={`timer-value ${winner ? 'timer-stopped' : ''}`}>
          {formatTime(elapsedMs)}
        </span>
      </div>

      <DifficultySelect
        difficulty={difficulty}
        onChange={onSetDifficulty}
        disabled={isAiThinking}
      />

      <div className="side-select">
        <label>Startseite:</label>
        <div className="difficulty-buttons">
          <button
            className={`diff-btn ${humanPlayer === 2 ? 'active' : ''}`}
            onClick={() => onSetSide(2)}
            disabled={isAiThinking}
          >
            Unten
          </button>
          <button
            className={`diff-btn ${humanPlayer === 1 ? 'active' : ''}`}
            onClick={() => onSetSide(1)}
            disabled={isAiThinking}
          >
            Oben
          </button>
        </div>
      </div>

      {/* Fast Mode Toggle */}
      <div className="fast-mode-toggle">
        <label className="toggle-label">
          <span>Fast-Mode</span>
          <button
            className={`toggle-btn ${fastMode ? 'toggle-on' : 'toggle-off'}`}
            onClick={onToggleFastMode}
            title={fastMode ? 'Kettenspruenge deaktiviert' : 'Kettenspruenge aktiviert'}
          >
            <span className="toggle-knob" />
          </button>
        </label>
        <span className="toggle-hint">
          {fastMode ? 'Spruenge enden sofort' : 'Kettenspruenge moeglich'}
        </span>
      </div>

      <div className="status">
        {winner ? (
          <div className="winner-banner">
            {winner === humanPlayer ? 'Du hast gewonnen!' : 'KI hat gewonnen!'}
          </div>
        ) : isAiThinking ? (
          <div className="thinking">
            <span className="spinner" />
            KI denkt nach...
          </div>
        ) : (
          <div className="current-turn">
            <span
              className="turn-dot"
              style={{ background: isHumanTurn ? '#3b82f6' : '#ef4444' }}
            />
            {isHumanTurn ? 'Du bist dran' : 'KI ist dran'}
          </div>
        )}
      </div>

      {!fastMode && jumpPath.length > 0 && !winner && (
        <button className="end-turn-btn" onClick={onEndTurn}>
          Zug beenden
        </button>
      )}

      <button className="restart-btn" onClick={onRestart}>
        Neues Spiel
      </button>

      {/* Highscores */}
      {currentHighscores.length > 0 && (
        <div className="highscores">
          <h3>Bestzeiten ({difficultyLabels[difficulty]})</h3>
          <ol className="highscore-list">
            {currentHighscores.map((entry, i) => (
              <li key={i}>
                <span className="hs-time">{formatTime(entry.time)}</span>
                <span className="hs-date">{entry.date}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="rules">
        <h3>Spielregeln</h3>
        <ul>
          <li>Klicke auf einen blauen Stein, um ihn auszuwählen</li>
          <li>Klicke auf ein grünes Feld, um zu ziehen</li>
          <li>Sprünge über Steine sind erlaubt</li>
          {!fastMode && (
            <li>Bei Kettensprüngen: weiter springen oder &quot;Zug beenden&quot;</li>
          )}
          <li>Bringe alle Steine ins gegenüberliegende Dreieck!</li>
        </ul>
      </div>
    </div>
  );
};

export default GameInfo;
