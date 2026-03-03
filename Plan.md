# Blitzhalma — Projektplan

## Name & Domain

- **Name**: Blitzhalma
- **Domains**: blitzhalma.de (evtl. blitz-halma.de)
- **Hosting**: NetCup (React Static Build)
- **Repo**: github.com/michaelblaess/react-halma

## Tech-Stack

- **Frontend**: React 19 + TypeScript + Vite 7
- **Styling**: CSS Modules + index.css
- **AI**: Web Worker mit Minimax-Algorithmus
- **State**: useReducer + useEffect-Hooks
- **Audio**: Web Audio API (SFX) + HTML5 Audio (Musik)

## Architektur

```
src/
  model/         → Types, Board-Setup, Game-Logik
  hooks/         → useGame (Reducer, Timer, Highscores)
  components/    → Board, GameInfo, DifficultySelect, Piece, ThemeSelect
  theme/         → themes.ts (7 Themes + Tokens), ThemeContext.tsx (Provider + Hook)
  ai/            → AI Worker (Minimax)
  audio/         → sounds.ts (SFX), music.ts (Hintergrundmusik)
  assets/        → Statische Assets
public/
  music/         → Lizenzierte MP3-Tracks (AudioJungle)
  HIGHSCORE.md   → Statische Highscore-Tabelle
```

## Features (implementiert)

- [x] Sternhalma-Brett (Hexagon-Grid)
- [x] Mensch vs. KI (Easy/Medium/Hard)
- [x] Seitenwahl (Oben/Unten)
- [x] Fast-Mode permanent (Spruenge enden sofort)
- [x] Stein-Deselect (nochmal klicken = Auswahl aufheben)
- [x] Speed-Timer (MM:SS.s, stoppt bei Sieg/Niederlage)
- [x] Spielername (localStorage, Sanitization)
- [x] Highscores — Siege UND Niederlagen (mit fehlenden Steinen)
- [x] HIGHSCORE.md Overlay + kopierbares Markdown-Snippet bei Sieg
- [x] Spielregeln als Modal
- [x] About-Screen (Autor, Repo, Musik-Lizenzhinweis)
- [x] Sound-Effekte (Web Audio API, generiert)
- [x] Hintergrundmusik (3 Tracks, Shuffle-Playlist, Autoplay)
- [x] Musik-Toggle-Button

---

## Naechste Schritte (Prio-Reihenfolge)

### 1. Spielstart-Flow
- Spiel startet NICHT automatisch — Board ist sichtbar, aber inaktiv
- Erst "Neues Spiel" klicken startet das Spiel und den Timer
- Verhindert versehentliches Spielstarten beim Seite-Oeffnen

### 2. Responsive Design (Breakpoints)
- Mobile / Tablet / Desktop Layouts
- Auf Mobile: Panel unter dem Board (statt rechts daneben)
- Auf Tablet: Kompakteres Layout
- Touch-Targets gross genug fuer Finger (min 44px)
- Board skaliert mit Viewport

### 3. Themes ✓
- Theme-Switcher im Panel (2 Reihen Buttons, "Design:" Label)
- 7 Themes implementiert:
  - **Standard** — Dark Theme (Baseline)
  - **Kosmos** — Space-Opera, animierter Parallax-Sternen-Himmel (2 Ebenen, CSS-Keyframes)
  - **Neon** — Cyan-Grid auf dunklem Grund, Glow-Effekt auf Steinen
  - **Eleganz** — Brushed-Metal-Textur (SVG feTurbulence), warmes Licht
  - **Holz** — Prozedurales Holzbrett (SVG feTurbulence), dunkle Rillen, Vignette
  - **Kontrast** — High Contrast, groessere Steine (pieceRadius 16 statt 14)
  - **Hell** — Light Mode, auto-detect via prefers-color-scheme
- Architektur: CSS Custom Properties (:root) + React Context (useTheme())
- Dynamisches `<style id="theme-vars">` Element fuer zuverlaessiges Theme-Switching
- ThemeProvider in main.tsx, ThemeSelect in GameInfo (Desktop + Drawer)
- Theme-Wahl in localStorage gespeichert
- Piece-Glow (Kosmos/Neon/Eleganz): 2 konzentrische Kreise hinter Spielstein
- SVG-Hintergruende: WoodBackground, KosmosBackground, NeonBackground, EleganzBackground
- TODO: Themes weiter optimieren
- **Kosmos, Neon, Eleganz vorerst ausgeblendet** (ThemeSelect.tsx HIDDEN_THEMES) — muessen noch ueberarbeitet werden, bevor sie wieder sichtbar geschaltet werden

### 4. Accessibility (a11y)
- ARIA-Labels auf allen interaktiven Elementen
- `role="grid"` / `role="gridcell"` fuer das Board
- `aria-selected`, `aria-disabled` fuer Steine und Zuege
- `aria-live="polite"` fuer Status-Meldungen (wer ist dran, Sieg etc.)
- Keyboard-Navigation (Tab + Enter fuer Stein-Auswahl und Zuege)
- Focus-Styles sichtbar
- `prefers-reduced-motion` respektieren
- `prefers-color-scheme` fuer automatisches Hell/Dunkel-Theme
- Screen-Reader-Tests

### 5. SEO
- Meta-Tags: title, description, og:image, og:title, og:description
- Canonical URL (blitzhalma.de)
- Strukturierte Daten (JSON-LD: WebApplication / Game)
- Favicon + Apple Touch Icons
- robots.txt + sitemap.xml
- Performance: Lighthouse Score optimieren

### 6. Donate / Coffee-Ware
- Spendenbutton im About-Screen oder Footer
- Optionen evaluieren:
  - **PayPal Donate Button** (einfachster Einstieg, kein Backend)
  - **Buy Me a Coffee** (gehostete Seite, kein Backend)
  - **Stripe Payment Links** (professioneller, kein Backend noetig)
  - **Ko-fi** (Alternative zu Buy Me a Coffee)
- Empfehlung: PayPal Donate Button + Buy Me a Coffee Link
- Rechtliches: Impressum auf blitzhalma.de (Pflicht fuer .de)

### 7. PWA / Mobile App
- manifest.json + Service Worker + Icons
- Installierbar auf Android + iOS
- Offline-faehig (Spiel + Musik gecacht)
- Spaeter evtl. Capacitor fuer Store-Veroeffentlichung

---

## Hosting (NetCup)

- React Static Build (`npm run build` → `dist/`)
- Upload via FTP/SFTP oder Git Deploy
- SSL-Zertifikat (Let's Encrypt) fuer blitzhalma.de
- `dist/` als Document Root
- SPA-Redirect: alle Routen auf index.html (falls noetig)

## Musik-Lizenzen

Alle Tracks: **Envato AudioJungle — Music Standard License**
- Erlaubt Nutzung in Web-Games (explizit gelistet)
- 1 Lizenz pro Track, 1 Endprodukt (Blitzhalma)
- Bis 10.000 Kopien
- Lizenzdateien aufbewahren (nicht im Repo)

| Track | Autor | Item ID |
|-------|-------|---------|
| Cyberpunk | Pchelaudio | 20906388 |
| Epic | (aus ZIP) | 22602282 |
| Epicness | Alive_Tunes | 20777340 |
