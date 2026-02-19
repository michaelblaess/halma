import React from 'react';
import type { GameState, Difficulty, Player } from '../model/types';
import DifficultySelect from './DifficultySelect';

interface GameInfoProps {
  state: GameState;
  onEndTurn: () => void;
  onSetDifficulty: (d: Difficulty) => void;
  onSetSide: (p: Player) => void;
  onRestart: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({
  state,
  onEndTurn,
  onSetDifficulty,
  onSetSide,
  onRestart,
}) => {
  const { currentPlayer, humanPlayer, winner, isAiThinking, jumpPath, difficulty } = state;
  const isHumanTurn = currentPlayer === humanPlayer;

  return (
    <div className="game-info">
      <h1>Sternhalma</h1>

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

      {jumpPath.length > 0 && !winner && (
        <button className="end-turn-btn" onClick={onEndTurn}>
          Zug beenden
        </button>
      )}

      <button className="restart-btn" onClick={onRestart}>
        Neues Spiel
      </button>

      <div className="rules">
        <h3>Spielregeln</h3>
        <ul>
          <li>Klicke auf einen blauen Stein, um ihn auszuwählen</li>
          <li>Klicke auf ein grünes Feld, um zu ziehen</li>
          <li>Sprünge über Steine sind erlaubt</li>
          <li>Bei Kettensprüngen: weiter springen oder &quot;Zug beenden&quot;</li>
          <li>Bringe alle Steine ins gegenüberliegende Dreieck!</li>
        </ul>
      </div>
    </div>
  );
};

export default GameInfo;
