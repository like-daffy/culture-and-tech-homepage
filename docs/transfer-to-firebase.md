# Cafe24 to Firebase Hosting migration plan

Prepared: 2026-10-22. Scope: document the remaining work to move `cultureand.tech` to Firebase Hosting. This planning task changes no application code, deployment, DNS, domain registration, email settings, or Cafe24 subscription.

**Resume the existing migration rather than starting again.** The `firebase-hosting` branch already contains a root-path static export and policy-page publishing tools, and `https://cultureand-tech-web.web.app/` already serves that export. The main checkout and custom domain still serve the older Cafe24-oriented version. Complete source integration, browser validation, domain cutover, and operational handoff while retaining `https://cultureand.tech/` as the canonical address.

## 1. Verified starting point

### Repository and existing migration

| Item | Observed on 2026-10-22 |
| --- | --- |
| Requested repository | `/Users/chanbaek/Develop-Projects/culture-and-tech-homepage` |
| Main checkout | `main` at `e76e0ae`; clean before this plan |
| Existing migration worktree | `.claude/worktrees/firebase-hosting`, branch `firebase-hosting`, HEAD `52e04a6`; clean when inspected |
| Framework | Next.js Pages Router; locked/installed Next `16.3.5`, React `18.3.1` |
| Main build | `output: "export"`, `basePath: "/culture"`, `trailingSlash: true`, unoptimized images; produces `out/` |
| Cafe24 routing in Git | `.htaccess` internally maps the domain to `/culture/`; this does not establish that the live server applies every rule |
| Firebase branch | Removes `basePath`, publishes `out/`, adds Hosting configuration and legal-page checks, removes Cafe24/Vercel deployment files |
| Existing target | `.firebaserc` on the migration branch selects `cultureand-tech-web`; its public Firebase hostname responds |
| Local checks run for this plan | Main checkout: `npm run lint` and `node_modules/.bin/tsc --noEmit --incremental false` passed on Node `v24.21.0` |
| Policy guard | Migration branch: `bash scripts/sync-thai-legal.sh --check public/culture/thai-learn` passed |
| Checks not performed | No fresh production build, browser interaction suite, authenticated Firebase inspection, or DNS-console inspection |

The existing main `out/index.html`, last modified on 2026-09-14, matches the bytes currently returned by the custom domain. It is historical build evidence, not a newly validated release artifact.

Relevant migration commits already exist locally:

| Commit | Existing work |
| --- | --- |
| `2ecb15c` | Root-path Firebase export, `firebase.json`, `.firebaserc`, legal-page copy/validation and live-check scripts |
| `d099b92` | Preserved Thai legal pages version 1.0 from Cafe24 |
| `0d90de0` | Removed `.htaccess` and `vercel.json` from the Firebase branch |
| `52e04a6` | Updated Thai privacy policy to version 1.1 describing Firebase Hosting |

Read this work through `git show firebase-hosting:<path>` or its existing worktree. Do not deploy the old main checkout, reset the migration branch, or reinitialize Hosting over its configuration. Integration into the maintained release branch is still outstanding; no merge or push was performed for this plan.

### Public HTTP evidence

| Address/check | Observed result | Meaning |
| --- | --- | --- |
| `https://cultureand.tech/`, `/culture/`, and `https://www.cultureand.tech/` | 200, same homepage HTML, assets under `/culture/_next/` | Custom hostnames still return the old build |
| `https://cultureand.tech/api/detect-location` | 200 **HTML**, identical to the homepage | This is not a working JSON geolocation API |
| `https://cultureand-tech-web.web.app/` | 200, assets under `/_next/` | Firebase already serves the root-path build |
| Firebase `/culture/` | 301 to `/` | Old homepage alias is handled |
| Firebase `/api/detect-location` | 404 | Pages API route is not deployed as a server function |
| Thai policy URLs on both hosts | All four HTML pages and `styles.css` return 200 | These shared-domain paths must survive the cutover |
| Firebase policy | Version 1.1 and expected canonical pass the existing checker | Firebase serves the newer policy copy |
| Custom-domain final-state checker | Fails `/culture/` redirect, unknown-path 404, policy 1.1/canonical, HTTP-to-HTTPS redirect, and `www` redirect | Migration cannot be called complete |

The Firebase homepage and privacy-page response bytes match the migration worktree's `out/index.html` and `public/culture/thai-learn/privacy.html`, respectively. This establishes those two file matches, not the deployed release ID or a complete site audit.

The existing `scripts/check-live.sh cultureand-tech-web.web.app 1.1` passed. The same command for `cultureand.tech` failed the final-state checks listed above. Initial sandboxed runs returned HTTP 000; only the subsequent network-enabled runs are used as service evidence.

## 2. Target architecture and scope

```text
https://cultureand.tech/
  -> Firebase Hosting, existing cultureand-tech-web site
     -> Next.js static export from out/
     -> existing app policy pages at /culture/...

https://www.cultureand.tech/<path>
  -> redirect to https://cultureand.tech/<path>

Domain registration, authoritative DNS, and mail remain separate services.
```

Use **Firebase Hosting (classic)**. This application already exports HTML, CSS, and JavaScript; there is no reason to add a Next.js server merely to change hosts. Next's static export is generated by `next build` into `out/`; API routes and runtime Next rewrites are not supplied by that artifact. See [Next.js static exports](https://nextjs.org/docs/pages/guides/static-exports).

| Decision | Plan |
| --- | --- |
| Project/site | Reuse `cultureand-tech-web` after verifying account access, actual Hosting site ID, and current release |
| Canonical hostname | Retain `cultureand.tech`; Firebase's `web.app` hostname is for verification and fallback access |
| Public directory | `out/`, including the copied policy pages; not `public/`, `.next/`, or the repository root |
| Firebase services | Hosting only; no Auth, Firestore, Functions, Storage, or Analytics is required for this transfer |
| Billing | Existing branch README reports Spark. Verify current plan and usage; do not silently upgrade |
| Releases | Local validation and explicit manual deployment, following the Chord-to-MIDI workflow |
| Registrar/DNS/email | Branch README reports Porkbun DNS and Google Workspace mail. Verify the current records; preserve those services |

The [Chord-to-MIDI deployment notes](../../chord-to-midi-web/docs/deploy.md) and [local verification decisions](../../chord-to-midi-web/docs/decisions.md) provide the process to reuse: pinned tooling, explicit project selection, and separate evidence for validation and deployment. Its current `firebase-tools` version is `15.32.1`. Its Functions, Firestore, payment configuration, and `dist/` output do not apply to this homepage. The earlier stale-staging-alias incident is a reason to keep `--project cultureand-tech-web` explicit.

Hosting quota is shared by a project's sites and retained releases. Review traffic and release storage before cutover. If a paid plan becomes necessary, record the choice and set budget alerts; alerts do not cap spending. See [Firebase Hosting usage and quotas](https://firebase.google.com/docs/hosting/usage-quotas-pricing).

## 3. Preserve URLs and shared-domain content

Moving this hostname moves every path on it, including pages absent from the old main checkout. Inventory the Cafe24 document root and registered application URLs before declaring the domain ready.

| URL | Required destination behavior |
| --- | --- |
| `/` | 200, root-path homepage with assets from `/_next/` |
| `/culture`, `/culture/`, `/culture/index.html` | Existing explicit 301 redirects to `/`; verify query and fragment behavior |
| `/_next/static/**` | Serve the new export's CSS, JavaScript, and other generated assets |
| `/culture/_next/static/**` | Handle old asset requests during the transition; see below |
| `/favicon.ico`, `/og-image.png` | Preserve exact URLs and correct file types |
| `/culture/thai-learn/` and `/culture/thai-learn/index.html` | Serve the Thai app's legal landing page |
| `/culture/thai-learn/terms.html` | Serve the approved terms page at this exact URL |
| `/culture/thai-learn/privacy.html` | Serve the selected approved privacy-policy version at this exact URL |
| `/culture/thai-learn/privacy-consent.html` | Serve the login consent page at this exact URL |
| `/culture/thai-learn/styles.css` | Serve its stylesheet as CSS |
| Any additional policy, support, verification, or download URL found in the inventory | Preserve the file or define a deliberate path-specific migration |
| An unknown URL | Return a real 404, not homepage HTML with 200 |

Keep Firebase `cleanUrls: false` and its `trailingSlash` option unset, as on the migration branch. This preserves `.html` policy URLs while allowing directory indexes. Keep only the three explicit homepage redirects. **Do not add a `/culture/**` redirect or a catch-all homepage rewrite**: the policy pages live below that prefix, and Firebase redirects precede static files. See [Hosting response precedence and URL configuration](https://firebase.google.com/docs/hosting/full-config).

Old browser tabs and cached Cafe24 HTML reference `/culture/_next/`. Before cutover, inventory those references against the actual old export. Preserve the necessary old hashed assets for an overlap period through a deterministic release-assembly step, or prove an equivalent mapping serves every referenced file. A blind prefix redirect is insufficient if a new build no longer includes an old chunk. Include compatibility assets after each build and before upload; the existing predeploy build can erase manual changes to `out/`. Keep them until old HTML/DNS caches have aged out and observations show no failures.

The existing legal-page source is [Toss app publishing documentation](../../toss-in-app-thai-phrase/docs/LEGAL_RELEASE.md). Keep its ownership workflow: reviewed source export -> `scripts/sync-thai-legal.sh` -> committed copies under `public/culture/thai-learn/` -> Next export. Its normal sync mode writes files; use `--check` for validation only. Do not hand-edit copied policy HTML or copy operator documents, credentials, app bundles, or release manifests into the hosted directory.

The branch README mentions `/culture/storage-review/privacy.html` as **planned**. That is not proof the page is approved, generated, or live. Recheck this and any Thai-learning App Store URLs against their actual source and registered settings; do not publish drafts just to fill a route. Coordinate the policy version with the actual hosting change instead of assuming a documentation statement means the custom domain has moved.

## 4. Code and configuration work still needed

| Area | Existing implementation | Remaining action |
| --- | --- | --- |
| Source integration | Four migration commits on `firebase-hosting` | Review and integrate into the intended maintained branch, preserving concurrent work and this plan |
| Root export | `/culture` basePath already removed on that branch | Rebuild from the selected commit; verify generated links and CSS/JS URLs |
| Template drift | Actual config uses Next 16 `turbopack`; template still uses `experimental.turbo` | Align or retire the template so it cannot recreate obsolete config |
| Old build helpers | `build.sh` and `build.ps1` prompt for basePath and run `npm install` | Document them as legacy or replace with deterministic Firebase instructions; do not run them for this release |
| Hosting config | `public: "out"`, explicit homepage redirects, build/policy predeploy hooks | Preserve this base; review cache behavior and include the compatibility asset assembly if needed |
| Language detection | Calls `/api/detect-location` only when storage/browser language cannot decide | Remove the nonfunctional IP fallback and keep stored preference -> supported browser language -> English, unless server geolocation is explicitly required |
| API files | `src/pages/api/hello.ts` and `detect-location.ts` remain in source | Remove unused endpoints with the fallback cleanup, or document them as unavailable; static Hosting will not execute them |
| SEO | Canonical and OG URLs already use `https://cultureand.tech` | Keep the production origin; inventory and retain existing robots/sitemap/verification files, adding suitable static ones if absent |
| Documentation | Migration README describes Firebase as already serving the custom domain | Correct status using current evidence; separate Firebase live readiness from DNS/certificate completion |

The language change should retain the `user-language` key, cookie path, EN/KO switch, and hydration behavior. Add focused checks for saved-language priority, Korean/English browser preferences, unsupported-language fallback, blocked storage, and manual switching if this code is changed. There is no test script in the current package manifest; do not report a nonexistent unit suite as passing.

If IP-based language selection is genuinely required, treat it as a separate architecture decision involving a real endpoint and its hosting/cost/privacy requirements. Merely uploading the Pages API files will not provide that feature. The current custom-domain endpoint already returns HTML rather than JSON.

Next's basePath is embedded at build time, so changing server redirects alone cannot convert an old export to root-path assets. See [Next.js basePath](https://nextjs.org/docs/pages/api-reference/config/next-config-js/basePath).

Preserve homepage embeds and styling during the transfer: YouTube, SoundCloud, Google Fonts, and the existing Softgen script are external dependencies. Keep `Referrer-Policy: no-referrer` limited to policy paths as the branch does; do not apply it to the homepage's YouTube embeds. Avoid adding a restrictive CSP as an incidental hosting change. Review third-party behavior separately from the claim that the homepage needs no backend.

Suggested caching: revalidate homepage/404 HTML, keep the selected short policy-page cache policy, and use immutable caching only for proven content-hashed Next assets. Verify actual response headers rather than assuming branch settings are already deployed. Keep `next.config.mjs` tracked: despite its `.gitignore` entry, it is currently a tracked file.

## 5. Execution sequence

These are future implementation steps. This planning task ran read-only inspection, lint, type checking, policy validation, and HTTP checks; it did not build, merge, deploy, or alter DNS.

### Phase A — capture ownership and rollback evidence

1. Recheck both worktrees and commits. Identify the maintained release branch and the person/process currently using the migration worktree before integrating changes.
2. Inspect the existing Firebase project/site, current live release/version, configured custom domains, certificate state, and billing plan. Reuse the existing site; do not create another project or deploy to Chord-to-MIDI or Live-Idol.
3. Back up Cafe24's complete published document root, including manually uploaded policy pages, assets, verification files, and applicable `.htaccess`. Inventory any PHP, forms, databases, scheduled jobs, or mail dependencies outside this Git repository. Resolve any such dependency before moving its hostname.
4. Export the authoritative DNS zone and record TTLs and the exact current apex/`www` web records. Preserve NS, MX, SPF, DKIM, DMARC, unrelated TXT verification records, and other subdomains. Do not reuse the historical rollback IP in the branch README without checking it.
5. Record the current policy versions and all application-console URLs. Keep a recoverable Cafe24 copy and a known-good Firebase release.

Read-only Firebase inventory commands, using the same pinned CLI as Chord-to-MIDI:

```sh
npx --yes firebase-tools@15.32.1 --version
npx --yes firebase-tools@15.32.1 login:list
npx --yes firebase-tools@15.32.1 projects:list
npx --yes firebase-tools@15.32.1 hosting:sites:list --project cultureand-tech-web
npx --yes firebase-tools@15.32.1 hosting:channel:list --project cultureand-tech-web
```

The account and console inventory were not performed in this planning task. Authenticate only if needed. Record the actual site ID and release details without putting credentials into documentation.

**Exit:** existing project/site identified, complete URL inventory, backups, current DNS records, and recovery steps recorded.

### Phase B — integrate and create a reproducible release

Review the migration commits and outstanding items in section 4, then integrate them into the selected release branch. The following example assumes that integration has reached the main repository path. Do not run a deployment from `main@e76e0ae`, which lacks the Firebase configuration.

```sh
cd /Users/chanbaek/Develop-Projects/culture-and-tech-homepage
git status --short
git log -5 --oneline
test -f firebase.json
test -f scripts/sync-thai-legal.sh
node --version
npm ci
npm run lint
node_modules/.bin/tsc --noEmit --incremental false
bash scripts/sync-thai-legal.sh --check public/culture/thai-learn
npm run build
bash scripts/sync-thai-legal.sh --check out/culture/thai-learn
git diff --check
```

Use the lockfile and a supported Node version; Next `16.3.5` declares Node `>=20.9.0`. The existing Next ESLint configuration is `15.3.2`; lint passed here, so do not change dependency majors merely to migrate hosts. Resolve any fresh-build incompatibility explicitly.

Inspect the generated homepage, 404, policy files, CSS/JS, and asset paths. Confirm `out/` contains only intended public content and that `/culture` remains only where required for legal/compatibility paths. Keep the artifact fingerprint and source commit. Use a static server or the Hosting emulator for validation; `next dev`, PM2's development config, and `next start` do not establish that the exported artifact works.

**Exit:** a fresh export, policy checks, and local page/asset checks pass for the actual release source.

### Phase C — validate a Firebase preview

```sh
npx --yes firebase-tools@15.32.1 hosting:channel:deploy cafe24-migration \
  --expires 7d --no-authorized-domains --project cultureand-tech-web
```

The existing `predeploy` hooks rebuild the export and check its legal pages. Validate the **uploaded preview**, not merely the earlier local build. Record the returned hostname and version, run the checker with that hostname, and complete the browser matrix in section 6. Replace this example hostname before running:

```sh
bash scripts/check-live.sh REPLACE_WITH_PREVIEW_HOST 1.1
```

Use the expected reviewed policy version if it has changed. Do not modify the live site's release until the preview is accepted. Keep canonical metadata on `cultureand.tech`; never put the preview address into application registrations. Do not carry temporary `noindex` settings into production.

**Exit:** actual preview HTTP and browser checks pass, including every required policy route and old asset compatibility.

### Phase D — prepare certificates and move traffic

1. Inspect the existing custom-domain registration before adding another. Use Firebase Hosting's **Advanced Setup** for a hostname currently serving Cafe24 traffic, preparing ownership and TLS before switching traffic. Follow only the records and challenge steps currently displayed by Firebase. See [Firebase custom-domain setup](https://firebase.google.com/docs/hosting/custom-domain).
2. Prepare both `cultureand.tech` and `www.cultureand.tech`; use the latter as a path-preserving redirect to the apex. Validate certificate readiness for both.
3. Arrange a short release freeze. Publish the approved version to the existing Firebase live site and validate its `web.app` address before changing DNS.
4. Update only the relevant apex/`www` web records at the verified DNS provider. Reconcile conflicting A/AAAA/CNAME entries as Firebase directs, preserving mail, ownership verification, and all unrelated records. Keep the registrar and nameservers unchanged for this migration.
5. Verify DNS propagation, valid certificates, and the complete custom-domain acceptance matrix. Retain Cafe24 throughout the propagation/observation period.

To promote the exact tested preview, use the verified site ID in both positions:

```sh
CULTURE_SITE_ID='cultureand-tech-web'
npx --yes firebase-tools@15.32.1 hosting:clone \
  "$CULTURE_SITE_ID:cafe24-migration" "$CULTURE_SITE_ID:live" \
  --project cultureand-tech-web
```

Verify the source channel still contains the accepted version. Cloning addresses sites explicitly, so checking the two site IDs matters even with `--project`. It publishes the tested version rather than running the local predeploy rebuild. See [Firebase channel promotion](https://firebase.google.com/docs/hosting/manage-hosting-resources).

After the approved live release and again after DNS cutover:

```sh
bash scripts/check-live.sh cultureand-tech-web.web.app 1.1
bash scripts/check-live.sh cultureand.tech 1.1
```

If the target release is already the approved version, record it and proceed without an unnecessary redeployment. Record the live release ID separately from DNS/certificate and browser results.

**Exit:** both custom hostnames reach the intended Firebase site over HTTPS and pass all relevant checks.

### Phase E — SEO, monitoring, and handoff

Keep the homepage canonical, OG URL/image, support links, and policy URLs on `cultureand.tech`. This is a hosting change with the primary URLs retained, so it does not require a domain Change of Address request. Preserve Search Console verification and inspect indexing/404s; the explicit `/culture` aliases are the limited URL redirects to test. Lower DNS TTL in advance where practical and observe both hosts during propagation. See [Google's hosting-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes).

Check immediately after cutover, the next day, and after a week. Record HTTP failures, missing chunks, embed playback, policy availability, DNS/TLS, Hosting usage, and mail routing. Do not send test messages through the user's accounts without an instruction to do so; DNS checks alone do not prove mail delivery.

Update the maintained README with the real release branch, pinned CLI, validation commands, manual deploy command, legal-page source, rollback procedure, and actual custom-domain status. Keep pushes and deployments separate. Cancel only the Cafe24 web-hosting product after the observation period and a separate owner decision; DNS, domain registration, mail, backups, or unrelated sites may be attached to other services.

## 6. Acceptance matrix

| Area | Required result |
| --- | --- |
| Build provenance | Fresh root-path static export from the recorded commit; deployed version identified |
| Homepage/assets | 200 HTML, all CSS/JS/fonts load, favicon and OG image have correct content types, no broken `/culture/_next/` requests |
| Old URLs | Explicit homepage aliases redirect to `/`; policy URLs remain exact 200s; no broad prefix redirect, loops, or lost fragments/query parameters |
| Unknown paths | Real 404, including unknown files under `/culture/`; no homepage HTML posing as a successful API response |
| Language | EN/KO switch, saved preference, browser detection, fallback, blocked storage, and hydration work; no dangling geolocation fetch after cleanup |
| Layout/navigation | Phone/tablet/desktop checks, section anchors, overlays, keyboard navigation, and existing theme behavior match baseline |
| Media/external links | YouTube hero/works/footer and SoundCloud embeds load and can be interacted with; contact and service links still work |
| Policy publishing | Four HTML pages and stylesheet pass the guard; approved version, dates, canonical, and relative CSS links match the intended release |
| Other shared-domain content | Every discovered app policy/support/download/verification path has an explicit preservation result |
| Custom domain/TLS | Apex HTTPS works; HTTP upgrades; `www` preserves paths while redirecting; certificates cover both hostnames |
| DNS/email | Intended web records changed; nameservers, MX, SPF, DKIM, DMARC, ownership records, and unrelated subdomains preserved |
| SEO/cache | Production canonical retained; no preview URL or accidental `noindex`; suitable cache headers and valid sitemap/verification where applicable |
| Recovery | Cafe24 content backup, current DNS rollback values, retained Firebase version, and old asset overlap plan documented |

`scripts/check-live.sh` covers a useful HTTP subset. It does not prove JavaScript execution, content completeness on every page, media playback, browser storage, or mail delivery. A status-200 result alone is insufficient, as the current custom-domain API and unknown paths demonstrate.

## 7. Rollback and completion record

| Failure | Recovery |
| --- | --- |
| Build or preview fails | Keep the custom domain on its current service; fix and revalidate the candidate |
| New Firebase content regresses | Restore a retained known-good Hosting release and repeat HTTP/browser checks |
| DNS/TLS cutover fails | Restore the recorded previous web records and keep Cafe24 available; allow for DNS caches |
| Missing shared-domain page | Restore the approved file through the release process, or roll back the domain if essential routes cannot be recovered promptly |
| Policy version differs between hosts | Coordinate the approved policy and actual provider state; do not silently replace legal text or treat an older release as universally correct |
| Old cached page cannot load chunks | Serve the retained old hashed assets during overlap and verify from a browser with the old HTML |

Firebase rollback restores hosted content/configuration; it does not restore DNS, email records, or the source repository. Cafe24 rollback likewise depends on the verified backup and current DNS records, not a remembered IP. Do not create a redirect from the canonical domain to itself or bounce it between providers. Firebase release restoration is documented in [Hosting rollback management](https://firebase.google.com/docs/hosting/manage-hosting-resources#rollback).

| Milestone | Status at plan creation |
| --- | --- |
| Main and migration branch inspected | Complete: `e76e0ae` / `52e04a6` |
| Local lint/type checks | Passed on main; repeat on the integrated release source |
| Legal-page validation | Passed on migration branch's committed public files |
| Existing Firebase HTTP checks | Passed at `cultureand-tech-web.web.app`, policy 1.1 |
| Deployed file comparison | Homepage and privacy file match the migration worktree artifacts |
| Integration into maintained branch | Pending |
| Complete Cafe24 content/DNS/rollback inventory | Pending |
| Authenticated Firebase site/release/domain/billing inspection | Pending |
| API fallback cleanup / template alignment / asset overlap | Pending review and implementation |
| Fresh release build and browser validation | Pending |
| Custom-domain final-state checks | Not passing; differences recorded in section 1 |
| DNS/certificate cutover and post-cutover checks | Pending verification/completion |
| Observation, documentation handoff, Cafe24 retirement decision | Pending |

Report source integration, local build, Firebase publication, DNS/certificate completion, custom-domain behavior, and Cafe24 retirement separately. The migration is complete when the retained custom URLs serve the intended Firebase release, the shared policy pages and mail configuration are preserved, and release/rollback ownership is documented.

## 8. Implementation log — 2026-10-22

| Step | Result |
| --- | --- |
| Source integration | `firebase-hosting` (`52e04a6`) fast-forwarded into `main`; no divergent commits. Pushed to `origin/main` |
| Language fallback | `/api/detect-location` fallback and both Pages API routes removed; detection is stored preference -> browser languages -> English, `user-language` key and cookie kept |
| Template drift | `next.config.mjs.template` now mirrors `next.config.mjs` (Next 16 `turbopack`, no `basePath`) |
| Old asset overlap | The 26 hashed `/culture/_next/static/` files of the Cafe24 build (byte-identical to what `cultureand.tech` serves) are committed under `compat/cafe24/`; `scripts/add-compat-assets.sh` adds them to `out/` in `predeploy`, after the build |
| Cache headers | `/` and `*.html` revalidate; `/_next/static/**` and `/culture/_next/static/**` immutable; policy HTML keeps 600 s; `Referrer-Policy` stays on `/culture/**` |
| Local checks | `npm ci`, lint, `tsc --noEmit`, policy guard on `public/` and `out/`, `npm run build`, `git diff --check`: pass (Node `v24.21.0`) |
| Language scenarios | Scratch script against `src/lib/language-detection.ts`: saved/cookie priority, ko/en browser, second-choice language, unsupported fallback, invalid saved value, blocked storage: 10/10 pass. No test script exists in `package.json` |
| Preview | Channel `cafe24-migration`, `https://cultureand-tech-web--cafe24-migration-pm9n72xd.web.app`, expires 2026-10-29, built from `cec702e`, Next build ID `Ll1tzcfuYJBtcM5Ft2I35` |
| Preview HTTP | `scripts/check-live.sh <preview> 1.1` passes; every `/_next/` and `/culture/_next/` asset referenced by the new and the Cafe24 HTML is 200 with CSS/JS types; `/culture`, `/culture/index.html` 301 to `/` with query kept; `/api/detect-location` 404; favicon/OG image types correct; no `noindex` |
| Browser (Hosting emulator on the same `out/`) | Homepage renders, all assets 200, no console errors or `/api/` requests; saved `ko` beats `en-US` browser; EN/KO switch persists across reloads; the Cafe24 HTML loads all 15 of its `/culture/_next/` assets and hydrates; policy page 1.1 with canonical and own CSS; unknown path shows the 404 page. Phone/tablet widths and embed playback not checked |
| Browser (preview host) | Not done: Chrome showed a page titled "Safety warning" for both `web.app` hosts (also the unchanged live one), so the extension could not attach. Google Safe Browsing's transparency report shows no unsafe content for either host |
| Live release | Accepted by the owner after checking the emulator build. 2026-10-22 00:59: `cafe24-migration` cloned to `live` (no rebuild); live `index.html` identical to the tested preview, build ID `Ll1tzcfuYJBtcM5Ft2I35`; `check-live.sh cultureand-tech-web.web.app 1.1` passes. Content rollback target: the previous live release (00:05) in the console's release history |

Public DNS before the cutover (authoritative Porkbun answer), kept for rollback reference. No full zone export was made; the cutover changed only the two A records:

| Record | Value |
| --- | --- |
| `cultureand.tech` A | `183.110.224.126`, TTL 600; no AAAA/CNAME |
| `www.cultureand.tech` A | `183.110.224.126`, TTL 600; no AAAA/CNAME |
| NS | `curitiba`, `fortaleza`, `maceio`, `salvador` `.ns.porkbun.com` |
| MX | Google Workspace (`aspmx.l.google.com` and alternates, `smtp.google.com`) |
| TXT (apex) | SPF `include:_spf.google.com`, an OpenAI domain verification; no Firebase `hosting-site` ownership record |
| `_dmarc` | `p=quarantine` |
| `_acme-challenge` (apex, `www`) | none, so certificates for the custom domain are not prepared yet |

No CAA, wildcard, or DNSSEC (DS) records were found, so nothing blocks certificate issuance.

### Cutover — 2026-10-22

Done by the owner in the Firebase console and at Porkbun (Advanced Setup, certificates before traffic), then verified from this repository.

| Step | Result |
| --- | --- |
| Ownership/certificate records | TXT `hosting-site=cultureand-tech-web` on the apex and `www`; TXT `_acme-challenge` and `_acme-challenge.www` |
| Web records | Apex and `www` A records edited in place from `183.110.224.126` to `199.36.158.100`; no AAAA or CNAME; all four Porkbun nameservers agree |
| Firebase | Both hostnames Connected; `www` redirects to the apex |
| Certificates | Google Trust Services (WR3), one per hostname, valid until 2027-01-19 |
| `check-live.sh cultureand.tech 1.1` | Passes, including the HTTP->HTTPS and `www` redirects |
| Custom-domain content | `index.html` identical to the released build; the `www` redirect keeps path and query; Cafe24 `/culture/_next/` assets 200; `/api/detect-location` 404; favicon and OG image types correct |
| Headers | Repository cache, `nosniff` and policy `Referrer-Policy` headers apply; Firebase adds `Strict-Transport-Security: max-age=31556926` (no `includeSubDomains`) on the apex |
| Mail and other records | MX, SPF, DMARC, the OpenAI TXT, the Comodo CNAME and the nameservers unchanged |
| Rollback | Edit both A records back to `183.110.224.126`. Cafe24 still serves the old site over HTTPS with a Sectigo certificate for both hostnames valid until 2027-04-05, which the HSTS header makes necessary |

Cafe24 backup: skipped (owner decision, 2026-10-22: Cafe24 holds no data that needs keeping). Rollback to Cafe24 relies on that hosting staying active; once it is cancelled, that rollback is no longer available.

Remaining: observe the next day and after a week (HTTP failures, old chunks, embeds, policy pages, Search Console, Hosting usage); then decide whether to retire Cafe24 web hosting.
