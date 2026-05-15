# Halma — Sternhalma gegen die KI

<p align="center">
  <img src="docs/flags/gb.svg" height="13" alt=""> <a href="README.md">English</a> ·
  <img src="docs/flags/de.svg" height="13" alt=""> <b>Deutsch</b>
</p>

---

[![Stars](https://img.shields.io/github/stars/michaelblaess/halma?logo=github&logoColor=white&color=fbbf24)](https://github.com/michaelblaess/halma/stargazers)
[![Forks](https://img.shields.io/github/forks/michaelblaess/halma?logo=github&logoColor=white&color=34d399)](https://github.com/michaelblaess/halma/network/members)
[![Issues](https://img.shields.io/github/issues/michaelblaess/halma?logo=github&logoColor=white&color=f87171)](https://github.com/michaelblaess/halma/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/michaelblaess/halma?logo=github&logoColor=white&color=a78bfa)](https://github.com/michaelblaess/halma/pulls)

[![Last Commit](https://img.shields.io/github/last-commit/michaelblaess/halma?logo=git&logoColor=white&color=3b82f6)](https://github.com/michaelblaess/halma/commits/main)
[![License](https://img.shields.io/badge/license-Apache_2.0-3b82f6)](LICENSE)
[![React](https://img.shields.io/badge/react-19-3b82f6?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5-3b82f6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Ein Sternhalma-Brettspiel (Chinese Checkers) gegen die KI, direkt im Browser spielbar.
Drei Schwierigkeitsstufen, sieben Themes, Hintergrundmusik, Highscores und vollständig offline-fähig als PWA.

## Features

- **KI-Gegner** — Minimax-Algorithmus in drei Stufen (Leicht / Mittel / Schwer), läuft im Web Worker
- **7 Themes** — Standard, Kosmos, Neon, Eleganz, Holz, High-Contrast, Hell (auto-detect via `prefers-color-scheme`)
- **Sound & Musik** — Generierte SFX via Web Audio API, lizenzierte Hintergrundmusik mit Shuffle-Playlist
- **PWA & Offline** — Installierbar als App, vollständig offline spielbar dank Service Worker
- **Speed-Timer** — Zeitmessung mit Zehntel-Sekunden, lokale Highscores pro Schwierigkeitsstufe
- **Barrierefreiheit** — ARIA-Labels, Keyboard-Navigation, Focus-Styles, Screen-Reader-Support, `prefers-reduced-motion`
- **Seitenwahl** — Oben oder Unten starten
- **Spielername** — Frei wählbar, wird lokal gespeichert

## Tech Stack

| Technologie | Verwendung |
|---|---|
| React 19 | UI-Rendering |
| TypeScript | Typsicherheit |
| Vite 7 | Build-Tool & Dev-Server |
| CSS Modules + CSS Custom Properties | Styling & Theming |
| Web Workers | KI-Berechnung (non-blocking) |
| Web Audio API | Sound-Effekte |
| vite-plugin-pwa | Service Worker & Manifest |

## Entwicklung

```bash
# Abhaengigkeiten installieren
npm install

# Dev-Server starten
npm run dev

# Produktions-Build
npm run build

# Build-Vorschau
npm run preview
```

## Projektstruktur

```
src/
  model/         Typen, Board-Setup, Spiellogik
  hooks/         useGame (Reducer, Timer, Highscores)
  components/    Board, GameInfo, DifficultySelect, Piece, ThemeSelect
  theme/         themes.ts (7 Themes + Tokens), ThemeContext.tsx
  ai/            AI Worker (Minimax-Algorithmus)
  audio/         sounds.ts (SFX), music.ts (Hintergrundmusik)
docs/            GitHub Pages Landing Page
public/
  music/         Lizenzierte MP3-Tracks (nicht im Repo, siehe public/music/README.md)
  HIGHSCORE.md   Highscore-Tabelle
```

## Musik

Die Hintergrundmusik ist **nicht im Repository enthalten**, da die Tracks über
kommerzielle Lizenzen (AudioJungle / Envato Market) bezogen wurden.
Das Spiel funktioniert auch ohne Musik — Details und Dateinamen stehen in
[`public/music/README.md`](public/music/README.md).

## Disclaimer

Halma ist ein klassisches Brettspiel, erfunden 1883 von George Howard Monks.
Die Sternhalma-Variante (auch bekannt als "Chinese Checkers") entstand 1892.
Diese Webseite ist ein nicht-kommerzielles Hobby-Projekt und steht in keiner
Verbindung zu kommerziellen Halma-Produkten oder deren Herstellern.

## Lizenz

Apache License 2.0 — siehe [LICENSE](LICENSE).
