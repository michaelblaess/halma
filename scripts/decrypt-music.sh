#!/usr/bin/env bash
# Entschluesselt die Musik-Dateien fuer den Build.
# Erwartet MUSIC_KEY als Umgebungsvariable.
set -euo pipefail

if [ -z "${MUSIC_KEY:-}" ]; then
  echo "MUSIC_KEY nicht gesetzt — Musik wird uebersprungen."
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$ROOT_DIR/assets/music"
DEST_DIR="$ROOT_DIR/public/music"

mkdir -p "$DEST_DIR"

# Mapping: hash → entschluesselte Datei
declare -A TRACKS=(
  ["1e6b41f0261e"]="1e6b41f0261e"
  ["9685818f508c"]="9685818f508c"
  ["a07b560519d9"]="a07b560519d9"
)

for hash in "${!TRACKS[@]}"; do
  enc_file="$SRC_DIR/${hash}.enc"
  out_file="$DEST_DIR/${TRACKS[$hash]}.mp3"

  if [ ! -f "$enc_file" ]; then
    echo "WARNUNG: $enc_file nicht gefunden, ueberspringe."
    continue
  fi

  openssl enc -aes-256-cbc -d -salt -pbkdf2 \
    -in "$enc_file" \
    -out "$out_file" \
    -pass "pass:$MUSIC_KEY"

  echo "Entschluesselt: ${TRACKS[$hash]}.mp3"
done

echo "Musik bereit."
