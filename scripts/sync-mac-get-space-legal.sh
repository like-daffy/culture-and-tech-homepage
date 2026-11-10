#!/usr/bin/env bash
# Copies Clean Space's released legal pages into public/culture/clean-space/, which is served at
# https://cultureand.tech/culture/clean-space/. Refuses drafts and anything but plain HTML + styles.css.
# Until 2026-11-05 the app was Mac Get Space and the page was at /culture/mac-get-space/privacy.html, now a 301 in
# firebase.json; the app's repository, its build folder and this script keep the old name.
#
# Two sets of pages share the folder and its styles.css (both come from mac-get-space's scripts/lib/legal-page.css):
#   - the Mac App Store edition's privacy policy, privacy.html (always there; App Store Connect links it), made by
#     `scripts/build-privacy-page.py --release` (build/legal-upload/mac-get-space/) from docs/12;
#   - the website edition's direct-sale policies, direct-terms.html, direct-refunds.html and direct-privacy.html
#     (all three or none), made by `scripts/build-direct-sale-pages.py --release` (build/legal-upload/clean-space-direct/)
#     from docs/13-direct-sale/. Clean Space's checkout opens only once they are published (check-checkout-config.mjs).
# Each sync replaces only its own set.
#
# Usage: scripts/sync-mac-get-space-legal.sh [path/to/mac-get-space]            the App Store privacy page
#        scripts/sync-mac-get-space-legal.sh --direct [path/to/mac-get-space]   the direct-sale pages
#        scripts/sync-mac-get-space-legal.sh --check <dir>   validate only (firebase predeploy runs it on out/)
#
# Never edit the copied HTML by hand; change the texts in mac-get-space and release again.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
site="https://cultureand.tech/culture/clean-space"
appstore_pages=(privacy.html)
direct_pages=(direct-terms.html direct-refunds.html direct-privacy.html)

fail() { echo "sync-mac-get-space-legal: $*" >&2; exit 1; }

validate() {
  local dir="$1" f name body links found=0
  for f in "${appstore_pages[@]}" styles.css; do
    if [ ! -f "$dir/$f" ]; then fail "missing $dir/$f"; fi
  done
  for f in "${direct_pages[@]}"; do
    if [ -f "$dir/$f" ]; then found=$((found + 1)); fi
  done
  if [ "$found" -ne 0 ] && [ "$found" -ne "${#direct_pages[@]}" ]; then
    fail "$dir has $found of the ${#direct_pages[@]} direct-sale pages (${direct_pages[*]}): publish all three or none"
  fi
  for f in "$dir"/*.html; do
    name="$(basename "$f")"
    case " ${appstore_pages[*]} ${direct_pages[*]} " in *" $name "*) ;; *) fail "unexpected page $f (add it to this script on purpose)";; esac
    body="$(cat "$f")"
    if grep -q 'class="draft"' <<<"$body"; then fail "draft banner in $f"; fi
    if grep -qE '\[[A-Z][A-Z_]{2,}\]' <<<"$body"; then fail "placeholder left in $f"; fi
    if grep -qi '<script' <<<"$body"; then fail "script tag in $f"; fi
    if ! grep -q '<meta name="robots" content="index,follow">' <<<"$body"; then fail "robots is not index,follow in $f"; fi
    if ! grep -qF "<link rel=\"canonical\" href=\"$site/$name\">" <<<"$body"; then fail "canonical in $f is not $site/$name"; fi
    links="$(grep -o '<link[^>]*>' <<<"$body" | grep -vE '^<link rel="stylesheet" href="styles\.css">$|^<link rel="canonical" href="https://cultureand\.tech/[^"]*">$' || true)"
    if [ -n "$links" ]; then fail "unexpected <link> in $f: $links"; fi
    # Links are https pages, mailto: or the pages beside it: never http:, javascript: or data: (the direct-sale privacy
    # policy links official bodies such as KISA, as Chord to MIDI's does).
    links="$(grep -oE 'href="[^"]*"' <<<"$body" | grep -vE '^href="(https://|mailto:|#|styles\.css")' \
      | grep -vE "^href=\"($(IFS='|'; echo "${appstore_pages[*]} ${direct_pages[*]}" | sed 's/ /|/g; s/\./\\./g'))\"$" || true)"
    if [ -n "$links" ]; then fail "unexpected link in $f: $links"; fi
  done
  if grep -qiE '@import|url\(' "$dir/styles.css"; then fail "styles.css loads another resource"; fi
}

if [ "${1:-}" = "--check" ]; then
  [ $# -eq 2 ] || fail "usage: $0 --check <dir>"
  validate "$2"
  echo "ok: $2 holds release pages only"
  exit 0
fi

set_name=appstore
if [ "${1:-}" = "--direct" ]; then set_name=direct; shift; fi

common="$(git -C "$root" rev-parse --path-format=absolute --git-common-dir)"
app="${1:-$(dirname "$(dirname "$common")")/mac-get-space}"
if [ "$set_name" = direct ]; then
  src="$app/build/legal-upload/clean-space-direct"
  pages=("${direct_pages[@]}")
  sources=(docs/13-direct-sale scripts/build-direct-sale-pages.py scripts/lib/legal-page.css)
  maker="scripts/build-direct-sale-pages.py --release"
else
  src="$app/build/legal-upload/mac-get-space"
  pages=("${appstore_pages[@]}")
  sources=(docs/12-privacy-policy-draft.md scripts/build-privacy-page.py scripts/lib/legal-page.css)
  maker="scripts/build-privacy-page.py --release"
fi

for f in "${pages[@]}" styles.css; do
  [ -f "$src/$f" ] || fail "no release file $src/$f (run $maker in $app)"
done
if [ -n "$(git -C "$app" status --porcelain -- "${sources[@]}")" ]; then
  fail "commit ${sources[*]} in $app first, so the published pages match a committed text"
fi

dest="$root/public/culture/clean-space"
mkdir -p "$dest"
if [ -f "$dest/styles.css" ] && ! cmp -s "$src/styles.css" "$dest/styles.css"; then
  echo "note: styles.css changes (both page sets use it; release the other set too if its generator changed)" >&2
fi
for f in "${pages[@]}"; do rm -f "$dest/$f"; done
for f in "${pages[@]}" styles.css; do cp "$src/$f" "$dest/$f"; done
validate "$dest"
echo "Copied ${#pages[@]} page(s) + styles.css from $src ($(git -C "$app" log -1 --format='%h %s' -- "${sources[@]}"))"
for f in "${pages[@]}"; do
  grep -o 'class="date">[^<]*' "$dest/$f" | sed "s/class=\"date\">/$f: /" || echo "$f: no effective date"
done
git -C "$root" status --short -- public/culture/clean-space
