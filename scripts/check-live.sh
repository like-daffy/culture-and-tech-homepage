#!/usr/bin/env bash
# HTTP checks against any host serving this site.
# Usage: scripts/check-live.sh <host> [privacy-version]
#   e.g. scripts/check-live.sh cultureand-tech-web.web.app
#        scripts/check-live.sh cultureand-tech-web--preview-abc123.web.app
#        scripts/check-live.sh cultureand.tech 1.1
# With a privacy version, privacy.html must show "버전 <version>" and its canonical URL.
set -u
host="$1"; version="${2:-}"; fail=0
code() { curl -s -o /dev/null -m 20 -w '%{http_code}' "$1"; }
expect() { local got; got=$(code "$2"); if [ "$got" = "$1" ]; then echo "ok   $1 $2"; else echo "FAIL $got (want $1) $2"; fail=1; fi; }
for p in index terms privacy privacy-consent; do expect 200 "https://$host/culture/thai-learn/$p.html"; done
expect 200 "https://$host/culture/thai-learn/styles.css"
expect 200 "https://$host/culture/mac-get-space/privacy.html"
expect 200 "https://$host/culture/mac-get-space/styles.css"
for p in privacy support; do expect 200 "https://$host/culture/english-thai-learn/$p.html"; done
expect 200 "https://$host/culture/english-thai-learn/styles.css"
# Every page in both languages: 200, and no stale browser cache (firebase.json headers; the default is max-age=3600)
for p in "" ko/ apps/chord-to-midi/ apps/mac-get-space/ ko/apps/chord-to-midi/ ko/apps/mac-get-space/; do
  headers=$(curl -s -o /dev/null -D - -m 20 "https://$host/$p" | tr -d '\r')
  status=$(echo "$headers" | awk 'NR==1{print $2}')
  cc=$(echo "$headers" | awk 'tolower($1)=="cache-control:"{ $1=""; print }')
  if [ "$status" != 200 ]; then echo "FAIL $status (want 200) https://$host/$p"; fail=1
  elif echo "$cc" | grep -q 'max-age=0'; then echo "ok   200 https://$host/$p (cache-control:$cc)"
  else echo "FAIL cache-control https://$host/$p:$cc"; fail=1; fi
done
for p in chord-to-midi/og.png chord-to-midi/icon.png mac-get-space/og.png mac-get-space/og-ko.png mac-get-space/main.webp; do
  expect 200 "https://$host/images/apps/$p"
done
expect 301 "https://$host/culture/"
expect 404 "https://$host/culture/no-such-page-$(date +%s).html"
for p in index terms privacy privacy-consent; do
  body=$(curl -s -m 20 "https://$host/culture/thai-learn/$p.html")
  if echo "$body" | grep -qi '<script'; then echo "FAIL script tag in $p.html"; fail=1; fi
  if echo "$body" | grep -qE 'class="pending"|확인 필요'; then echo "FAIL pending marker in $p.html"; fail=1; fi
  if echo "$body" | grep -o '<link[^>]*>' | grep -vE 'styles\.css|rel="canonical"' | grep -q .; then echo "FAIL external link in $p.html"; fail=1; fi
done
# Mac Get Space's privacy page (sync-mac-get-space-legal.sh): the release page only, at its canonical address
body=$(curl -s -m 20 "https://$host/culture/mac-get-space/privacy.html")
if echo "$body" | grep -qi '<script'; then echo "FAIL script tag in mac-get-space/privacy.html"; fail=1; fi
if echo "$body" | grep -q 'class="draft"'; then echo "FAIL draft banner in mac-get-space/privacy.html"; fail=1; fi
if echo "$body" | grep -o '<link[^>]*>' | grep -vE 'styles\.css|rel="canonical"' | grep -q .; then echo "FAIL external link in mac-get-space/privacy.html"; fail=1; fi
if echo "$body" | grep -q '<link rel="canonical" href="https://cultureand.tech/culture/mac-get-space/privacy.html">'; then echo "ok   mac-get-space/privacy.html canonical"; else echo "FAIL mac-get-space/privacy.html canonical"; fail=1; fi
# English-Thai Learn's privacy and support pages (sync-english-thai-learn-legal.sh): the release pages only, at their canonical addresses
for p in privacy support; do
  body=$(curl -s -m 20 "https://$host/culture/english-thai-learn/$p.html")
  if echo "$body" | grep -qi '<script'; then echo "FAIL script tag in english-thai-learn/$p.html"; fail=1; fi
  if echo "$body" | grep -q 'class="draft"'; then echo "FAIL draft banner in english-thai-learn/$p.html"; fail=1; fi
  if echo "$body" | grep -o '<link[^>]*>' | grep -vE 'styles\.css|rel="canonical"' | grep -q .; then echo "FAIL external link in english-thai-learn/$p.html"; fail=1; fi
  if echo "$body" | grep -q "<link rel=\"canonical\" href=\"https://cultureand.tech/culture/english-thai-learn/$p.html\">"; then echo "ok   english-thai-learn/$p.html canonical"; else echo "FAIL english-thai-learn/$p.html canonical"; fail=1; fi
done
if [ -n "$version" ]; then
  body=$(curl -s -m 20 "https://$host/culture/thai-learn/privacy.html")
  if echo "$body" | grep -q "버전 $version"; then echo "ok   privacy.html shows 버전 $version"; else echo "FAIL privacy.html does not show 버전 $version"; fail=1; fi
  if echo "$body" | grep -q '<link rel="canonical" href="https://cultureand.tech/culture/thai-learn/privacy.html">'; then echo "ok   privacy.html canonical"; else echo "FAIL privacy.html canonical"; fail=1; fi
fi
if [ "$host" = "cultureand.tech" ]; then
  expect 301 "http://$host/culture/thai-learn/privacy.html"
  expect 301 "http://$host/culture/mac-get-space/privacy.html"
  expect 301 "http://$host/culture/english-thai-learn/privacy.html"
  expect 301 "https://www.$host/"
fi
exit $fail
