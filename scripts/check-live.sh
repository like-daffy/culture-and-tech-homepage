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
expect 200 "https://$host/culture/clean-space/privacy.html"
expect 200 "https://$host/culture/clean-space/styles.css"
for p in privacy support; do expect 200 "https://$host/culture/english-thai-learn/$p.html"; done
expect 200 "https://$host/culture/english-thai-learn/styles.css"
# Every page in both languages: 200, and no stale browser cache (firebase.json headers; the default is max-age=3600)
for p in "" ko/ apps/chord-to-midi/ apps/clean-space/ ko/apps/chord-to-midi/ ko/apps/clean-space/; do
  headers=$(curl -s -o /dev/null -D - -m 20 "https://$host/$p" | tr -d '\r')
  status=$(echo "$headers" | awk 'NR==1{print $2}')
  cc=$(echo "$headers" | awk 'tolower($1)=="cache-control:"{ $1=""; print }')
  if [ "$status" != 200 ]; then echo "FAIL $status (want 200) https://$host/$p"; fail=1
  elif echo "$cc" | grep -q 'max-age=0'; then echo "ok   200 https://$host/$p (cache-control:$cc)"
  else echo "FAIL cache-control https://$host/$p:$cc"; fail=1; fi
done
for p in chord-to-midi/og.png chord-to-midi/icon.png clean-space/og.png clean-space/og-ko.png clean-space/main.webp \
         clean-space/protection.webp clean-space/icon.png; do
  expect 200 "https://$host/images/apps/$p"
done
# Every page calls the app Clean Space (renamed from Mac Get Space on 2026-11-05)
for p in "" ko/ apps/chord-to-midi/ apps/clean-space/ ko/apps/chord-to-midi/ ko/apps/clean-space/; do
  body=$(curl -s -m 20 "https://$host/$p")
  if echo "$body" | grep -q 'Clean Space' && ! echo "$body" | grep -q 'Mac Get Space'; then echo "ok   https://$host/$p names Clean Space"
  else echo "FAIL https://$host/$p does not name the app Clean Space only"; fail=1; fi
done
expect 301 "https://$host/culture/"
expect 404 "https://$host/culture/no-such-page-$(date +%s).html"
# Clean Space's addresses until 2026-11-05 (as Mac Get Space): a 301 to the clean-space ones (firebase.json redirects)
moved() { local got; got=$(curl -s -o /dev/null -m 20 -w '%{http_code} %{redirect_url}' "https://$host$1")
  if [ "$got" = "301 https://$host$2" ]; then echo "ok   301 $1 -> $2"; else echo "FAIL $got (want 301 https://$host$2) https://$host$1"; fail=1; fi; }
moved /apps/mac-get-space/ /apps/clean-space/
moved /apps/mac-get-space /apps/clean-space/
moved /ko/apps/mac-get-space/ /ko/apps/clean-space/
moved /ko/apps/mac-get-space /ko/apps/clean-space/
moved /culture/mac-get-space/privacy.html /culture/clean-space/privacy.html
moved /images/apps/mac-get-space/og.png /images/apps/clean-space/og.png
# The central checkout (README, "The central checkout"): every product's pages in both languages are 200, never cached
# stale, never framed, out of search results, and load nothing from other hosts but what the payment needs.
checkout_pages() {
  local slug="$1" p headers status body
  for p in "checkout/$slug/" "checkout/$slug/success/" "checkout/$slug/fail/" \
           "ko/checkout/$slug/" "ko/checkout/$slug/success/" "ko/checkout/$slug/fail/"; do
    headers=$(curl -s -o /dev/null -D - -m 20 "https://$host/$p" | tr -d '\r')
    status=$(echo "$headers" | awk 'NR==1{print $2}')
    header() { echo "$headers" | awk -v name="$1" 'tolower($1)==name{ $1=""; sub(/^ /, ""); print }'; }
    if [ "$status" != 200 ]; then echo "FAIL $status (want 200) https://$host/$p"; fail=1; continue; fi
    if header cache-control: | grep -q 'max-age=0' && [ "$(header x-frame-options:)" = DENY ] \
       && header content-security-policy: | grep -q "frame-ancestors 'none'" \
       && [ "$(header referrer-policy:)" = strict-origin ]; then
      echo "ok   200 https://$host/$p (no cache, no framing, referrer origin only, also on this site)"
    else echo "FAIL headers of https://$host/$p"; fail=1; fi
    body=$(curl -s -m 20 "https://$host/$p")
    if echo "$body" | grep -qE 'cdn\.softgen\.ai|fonts\.googleapis\.com|youtube'; then echo "FAIL https://$host/$p loads another host"; fail=1; fi
    if ! echo "$body" | grep -q '<meta name="robots" content="noindex"'; then echo "FAIL https://$host/$p has no noindex"; fail=1; fi
  done
  moved "/checkout/$slug" "/checkout/$slug/"
  moved "/ko/checkout/$slug" "/ko/checkout/$slug/"
}
checkout_pages chord-to-midi
checkout_pages dj-duplicate-guard
checkout_pages clean-space
# DJ Duplicate Guard's checkout stays closed until its owner opens Expert's sales (DJ_DUPLICATE_GUARD_SALES_OPEN in
# scripts/check-checkout-config.mjs): its pages say so, and publish nothing of the offer.
if ! grep -q '^const DJ_DUPLICATE_GUARD_SALES_OPEN = true;' "$(dirname "$0")/check-checkout-config.mjs"; then
  for p in checkout/dj-duplicate-guard/ checkout/dj-duplicate-guard/success/ checkout/dj-duplicate-guard/fail/ \
           ko/checkout/dj-duplicate-guard/ ko/checkout/dj-duplicate-guard/success/ ko/checkout/dj-duplicate-guard/fail/; do
    body=$(curl -s -m 20 "https://$host/$p")
    if echo "$body" | grep -q 'data-checkout="closed"' && ! echo "$body" | grep -q 'Expert'; then echo "ok   https://$host/$p is closed"
    else echo "FAIL https://$host/$p isn't closed, or names the offer"; fail=1; fi
  done
fi
# Clean Space's checkout stays closed until its owner opens the 364 days Unlock's sales (CLEAN_SPACE_SALES_OPEN in
# scripts/check-checkout-config.mjs): its pages say so, and publish nothing of the offer.
if ! grep -q '^const CLEAN_SPACE_SALES_OPEN = true;' "$(dirname "$0")/check-checkout-config.mjs"; then
  for p in checkout/clean-space/ checkout/clean-space/success/ checkout/clean-space/fail/ \
           ko/checkout/clean-space/ ko/checkout/clean-space/success/ ko/checkout/clean-space/fail/; do
    body=$(curl -s -m 20 "https://$host/$p")
    if echo "$body" | grep -q 'data-checkout="closed"' && ! echo "$body" | grep -qE 'Unlock|잠금 해제'; then echo "ok   https://$host/$p is closed"
    else echo "FAIL https://$host/$p isn't closed, or names the offer"; fail=1; fi
  done
fi
for p in index terms privacy privacy-consent; do
  body=$(curl -s -m 20 "https://$host/culture/thai-learn/$p.html")
  if echo "$body" | grep -qi '<script'; then echo "FAIL script tag in $p.html"; fail=1; fi
  if echo "$body" | grep -qE 'class="pending"|확인 필요'; then echo "FAIL pending marker in $p.html"; fail=1; fi
  if echo "$body" | grep -o '<link[^>]*>' | grep -vE 'styles\.css|rel="canonical"' | grep -q .; then echo "FAIL external link in $p.html"; fail=1; fi
done
# Clean Space's privacy page (sync-mac-get-space-legal.sh): the release page only, at its canonical address
body=$(curl -s -m 20 "https://$host/culture/clean-space/privacy.html")
if echo "$body" | grep -q '<span class="brand">Clean Space</span>' && ! echo "$body" | grep -q 'Mac Get Space'; then echo "ok   clean-space/privacy.html names Clean Space"; else echo "FAIL clean-space/privacy.html does not name the app Clean Space only"; fail=1; fi
if echo "$body" | grep -qi '<script'; then echo "FAIL script tag in clean-space/privacy.html"; fail=1; fi
if echo "$body" | grep -q 'class="draft"'; then echo "FAIL draft banner in clean-space/privacy.html"; fail=1; fi
if echo "$body" | grep -o '<link[^>]*>' | grep -vE 'styles\.css|rel="canonical"' | grep -q .; then echo "FAIL external link in clean-space/privacy.html"; fail=1; fi
if echo "$body" | grep -q '<link rel="canonical" href="https://cultureand.tech/culture/clean-space/privacy.html">'; then echo "ok   clean-space/privacy.html canonical"; else echo "FAIL clean-space/privacy.html canonical"; fail=1; fi
# English-Thai Learn's privacy and support pages (sync-english-thai-learn-legal.sh): the release pages only, at their canonical addresses
for p in privacy support; do
  body=$(curl -s -m 20 "https://$host/culture/english-thai-learn/$p.html")
  if echo "$body" | grep -qi '<script'; then echo "FAIL script tag in english-thai-learn/$p.html"; fail=1; fi
  if echo "$body" | grep -q 'class="draft"'; then echo "FAIL draft banner in english-thai-learn/$p.html"; fail=1; fi
  if echo "$body" | grep -o '<link[^>]*>' | grep -vE 'styles\.css|rel="canonical"' | grep -q .; then echo "FAIL external link in english-thai-learn/$p.html"; fail=1; fi
  if echo "$body" | grep -q "<link rel=\"canonical\" href=\"https://cultureand.tech/culture/english-thai-learn/$p.html\">"; then echo "ok   english-thai-learn/$p.html canonical"; else echo "FAIL english-thai-learn/$p.html canonical"; fail=1; fi
done
# Clean Space's account, sign-in callback, email link and activation pages (docs/clean-space-direct-sale.md; its checkout pages are
# the central checkout's, above): every page in both languages is 200, never stored, never framed, out of search
# results, sends no referrer beyond the origin, and loads no font, monitoring script or embed.
for p in apps/clean-space/account/ apps/clean-space/auth/callback/ apps/clean-space/auth/email/ apps/clean-space/activate/; do
  for l in "" ko/; do
    url="https://$host/$l$p"
    headers=$(curl -s -o /dev/null -D - -m 20 "$url" | tr -d '\r')
    status=$(echo "$headers" | awk 'NR==1{print $2}')
    hval() { echo "$headers" | awk -v name="$1" 'tolower($1)==name{ $1=""; sub(/^ /, ""); print }'; }
    if [ "$status" != 200 ]; then echo "FAIL $status (want 200) $url"; fail=1; continue; fi
    if [ "$(hval cache-control:)" = no-store ] && [ "$(hval x-frame-options:)" = DENY ] && [ "$(hval referrer-policy:)" = strict-origin ] \
       && hval content-security-policy: | grep -q "frame-ancestors 'none'" && hval x-robots-tag: | grep -q noindex; then
      echo "ok   200 $url (no-store, no framing, origin-only referrer, noindex)"
    else echo "FAIL headers of $url"; fail=1; fi
    body=$(curl -s -m 20 "$url")
    if echo "$body" | grep -qE 'cdn\.softgen\.ai|fonts\.googleapis\.com|youtube'; then echo "FAIL $url loads another host"; fail=1; fi
    if ! echo "$body" | grep -q '<meta name="robots" content="noindex, nofollow"'; then echo "FAIL $url has no noindex"; fail=1; fi
  done
done
if [ -n "$version" ]; then
  body=$(curl -s -m 20 "https://$host/culture/thai-learn/privacy.html")
  if echo "$body" | grep -q "버전 $version"; then echo "ok   privacy.html shows 버전 $version"; else echo "FAIL privacy.html does not show 버전 $version"; fail=1; fi
  if echo "$body" | grep -q '<link rel="canonical" href="https://cultureand.tech/culture/thai-learn/privacy.html">'; then echo "ok   privacy.html canonical"; else echo "FAIL privacy.html canonical"; fail=1; fi
fi
if [ "$host" = "cultureand.tech" ]; then
  expect 301 "http://$host/culture/thai-learn/privacy.html"
  expect 301 "http://$host/culture/clean-space/privacy.html"
  expect 301 "http://$host/culture/english-thai-learn/privacy.html"
  expect 301 "https://www.$host/"
fi
exit $fail
