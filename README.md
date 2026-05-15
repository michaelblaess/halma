# Halma — Chinese Checkers vs AI

<p align="center">
  <img src="docs/flags/gb.svg" height="13" alt=""> <b>English</b> ·
  <img src="docs/flags/de.svg" height="13" alt=""> <a href="README.de.md">Deutsch</a>
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

## Project Structure

```
src/
  model/         Types, board setup, game logic
  hooks/         useGame (reducer, timer, highscores)
  components/    Board, GameInfo, DifficultySelect, Piece, ThemeSelect
  theme/         themes.ts (7 themes + tokens), ThemeContext.tsx
  ai/            AI Worker (Minimax algorithm)
  audio/         sounds.ts (SFX), music.ts (background music)
docs/            GitHub Pages landing page
public/
  music/         Licensed MP3 tracks (not in repo, see public/music/README.md)
  HIGHSCORE.md   Highscore table
```

## Music

Background music is **not included in the repository** as the tracks are
commercially licensed (AudioJungle / Envato Market).
The game works fine without music — see [`public/music/README.md`](public/music/README.md) for details and file names.

## Disclaimer

Halma is a classic board game invented in 1883 by George Howard Monks.
The star halma variant (also known as "Chinese Checkers") was created in 1892.
This website is a non-commercial hobby project and is not affiliated with
any commercial Halma products or their manufacturers.

## License

Apache License 2.0 — see [LICENSE](LICENSE).
