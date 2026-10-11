#!/usr/bin/env bash
# Install and configure ffmpeg + Remotion for video-use.
#
#   ./setup.sh                 install everything that's missing, then verify
#   ./setup.sh --check         only report what's installed (no changes)
#   ./setup.sh --skip-remotion ffmpeg only
#   ./setup.sh --skip-ffmpeg   Remotion only
#
# Idempotent: re-running skips anything already in place.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE="$REPO/remotion"
NODE_MIN=18

G="\033[0;32m"; Y="\033[0;33m"; R="\033[0;31m"; N="\033[0m"
ok()   { echo -e "  ${G}+${N} $1"; }
warn() { echo -e "  ${Y}!${N} $1"; }
fail() { echo -e "  ${R}x${N} $1"; }
step() { echo ""; echo "$1"; }

CHECK=0; DO_FFMPEG=1; DO_REMOTION=1
for arg in "$@"; do
  case "$arg" in
    --check) CHECK=1 ;;
    --skip-ffmpeg) DO_FFMPEG=0 ;;
    --skip-remotion) DO_REMOTION=0 ;;
    -h|--help) sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

errors=0

SUDO=""
if [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null; then SUDO="sudo"; fi

# Install packages with whichever package manager this machine has.
# Args: brew-name apt-name dnf-name pacman-name
pkg_install() {
  if command -v brew >/dev/null; then brew install "$1"
  elif command -v apt-get >/dev/null; then $SUDO apt-get update -qq && $SUDO apt-get install -y -qq "$2"
  elif command -v dnf >/dev/null; then $SUDO dnf install -y "$3"
  elif command -v pacman >/dev/null; then $SUDO pacman -S --noconfirm "$4"
  else return 1
  fi
}

# ---------------------------------------------------------------- ffmpeg
if [ $DO_FFMPEG -eq 1 ]; then
  step "ffmpeg"
  if ! command -v ffmpeg >/dev/null || ! command -v ffprobe >/dev/null; then
    if [ $CHECK -eq 1 ]; then
      fail "ffmpeg/ffprobe not found"; errors=$((errors+1))
    elif pkg_install ffmpeg ffmpeg ffmpeg ffmpeg; then
      :
    else
      fail "no supported package manager — install ffmpeg manually: https://ffmpeg.org/download.html"
      errors=$((errors+1))
    fi
  fi
  if command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null; then
    ok "$(ffmpeg -version | head -1 | awk '{print "ffmpeg", $3}')"
    # Filters the helpers rely on: subtitles (captions), ebur128 (loudness), lut3d (grades).
    filters="$(ffmpeg -hide_banner -filters 2>/dev/null)"
    for f in subtitles ebur128 lut3d; do
      grep -qE "^ [.A-Z|]+ $f " <<<"$filters" && ok "filter: $f" \
        || { warn "filter '$f' missing — this ffmpeg build lacks it (try a full build, e.g. brew/apt ffmpeg)"; }
    done
    # Real smoke test: encode one second of video.
    if ffmpeg -hide_banner -loglevel error -f lavfi -i testsrc=d=1:s=320x240:r=30 \
         -c:v libx264 -pix_fmt yuv420p -f null - 2>/dev/null; then
      ok "libx264 encode"
    else
      fail "ffmpeg cannot encode H.264 (libx264 missing)"; errors=$((errors+1))
    fi
  fi
fi

# ---------------------------------------------------------------- Remotion
if [ $DO_REMOTION -eq 1 ]; then
  step "Node.js"
  node_major() { node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0; }
  if ! command -v node >/dev/null || [ "$(node_major)" -lt $NODE_MIN ]; then
    if [ $CHECK -eq 0 ]; then
      pkg_install node nodejs nodejs nodejs || true
      command -v apt-get >/dev/null && ! command -v npm >/dev/null && $SUDO apt-get install -y -qq npm || true
    fi
  fi
  if command -v node >/dev/null && command -v npm >/dev/null && [ "$(node_major)" -ge $NODE_MIN ]; then
    ok "node $(node -v), npm $(npm -v)"
    [ "$(node_major)" -lt 22 ] && warn "HyperFrames needs Node 22+ (Remotion is fine on $NODE_MIN+)"
    NODE_OK=1
  else
    fail "Node.js >= $NODE_MIN with npm required for Remotion — install from https://nodejs.org (or nvm install --lts)"
    errors=$((errors+1)); NODE_OK=0
  fi

  if [ "$NODE_OK" -eq 1 ]; then
    step "Remotion"
    if [ ! -d "$TEMPLATE/node_modules/remotion" ]; then
      if [ $CHECK -eq 1 ]; then
        fail "Remotion template not installed (run ./setup.sh)"; errors=$((errors+1))
      else
        (cd "$TEMPLATE" && npm install --no-audit --no-fund --loglevel=error)
      fi
    fi

    if [ -d "$TEMPLATE/node_modules/remotion" ]; then
      ok "remotion $(node -p "require('$TEMPLATE/node_modules/remotion/package.json').version")"

      # Remotion renders in Chrome Headless Shell. Prefer its own download; fall
      # back to a local Chromium (Playwright's, or a system one) when the download
      # is blocked, and remember the choice in remotion/.remotion-browser.
      BROWSER_FILE="$TEMPLATE/.remotion-browser"
      if [ $CHECK -eq 0 ] && [ ! -s "$BROWSER_FILE" ]; then
        if (cd "$TEMPLATE" && npx --no-install remotion browser ensure >/dev/null 2>&1); then
          : > "$BROWSER_FILE.ok"
        else
          for c in \
            "${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"/chromium_headless_shell-*/chrome-linux/headless_shell \
            "${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"/chromium-*/chrome-linux/chrome \
            "$HOME"/.cache/ms-playwright/chromium_headless_shell-*/chrome-linux/headless_shell \
            "$(command -v chromium 2>/dev/null)" "$(command -v chromium-browser 2>/dev/null)" \
            "$(command -v google-chrome 2>/dev/null)" \
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
            if [ -n "$c" ] && [ -x "$c" ]; then echo "$c" > "$BROWSER_FILE"; break; fi
          done
        fi
      fi
      if [ -s "$BROWSER_FILE" ]; then
        export REMOTION_BROWSER_EXECUTABLE="$(cat "$BROWSER_FILE")"
        ok "browser: $REMOTION_BROWSER_EXECUTABLE"
      elif [ -e "$BROWSER_FILE.ok" ]; then
        ok "browser: Remotion Chrome Headless Shell"
      else
        warn "no browser confirmed yet — Remotion will try to download one on first render"
      fi

      # Real smoke test: render the template composition and probe it.
      if [ $CHECK -eq 0 ]; then
        out="$(mktemp -d)/smoke.mp4"
        if (cd "$TEMPLATE" && npx --no-install remotion render Overlay "$out" --frames=0-29 --log=error >/dev/null 2>&1) \
           && [ -s "$out" ]; then
          dims="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,nb_frames -of default=nw=1:nk=1 "$out" 2>/dev/null || true)"
          ok "smoke render OK ($(echo $dims | awk '{print $1"x"$2", "$3" frames"}'))"
        else
          fail "Remotion smoke render failed — run: cd remotion && npx remotion render Overlay out.mp4 --frames=0-29"
          errors=$((errors+1))
        fi
        rm -rf "$(dirname "$out")"
      fi
    fi
  fi
fi

echo ""
if [ $errors -eq 0 ]; then
  echo -e "${G}All set.${N} New Remotion slot: helpers/remotion_slot.sh <edit>/animations/slot_<id>"
else
  echo -e "${R}$errors problem(s) above.${N}"
fi
echo ""
exit $([ $errors -eq 0 ] && echo 0 || echo 1)
