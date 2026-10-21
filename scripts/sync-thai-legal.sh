#!/usr/bin/env bash
# Copies the Thai app's released legal pages into public/culture/thai-learn/, which is served at
# https://cultureand.tech/culture/thai-learn/. Refuses drafts and anything but plain HTML + styles.css.
#
# Usage: scripts/sync-thai-legal.sh [path/to/toss-in-app-thai-phrase]
#        scripts/sync-thai-legal.sh --check <dir>   validate only (firebase predeploy runs it on out/)
#
# The source is `npm run legal:release` output in toss-in-app-thai-phrase (build/legal-upload/thai/).
# Never edit the copied HTML by hand; change the templates there and release again.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
pages=(index.html terms.html privacy.html privacy-consent.html)

fail() { echo "sync-thai-legal: $*" >&2; exit 1; }

validate() {
  local dir="$1" f name body links
  for f in "${pages[@]}" styles.css; do
    if [ ! -f "$dir/$f" ]; then fail "missing $dir/$f"; fi
  done
  for f in "$dir"/*.html; do
    name="$(basename "$f")"
    case " ${pages[*]} " in *" $name "*) ;; *) fail "unexpected page $f (add it to this script on purpose)";; esac
    body="$(cat "$f")"
    if grep -qE 'class="pending"|확인 필요' <<<"$body"; then fail "pending marker in $f"; fi
    if grep -q 'class="draft"' <<<"$body"; then fail "draft banner in $f"; fi
    if grep -qi '<script' <<<"$body"; then fail "script tag in $f"; fi
    if ! grep -q '<meta name="robots" content="index,follow">' <<<"$body"; then fail "robots is not index,follow in $f"; fi
    links="$(grep -o '<link[^>]*>' <<<"$body" | grep -vE '^<link rel="stylesheet" href="styles\.css">$|^<link rel="canonical" href="https://cultureand\.tech/[^"]*">$' || true)"
    if [ -n "$links" ]; then fail "unexpected <link> in $f: $links"; fi
  done
}

if [ "${1:-}" = "--check" ]; then
  [ $# -eq 2 ] || fail "usage: $0 --check <dir>"
  validate "$2"
  echo "ok: $2 holds release pages only"
  exit 0
fi

common="$(git -C "$root" rev-parse --path-format=absolute --git-common-dir)"
thai="${1:-$(dirname "$(dirname "$common")")/toss-in-app-thai-phrase}"
src="$thai/build/legal-upload/thai"
manifest="$thai/build/legal-upload/manifest.json"

[ -f "$manifest" ] || fail "no release manifest at $manifest (run npm run legal:release in $thai)"
status="$(node -e 'process.stdout.write(String(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).status))' "$manifest")"
[ "$status" = "operator-reviewed-local-export" ] || fail "manifest status is '$status', expected operator-reviewed-local-export"
validate "$src"
for f in "${pages[@]}"; do
  if ! grep -q '<link rel="canonical" href="https://cultureand\.tech/culture/thai-learn/' "$src/$f"; then
    fail "canonical in $src/$f does not point into https://cultureand.tech/culture/thai-learn/"
  fi
done

dest="$root/public/culture/thai-learn"
mkdir -p "$dest"
find "$dest" -maxdepth 1 -type f \( -name '*.html' -o -name 'styles.css' \) -delete
for f in "${pages[@]}" styles.css; do cp "$src/$f" "$dest/$f"; done
echo "Copied ${#pages[@]} pages + styles.css from $src"
grep -o 'class="date">[^<]*' "$dest/privacy.html" | sed 's/class="date">/privacy.html: /'
git -C "$root" status --short -- public/culture/thai-learn
