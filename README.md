# cultureand.tech

The Culture & Tech homepage (Next.js static export) and the legal pages of our apps, served together from
Firebase Hosting, project `cultureand-tech-web` (Spark plan, Hosting only). Until October 2026 the site was on
Cafe24 web hosting under `/culture` (see `.htaccess` in the git history).

## What is served from where

| URL | Source | Made by |
|---|---|---|
| `/`, `/404.html`, `/_next/…`, `/favicon.ico`, `/og-image.png` | `src/`, `public/` | `npm run build` (static export into `out/`) |
| `/culture/thai-learn/{index,terms,privacy,privacy-consent}.html`, `styles.css` | `public/culture/thai-learn/` (generated, committed) | `scripts/sync-thai-legal.sh` from `toss-in-app-thai-phrase` |
| `/culture/storage-review/privacy.html` (planned) | `public/culture/storage-review/` | from `mac-get-space` `docs/12-privacy-policy-draft.md` once approved |
| `/culture`, `/culture/`, `/culture/index.html` | `firebase.json` redirects | 301 to `/` (the old homepage address) |

The `/culture/...` legal URLs are registered in the Toss console and App Store Connect. They must keep returning
200 at exactly these paths, so `cleanUrls` stays `false` and `trailingSlash` is unset in `firebase.json`.
The generated HTML is committed so that the published text of every policy version stays in git history.

## Develop

```bash
npm install
npm run dev
```

## Deploy

Needs `firebase login` with the account that owns `cultureand-tech-web` (sochan@cultureand.tech).
Both commands first run `npm run build` and a guard over `out/culture/thai-learn/` (`predeploy` in `firebase.json`).

```bash
# Preview: a temporary *.web.app URL, no effect on cultureand.tech
firebase hosting:channel:deploy preview --expires 7d
scripts/check-live.sh <preview-host>

# Live
firebase deploy --only hosting
scripts/check-live.sh cultureand-tech-web.web.app
scripts/check-live.sh cultureand.tech 1.1    # with the expected privacy-policy version
```

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

DNS is at Porkbun; mail is Google Workspace (MX, SPF) and does not depend on the web host. The custom domain was
added in the Firebase console with Advanced Setup; keep its ownership TXT record permanently (certificate renewal).
Until Cafe24 is cancelled, rollback is: at Porkbun, set the apex and `www` A records back to `183.110.224.126` and
remove any AAAA records added for Firebase.

`build.sh` / `build.ps1` are the old Softgen helpers for uploading `out/` to another host; deployment uses the
Firebase commands above.
