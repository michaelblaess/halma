# Sternhalma — Projektplan

## Name

Arbeitstitel: **Sternhalma**

Kandidaten fuer den finalen Namen:
- **Blitz Halma** — Analogie zu "Blitzschach", sofort verstaendlich auf Deutsch
- **Turbo Halma** — Retro-Gaming-Vibe, einpraegsam

Beide Namen sind frei:
- Kein GitHub-Repo, keine App, kein npm-Paket unter diesen Namen
- "Halma" ist ein generischer Spielbegriff (griechisch fuer "Sprung"), seit 1883, Public Domain
- Halma plc (UK-Firma) hat "HALMA" nur fuer Sicherheitstechnik/Chemie eingetragen (Nizza-Klassen 1/9), nicht fuer Software/Spiele
- Kein Markenrechtskonflikt bei Verwendung im Spiel-/App-Kontext

## Tech-Stack

- **Frontend**: React 19 + TypeScript + Vite 7
- **Styling**: CSS Modules + index.css
- **AI**: Web Worker mit Minimax-Algorithmus
- **State**: useReducer + useEffect-Hooks

## Architektur

```
src/
  model/         → Types, Board-Setup
  hooks/         → useGame (Reducer, Timer, Highscores)
  components/    → Board, GameInfo, DifficultySelect
  ai/            → AI Worker (Minimax)
```

## Features (implementiert)

- [x] Sternhalma-Brett (Hexagon-Grid)
- [x] Mensch vs. KI (Easy/Medium/Hard)
- [x] Seitenwahl (Oben/Unten)
- [x] Kettenspruenge
- [x] Zentriertes Layout
- [x] Fast-Mode (Spruenge enden sofort, default an)
- [x] Speed-Timer (MM:SS.s, stoppt bei Sieg)
- [x] Highscores (Top 5 pro Schwierigkeit, localStorage)

## Naechste Schritte

- [ ] Finalen Namen festlegen (Blitz Halma vs. Turbo Halma)
- [ ] Mobile App (siehe Abschnitt unten)
- [ ] Sound-Effekte?
- [ ] Multiplayer (lokal)?

## Mobile App — Optionen

### Option A: PWA (Progressive Web App)
- Geringster Aufwand — die Web-App wird installierbar gemacht
- `manifest.json` + Service Worker + Icons
- Installierbar auf Android (Chrome "Zum Startbildschirm") und iOS (Safari "Teilen > Zum Home-Bildschirm")
- Kein Store noetig, Sideloading sofort moeglich
- Nachteil: Kein echter Store-Eintrag, eingeschraenkte native APIs

### Option B: Capacitor (Ionic)
- Wraps die bestehende Web-App in eine native Shell
- `npm install @capacitor/core @capacitor/cli` + `npx cap init`
- Generiert Android Studio / Xcode Projekte
- Store-Veroeffentlichung moeglich (Google Play, App Store)
- Sideloading via APK auf Android trivial
- Zugriff auf native APIs (Vibration, Haptics etc.)

### Option C: React Native (Neuschreiben)
- Komplett native UI, beste Performance
- Grosser Aufwand — gesamtes UI muss neu geschrieben werden
- Fuer ein Brettspiel Overkill

### Empfehlung
**Option A (PWA) zum Testen, spaeter Option B (Capacitor) fuer Store.**
PWA ist in 30 Minuten machbar und reicht fuers Sideloading.
