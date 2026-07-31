// Zuschauer fuer das dritte Pane.
//
// Pollt state.json und zeichnet neu, sobald sich die Datei aendert. Bewusst
// Polling statt fs.watch: unter Windows meldet fs.watch je nach Editor und
// Netzlaufwerk unzuverlaessig, und 400 ms Verzoegerung faellt bei einem Spiel
// nicht ins Gewicht, dessen Zuege Sekunden brauchen.

import { statSync, readFileSync } from 'node:fs';
import { hasState, statePath, boardOf, type DuelState } from './state.ts';
import { renderAll, zugArt } from './render.ts';

const INTERVALL_MS = 400;

const RESET = '\x1b[0m';
const GRAU = '\x1b[38;5;240m';

function clear(): void {
  process.stdout.write('\x1b[2J\x1b[H');
}

function zeichne(state: DuelState): void {
  clear();
  console.log(renderAll(state, boardOf(state)));

  const letzte = state.history.slice(-6).reverse();
  if (letzte.length > 0) {
    console.log(`  ${GRAU}Verlauf:${RESET}`);
    for (const m of letzte) {
      const grund = m.why ? `  ${GRAU}${m.why.slice(0, 60)}${RESET}` : '';
      console.log(`  ${GRAU}${String(m.n).padStart(3)}.${RESET} S${m.player}  ${m.from} → ${m.to}  ${GRAU}(${zugArt(m.jumps)})${RESET}${grund}`);
    }
    console.log('');
  }

  console.log(`  ${GRAU}Zuschauer läuft, Abbruch mit Strg+C${RESET}`);
}

let letzteAenderung = 0;
let letzterFehler = '';

function tick(): void {
  if (!hasState()) {
    clear();
    console.log('');
    console.log('  Keine laufende Partie.');
    console.log('  Anlegen mit: npx tsx ai-duel/duel.ts new');
    console.log('');
    console.log(`  ${GRAU}Warte auf ${statePath()}${RESET}`);
    return;
  }

  try {
    const mtime = statSync(statePath()).mtimeMs;
    if (mtime === letzteAenderung) return;

    // Die Datei koennte gerade halb geschrieben sein. Dann einfach den
    // naechsten Durchlauf abwarten, statt den Zuschauer abstuerzen zu lassen.
    const state = JSON.parse(readFileSync(statePath(), 'utf8')) as DuelState;
    letzteAenderung = mtime;
    letzterFehler = '';
    zeichne(state);
  } catch (e) {
    const meldung = e instanceof Error ? e.message : String(e);
    if (meldung !== letzterFehler) {
      letzterFehler = meldung;
    }
    // Kein Abbruch: der naechste Tick liest die fertig geschriebene Datei.
  }
}

clear();
console.log('  Halma-Zuschauer startet …');
tick();
setInterval(tick, INTERVALL_MS);
