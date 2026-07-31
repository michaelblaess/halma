# KI-Duell: Claude gegen Claude auf dem Sternbrett

Zwei Claude-Code-Instanzen spielen Halma gegeneinander, nach dem Regelwerk aus
`src/model/`. Der Spielstand wird von einem Schiedsrichter gehalten, nicht von den
Sprachmodellen.

## Warum ein Schiedsrichter

Kettensprünge entstehen in `getJumpMoves()` aus einer Breitensuche über die Spiegelung
`landingRow = 2*nRow - curRow`. Über 60 Züge rechnet kein Sprachmodell das zuverlässig durch.
Ohne Schiedsrichter hätten beide Instanzen nach kurzer Zeit verschiedene Bretter im Kopf.

Deshalb gilt: **Die Modelle kennen die Regeln nicht und müssen sie nicht kennen.** Sie bekommen
das Brett und die fertige Liste der legalen Züge aus `getAllMoves()` und wählen daraus aus.
Regelkonformität ist damit strukturell garantiert, und die interessante Frage bleibt sauber
isoliert: Kann ein Sprachmodell Sternhalma-Strategie?

## Aufbau

```
Claude A (Spieler 1, Nord) ──┐
                             ├──> duel.ts ──> state.json ──> watch.ts (drittes Pane)
Claude B (Spieler 2, Sued) ──┘      │
                                    └──> claude-bus (Zugkommentare)

                     importiert src/model/{board,gameLogic,types}
                     unveraendert, ohne React
```

`src/model/` und `src/ai/` sind React-frei und laufen headless unter Node. Es wird nichts am
bestehenden Spiel geändert.

## Ablage

- **Code** in `ai-duel/` im Repo. Liegt ausserhalb von `src`, deshalb fasst `tsc -b` es nicht
  an (`tsconfig.app.json` hat `include: ["src"]`).
- **Laufzeitdaten** unter `~/.claude/bus/<RECHNER>/halma-duel/`. Bewusst nicht im Repo: dort
  liegt schon der Bus, der Bereich ist garantiert nicht synchronisiert und nicht in Git.
  Damit kann ein Spielstand nicht versehentlich committet werden.

## Zugablauf

1. `duel.ts show --player 1` liefert Brett, legale Züge und Fortschritt beider Seiten.
2. Claude wählt einen Zug aus der Liste und begründet ihn in einem Satz.
3. `duel.ts move --player 1 --from 13,1 --to 8,4 --why "..."` validiert, wendet an, wechselt
   den Spieler, schreibt `state.json` und postet in den Bus.
4. Die Gegenseite wiederholt das.

Ein Zug, der nicht in der Liste steht, wird abgelehnt. Ein Zug des falschen Spielers auch.

## Taktung

`/loop` in beiden Instanzen. Jede prüft, ob sie dran ist, zieht gegebenenfalls und wartet
sonst. Aktives Wecken ginge nur mit `wezterm cli send-text`, das Windows Terminal kann es
nicht.

## Rendering

Stufe 1 ist `watch.ts`: pollt `state.json` und zeichnet den Stern mit ANSI-Farben in einem
dritten Pane. Die 17 Reihen werden über `getGx()` eingerückt, ein halber gx-Schritt ist ein
Zeichen, das Brett ist damit 25 Zeichen breit.

Stufe 2 ist der Browser-Zuschauer unter `ai-duel/web/`, auf derselben `state.json`:

```bash
npx vite --config ai-duel/web/vite.config.ts     # http://localhost:5174
```

`Board.tsx` wird **unverändert** wiederverwendet. Der Zuschauer baut aus dem `DuelState`
einen `GameState` und reicht No-Op-Callbacks durch. Mit `isAiThinking: true` und leeren
`validMoves` schaltet `Board.tsx` von allein in einen nicht interaktiven Zustand, es gibt also
keine Klickziele und keinen Tastaturfokus. Der letzte Zug wird als `selectedPiece` gesetzt,
dadurch bekommt der zuletzt gezogene Stein den Auswahlring.

Der SSE-Endpunkt `/api/state` steckt als Middleware im Dev-Server, deshalb bleibt es bei einem
Prozess, einem Port und einem Origin. Kein CORS, kein zweiter Server. `publicDir` zeigt auf das
`public/` der Hauptapp, damit das Icon mitbenutzt wird statt ein zweites zu pflegen.

Die eigene Vite-Config liegt bewusst getrennt: `tsconfig.app.json` hat `include: ["src"]`, und
der Haupt-Build läuft weiter unverändert (`tsc -b` mit Exit 0, `vite build` erfolgreich).

## Offene Punkte

- Smoke-Test ohne Modellkosten: `duel.ts auto` lässt `computeAiMove` gegen sich selbst
  spielen und prüft damit Referee, Zustand und Renderer in einem Durchlauf.
- Spielstärke ist unbekannt. `minimax` mit Tiefe 4 ist ein harter Gegner, ob ein Sprachmodell
  dagegen besteht, ist offen und genau die Frage, die das Duell beantworten soll.
- Kosten: eine Partie sind 50 bis 80 Züge pro Seite, jeder Zug ein Modellaufruf mit Brett im
  Kontext. Kein Nebenbei-Prozess.
