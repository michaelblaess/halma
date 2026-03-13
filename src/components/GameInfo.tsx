import React, { useState } from 'react';
import type { GameState, Difficulty, Player } from '../model/types';
import { getGoalZone } from '../model/board';
import { musicToggle, musicIsPlaying } from '../audio/music';
import { useTheme } from '../theme/ThemeContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import DifficultySelect from './DifficultySelect';
import ThemeSelect from './ThemeSelect';

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
  const panelRef = useFocusTrap(onClose);

  React.useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}HIGHSCORE.md`)
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
      <div ref={panelRef} className="overlay-panel" role="dialog" aria-modal="true" aria-labelledby="hs-title" onClick={(e) => e.stopPropagation()}>
        <button className="overlay-close" onClick={onClose} aria-label="Schliessen">✕</button>
        <h2 id="hs-title">Highscore</h2>
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

const RulesOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const panelRef = useFocusTrap(onClose);
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div ref={panelRef} className="overlay-panel" role="dialog" aria-modal="true" aria-labelledby="rules-title" onClick={(e) => e.stopPropagation()}>
        <button className="overlay-close" onClick={onClose} aria-label="Schliessen">✕</button>
        <h2 id="rules-title">Spielregeln</h2>
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
};

const AboutOverlay: React.FC<{ onClose: () => void; onShowImpressum: () => void }> = ({ onClose, onShowImpressum }) => {
  const panelRef = useFocusTrap(onClose);
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div ref={panelRef} className="overlay-panel" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={(e) => e.stopPropagation()}>
        <button className="overlay-close" onClick={onClose} aria-label="Schliessen">✕</button>
        <h2 id="about-title">Halma</h2>
        <div className="about-content">
          <p>Ein Sternhalma-Spiel gegen die KI.</p>
          <p className="about-author">von Michael Blaess</p>
          <p>
            <a
              href="https://github.com/michaelblaess/halma"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/michaelblaess/halma
            </a>
          </p>
          <p className="about-music">
            Hintergrundmusik lizenziert via AudioJungle (Envato Market).
          </p>
          <p className="about-disclaimer">
            Halma ist ein klassisches Brettspiel (1883). Diese Webseite ist ein
            nicht-kommerzielles Hobby-Projekt und steht in keiner Verbindung zu
            kommerziellen Halma-Produkten oder deren Herstellern.
          </p>
          <button className="about-impressum-link" onClick={(e) => { e.stopPropagation(); onShowImpressum(); }}>
            Impressum
          </button>
        </div>
      </div>
    </div>
  );
};

const ImpressumOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const panelRef = useFocusTrap(onClose);
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div ref={panelRef} className="overlay-panel" role="dialog" aria-modal="true" aria-labelledby="impressum-title" onClick={(e) => e.stopPropagation()}>
        <button className="overlay-close" onClick={onClose} aria-label="Schliessen">✕</button>
        <h2 id="impressum-title">Impressum</h2>
        <div className="impressum-content">
          <h3>Angaben gemäß § 5 TMG</h3>
          <p>Michael Blaess<br />Kurze Str. 2<br />15345 Rehfelde<br />Deutschland</p>
          <h3>Kontakt</h3>
          <p>E-Mail: <a href="mailto:mail@michaelblaess.de">mail@michaelblaess.de</a></p>
          <h3>Umsatzsteuer-ID</h3>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE297191527</p>
          <h3>Haftung für Links</h3>
          <p>Dieses Angebot enthält Links zu externen Webseiten, auf deren Inhalte ich keinen Einfluss habe. Für die Inhalte der verlinkten Seiten ist der jeweilige Anbieter verantwortlich.</p>
          <h3>Streitbeilegung</h3>
          <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
        </div>
      </div>
    </div>
  );
};

// --- Status renderer (shared between compact bar and desktop panel) ---

function StatusDisplay({ state, remainingPieces, humanWon, aiWon: _aiWon, humanColor, aiColor }: {
  state: GameState;
  remainingPieces: number;
  humanWon: boolean;
  aiWon: boolean;
  humanColor: string;
  aiColor: string;
}) {
  const { humanPlayer, currentPlayer, winner, isAiThinking } = state;
  const isHumanTurn = currentPlayer === humanPlayer;

  if (!state.started) {
    return <span className="start-hint">Druecke &laquo;Neues Spiel&raquo;</span>;
  }
  if (winner) {
    return (
      <span className={humanWon ? 'status-win' : 'status-loss'}>
        {humanWon ? 'Gewonnen!' : `Verloren (−${remainingPieces})`}
      </span>
    );
  }
  if (isAiThinking) {
    return <><span className="spinner" /> KI denkt...</>;
  }
  return (
    <>
      <span className="turn-dot" style={{ background: isHumanTurn ? humanColor : aiColor }} />
      {isHumanTurn ? 'Du bist dran' : 'KI ist dran'}
    </>
  );
}

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
  const { theme } = useTheme();
  const { humanPlayer, winner, isAiThinking, difficulty } = state;
  const currentHighscores = highscores[difficulty];
  const [showOverlay, setShowOverlay] = useState<'highscore' | 'rules' | 'about' | 'impressum' | null>(null);
  const [musicOn, setMusicOn] = useState(musicIsPlaying);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const humanWon = winner === humanPlayer;
  const aiWon = winner !== null && !humanWon;

  let remainingPieces = 0;
  if (aiWon) {
    const goalZone = getGoalZone(humanPlayer);
    for (const [pos, cell] of state.board) {
      if (cell === humanPlayer && !goalZone.has(pos)) remainingPieces++;
    }
  }

  const snippetTime = formatTime(elapsedMs);
  const snippetDate = new Date().toISOString().slice(0, 10);
  const snippetName = playerName || 'Anonym';
  const snippet = `| ${snippetName} | ${snippetTime} | ${difficultyLabels[difficulty]} | ${snippetDate} |`;

  const handleMusicToggle = () => {
    musicToggle();
    setMusicOn(musicIsPlaying());
  };

  return (
    <div className="game-info">
      {/* ===== Compact bar (tablet/mobile only via CSS) ===== */}
      <div className="compact-bar">
        <span className={`compact-timer ${winner ? 'timer-stopped' : ''}`}>
          {formatTime(elapsedMs)}
        </span>
        <span className="compact-status">
          <StatusDisplay state={state} remainingPieces={remainingPieces} humanWon={humanWon} aiWon={aiWon} humanColor={theme.humanColor} aiColor={theme.aiColor} />
        </span>
        <button className="compact-btn" onClick={onRestart} aria-label="Neues Spiel">&#9654;</button>
        <button
          className={`compact-btn ${musicOn ? 'music-on' : ''}`}
          onClick={handleMusicToggle}
          aria-label={musicOn ? 'Musik aus' : 'Musik an'}
          aria-pressed={musicOn}
        >
          {musicOn ? '\u266B' : '\u266A'}
        </button>
        <button
          className={`compact-btn ${drawerOpen ? 'drawer-active' : ''}`}
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label="Einstellungen"
          aria-expanded={drawerOpen}
        >
          &#9881;
        </button>
      </div>

      {/* ===== Drawer (tablet/mobile: toggleable, desktop: hidden via CSS) ===== */}
      <div className={`drawer ${drawerOpen ? 'drawer-open' : ''}`}>
        <div className="drawer-content">
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
                aria-pressed={humanPlayer === 2}
              >
                Unten
              </button>
              <button
                className={`diff-btn ${humanPlayer === 1 ? 'active' : ''}`}
                onClick={() => onSetSide(1)}
                disabled={isAiThinking}
                aria-pressed={humanPlayer === 1}
              >
                Oben
              </button>
            </div>
          </div>

          <ThemeSelect />

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

          {currentHighscores.length > 0 && (
            <div className="highscores">
              <h3>Spielverlauf ({difficultyLabels[difficulty]})</h3>
              <ol className="highscore-list">
                {currentHighscores.map((entry, i) => (
                  <li key={i} className={entry.result === 'loss' ? 'hs-loss' : ''}>
                    <span className="hs-name">{entry.name || 'Anonym'}</span>
                    <span className="hs-time">{formatTime(entry.time)}</span>
                    <span className="hs-result">
                      {entry.result === 'loss' ? `✗ −${entry.remaining ?? '?'}` : '✓'}
                    </span>
                    <span className="hs-date">{entry.date}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* ===== Desktop panel (hidden on tablet/mobile via CSS) ===== */}
      <div className="desktop-panel">
        <div className="title-row">
          <h1>Halma</h1>
          <button
            className={`music-btn ${musicOn ? 'music-on' : ''}`}
            onClick={handleMusicToggle}
            aria-label={musicOn ? 'Musik aus' : 'Musik an'}
            aria-pressed={musicOn}
          >
            {musicOn ? '\u266B' : '\u266A'}
          </button>
        </div>

        <div className="name-input">
          <label htmlFor="player-name-d">Dein Name</label>
          <input
            id="player-name-d"
            type="text"
            maxLength={20}
            value={playerName}
            onChange={(e) => onPlayerNameChange(sanitizeName(e.target.value))}
            placeholder="Anonym"
          />
        </div>

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

        <ThemeSelect />

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
                style={{ background: state.currentPlayer === humanPlayer ? theme.humanColor : theme.aiColor }}
              />
              {state.currentPlayer === humanPlayer ? 'Du bist dran' : 'KI ist dran'}
            </div>
          )}
        </div>

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

        {currentHighscores.length > 0 && (
          <div className="highscores">
            <h3>Spielverlauf ({difficultyLabels[difficulty]})</h3>
            <ol className="highscore-list">
              {currentHighscores.map((entry, i) => (
                <li key={i} className={entry.result === 'loss' ? 'hs-loss' : ''}>
                  <span className="hs-name">{entry.name || 'Anonym'}</span>
                  <span className="hs-time">{formatTime(entry.time)}</span>
                  <span className="hs-result">
                    {entry.result === 'loss' ? `✗ −${entry.remaining ?? '?'}` : '✓'}
                  </span>
                  <span className="hs-date">{entry.date}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {showOverlay === 'highscore' && <HighscoreOverlay onClose={() => setShowOverlay(null)} />}
      {showOverlay === 'rules' && <RulesOverlay onClose={() => setShowOverlay(null)} />}
      {showOverlay === 'about' && <AboutOverlay onClose={() => setShowOverlay(null)} onShowImpressum={() => setShowOverlay('impressum')} />}
      {showOverlay === 'impressum' && <ImpressumOverlay onClose={() => setShowOverlay(null)} />}
    </div>
  );
};

export default GameInfo;
