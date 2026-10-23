#!/usr/bin/env bash
# Copies Mac Get Space's released privacy page into public/culture/mac-get-space/, which is served at
# https://cultureand.tech/culture/mac-get-space/. Refuses drafts and anything but plain HTML + styles.css.
#
# Usage: scripts/sync-mac-get-space-legal.sh [path/to/mac-get-space]
#        scripts/sync-mac-get-space-legal.sh --check <dir>   validate only (firebase predeploy runs it on out/)
#
# The source is `scripts/build-privacy-page.py --release` output in mac-get-space (build/legal-upload/mac-get-space/),
# made from its committed docs/12-privacy-policy-draft.md. Never edit the copied HTML by hand; change docs/12 there and
# release again.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
pages=(privacy.html)
canonical="https://cultureand.tech/culture/mac-get-space/privacy.html"

fail() { echo "sync-mac-get-space-legal: $*" >&2; exit 1; }

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
    if ! grep -qF "<link rel=\"canonical\" href=\"$canonical\">" <<<"$body"; then fail "canonical in $f is not $canonical"; fi
    links="$(grep -o '<link[^>]*>' <<<"$body" | grep -vE '^<link rel="stylesheet" href="styles\.css">$|^<link rel="canonical" href="https://cultureand\.tech/[^"]*">$' || true)"
    if [ -n "$links" ]; then fail "unexpected <link> in $f: $links"; fi
  done
  if grep -qiE '@import|url\(' "$dir/styles.css"; then fail "styles.css loads another resource"; fi
}

if [ "${1:-}" = "--check" ]; then
  [ $# -eq 2 ] || fail "usage: $0 --check <dir>"
  validate "$2"
  echo "ok: $2 holds the release page only"
  exit 0
fi

common="$(git -C "$root" rev-parse --path-format=absolute --git-common-dir)"
app="${1:-$(dirname "$(dirname "$common")")/mac-get-space}"
src="$app/build/legal-upload/mac-get-space"
sources=(docs/12-privacy-policy-draft.md scripts/build-privacy-page.py scripts/lib/legal-page.css)

[ -f "$src/privacy.html" ] || fail "no release page at $src (run scripts/build-privacy-page.py --release in $app)"
if [ -n "$(git -C "$app" status --porcelain -- "${sources[@]}")" ]; then
  fail "commit ${sources[*]} in $app first, so the published page matches a committed text"
fi
validate "$src"

dest="$root/public/culture/mac-get-space"
mkdir -p "$dest"
find "$dest" -maxdepth 1 -type f \( -name '*.html' -o -name 'styles.css' \) -delete
for f in "${pages[@]}" styles.css; do cp "$src/$f" "$dest/$f"; done
echo "Copied ${#pages[@]} page + styles.css from $src ($(git -C "$app" log -1 --format='%h %s' -- "${sources[@]}"))"
grep -o 'class="date">[^<]*' "$dest/privacy.html" | sed 's/class="date">/privacy.html: /' \
  || echo "privacy.html: no effective date (published before the release day)"
git -C "$root" status --short -- public/culture/mac-get-space
