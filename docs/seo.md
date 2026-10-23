# SEO for cultureand.tech

## In place (2026-10-22)

| Item | Where |
| --- | --- |
| Language versions | `/` English, `/ko/` Korean, both pre-rendered; `hreflang` en / ko / x-default (`src/lib/seo.ts`, `public/sitemap.xml`) |
| Titles and descriptions | `HOME_METADATA` in `src/lib/seo.ts` |
| Structured data | Organization, WebSite and FAQPage per language (`homeJsonLd`); the FAQ is the visible FAQ text |
| Crawler files | `public/robots.txt` (search engines and all AI crawlers allowed), `public/sitemap.xml`, `public/llms.txt` |
| 404 page | `noindex`, no canonical |

Released 2026-10-22 16:11 KST from `f60d4e6` (preview channel `seo` cloned to `live`, Next build ID
`9ZVNZYVJcngl3EbgAYbgi`). On `cultureand.tech` after the release: `/ko/` serves 829 Korean characters with
`lang="ko"`; both pages carry one JSON-LD block and three `hreflang` links, with no `noindex` meta tag or
`X-Robots-Tag`; `robots.txt`, `sitemap.xml` and `llms.txt` return 200; the schema.org validator reports 0 errors
and 0 warnings for both pages; `scripts/check-live.sh cultureand.tech 1.1` passes.

## App pages (branch `update/introduce-music-apps`, not released yet)

| Item | Where |
| --- | --- |
| Pages | `/apps/chord-to-midi/` and `/apps/storage-review/`, with Korean versions under `/ko/apps/`, pre-rendered; `hreflang` en / ko / x-default per app (`appPaths` in `src/lib/seo.ts`, `public/sitemap.xml`) |
| Titles and descriptions | `APP_METADATA` in `src/lib/seo.ts` |
| Structured data | Organization, WebSite, the app (WebApplication for Chord to MIDI, SoftwareApplication for Storage Review), FAQPage and BreadcrumbList per page (`appJsonLd`); the FAQ is the visible FAQ text; screenshots labelled as a development build are left out |
| Language | App pages show the language of their address, so their text, title, description and structured data agree; only the English homepage adapts to the visitor |
| Link preview images | `public/images/apps/<app>/og.png`, 1200 × 630; Storage Review also has `og-ko.png` for its Korean page, both labelled as a development build |
| Homepage | An Apps section (`#apps`) with one card per app, linking to its page; hero and About rewritten around "Music for live idols. Apps for musicians." The homepage's title, description and structured data are unchanged |
| Crawler files | Both apps in `public/llms.txt`; the four app pages in `public/sitemap.xml` |

Checked on the local export (2026-10-23): every page has its `lang`, a title of at most 60 characters, a description,
its canonical URL, three `hreflang` links, an existing `og:image`, and one JSON-LD block that parses and whose FAQ
equals the visible questions and answers; the homepage's JSON-LD is identical to the live build's; no page scrolls
sideways at 390 px. After the release: `scripts/check-live.sh` checks the app pages and their images; submit
`sitemap.xml` again in Search Console and Search Advisor and request indexing of the four app pages.

## Baseline before the change (crawler view, 2026-10-22)

- `robots.txt`, `sitemap.xml`, `llms.txt`: 404
- Structured data: none
- Korean text in the static HTML: 0 characters (Korean appeared only after JavaScript language detection)
- Title "Culture & Tech" (14 characters); description 196 characters
- Google Search Console, Naver Search Advisor, Bing Webmaster Tools: not registered, so no search data yet

## Registration (owner accounts)

| Service | Property | Verification | Then |
| --- | --- | --- | --- |
| Google Search Console | Domain `cultureand.tech` | TXT record at Porkbun (Host blank) | Submit `sitemap.xml`; inspect `/` and `/ko/` and request indexing |
| Bing Webmaster Tools | Imported from Search Console | Import | Check the sitemap is listed |
| Naver Search Advisor | `https://cultureand.tech` | HTML tag (`naver-site-verification`, added in `src/pages/_document.tsx`) | Submit `sitemap.xml`; request collection of `/ko/` |

## Old address music.cafe24.com

On 2026-10-22 Naver still listed the old profile pages on `https://music.cafe24.com/`, which answered 200 with
canonical URLs on that host. `cafe24/` holds their 301s to `cultureand.tech` (Korean pages to `/ko/`, the others
to `/`). Live since 2026-10-22; `scripts/check-music-cafe24.sh` passes. Next: request collection of the old URLs
in Naver Search Advisor (`cafe24/README.md`).

## Measurement

Re-measure on **2026-11-05** (14 days after the release), leaving out the last 2–3 days of data:

- Search Console and Search Advisor: impressions, clicks, indexed pages, top queries
- `site:cultureand.tech` on Google, Naver and Bing
- `site:music.cafe24.com` on Naver and Google: the old pages replaced by `cultureand.tech`
- AI citation (O/X) in ChatGPT search, Perplexity and Naver AI briefing for starter questions such as
  "라이브아이돌 오리지널곡 제작", "지하아이돌 오리곡 제작 의뢰", "컬처앤테크", "live idol original song producer Korea"

App pages: measure 14 days after their own release, the same way: impressions, clicks and top queries of the four
pages, and AI citation (O/X) for questions such as "chord progression to MIDI online", "코드 진행 MIDI 변환",
"Mac storage cleaner for music producers", "맥 용량 정리 음악 작업" and "로직 프로 용량 부족".

Top queries without a matching page are candidates for new pages.
