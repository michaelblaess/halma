# Credits

Der Quellcode von halma steht unter der Apache-2.0-Lizenz (siehe `LICENSE`).
Diese Lizenz gilt **nicht** für die eingebundene Musik. Die Nachweise dafür
stehen hier.

## Hintergrundmusik

Alle drei Titel stammen von [AudioJungle](https://audiojungle.net/) (Envato
Market) und wurden unter der **Music Standard License** bezogen. Die
Lizenzurkunden liegen privat beim Autor des Spiels, nicht im Repository.

| Titel | Urheber | Item-ID | Bezogen am |
|-------|---------|---------|------------|
| [Cyberpunk](https://audiojungle.net/item/cyberpunk/20906388) | Pchelaudio | 20906388 | 28.06.2019 |
| [Epic](https://audiojungle.net/item/epic/22602282) | YellowTea | 22602282 | 28.02.2019 |
| [Epicness](https://audiojungle.net/item/epicness/20777340) | Alive_Tunes | 20777340 | 28.05.2018 |

## Warum die Dateien verschlüsselt im Repository liegen

Die Titel sind lizenziert, aber nicht frei weitergebbar. Deshalb liegt hier
keine abspielbare Datei:

- `assets/music/*.enc` sind AES-256-verschlüsselte Fassungen. Ohne den Schlüssel
  in `MUSIC_KEY` sind sie nicht verwendbar.
- `scripts/decrypt-music.sh` entschlüsselt sie beim Build nach `public/music/`.
  Dieser Ordner ist per `.gitignore` vom Commit ausgeschlossen.
- Die Dateinamen im Repository sind Hashes. Welche Datei welcher Titel ist,
  steht hier bewusst nicht.

Der Schlüssel selbst liegt nicht im Repository. Im Deploy kommt er aus einem
GitHub-Secret, lokal aus der Umgebung.

**Wer das Projekt klont, bekommt keine spielbare Musik.** Das Spiel läuft ohne
sie vollständig, der Musik-Knopf bleibt dann wirkungslos.

## Sonstige Medien

Die Soundeffekte werden zur Laufzeit über die Web Audio API erzeugt (siehe
`src/audio/sounds.ts`), es liegen dafür keine fremden Dateien im Projekt.
