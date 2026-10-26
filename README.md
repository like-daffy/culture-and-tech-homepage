# cultureand.tech

The Culture & Tech homepage (Next.js static export) and the legal pages of our apps, served together from
Firebase Hosting, project `cultureand-tech-web` (Spark plan, Hosting only).

**Status (2026-10-22):** `cultureand.tech` is served by Firebase Hosting; `www.cultureand.tech` and `http://`
redirect to `https://cultureand.tech/`. Cafe24 web hosting (the old `/culture` build) is kept as the rollback target
until it is retired; see `docs/transfer-to-firebase.md`. Its web root files, including the `.htaccess` and the 301s
of the old address `music.cafe24.com`, are in `cafe24/`.

## What is served from where

| URL | Source | Made by |
|---|---|---|
| `/` (English), `/ko/` (Korean), the app pages `/apps/<app>/` and `/ko/apps/<app>/`, `/404.html`, `/_next/…`, `/favicon.ico`, `/og-image.png`, `/images/apps/…` | `src/`, `public/` | `npm run build` (static export into `out/`) |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt` | `public/` (hand-written) | see `docs/seo.md` |
| `/culture/thai-learn/{index,terms,privacy,privacy-consent}.html`, `styles.css` | `public/culture/thai-learn/` (generated, committed) | `scripts/sync-thai-legal.sh` from `toss-in-app-thai-phrase` |
| `/culture/storage-review/privacy.html` (planned) | `public/culture/storage-review/` | from `mac-get-space` `docs/12-privacy-policy-draft.md` once approved; then set `privacyPolicyPath` in `src/lib/apps.ts` so that the Mac Get Space page links it |
| `/culture`, `/culture/`, `/culture/index.html` | `firebase.json` redirects | 301 to `/` (the old homepage address) |
| `/culture/_next/static/…` | `compat/cafe24/` (committed) | `scripts/add-compat-assets.sh` (predeploy): the last Cafe24 build's hashed assets, for old tabs and cached HTML |
| `https://music.cafe24.com/…` (old address, not Firebase) | `cafe24/www/` | Uploaded by hand to the Cafe24 web root: 301 to `cultureand.tech`, checked by `scripts/check-music-cafe24.sh`; see `cafe24/README.md` |

The `/culture/...` legal URLs are registered in the Toss console and App Store Connect. They must keep returning
200 at exactly these paths, so `cleanUrls` stays `false` and `trailingSlash` is unset in `firebase.json`.
The generated HTML is committed so that the published text of every policy version stays in git history.

## Develop

```bash
npm install
npm run dev
```

There are no API routes: the site is a static export. Every page has an English version and a Korean version under
`/ko/`, each pre-rendered in its language: `/` and `/ko/`, `/apps/<app>/` and `/ko/apps/<app>/`. Only the English
homepage adapts to the visitor (stored preference, then browser language, then English); every other page, the app
pages included, shows the language of its address, so that its text matches its title, description and structured
data. The language switch moves to the same page in the other language.

## SEO

Titles, descriptions, `hreflang` and structured data come from `src/lib/seo.ts`; the homepage's FAQ structured
data reuses the FAQ text of `src/components/MusicDetails.tsx`, and each app page's reuses that app's FAQ in
`src/lib/apps.ts`. Structured data and `public/llms.txt` may only state what the page shows. When page content
changes, update `public/llms.txt` and the `<lastmod>` dates in `public/sitemap.xml`; a new page also goes into the
sitemap. Registration, baseline and measurement: `docs/seo.md`.

## Apps for musicians

The homepage's Apps section and the app pages introduce only apps for making music; that is the section's concept.
Today they are Chord to MIDI (`chord-to-midi-web`, live at https://chord-to-midi.app/) and Mac Get Space
(`mac-get-space`, coming to the Mac App Store; the app was called Storage Review until its rename). The Thai app is not introduced, and MIDI Utility is not named while
it is not public.

All of their copy, in English and Korean, is in `src/lib/apps.ts`; the cards, the app pages and the structured data
read it. Every claim must be true on the day it is published and documented in the app's own repository (the sources
are listed at the top of that file). Mac Get Space's protection is described as what its default rules exclude from
removal, together with the limits the page lists, never as a guarantee; the Trash and permanent deletion are named
apart; its privacy text covers file processing only, since Apple handles the Expert purchase.

Images are in `public/images/apps/`. Chord to MIDI's icon, link preview image and screenshots come from its
repository. Mac Get Space's screenshots are Free-edition captures of the validation tour on its synthetic home
(`build/validation/shots-free/` in `mac-get-space`), with the tour's own "Validation mode" label painted over. The
page labels each of them "Development build · sample data" (`note` in `src/lib/apps.ts`), its link preview images
`og.png` and `og-ko.png` (cropped from the Protection & exclusions screen) carry the same label in their language, and
screenshots with a note stay out of the structured data. Replace all of them with App Store screenshots at launch.

When an app changes:
- Mac Get Space on the App Store: give both languages a `cta` with the App Store link and a new `status`, set
  `schema.free` once the page says the download is free, replace the screenshots and link preview images with App
  Store ones (without a `note`), and update `public/llms.txt`.
- Mac Get Space's privacy policy changes: see "Updating Mac Get Space's privacy page" below. Its app pages link to
  it through `privacyPolicyPath` (published 2026-10-23).
- Chord to MIDI: mention DAW drag only once its extension is on the Chrome Web Store, and ads only once AdSense has
  approved the site.
- A new app: an entry in `APPS` and `APP_SLUGS` (`src/lib/apps.ts`) and in `APP_METADATA` (`src/lib/seo.ts`), page
  files under `src/pages/apps/` and `src/pages/ko/apps/`, then the sitemap, `public/llms.txt` and
  `scripts/check-live.sh`.

## Deploy

Releases are manual, from a clean, committed `main`, with the pinned CLI and an explicit project.
Needs `firebase login` with the account that owns `cultureand-tech-web` (sochan@cultureand.tech).
Channel deploys first run `npm run build`, add the Cafe24 compatibility assets and check
`out/culture/thai-learn/` and `out/culture/mac-get-space/` (`predeploy` in `firebase.json`).

```bash
fb() { npx --yes firebase-tools@15.32.1 "$@"; }
npm ci && npm run lint && node_modules/.bin/tsc --noEmit --incremental false

# Preview: a temporary *.web.app URL, no effect on the live site
fb hosting:channel:deploy cafe24-migration --expires 7d --no-authorized-domains --project cultureand-tech-web
scripts/check-live.sh <preview-host> 1.1

# Live: promote the tested preview (no rebuild)
fb hosting:clone cultureand-tech-web:cafe24-migration cultureand-tech-web:live --project cultureand-tech-web
scripts/check-live.sh cultureand-tech-web.web.app 1.1
scripts/check-live.sh cultureand.tech 1.1
```

Rollback of content: Firebase console → Hosting → release history → roll back to the previous release.

## Updating the Thai app's legal pages

1. In `toss-in-app-thai-phrase`: edit `legal/publisher.json` or `legal/templates/`, run `npm run legal:draft`,
   review `build/legal-preview/thai/`, set both `publicationReview` flags, then `npm run legal:release`.
2. Here: `scripts/sync-thai-legal.sh` (refuses drafts, pending markers, scripts and foreign `<link>`s), commit
   ("Thai legal: …"), deploy.

Never edit the copied HTML by hand.

## Updating Mac Get Space's privacy page

1. In `mac-get-space`: edit `docs/12-privacy-policy-draft.md`, review the draft from
   `scripts/build-privacy-page.py` (`build/legal-preview/mac-get-space/`), record the owner's approvals in docs/12,
   commit, then run `scripts/build-privacy-page.py --release`. Until the release day the page has no effective date
   (`--release --without-effective-date`, the owner's choice on 2026-10-23).
2. Here: `scripts/sync-mac-get-space-legal.sh` (refuses drafts, placeholders, scripts, foreign `<link>`s and
   uncommitted sources), commit ("Mac Get Space legal: …"), deploy.

## Updating English-Thai Learn's privacy and support pages

1. In `thai-word-learn-app`: edit `docs/legal/privacy-policy-draft.md` or `docs/legal/support-page-draft.md`, review
   the drafts from `scripts/build-legal-pages.py` (`build/legal-preview/english-thai-learn/index.html`), record the
   owner's approvals in the drafts, commit, then run `scripts/build-legal-pages.py --release`. Until the app's release
   day the policy has no effective date (`--release --without-effective-date`, as for Mac Get Space).
2. Here: `scripts/sync-english-thai-learn-legal.sh` (refuses drafts, placeholders, scripts, foreign `<link>`s and
   uncommitted sources), commit ("English-Thai Learn legal: …"), deploy.

Never edit the copied HTML by hand.

## Rules

- `public/` holds static HTML, CSS and the homepage's assets only. Never `publisher.json`, operator docs, server
  code, `.ait` bundles, service-account files or `.env` files.
- Hosting only: never enable Firestore, Functions, Auth or Analytics in `cultureand-tech-web`, and never deploy
  this site to another Firebase project.
- `Referrer-Policy: no-referrer` applies to `/culture/**` only; the homepage's YouTube embeds need a referrer.
- Firebase itself sends `Strict-Transport-Security: max-age=31556926` (no `includeSubDomains`) on the custom
  domain. Do not add `includeSubDomains` or `preload`.

## DNS and rollback

DNS is at Porkbun; mail is Google Workspace (MX, SPF, DMARC) and does not depend on the web host. Both hostnames
were added in the Firebase console with Advanced Setup on 2026-10-22. Keep their TXT records permanently
(certificate renewal): `hosting-site=cultureand-tech-web` on the apex and `www`, and `_acme-challenge` /
`_acme-challenge.www`. The web records are A `199.36.158.100` on the apex and on `www`; Firebase does the `www`
redirect, so never use Porkbun's URL forwarding or Quick DNS Config.

Until Cafe24 is cancelled, rollback is: at Porkbun, edit both A records back to `183.110.224.126` (each record's
note holds the old IP) and leave the TXT records. Because of the HSTS header, Cafe24 must then serve valid HTTPS:
its Sectigo certificate covers both hostnames until 2027-04-05. Keep the existing Comodo CNAME (probably that
certificate's validation record) while Cafe24 is the fallback. Cancelling Cafe24 also ends the `music.cafe24.com`
redirects, so keep it until Naver and Google list `cultureand.tech` instead.

`build.sh` / `build.ps1` are legacy Softgen helpers (they rewrite `basePath` and run `npm install`); do not use them
for Firebase releases. `next.config.mjs.template` mirrors `next.config.mjs`.
