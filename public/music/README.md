# Hintergrundmusik

Die MP3-Dateien werden beim Build automatisch aus den verschluesselten Dateien
in `assets/music/` erzeugt (siehe `scripts/decrypt-music.sh`).

Lokal: `MUSIC_KEY=... bash scripts/decrypt-music.sh`

## Ohne Musik spielen

Das Spiel funktioniert auch ohne diese Dateien — der Musik-Toggle bleibt dann
wirkungslos. Alle anderen Features (KI, Themes, Sound-Effekte) sind davon nicht betroffen.
