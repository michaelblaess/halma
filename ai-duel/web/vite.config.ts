// Eigenstaendiger Vite-Einstieg fuer den Zuschauer.
//
// Der SSE-Endpunkt steckt als Middleware direkt im Dev-Server. Dadurch bleibt
// es bei EINEM Prozess und einem Origin, es gibt kein CORS und keinen zweiten
// Port zu starten. Die bestehende App unter src/ wird nicht angefasst.

import { defineConfig, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { statSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { statePath } from '../state.ts';

const POLL_MS = 300;

function duelStatePlugin() {
  return {
    name: 'duel-state-sse',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/state', (_req, res) => {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          // Verhindert, dass ein Proxy den Stream puffert.
          'X-Accel-Buffering': 'no',
        });

        const datei = statePath();
        let letzteAenderung = 0;

        const senden = (): void => {
          try {
            if (!existsSync(datei)) {
              res.write(`event: empty\ndata: {}\n\n`);
              letzteAenderung = 0;
              return;
            }
            const mtime = statSync(datei).mtimeMs;
            if (mtime === letzteAenderung) return;

            // Kann halb geschrieben sein. Dann einfach den naechsten Tick
            // abwarten, statt den Stream mit kaputtem JSON zu fuellen.
            const roh = readFileSync(datei, 'utf8');
            JSON.parse(roh);
            letzteAenderung = mtime;
            res.write(`data: ${roh.replace(/\n/g, '')}\n\n`);
          } catch {
            // Naechster Tick liest die fertig geschriebene Datei.
          }
        };

        senden();
        const timer = setInterval(senden, POLL_MS);
        // Heartbeat, damit Zwischenstationen die Verbindung nicht kappen.
        const ping = setInterval(() => res.write(': ping\n\n'), 20000);

        res.on('close', () => {
          clearInterval(timer);
          clearInterval(ping);
        });
      });
    },
  };
}

export default defineConfig({
  root: __dirname,
  // Das Icon der Hauptapp mitbenutzen, statt ein zweites zu pflegen.
  publicDir: resolve(__dirname, '../../public'),
  plugins: [react(), duelStatePlugin()],
  server: {
    port: 5174,
    open: true,
  },
});
