// Zuschauer-Ansicht.
//
// Baut aus dem DuelState einen GameState, wie ihn Board.tsx erwartet, und
// reicht No-Op-Callbacks durch. Board.tsx bleibt dadurch voellig unveraendert:
// mit isAiThinking=true und leeren validMoves schaltet es von allein in einen
// nicht interaktiven Zustand, es gibt also keine Klickziele und keinen
// Tastaturfokus.

import React, { useEffect, useMemo, useState } from 'react';
import Board from '../../src/components/Board';
import { getGoalZone, deserializeBoard } from '../../src/model/board';
import type { CellState, GameState, Player } from '../../src/model/types';
import type { DuelState } from '../state';
import styles from './Spectator.module.css';

const NOOP = (): void => undefined;

function zugArt(jumps: number): string {
  if (jumps === 0) return 'Schritt';
  if (jumps === 1) return '1 Sprung';
  return `Kette, ${jumps} Sprünge`;
}

function zeit(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '';
  }
}

/** Zaehlt, wie viele Zielfelder ein Spieler bereits besetzt. */
function fortschritt(board: Map<string, CellState>, player: Player): { drin: number; gesamt: number } {
  const goal = getGoalZone(player);
  let drin = 0;
  for (const pos of goal) {
    if (board.get(pos) === player) drin++;
  }
  return { drin, gesamt: goal.size };
}

const Spectator: React.FC = () => {
  const [duel, setDuel] = useState<DuelState | null>(null);
  const [verbunden, setVerbunden] = useState(false);
  const [leer, setLeer] = useState(false);

  useEffect(() => {
    const quelle = new EventSource('/api/state');

    quelle.onopen = () => setVerbunden(true);
    quelle.onerror = () => setVerbunden(false);
    quelle.onmessage = (e) => {
      try {
        setDuel(JSON.parse(e.data) as DuelState);
        setLeer(false);
      } catch {
        // Unvollstaendige Nachricht ignorieren, die naechste kommt gleich.
      }
    };
    quelle.addEventListener('empty', () => {
      setLeer(true);
      setDuel(null);
    });

    return () => quelle.close();
  }, []);

  const board = useMemo(
    () => (duel ? deserializeBoard(duel.board) : new Map<string, CellState>()),
    [duel],
  );

  // Board.tsx erwartet einen GameState. Der letzte Zug wird als selectedPiece
  // markiert, dadurch bekommt der zuletzt gezogene Stein den Auswahlring.
  const gameState = useMemo<GameState | null>(() => {
    if (!duel) return null;
    const letzter = duel.history[duel.history.length - 1];
    return {
      board,
      currentPlayer: duel.currentPlayer,
      humanPlayer: 2,
      playerCount: duel.playerCount,
      players: duel.players,
      aiPlayers: duel.players,
      selectedPiece: letzter ? letzter.to : null,
      validMoves: [],
      jumpPath: [],
      winner: duel.winner,
      difficulty: 'hard',
      isAiThinking: true,
      fastMode: false,
      started: true,
      startTime: null,
      endTime: null,
      lastMoveJumps: letzter ? letzter.jumps : 0,
    };
  }, [duel, board]);

  if (leer || !duel || !gameState) {
    return (
      <div className={styles.leer}>
        <h1>Halma - KI gegen KI</h1>
        <p>Keine laufende Partie.</p>
        <code>npx tsx ai-duel/duel.ts new</code>
        <p className={styles.status}>
          {verbunden ? 'Verbunden, warte auf den ersten Zug.' : 'Keine Verbindung zum Server.'}
        </p>
      </div>
    );
  }

  const verlauf = [...duel.history].reverse();

  return (
    <div className={styles.seite}>
      <header className={styles.kopf}>
        <h1>Halma - KI gegen KI</h1>
        {duel.winner ? (
          <div className={`${styles.badge} ${styles.sieg}`}>
            Sieg für Spieler {duel.winner} nach {duel.moveNumber} Zügen
          </div>
        ) : (
          <div className={`${styles.badge} ${styles[`p${duel.currentPlayer}`]}`}>
            Zug {duel.moveNumber + 1} · Spieler {duel.currentPlayer} ist am Zug
          </div>
        )}
      </header>

      <div className={styles.inhalt}>
        <div className={styles.brett}>
          <Board state={gameState} onSelectPiece={NOOP} onMovePiece={NOOP} />
        </div>

        <aside className={styles.seitenleiste}>
          <section className={styles.spieler}>
            {duel.players.map((p) => {
              const { drin, gesamt } = fortschritt(board, p);
              return (
                <div key={p} className={`${styles.sitz} ${styles[`p${p}`]}`}>
                  <div className={styles.sitzKopf}>
                    <span className={styles.punkt} />
                    <strong>Spieler {p}</strong>
                    <span className={styles.name}>{duel.seats[p] ?? ''}</span>
                  </div>
                  <div className={styles.balken}>
                    <div className={styles.balkenFuell} style={{ width: `${(drin / gesamt) * 100}%` }} />
                  </div>
                  <div className={styles.zahl}>{drin} / {gesamt} im Ziel</div>
                </div>
              );
            })}
          </section>

          <section className={styles.verlauf}>
            <h2>Verlauf</h2>
            {verlauf.length === 0 && <p className={styles.status}>Noch kein Zug.</p>}
            <ol>
              {verlauf.map((m) => (
                <li key={`${m.n}-${m.ts}`} className={styles[`p${m.player}`]}>
                  <div className={styles.zugKopf}>
                    <span className={styles.nummer}>{m.n}</span>
                    <span className={styles.felder}>{m.from} → {m.to}</span>
                    <span className={styles.art}>{zugArt(m.jumps)}</span>
                    <span className={styles.uhr}>{zeit(m.ts)}</span>
                  </div>
                  {m.why && <div className={styles.grund}>{m.why}</div>}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <footer className={styles.fuss}>
        {verbunden ? 'Live verbunden' : 'Verbindung unterbrochen'} · Stand {zeit(duel.updatedAt)}
      </footer>
    </div>
  );
};

export default Spectator;
