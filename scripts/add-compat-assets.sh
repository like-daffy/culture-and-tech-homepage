#!/usr/bin/env bash
# Copies the hashed /culture/_next/ assets of the last Cafe24 build (compat/cafe24/) into the export, so that
# old tabs and cached Cafe24 HTML can still load their chunks after the domain moves to Firebase Hosting.
# Runs after `npm run build` (predeploy in firebase.json), which recreates out/.
# Usage: scripts/add-compat-assets.sh [out-dir]
set -euo pipefail
cd "$(dirname "$0")/.."
out="${1:-out}"
[ -f "$out/index.html" ] || { echo "no export at $out/ (run npm run build first)" >&2; exit 1; }
if [ -e "$out/culture/_next" ]; then echo "$out/culture/_next already exists; refusing to merge" >&2; exit 1; fi
mkdir -p "$out/culture"
cp -R compat/cafe24/culture/_next "$out/culture/_next"
echo "added $(find "$out/culture/_next" -type f | wc -l | tr -d ' ') Cafe24 compatibility assets under $out/culture/_next/"
