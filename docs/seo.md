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

## App pages (released 2026-10-23)

| Item | Where |
| --- | --- |
| Pages | `/apps/chord-to-midi/` and `/apps/clean-space/` (`/apps/mac-get-space/` until 2026-11-05, now a 301), with Korean versions under `/ko/apps/`, pre-rendered; `hreflang` en / ko / x-default per app (`appPaths` in `src/lib/seo.ts`, `public/sitemap.xml`) |
| Titles and descriptions | `APP_METADATA` in `src/lib/seo.ts` |
| Structured data | Organization, WebSite, the app (WebApplication for Chord to MIDI, SoftwareApplication for Clean Space), FAQPage and BreadcrumbList per page (`appJsonLd`); the FAQ is the visible FAQ text; screenshots labelled as a development build are left out |
| Language | App pages show the language of their address, so their text, title, description and structured data agree; only the English homepage adapts to the visitor |
| Link preview images | `public/images/apps/<app>/og.png`, 1200 × 630; Clean Space also has `og-ko.png` for its Korean page, both labelled as a development build |
| Homepage | An Apps section (`#apps`) with one card per app, linking to its page; hero and About rewritten around "Music for Live-idols. Apps for musicians." (the About names Subculture music and Live-idols; "Live-idol" is spelled as a proper noun throughout the English text). The homepage's title and description no longer mention QA since the QA card was removed; its FAQ structured data is unchanged |
| Crawler files | Both apps in `public/llms.txt`; the four app pages in `public/sitemap.xml` |

Checked on the local export (2026-10-23): every page has its `lang`, a title of at most 60 characters, a description,
its canonical URL, three `hreflang` links, an existing `og:image`, and one JSON-LD block that parses and whose FAQ
equals the visible questions and answers; the homepage's FAQ structured data is unchanged from the previous release;
no page scrolls sideways at 390 px.

Released 2026-10-23 14:09 KST from `3e6f1b3` (preview channel `apps` cloned to `live`, Next build ID
`J2ulh-hEG6B8cGWwAMsWz`), from the branch `update/introduce-music-apps` before its merge; PR #1 merges it into
`main`. After the release, `scripts/check-live.sh … 1.1` passes on the preview channel, on
`cultureand-tech-web.web.app` and on `cultureand.tech`: the six pages answer 200 with `max-age=0`, the five app
images and the Thai legal pages answer 200, and every page serves its `lang`, its title and one JSON-LD block.
Next: submit `sitemap.xml` again in Search Console and Search Advisor and request indexing of the four app pages.

## Rename to Clean Space (released 2026-11-05)

Apple rejected the name Mac Get Space (Guideline 5.2.5); the app is now Clean Space, App Store subtitle "For Music
Production". This release kept every address (`/apps/mac-get-space/`, `/ko/apps/mac-get-space/` and
`/culture/mac-get-space/privacy.html`); they moved later the same day (next section).

- Titles: "Clean Space: Mac Cleaner for Musicians | Culture & Tech" and "Clean Space: 음악가를 위한 Mac 용량 정리 앱 |
  컬처앤테크"; the descriptions did not name the app and are unchanged.
- Structured data: the SoftwareApplication, the breadcrumb and the FAQ page name Clean Space; the page now shows the
  owner's icon, so `image` is `/images/apps/mac-get-space/icon.png`.
- Crawler files: `public/llms.txt` names Clean Space; every `<lastmod>` in `public/sitemap.xml` is 2026-11-05, since
  every page shows the app's name (the homepages' Apps cards, the Chord to MIDI pages' "More apps" card).
- Privacy page: the release build from mac-get-space `2632d3e` differs from the page it replaced only by the name.

Released 2026-11-05 17:02 KST from `37eb1fa` (preview channel `clean-space` cloned to `live`, Next build ID
`E6Ebs2A_cID6LryUGSkR0`). `scripts/check-live.sh … 1.1` passed on the preview (37 checks), on
`cultureand-tech-web.web.app` (37) and on `cultureand.tech` (41), including its new check that every page and the
privacy page name Clean Space and never Mac Get Space; the live privacy page and its `styles.css` are byte-identical
to the release files. The Firebase CLI's sign-in had expired; the owner signed in again before the deploy.

Next: request recrawling of the two Clean Space pages and the two homepages in Search Console and Search
Advisor, so that results show the new name; until then they may still show Mac Get Space. Add "Clean Space Mac" and
"Clean Space For Music Production" to the app pages' measurement queries.

## Clean Space addresses (released 2026-11-05)

At the owner's request, so that nothing an App Store reviewer opens carries the rejected name, Clean Space's
addresses moved to `/apps/clean-space/`, `/ko/apps/clean-space/`, `/images/apps/clean-space/` and
`/culture/clean-space/privacy.html`; canonical URLs, `hreflang`, structured data, `public/sitemap.xml` and
`public/llms.txt` follow. `firebase.json` 301s every old address: `/apps/mac-get-space` and `/ko/apps/mac-get-space`
with or without the slash, `/culture/mac-get-space/<file>` and `/images/apps/mac-get-space/<file>`. The privacy
page's text is unchanged; only its canonical link moved (mac-get-space `3ecd039`). The icon became the owner's
updated artwork.

Released 2026-11-05 19:11 KST from `ce0c31f` (preview channel `clean-space` cloned to `live` by the owner, Next
build ID `0P-P1nu873jPrHK68jkF0`). `scripts/check-live.sh … 1.1` passed on the preview (43 checks), on
`cultureand-tech-web.web.app` (43) and on `cultureand.tech` (47), including a 301 to the right new address for each
old one. The live privacy page and its `styles.css` are byte-identical to the committed files, and no page,
`sitemap.xml` or `llms.txt` contains the old slug or name.

Next: submit `sitemap.xml` again in Search Console and Search Advisor and request indexing of `/apps/clean-space/`
and `/ko/apps/clean-space/`; the 301s carry the old pages over. The app's own privacy link and the URLs in App Store
Connect move separately; until they do, the 301 keeps the old privacy address working.

## Clean Space's page on clean-space.app (the owner's decision of 2026-11-12)

Clean Space's product page moved to its own site, `https://clean-space.app/` and `https://clean-space.app/ko/` (README,
"clean-space.app").

- **Its addresses here** (`/apps/clean-space/`, `/ko/apps/clean-space/`, with or without the slash, and `index.html`)
  are 301s there; a `#fragment` such as `#download` carries over.
- **The page there** has its own canonical, hreflang, `og:url`, images and structured data on clean-space.app: its own
  WebSite node published by Culture & Tech's Organization, and no BreadcrumbList. It has its own `robots.txt` and
  `sitemap.xml`.
- **This site's files:** `public/sitemap.xml` no longer lists the page, and `public/llms.txt` names clean-space.app.
- **Change of Address doesn't apply.** Search Console's Change of Address is for a whole site, not one page, so the 301s
  and the canonical carry it.

Next, the owner:
- add `https://clean-space.app` as a property in Search Console (a DNS TXT record at Porkbun), and in Search Advisor if
  wanted;
- submit `https://clean-space.app/sitemap.xml` and request indexing of `/` and `/ko/`;
- submit this site's `sitemap.xml` again.

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
| Naver Search Advisor | `https://cultureand.tech` | HTML tag (`naver-site-verification` in `src/pages/_document.tsx`, on every page; live since 2026-10-23) | Submit `sitemap.xml`; request collection of `/ko/` and the four app pages |

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
