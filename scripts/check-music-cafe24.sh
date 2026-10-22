#!/usr/bin/env bash
# HTTP checks for the old Cafe24 host after cafe24/www/ is uploaded (see cafe24/README.md): every old
# music.cafe24.com URL answers 301 with its cultureand.tech address, the targets answer 200, robots.txt blocks
# nothing, and Cafe24 still serves cultureand.tech itself (the DNS rollback target) without redirecting it.
# Usage: scripts/check-music-cafe24.sh
set -u
old="https://music.cafe24.com"; new="https://cultureand.tech"; fail=0
code() { curl -s -o /dev/null -m 20 -w '%{http_code}' "$@"; }
expect() { local got; got=$(code "$2"); if [ "$got" = "$1" ]; then echo "ok   $1 $2"; else echo "FAIL $got (want $1) $2"; fail=1; fi; }
location() { curl -s -o /dev/null -m 20 -w '%{http_code} %{redirect_url}' "$1" | LC_ALL=C tr -c '[:print:]' '?'; }
moved() {  # moved <old path> <new url>: one 301 straight to the new url
  local got; got=$(location "$old$1")
  if [ "$got" = "301 $2" ]; then echo "ok   301 $old$1 -> $2"
  elif [ "${got%% *}" = 200 ] && curl -s -m 20 "$old$1" | grep -qF "content=\"0; url=$2\""; then
    echo "FAIL 200 $old$1 only has the meta refresh to $2 (.htaccess not active)"; fail=1
  else echo "FAIL $got (want 301 $2) $old$1"; fail=1; fi
}
moved / "$new/ko/"
moved /index.html "$new/ko/"
moved /promotion_kr.html "$new/ko/"
moved /index_en.html "$new/"
moved /index_jp.html "$new/"
moved /culture/ "$new/"
moved /culture/thai-learn/privacy.html "$new/culture/thai-learn/privacy.html"
moved /sitemap.xml "$new/sitemap.xml"
moved /assets/images/shop3.jpg "$new/"
moved "/index.html?utm_source=naver" "$new/ko/?utm_source=naver"
for u in "$new/" "$new/ko/" "$new/sitemap.xml" "$new/culture/thai-learn/privacy.html"; do expect 200 "$u"; done
expect 200 "$old/robots.txt"
robots=$(curl -s -m 20 "$old/robots.txt")
if echo "$robots" | grep -qiE '^disallow: *[^ ]'; then echo "FAIL $old/robots.txt blocks a path"; fail=1; fi
if echo "$robots" | grep -qF "Sitemap: $new/sitemap.xml"; then echo "ok   $old/robots.txt is cafe24/www/robots.txt"; else echo "FAIL $old/robots.txt is not cafe24/www/robots.txt"; fail=1; fi
expect 404 "$old/naver00000000000000000000000000000000.html"
# Cafe24 itself, as cultureand.tech (the DNS rollback target): the old build from /culture/, no redirect
rollback=(--connect-to cultureand.tech:443:music.cafe24.com:443)
if curl -s -m 20 "${rollback[@]}" "$new/" | grep -q '/culture/_next/'; then echo "ok   Cafe24 serves $new/ from /culture/"
else echo "FAIL Cafe24 does not serve $new/ from /culture/"; fail=1; fi
got=$(code "${rollback[@]}" "$new/culture/thai-learn/privacy.html")
if [ "$got" = 200 ]; then echo "ok   200 $new/culture/thai-learn/privacy.html on Cafe24"; else echo "FAIL $got (want 200) $new/culture/thai-learn/privacy.html on Cafe24"; fail=1; fi
# Cafe24's front server turns the Location of http:// redirects into a malformed address for every host (seen
# 2026-10-22, before and after this change); reported, not checked
echo "note http://music.cafe24.com/index.html -> $(location http://music.cafe24.com/index.html)"
exit $fail
