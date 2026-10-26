#!/usr/bin/env bash
# Copies English-Thai Learn's released privacy and support pages into public/culture/english-thai-learn/, which is
# served at https://cultureand.tech/culture/english-thai-learn/. Refuses drafts and anything but plain HTML + styles.css.
#
# Usage: scripts/sync-english-thai-learn-legal.sh [path/to/thai-word-learn-app]
#        scripts/sync-english-thai-learn-legal.sh --check <dir>   validate only (firebase predeploy runs it on out/)
#
# The source is `scripts/build-legal-pages.py --release` output in thai-word-learn-app
# (build/legal-upload/english-thai-learn/), made from its committed docs/legal/*.md. Never edit the copied HTML by hand;
# change the drafts there and release again.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
pages=(privacy.html support.html)
site="https://cultureand.tech/culture/english-thai-learn"

fail() { echo "sync-english-thai-learn-legal: $*" >&2; exit 1; }

validate() {
  local dir="$1" f name body links
  for f in "${pages[@]}" styles.css; do
    if [ ! -f "$dir/$f" ]; then fail "missing $dir/$f"; fi
  done
  for f in "$dir"/*.html; do
    name="$(basename "$f")"
    case " ${pages[*]} " in *" $name "*) ;; *) fail "unexpected page $f (add it to this script on purpose)";; esac
    body="$(cat "$f")"
    if grep -q 'class="draft"' <<<"$body"; then fail "draft banner in $f"; fi
    if grep -qE '\[[A-Z][A-Z_]{2,}\]' <<<"$body"; then fail "placeholder left in $f"; fi
    if grep -qi '<script' <<<"$body"; then fail "script tag in $f"; fi
    if ! grep -q '<meta name="robots" content="index,follow">' <<<"$body"; then fail "robots is not index,follow in $f"; fi
    if ! grep -qF "<link rel=\"canonical\" href=\"$site/$name\">" <<<"$body"; then fail "canonical in $f is not $site/$name"; fi
    links="$(grep -o '<link[^>]*>' <<<"$body" | grep -vE '^<link rel="stylesheet" href="styles\.css">$|^<link rel="canonical" href="https://cultureand\.tech/[^"]*">$' || true)"
    if [ -n "$links" ]; then fail "unexpected <link> in $f: $links"; fi
  done
  if grep -qiE '@import|url\(' "$dir/styles.css"; then fail "styles.css loads another resource"; fi
}

if [ "${1:-}" = "--check" ]; then
  [ $# -eq 2 ] || fail "usage: $0 --check <dir>"
  validate "$2"
  echo "ok: $2 holds the release pages only"
  exit 0
fi

common="$(git -C "$root" rev-parse --path-format=absolute --git-common-dir)"
app="${1:-$(dirname "$(dirname "$common")")/thai-word-learn-app}"
src="$app/build/legal-upload/english-thai-learn"
sources=(docs/legal/privacy-policy-draft.md docs/legal/support-page-draft.md docs/legal/legal-page.css scripts/build-legal-pages.py)

[ -f "$src/privacy.html" ] || fail "no release pages at $src (run scripts/build-legal-pages.py --release in $app)"
if [ -n "$(git -C "$app" status --porcelain -- "${sources[@]}")" ]; then
  fail "commit ${sources[*]} in $app first, so the published pages match a committed text"
fi
validate "$src"

dest="$root/public/culture/english-thai-learn"
mkdir -p "$dest"
find "$dest" -maxdepth 1 -type f \( -name '*.html' -o -name 'styles.css' \) -delete
for f in "${pages[@]}" styles.css; do cp "$src/$f" "$dest/$f"; done
echo "Copied ${#pages[@]} pages + styles.css from $src ($(git -C "$app" log -1 --format='%h %s' -- "${sources[@]}"))"
grep -o 'class="date">[^<]*' "$dest/privacy.html" | sed 's/class="date">/privacy.html: /' \
  || echo "privacy.html: no effective date (published before the release day)"
git -C "$root" status --short -- public/culture/english-thai-learn
