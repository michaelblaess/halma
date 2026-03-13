# Halma — Sternhalma gegen die KI

Ein Sternhalma-Brettspiel (Chinese Checkers) gegen die KI, direkt im Browser spielbar.
Drei Schwierigkeitsstufen, sieben Themes, Hintergrundmusik, Highscores und vollstaendig offline-faehig als PWA.

> **[English version below](#halma--chinese-checkers-vs-ai)**

## Features

- **KI-Gegner** — Minimax-Algorithmus in drei Stufen (Leicht / Mittel / Schwer), laeuft im Web Worker
- **7 Themes** — Standard, Kosmos, Neon, Eleganz, Holz, High-Contrast, Hell (auto-detect via `prefers-color-scheme`)
- **Sound & Musik** — Generierte SFX via Web Audio API, lizenzierte Hintergrundmusik mit Shuffle-Playlist
- **PWA & Offline** — Installierbar als App, vollstaendig offline spielbar dank Service Worker
- **Speed-Timer** — Zeitmessung mit Zehntel-Sekunden, lokale Highscores pro Schwierigkeitsstufe
- **Barrierefreiheit** — ARIA-Labels, Keyboard-Navigation, Focus-Styles, Screen-Reader-Support, `prefers-reduced-motion`
- **Seitenwahl** — Oben oder Unten starten
- **Spielername** — Frei waehlbar, wird lokal gespeichert

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

Die Hintergrundmusik ist **nicht im Repository enthalten**, da die Tracks ueber
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

---

# Halma — Chinese Checkers vs AI

A Chinese Checkers (star halma) board game against AI, playable directly in the browser.
Three difficulty levels, seven themes, background music, highscores, and fully offline-capable as a PWA.

## Features

- **AI Opponent** — Minimax algorithm with three difficulty levels (Easy / Medium / Hard), runs in a Web Worker
- **7 Themes** — Standard, Cosmos, Neon, Elegance, Wood, High-Contrast, Light (auto-detect via `prefers-color-scheme`)
- **Sound & Music** — Generated SFX via Web Audio API, licensed background music with shuffle playlist
- **PWA & Offline** — Installable as an app, fully playable offline thanks to Service Worker
- **Speed Timer** — Time tracking with tenths of seconds, local highscores per difficulty level
- **Accessibility** — ARIA labels, keyboard navigation, focus styles, screen reader support, `prefers-reduced-motion`
- **Side Selection** — Start from top or bottom
- **Player Name** — Customizable, stored locally

## Tech Stack

| Technology | Usage |
|---|---|
| React 19 | UI rendering |
| TypeScript | Type safety |
| Vite 7 | Build tool & dev server |
| CSS Modules + CSS Custom Properties | Styling & theming |
| Web Workers | AI computation (non-blocking) |
| Web Audio API | Sound effects |
| vite-plugin-pwa | Service worker & manifest |

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

## Music

Background music is **not included in the repository** as the tracks are
commercially licensed (AudioJungle / Envato Market).
The game works fine without music — see [`public/music/README.md`](public/music/README.md) for details.

## Disclaimer

Halma is a classic board game invented in 1883 by George Howard Monks.
The star halma variant (also known as "Chinese Checkers") was created in 1892.
This website is a non-commercial hobby project and is not affiliated with
any commercial Halma products or their manufacturers.

## License

Apache License 2.0 — see [LICENSE](LICENSE).
