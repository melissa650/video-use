#!/usr/bin/env bash
# Create a Remotion project for one animation slot from the installed template.
#
#   helpers/remotion_slot.sh <edit>/animations/slot_<id>
#   cd <slot> && npx remotion render Overlay render.mp4
#
# Copies remotion/ (sources + config) into the slot and symlinks node_modules to
# the template's, so each slot starts instantly without a fresh npm install.
set -euo pipefail

[ $# -eq 1 ] || { echo "usage: $0 <slot_dir>" >&2; exit 2; }
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$REPO/remotion"
SLOT="$1"

[ -d "$TEMPLATE/node_modules/remotion" ] || { echo "Remotion not installed — run $REPO/setup.sh" >&2; exit 1; }
[ -e "$SLOT/package.json" ] && { echo "$SLOT already has a project; leaving it alone" >&2; exit 1; }

mkdir -p "$SLOT"
(cd "$TEMPLATE" && tar cf - --exclude=node_modules --exclude=out --exclude=render.mp4 .) | (cd "$SLOT" && tar xf -)
ln -s "$TEMPLATE/node_modules" "$SLOT/node_modules"
echo "Remotion slot ready: $SLOT"
