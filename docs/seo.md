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

Top queries without a matching page are candidates for new pages.
