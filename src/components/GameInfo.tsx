import React, { useState } from 'react';
import type { GameState, Difficulty, Player } from '../model/types';
import { getGoalZone } from '../model/board';
import { musicToggle, musicIsPlaying } from '../audio/music';
import DifficultySelect from './DifficultySelect';

interface HighscoreEntry {
  time: number;
  date: string;
  name: string;
  result?: 'win' | 'loss';
  remaining?: number;
}

type Highscores = Record<Difficulty, HighscoreEntry[]>;

interface GameInfoProps {
  state: GameState;
  onEndTurn: () => void;
  onSetDifficulty: (d: Difficulty) => void;
  onSetSide: (p: Player) => void;
  onRestart: () => void;
  elapsedMs: number;
  highscores: Highscores;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
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

function sanitizeName(raw: string): string {
  const stripped = raw.replace(/<[^>]*>/g, '');
  const clean = stripped.replace(/[^a-zA-Z0-9äöüÄÖÜß \-]/g, '');
  return clean.slice(0, 20);
}

// --- Overlays ---

const HighscoreOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    fetch('/HIGHSCORE.md')
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then((text) => {
        const lines = text.split('\n').filter((l) => l.trim().startsWith('|'));
        const dataLines = lines.filter((l) => !l.includes('---'));
        const parsed = dataLines.map((line) =>
          line.split('|').map((cell) => cell.trim()).filter((cell) => cell.length > 0)
        );
        setRows(parsed);
      })
      .catch(() => setError(true));
  }, []);

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <button className="overlay-close" onClick={onClose}>✕</button>
        <h2>Highscore</h2>
        {error && <p className="overlay-error">HIGHSCORE.md nicht gefunden.</p>}
        {rows && rows.length > 0 && (
          <table className="overlay-table">
            <thead>
              <tr>{rows[0].map((cell, i) => <th key={i}>{cell}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        )}
        {rows && rows.length === 0 && <p>Keine Eintraege.</p>}
      </div>
    </div>
  );
};

const RulesOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="overlay-backdrop" onClick={onClose}>
    <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
      <button className="overlay-close" onClick={onClose}>✕</button>
      <h2>Spielregeln</h2>
      <ul className="rules-list">
        <li>Klicke auf einen blauen Stein, um ihn auszuwaehlen</li>
        <li>Klicke nochmal, um die Auswahl aufzuheben</li>
        <li>Klicke auf ein gruenes Feld, um zu ziehen</li>
        <li>Spruenge ueber Steine sind erlaubt</li>
        <li>Bringe alle Steine ins gegenueberliegende Dreieck!</li>
      </ul>
      <h3 className="rules-subheading">Wer faengt an?</h3>
      <ul className="rules-list">
        <li><strong>Leicht / Mittel:</strong> Du faengst an</li>
        <li><strong>Schwer:</strong> Die KI faengt an</li>
      </ul>
    </div>
  </div>
);

const AboutOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="overlay-backdrop" onClick={onClose}>
    <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
      <button className="overlay-close" onClick={onClose}>✕</button>
      <h2>Blitzhalma</h2>
      <div className="about-content">
        <p>Ein Sternhalma-Spiel gegen die KI.</p>
        <p className="about-author">von Michael Blaess</p>
        <p>
          <a
            href="https://github.com/michaelblaess/react-halma"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/michaelblaess/react-halma
          </a>
        </p>
        <p className="about-music">
          Hintergrundmusik lizenziert via AudioJungle (Envato Market).
        </p>
      </div>
    </div>
  </div>
);

// --- Main Component ---

const GameInfo: React.FC<GameInfoProps> = ({
  state,
  onSetDifficulty,
  onSetSide,
  onRestart,
  elapsedMs,
  highscores,
  playerName,
  onPlayerNameChange,
}) => {
  const { currentPlayer, humanPlayer, winner, isAiThinking, difficulty } = state;
  const isHumanTurn = currentPlayer === humanPlayer;
  const currentHighscores = highscores[difficulty];
  const [showOverlay, setShowOverlay] = useState<'highscore' | 'rules' | 'about' | null>(null);
  const [musicOn, setMusicOn] = useState(musicIsPlaying);

  const humanWon = winner === humanPlayer;
  const aiWon = winner !== null && !humanWon;

  let remainingPieces = 0;
  if (aiWon) {
    const goalZone = getGoalZone(humanPlayer);
    for (const pos of goalZone) {
      if (state.board.get(pos) !== humanPlayer) remainingPieces++;
    }
  }

  const snippetTime = formatTime(elapsedMs);
  const snippetDate = new Date().toISOString().slice(0, 10);
  const snippetName = playerName || 'Anonym';
  const snippet = `| ${snippetName} | ${snippetTime} | ${difficultyLabels[difficulty]} | ${snippetDate} |`;

  return (
    <div className="game-info">
      <div className="title-row">
        <h1>Blitzhalma</h1>
        <button
          className={`music-btn ${musicOn ? 'music-on' : ''}`}
          onClick={() => { musicToggle(); setMusicOn(musicIsPlaying()); }}
          title={musicOn ? 'Musik aus' : 'Musik an'}
        >
          {musicOn ? '\u266B' : '\u266A'}
        </button>
      </div>

      {/* Player Name */}
      <div className="name-input">
        <label htmlFor="player-name">Dein Name</label>
        <input
          id="player-name"
          type="text"
          maxLength={20}
          value={playerName}
          onChange={(e) => onPlayerNameChange(sanitizeName(e.target.value))}
          placeholder="Anonym"
        />
      </div>

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

      <div className="status">
        {!state.started ? (
          <div className="start-hint">
            Druecke &laquo;Neues Spiel&raquo; um zu starten
          </div>
        ) : winner ? (
          <div className={`winner-banner ${aiWon ? 'loss-banner' : ''}`}>
            {humanWon ? (
              'Du hast gewonnen!'
            ) : (
              <>
                KI hat gewonnen!
                <br />
                {remainingPieces === 1
                  ? 'Dir fehlte noch 1 Stein'
                  : `Dir fehlten noch ${remainingPieces} Steine`}
              </>
            )}
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

      {/* Markdown snippet on human win */}
      {humanWon && (
        <div className="win-snippet">
          <label>Fuer HIGHSCORE.md:</label>
          <code className="snippet-code" onClick={(e) => {
            navigator.clipboard.writeText(snippet);
            const el = e.currentTarget;
            el.classList.add('copied');
            setTimeout(() => el.classList.remove('copied'), 1500);
          }}>{snippet}</code>
          <span className="snippet-hint">Klick zum Kopieren</span>
        </div>
      )}

      <button className="restart-btn" onClick={onRestart}>
        Neues Spiel
      </button>

      {/* Button Row */}
      <div className="btn-row">
        <button className="panel-btn" onClick={() => setShowOverlay('highscore')}>
          Highscore
        </button>
        <button className="panel-btn" onClick={() => setShowOverlay('rules')}>
          Regeln
        </button>
        <button className="panel-btn" onClick={() => setShowOverlay('about')}>
          Info
        </button>
      </div>

      {showOverlay === 'highscore' && <HighscoreOverlay onClose={() => setShowOverlay(null)} />}
      {showOverlay === 'rules' && <RulesOverlay onClose={() => setShowOverlay(null)} />}
      {showOverlay === 'about' && <AboutOverlay onClose={() => setShowOverlay(null)} />}

      {/* Local Highscores */}
      {currentHighscores.length > 0 && (
        <div className="highscores">
          <h3>Spielverlauf ({difficultyLabels[difficulty]})</h3>
          <ol className="highscore-list">
            {currentHighscores.map((entry, i) => (
              <li key={i} className={entry.result === 'loss' ? 'hs-loss' : ''}>
                <span className="hs-name">{entry.name || 'Anonym'}</span>
                <span className="hs-time">{formatTime(entry.time)}</span>
                <span className="hs-result">
                  {entry.result === 'loss'
                    ? `✗ −${entry.remaining ?? '?'}`
                    : '✓'}
                </span>
                <span className="hs-date">{entry.date}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
