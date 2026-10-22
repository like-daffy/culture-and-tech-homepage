# Cafe24 web root: the music.cafe24.com redirect

`https://music.cafe24.com/` is the Cafe24 web hosting's own address, on the same server (`183.110.224.126`) that
served `cultureand.tech` before Firebase. On 2026-10-22 it still served the old Mobirise profile pages with 200
and canonical URLs on `music.cafe24.com`, so Naver kept listing them. The files in `www/` move every old URL to
`cultureand.tech` with a 301, as Naver's guide [웹 페이지의 이동](https://searchadvisor.naver.com/guide/seo-basic-redirect)
asks: a server redirect in one hop to a crawlable page, meta refresh only as a fallback, no JavaScript redirect.

They are uploaded by hand to the Cafe24 web root and are not part of the Firebase release.
**Status:** live since 2026-10-22 (all files of `www/` uploaded). `scripts/check-music-cafe24.sh` passes; every
old page reaches its new page in one 301, and Cafe24 still serves `cultureand.tech` for the rollback.

| Old URL on `music.cafe24.com` | Answer |
|---|---|
| `/`, `/index.html` (Korean profile), `/promotion_kr.html` | 301 to `https://cultureand.tech/ko/` |
| `/index_en.html`, `/index_jp.html`, `/culture/`, `/culture/index.html` | 301 to `https://cultureand.tech/` |
| `/culture/…` (Thai app policies, old Next assets), `/sitemap.xml` | 301 to the same path on `cultureand.tech` |
| Anything else (`/assets/…`, unknown paths) | 301 to `https://cultureand.tech/` |
| `/robots.txt`, `/google….html`, `/naver….html` | Served from the web root, so crawlers and site verification can read them |

| File | Purpose |
|---|---|
| `www/.htaccess` | The 301s for the host `music.cafe24.com` outside `/culture/`. Below them, unchanged, the live rules that serve `cultureand.tech` from `/culture/` (DNS rollback) |
| `www/culture/.htaccess` | The 301s below `/culture/`: this file has rewrite rules of its own, so the root rules do not run there. Below them, unchanged, the live fallback to `/culture/index.html` |
| `www/index.html`, `index_en.html`, `index_jp.html`, `promotion_kr.html` | Replace the old pages: an instant meta refresh and a canonical link to the new page, in case the `.htaccess` rules do not run |
| `www/robots.txt` | Replaces the old one, which disallowed `/assets/`: blocks nothing, names the new sitemap, keeps the Daum verification line |

"Unchanged" means as on the server on 2026-10-22, before this change (the root rules differ from the old
`.htaccess` in git). Tested on a local Apache 2.4.62 with the live files and with these: every row of the first
table works (`/culture` without a slash takes two hops), query strings are kept, and `cultureand.tech` and
`www.cultureand.tech` get identical answers from both sets.

## Upload

1. Over FTP, open the web root: the folder that holds `index.html`, `index_en.html`, `assets/` and `culture/`
   (`/www/` on Cafe24). Download `.htaccess` and `culture/.htaccess` (hidden files) and keep them, to restore.
2. Upload the files of `www/` to the same places (`culture/.htaccess` into `culture/`), replacing the old ones.
   Leave everything else in place: Cafe24 serves `cultureand.tech` from `culture/` in a rollback.
3. Run `scripts/check-music-cafe24.sh`; it ends with exit status 0. If the site answers 500, or a 301 points
   somewhere else, put the downloaded `.htaccess` files back. The meta refresh pages then still redirect.

## After the upload

- Naver: add `https://music.cafe24.com` in Search Advisor, verify it with the HTML file (upload the `naver….html`
  file to the web root), then 요청 → 웹페이지 수집 for `https://music.cafe24.com/index.html` and the other old
  pages. Otherwise Naver sees the 301s on its next crawl. Either way, the results take a while to change.
- Google: the old pages carried a Search Console verification meta tag, which is gone now. To keep that property
  (for example for the Change of Address tool), verify it with a `google….html` file instead.
- Keep the Cafe24 web hosting until Naver and Google list `cultureand.tech` instead of `music.cafe24.com`.
  Cancelling it ends the redirects.

## Known Cafe24 issue

Over `http://`, the Cafe24 front server (`Server: nginx`) replaces the `Location` of Apache's redirects with
`http://<host><path>/`, while the body keeps Apache's target: `http://music.cafe24.com/index.html` answers
`Location: http://music.cafe24.com/index.html/` with a body naming `https://cultureand.tech/ko/`, and for `/` the
`Location` is stray bytes. This was seen for every host on 2026-10-22, before and after this change, including
`cultureand.tech` on Cafe24, so it also affects a rollback for visitors who type `http://`. The web root cannot fix
it. Naver lists the `https://` URLs. `scripts/check-music-cafe24.sh` reports the `http://` answer without checking it.
