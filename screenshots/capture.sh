#!/usr/bin/env bash
# Снимает скриншоты экранов через headless Chrome.
# Запуск: bash screenshots/capture.sh (dev-сервер должен быть на :3000)
set -uo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE="${BASE:-http://localhost:3000}"

# shot <файл> <hash> <тема> <размер окна>
shot() {
  local name="$1" hash="$2" theme="$3" size="$4"
  local profile
  profile="$(mktemp -d)"
  rm -f "$DIR/$name"

  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --force-device-scale-factor=2 --window-size="$size" --virtual-time-budget=3000 \
    --user-data-dir="$profile" --screenshot="$DIR/$name" \
    "$BASE/?theme=$theme#$hash" >/dev/null 2>&1 &
  local pid=$!

  for _ in $(seq 1 30); do
    sleep 1
    [ -s "$DIR/$name" ] && break
  done
  sleep 1
  kill "$pid" 2>/dev/null
  wait "$pid" 2>/dev/null
  rm -rf "$profile"

  if [ -s "$DIR/$name" ]; then echo "✓ $name"; else echo "✗ $name"; fi
}

shot "01-dashboard.png" dashboard light 1440,1250
shot "02-tasks.png"     tasks     light 1440,1000
shot "03-calendar.png"  calendar  light 1440,1080
shot "04-wishes.png"    wishes    light 1440,1180
shot "05-dark-mode.png" dashboard dark  1440,1250
shot "06-mobile.png"    tasks     light 520,1000
