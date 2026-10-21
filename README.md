# cultureand.tech

The Culture & Tech homepage (Next.js static export) and the legal pages of our apps, served together from
Firebase Hosting, project `cultureand-tech-web` (Spark plan, Hosting only).

**Status (2026-10-22):** Firebase serves this build at `https://cultureand-tech-web.web.app/`. The custom domain
`cultureand.tech` (and `www`) still points at Cafe24 web hosting, which serves the old `/culture` build (see
`.htaccess` in the git history). The DNS/certificate cutover is pending; see `docs/transfer-to-firebase.md`.

## What is served from where

| URL | Source | Made by |
|---|---|---|
| `/`, `/404.html`, `/_next/…`, `/favicon.ico`, `/og-image.png` | `src/`, `public/` | `npm run build` (static export into `out/`) |
| `/culture/thai-learn/{index,terms,privacy,privacy-consent}.html`, `styles.css` | `public/culture/thai-learn/` (generated, committed) | `scripts/sync-thai-legal.sh` from `toss-in-app-thai-phrase` |
| `/culture/storage-review/privacy.html` (planned) | `public/culture/storage-review/` | from `mac-get-space` `docs/12-privacy-policy-draft.md` once approved |
| `/culture`, `/culture/`, `/culture/index.html` | `firebase.json` redirects | 301 to `/` (the old homepage address) |
| `/culture/_next/static/…` | `compat/cafe24/` (committed) | `scripts/add-compat-assets.sh` (predeploy): the last Cafe24 build's hashed assets, for old tabs and cached HTML |

The `/culture/...` legal URLs are registered in the Toss console and App Store Connect. They must keep returning
200 at exactly these paths, so `cleanUrls` stays `false` and `trailingSlash` is unset in `firebase.json`.
The generated HTML is committed so that the published text of every policy version stays in git history.

## Develop

```bash
npm install
npm run dev
```

There are no API routes: the site is a static export, so language detection is stored preference, then browser
language, then English.

## Deploy

Releases are manual, from a clean, committed `main`, with the pinned CLI and an explicit project.
Needs `firebase login` with the account that owns `cultureand-tech-web` (sochan@cultureand.tech).
Channel deploys first run `npm run build`, add the Cafe24 compatibility assets and check
`out/culture/thai-learn/` (`predeploy` in `firebase.json`).

```bash
fb() { npx --yes firebase-tools@15.32.1 "$@"; }
npm ci && npm run lint && node_modules/.bin/tsc --noEmit --incremental false

# Preview: a temporary *.web.app URL, no effect on the live site
fb hosting:channel:deploy cafe24-migration --expires 7d --no-authorized-domains --project cultureand-tech-web
scripts/check-live.sh <preview-host> 1.1

# Live: promote the tested preview (no rebuild)
fb hosting:clone cultureand-tech-web:cafe24-migration cultureand-tech-web:live --project cultureand-tech-web
scripts/check-live.sh cultureand-tech-web.web.app 1.1
scripts/check-live.sh cultureand.tech 1.1    # passes only after the DNS cutover
```

Rollback of content: Firebase console → Hosting → release history → roll back to the previous release.

## Updating the Thai app's legal pages

1. In `toss-in-app-thai-phrase`: edit `legal/publisher.json` or `legal/templates/`, run `npm run legal:draft`,
   review `build/legal-preview/thai/`, set both `publicationReview` flags, then `npm run legal:release`.
2. Here: `scripts/sync-thai-legal.sh` (refuses drafts, pending markers, scripts and foreign `<link>`s), commit
   ("Thai legal: …"), deploy.

Never edit the copied HTML by hand.

## Rules

- `public/` holds static HTML, CSS and the homepage's assets only. Never `publisher.json`, operator docs, server
  code, `.ait` bundles, service-account files or `.env` files.
- Hosting only: never enable Firestore, Functions, Auth or Analytics in `cultureand-tech-web`, and never deploy
  this site to another Firebase project.
- `Referrer-Policy: no-referrer` applies to `/culture/**` only; the homepage's YouTube embeds need a referrer.
- No HSTS until the custom domain has been Connected for a while; if it is added later, omit `includeSubDomains`.

## DNS and rollback

DNS is at Porkbun; mail is Google Workspace (MX, SPF) and does not depend on the web host. Add the custom
domain in the Firebase console with Advanced Setup (certificate before traffic); keep its ownership TXT record
permanently (certificate renewal).
Until Cafe24 is cancelled, rollback is: at Porkbun, restore the apex and `www` records exported before the cutover
(historically A `183.110.224.126`; verify against the export) and remove any records added for Firebase.

`build.sh` / `build.ps1` are legacy Softgen helpers (they rewrite `basePath` and run `npm install`); do not use them
for Firebase releases. `next.config.mjs.template` mirrors `next.config.mjs`.
