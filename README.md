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
| `/culture/clean-space/privacy.html`, `styles.css` (Clean Space's privacy policy) | `public/culture/clean-space/` (generated, committed) | `scripts/sync-mac-get-space-legal.sh` from `mac-get-space` (`docs/12-privacy-policy-draft.md`); the app pages link it through `privacyPolicyPath` in `src/lib/apps.ts` |
| `/apps/clean-space/account/`, `/apps/clean-space/activate/`, `/apps/clean-space/auth/…`, each also under `/ko/` (Clean Space's former account, activation and sign-in pages) | `firebase.json` redirects | 301 to the shared portal: account and sign-in to `https://portal.cultureand.tech/[ko/]products/clean-space`, activation to `…/products/clean-space/activate` (the browser keeps the `#request=` fragment). The old page sources stay until the removal gate in `docs/portal-integration.md` passes |
| `/culture/clean-space/direct-terms.html`, `direct-refunds.html`, `direct-privacy.html` (the website edition's Terms of Service, Refund Policy and Privacy Policy, Korean authoritative with the English translation; published 2026-11-10) | `public/culture/clean-space/` once published (all three or none) | `scripts/sync-mac-get-space-legal.sh --direct` from `mac-get-space` (`docs/13-direct-sale/`, `scripts/build-direct-sale-pages.py --release`); see "Publishing Clean Space's direct-sale policies" |
| `/culture`, `/culture/`, `/culture/index.html` | `firebase.json` redirects | 301 to `/` (the old homepage address) |
| `/apps/mac-get-space/`, `/ko/apps/mac-get-space/` (with or without the slash), `/culture/mac-get-space/<file>`, `/images/apps/mac-get-space/<file>` | `firebase.json` redirects | 301 to the same address under `clean-space`: Clean Space's addresses until 2026-11-05, still used by installed builds, App Store Connect and search engines |
| `/culture/_next/static/…` | `compat/cafe24/` (committed) | `scripts/add-compat-assets.sh` (predeploy): the last Cafe24 build's hashed assets, for old tabs and cached HTML |
| `/checkout/<product>/` and `/ko/checkout/<product>/` (`chord-to-midi`, `dj-duplicate-guard`, `clean-space`), with `success/` and `fail/` under each | `src/pages/checkout/`, `src/pages/ko/checkout/`, `src/components/checkout/`, `src/lib/checkout/` | `npm run build`; see "The central checkout" below |
| `https://music.cafe24.com/…` (old address, not Firebase) | `cafe24/www/` | Uploaded by hand to the Cafe24 web root: 301 to `cultureand.tech`, checked by `scripts/check-music-cafe24.sh`; see `cafe24/README.md` |

The `/culture/...` legal URLs are registered in the Toss console and App Store Connect. They must keep returning
200 at exactly these paths, so `cleanUrls` stays `false` and `trailingSlash` is unset in `firebase.json`. The one
exception is Clean Space's old address `/culture/mac-get-space/privacy.html`: since 2026-11-05 a permanent 301 to
`/culture/clean-space/privacy.html`. Keep that redirect while any build or App Store Connect links to the old address.
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
Today they are Chord to MIDI (`chord-to-midi-web`, live at https://chord-to-midi.app/) and Clean Space
(`mac-get-space`, coming to the Mac App Store; App Store subtitle "For Music Production"). Clean Space was called Mac
Get Space until Apple's Guideline 5.2.5 rejection (renamed 2026-11-05), and Storage Review before that. The same day
its pages, images and privacy page moved to `clean-space` addresses (`/apps/clean-space/`,
`/culture/clean-space/privacy.html`), so that no address a reviewer opens carries the rejected name; `firebase.json`
301s the old `mac-get-space` ones. Its repository keeps the name `mac-get-space`. The Thai app is not introduced, and
MIDI Utility is not named while it is not public.

All of their copy, in English and Korean, is in `src/lib/apps.ts`; the cards, the app pages and the structured data
read it. Every claim must be true on the day it is published and documented in the app's own repository (the sources
are listed at the top of that file). Clean Space's English page shows its subtitle under its name (`subtitle`); the
Korean page shows none while the subtitle has no reviewed Korean translation. Clean Space's protection is described as what its default rules exclude from
removal, together with the limits the page lists, never as a guarantee; the Trash and permanent deletion are named
apart; its privacy text covers file processing only, since Apple handles the Expert purchase.

Images are in `public/images/apps/`. Chord to MIDI's icon, link preview image and screenshots come from its
repository. Clean Space's icon is the owner's updated artwork (`assets/new-app-icon-1024-updated.png` in
`mac-get-space`, 1312 × 1199), padded to a square with its own white background and framed by the app's
`scripts/make-app-icon.swift`, run with a scratch folder as its root so that the app's icon set is not touched: the
256 px image (`icon_128x128@2x.png`). Never redraw it. Its screenshots are Expert-preview captures of the Clean Space validation tour on its synthetic home
(`build/validation/cs-tour-en/` in `mac-get-space`, 2026-11-05, recorded in its docs/10), with the tour's own
"Validation mode — fixture home" label left in place. The page labels each of them "Development build · sample data"
(`note` in `src/lib/apps.ts`), its link preview images `og.png` and `og-ko.png` (cropped from the Protection &
exclusions screen of the 2026-10-23 development build, which shows no app name) carry the same label in their
language, and screenshots with a note stay out of the structured data. Replace all of them with App Store screenshots
at launch.

When an app changes:
- Clean Space on the App Store: give both languages a `cta` with the App Store link and a new `status`, set
  `schema.free` once the page says the download is free, replace the screenshots and link preview images with App
  Store ones (without a `note`), and update `public/llms.txt`.
- Clean Space's privacy policy changes: see "Updating Clean Space's privacy page" below. Its app pages link to
  it through `privacyPolicyPath` (published 2026-10-23).
- Clean Space's website edition released: `NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE=1` and the download's https address
  in `NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL` (without it, no download button) add its section to the app pages (see
  "Clean Space" under "The central checkout"); update `public/llms.txt` and the sitemap's `<lastmod>` with it.
- Chord to MIDI: mention DAW drag only once its extension is on the Chrome Web Store, and ads only once AdSense has
  approved the site.
- A new app: an entry in `APPS` and `APP_SLUGS` (`src/lib/apps.ts`) and in `APP_METADATA` (`src/lib/seo.ts`), page
  files under `src/pages/apps/` and `src/pages/ko/apps/`, then the sitemap, `public/llms.txt` and
  `scripts/check-live.sh`.

## The central checkout

Culture & Tech's products take their payments here: Toss Payments approved PayPal for this host, `cultureand.tech`,
so the merchant's own payment pages are on it. Each product has its own pages, `/checkout/<product>/` (Korean:
`/ko/checkout/<product>/`) with `success/` and `fail/`, and its own backend: the product's Firebase project takes the
payment and keeps its orders, entitlements, webhook and refunds, and its pages call no other. The pages are one
implementation (`src/components/checkout/`, `src/lib/checkout/`). A product is an entry in `PRODUCTS`
(`src/lib/checkout/products.ts`): its backend's public settings, its site and the pages the checkout may link back to,
its wording (`product-copy.ts`), the tab's storage key for its session, and whether the build opens its checkout.

| Product | Pages | Backend | Here |
| --- | --- | --- | --- |
| Chord to MIDI: Remove Ads, 364 days | `/checkout/chord-to-midi/` | Firebase project `chord-to-midi` | Open |
| DJ Duplicate Guard: Expert, a 364-day pass | `/checkout/dj-duplicate-guard/` | Firebase project `dj-duplicate-guard` (from its M4a) | Closed |
| Clean Space: 364 days Unlock | `/checkout/clean-space/` | its own Firebase project | Closed |

- **The way through.** A buyer signs in on the product's site and continues to its checkout. The product's backend
  records a checkout session for that account and sends the tab to the product's checkout page here with a one-time
  handoff code after `#`. The page's first script takes the code out of the address before anything else runs
  (`src/pages/_document.tsx`); the page binds a random key of its own to the session with it (kept in the tab's
  sessionStorage until the payment goes through), and then shows the product, the account it is for, the currency, the
  agreements and Toss's 결제위젯. Toss sends the buyer back to `success/` or
  `fail/` here; the success page has the backend approve the payment and grant the product, and links back to the
  product's site, where the account shows it. A tab that no longer holds the session keeps the payment for its buyer,
  who finishes it signed in on the product's site. No sign-in, token or payment secret is ever put in an address.
- **Each backend is the product's own.** The pages call the Cloud Functions of the product's Firebase project
  (`openCheckout`, `createCheckoutOrder`, `confirmCheckoutPayment`, `failCheckoutOrder`, `preparePaymentResume`), which
  accept browsers from `https://cultureand.tech` only, with App Check. One product's session, storage key, prices or
  answers are never used for another's. This site's project is still Hosting only (Rules, below).
- **Nothing else loads there.** `src/pages/_document.tsx` leaves the Softgen script and Google Fonts out of the
  checkout pages, and they have their own frame (`CheckoutLayout`) without the homepage's YouTube footer, so a buyer's
  details there reach only the product's backend (Google Firebase) and Toss Payments, as the product's privacy policy
  says. Keep it so: no analytics, fonts, embeds or other scripts on these pages. `firebase.json` gives them
  `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `Referrer-Policy: strict-origin` (only the origin, also to this
  site's other pages) and no stale cache; their HTML has `noindex`, and they are not in the sitemap or `llms.txt`.
- **Copies.** The seller's details in the checkout's footer (`BUSINESS` in `src/lib/checkout/config.ts`) are Culture &
  Tech's, as each product's `site.config.json` has them. The checkout's own wording (`copy.ts`) is Chord to MIDI's
  (`src/i18n/`), and each product's wording (`product-copy.ts`) is a copy of its own (Clean Space's: its direct sale's
  facts sheet). So is the contract with the functions (`contract.ts`). Change them together.

### Chord to MIDI

Chord to MIDI (https://chord-to-midi.app) sells one product, Remove Ads — 364 days: one payment that removes the ads
for 364 days from its approval, with no renewal. The product, its price, terms and refund policy, and the buyers'
accounts are Chord to MIDI's, unchanged (`chord-to-midi-web`: `site.config.json`, `content/`,
`functions/src/checkout.ts`). Its server says when its sales are open (before its launch, only on Toss's test keys;
otherwise the page says so), gives the period, which the page states in fixed words and checks (`passDays`), and the
versions of the offer and of the terms and refund policy, which the order sends back (`OfferVersions`; a page opened
before they changed is told to reload).

- **Settings.** The build needs the public web app settings of the `chord-to-midi` project, the same values as
  `chord-to-midi-web`'s `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` and
  `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`, in `.env.production.local` (git-ignored):

  ```
  NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_API_KEY=…
  NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_PROJECT_ID=chord-to-midi
  NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_APP_ID=…
  NEXT_PUBLIC_CHORD_TO_MIDI_RECAPTCHA_SITE_KEY=…
  ```

  `scripts/check-checkout-config.mjs` (the first predeploy step) refuses a deployment without them, or with a test
  build's `NEXT_PUBLIC_CHORD_TO_MIDI_EMULATORS` or `NEXT_PUBLIC_CHORD_TO_MIDI_ORIGIN`. In Google Cloud (project
  `chord-to-midi`), that reCAPTCHA Enterprise key must list `cultureand.tech` among its domains, and the API key, if it
  has website restrictions, must allow `https://cultureand.tech/*`; a preview channel's `*.web.app` host isn't listed,
  so the checkout opens only on `cultureand.tech` (the previews show its pages, not a working checkout).
- **Tests.** `chord-to-midi-web`'s cross-site journeys (`npm run test:e2e:checkout` there) build this site for its
  Firebase emulators and fake Toss, serve it as Firebase Hosting does, and buy through it from chord-to-midi.app's
  purchase page. They write that build into `out/`; the predeploy's `npm run build` replaces it.

### DJ Duplicate Guard

DJ Duplicate Guard (https://dj-duplicate-guard.app) is to sell one product, Expert: a 364-day pass, one payment, no
renewal. Its sales are closed (`dj-duplicate-guard`: `docs/decisions/DL-52-checkout-on-cultureand-tech.md`,
`docs/specs/checkout.md`), and so is its checkout, at both ends:

- **Here.** Without `NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT=on`, its pages say the checkout isn't open, link only to
  its home page, and call nothing, and the build carries none of its offer: its product entry and wording stay out of
  the bundle. `scripts/check-checkout-config.mjs` refuses a deployment that sets the switch, or its test settings
  (`NEXT_PUBLIC_DJ_DUPLICATE_GUARD_EMULATORS`, `NEXT_PUBLIC_DJ_DUPLICATE_GUARD_ORIGIN`), while
  `DJ_DUPLICATE_GUARD_SALES_OPEN` in that script is `false`, and `scripts/check-live.sh` checks that its pages are
  closed.
- **There.** Its backend refuses every order until its own sales switch (`EXPERT_SALES_ENABLED`) is on, whatever a
  page shows.

#### Opening DJ Duplicate Guard's checkout

Only when its owner opens Expert's sales, after the launch requirements in its DL-52 and `docs/specs/checkout.md`
(among them its account service and account page, its published terms, refund and privacy pages, and Toss Payments'
written confirmation for the product):

1. In Google Cloud (project `dj-duplicate-guard`), its web app's reCAPTCHA Enterprise key lists `cultureand.tech`
   among its domains, and its API key, if it has website restrictions, allows `https://cultureand.tech/*`.
2. `.env.production.local` gets the switch and that web app's public settings:

   ```
   NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT=on
   NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FIREBASE_API_KEY=…
   NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FIREBASE_PROJECT_ID=dj-duplicate-guard
   NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FIREBASE_APP_ID=…
   NEXT_PUBLIC_DJ_DUPLICATE_GUARD_RECAPTCHA_SITE_KEY=…
   ```

3. `DJ_DUPLICATE_GUARD_SALES_OPEN = true` in `scripts/check-checkout-config.mjs`, in a commit of its own: the predeploy
   check then requires those settings, and `scripts/check-live.sh` stops expecting closed pages.
4. Deploy as usual (Deploy, below).

### All-in-one — 364 Days

The fourth purchase option: one payment, every Culture & Tech service, 364 days (the owner's terms of 2026-11-09). Its
name stays in English in both languages. It is sold by the central commerce codebase (`services/commerce`, in the
portal's project `cultureand-tech-web`, `asia-northeast3`), and its customers start and finish on the portal
(`https://portal.cultureand.tech/[ko/]products/all-in-one`), which calls `beginAllInOneCheckout` and hands over to
`/checkout/all-in-one/` here. The checkout pages call the shared commerce callables (`openCheckout`,
`createCheckoutOrder`, `confirmCheckoutPayment`, `failCheckoutOrder`, `preparePaymentResume`).

**Closed.** `NEXT_PUBLIC_ALL_IN_ONE_CHECKOUT` opens it in a build, and `scripts/check-checkout-config.mjs` refuses that
switch while `ALL_IN_ONE_SALES_OPEN` is false. Closed, its pages say so and the build carries none of its offer
(`next.config.mjs` writes the switch in so the open branch is dropped). Opening it needs, in a commit of its own: the
portal's All-in-one page and published policies live, `services/commerce` deployed, and the portal project's web app
settings for cultureand.tech (`NEXT_PUBLIC_ALL_IN_ONE_FIREBASE_*`, `NEXT_PUBLIC_ALL_IN_ONE_RECAPTCHA_SITE_KEY`: an App
Check key whose domains list cultureand.tech). Its copy is `ALL_IN_ONE_COPY` in `src/lib/checkout/product-copy.ts`;
`ALL_IN_ONE_ALREADY_OWNED_CODE` in `products.ts` is `ALREADY_ACTIVE`, `services/commerce`'s same-SKU code.

### Clean Space

Clean Space (`mac-get-space`) is to sell one product with its website edition, the 364 days Unlock: ₩3,300 (VAT
included), or US$2.49 through PayPal, for 364 days from Toss's approval of the payment, ending at the same time of day;
one payment, no renewal, another only after it ends. The facts its pages state are its direct sale's (`mac-get-space`:
`docs/13-direct-sale/facts.md`, `docs/plans/364-days-option.md` §0). Its sales are closed, and so is its checkout, as
DJ Duplicate Guard's: without `NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT=on` its pages say the checkout isn't open, link only to
its home page and call nothing, and the build carries none of its offer. `scripts/check-checkout-config.mjs` refuses a
deployment that sets the switch, or its test settings, while `CLEAN_SPACE_SALES_OPEN` in that script is `false`, and
`scripts/check-live.sh` checks that its pages are closed. Its own server refuses every order until its sales are open,
whatever a page shows.

How it differs from the other products:

- **Its site is this one.** Clean Space has no site of its own: its product page, its account page
  (`/apps/clean-space/account/`, sign-in with Google, Kakao, Naver or a passwordless email link), its sign-in callback,
  its email link page (`/apps/clean-space/auth/email/`) and its app activation page
  are here (`src/components/clean-space/`, `src/lib/clean-space/`), and its checkout links back to them (its `origin` is
  `https://cultureand.tech`). Those pages call its licensing service's Firebase project through a pinned copy of its
  contract (`src/lib/clean-space/contract.generated.ts`, checked by `scripts/check-clean-space-contract.mjs`); this
  site's project stays Hosting only. They load nothing but Firebase, are out of search results, and have their own
  headers in `firebase.json` (`no-store` and a content security policy).
- **Its account page starts the checkout.** Its purchase button calls the service's `beginCheckout({ lang })`, which
  answers the checkout's address with the one-time handoff (`https://cultureand.tech[/ko]/checkout/clean-space/#handoff=…`);
  the page opens only an https address on this site's origin, Clean Space's checkout page in either language
  (`checkoutAddress`, `src/lib/clean-space/checkout-handoff.ts`). Its refusals (sales closed, no currency, an account
  being deleted or without a confirmed contact email, another checkout in progress, too many checkouts, a 364 days
  Unlock that hasn't ended: `ALREADY_OWNED_CODE` in `src/lib/clean-space/site.ts`, provisionally `ALREADY_ACTIVE`) are
  said in the page's words. A payment the checkout kept for its buyer comes back as `?resume=<id>`: the page takes it
  out of the address and finishes it with `confirmPayment({ resumeID })` once that buyer is signed in.
- **Its legal pages exist once.** Its checkout links its Terms of Service, Refund Policy and Privacy Policy at
  `/culture/clean-space/direct-terms.html`, `direct-refunds.html` and `direct-privacy.html`, one bilingual page each (a
  page path that starts with `/` is linked as it is, without `/ko`). They are drafted in `mac-get-space`
  (`docs/13-direct-sale/`) and published like its privacy page; the predeploy check requires them once its sales open.
- **Its account email is a contact email.** It receives Toss Payments' receipts, support and notices, and is never a
  way to sign in or recover the account (its "Continue with email" address is a separate sign-in method, which receives
  only sign-in links and never matches another account by address): its checkout says "Receipt and contact email" (`receiptEmail` in its wording)
  where the others say "Receipt and recovery email". Refunds are requested by email from its account page (a `mailto:`
  link with the order number), as on Chord to MIDI's.
- **Test payments.** While a currency is on Toss's test keys (before its launch, for Toss's review), its checkout says
  that payments are test payments and that an access period they give ends when sales start for real (`testKeys` in its
  wording, shown for a test client key), and so does its account page where the offer says so (`testCurrencies`).
- **Settings.** Its checkout reads its account pages' settings (`src/lib/clean-space/config-rules.ts`, checked by
  `scripts/check-clean-space-config.mjs --deploy`): `NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY`, `_PROJECT_ID`, `_APP_ID`
  and `_RECAPTCHA_SITE_KEY`, and in test builds `NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT=emulator` (its emulator suite,
  Functions on port 5101) and `NEXT_PUBLIC_CLEAN_SPACE_ORIGIN` (this site served elsewhere). The account pages also need
  `NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT=production`, `_FIREBASE_AUTH_DOMAIN`, `_KAKAO_CLIENT_ID` and `_NAVER_CLIENT_ID`
  (`docs/clean-space-direct-sale.md`). The product page's website-edition section (the download, the offer, the policies
  and a button to the account page) comes with `NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE=1` and
  `NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL`; without the switch, the build leaves it out.
- **Korean.** Its checkout wording, its account page's purchase part and its product page's section are written in
  Korean too, awaiting the owner's review (`docs/clean-space-ko-review.md`); the rest of its account, sign-in and
  activation pages is English on `/ko/` until a reviewed translation.

#### Opening Clean Space's checkout

Only when its owner opens the 364 days Unlock's sales (first on Toss Payments' test keys, for Toss's review before
its contract):

1. Its Terms of Service, Refund Policy and Privacy Policy are published at the three addresses above ("Publishing
   Clean Space's direct-sale policies", below).
2. In Google Cloud (its licensing project), its web app's reCAPTCHA Enterprise key lists `cultureand.tech` among its
   domains, its API key, if it has website restrictions, allows `https://cultureand.tech/*`, and Firebase
   Authentication's authorized domains list `cultureand.tech`.
3. `.env.production.local` gets the switch and that web app's public settings, with its account pages' settings:

   ```
   NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT=on
   NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT=production
   NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY=…
   NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN=…
   NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID=…
   NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID=…
   NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY=…
   NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID=…
   NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID=…
   ```

   and, for the download and the offer on its product page, `NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE=1` with
   `NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL=https://…`.
4. `CLEAN_SPACE_SALES_OPEN = true` in `scripts/check-checkout-config.mjs`, in a commit of its own: the predeploy check
   then requires those settings and the published policies, and `scripts/check-live.sh` stops expecting closed pages.
5. Deploy as usual (Deploy, below).

## Deploy

Releases are manual, from a clean, committed `main`, with the pinned CLI and an explicit project.
Needs `firebase login` with the account that owns `cultureand-tech-web` (sochan@cultureand.tech).
Channel deploys first check the settings of the central checkout (`scripts/check-checkout-config.mjs`), Clean Space's
pinned contract (`scripts/check-clean-space-contract.mjs`) and its account pages' settings
(`scripts/check-clean-space-config.mjs --deploy`), then run `npm run build`, add the Cafe24 compatibility assets and
check `out/culture/thai-learn/`, `out/culture/clean-space/` and `out/culture/english-thai-learn/` (`predeploy` in
`firebase.json`). `npm test` runs the unit tests (vitest) of Clean Space's pages and checkout entry and of the
predeploy checks.

```bash
fb() { npx --yes firebase-tools@15.32.1 "$@"; }
npm ci && npm run lint && node_modules/.bin/tsc --noEmit --incremental false && npm test

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

## Updating Clean Space's privacy page

1. In `mac-get-space`: edit `docs/12-privacy-policy-draft.md`, review the draft from
   `scripts/build-privacy-page.py` (`build/legal-preview/mac-get-space/`), record the owner's approvals in docs/12,
   commit, then run `scripts/build-privacy-page.py --release`. Until the release day the page has no effective date
   (`--release --without-effective-date`, the owner's choice on 2026-10-23).
2. Here: `scripts/sync-mac-get-space-legal.sh` (refuses drafts, placeholders, scripts, foreign `<link>`s and
   uncommitted sources), commit ("Clean Space legal: …"), deploy. The page is at
   `/culture/clean-space/privacy.html`; its address until 2026-11-05, `/culture/mac-get-space/privacy.html`, is a 301
   to it. The script and the app's build folders (`build/legal-upload/mac-get-space/`) keep the repository's name.

## Publishing Clean Space's direct-sale policies

The website edition's Terms of Service, Refund Policy and Privacy Policy (`direct-terms.html`, `direct-refunds.html`,
`direct-privacy.html`) share `public/culture/clean-space/` and its `styles.css` with the App Store privacy page; each
sync replaces only its own pages, and the predeploy check accepts the folder only with all three or none of them.

1. In `mac-get-space`: the owner approves each document's text by fingerprint (docs/13 "Publishing"; previews from
   `scripts/build-direct-sale-pages.py` in `build/legal-preview/clean-space-direct/`); on the publication day set the
   effective date in all six files, commit, and run `scripts/build-direct-sale-pages.py --release`.
2. Here: `scripts/sync-mac-get-space-legal.sh --direct` (refuses drafts, placeholders, scripts, other hosts' resources,
   links that are not https, mailto or these pages, and uncommitted sources), commit ("Clean Space legal: …"), deploy.
   Add the three addresses to `scripts/check-live.sh` and `public/sitemap.xml` with that deploy.

## Updating English-Thai Learn's privacy and support pages

1. In `thai-word-learn-app`: edit `docs/legal/privacy-policy-draft.md` or `docs/legal/support-page-draft.md`, review
   the drafts from `scripts/build-legal-pages.py` (`build/legal-preview/english-thai-learn/index.html`), record the
   owner's approvals in the drafts, commit, then run `scripts/build-legal-pages.py --release`. Until the app's release
   day the policy has no effective date (`--release --without-effective-date`, as for Clean Space).
2. Here: `scripts/sync-english-thai-learn-legal.sh` (refuses drafts, placeholders, scripts, foreign `<link>`s and
   uncommitted sources), commit ("English-Thai Learn legal: …"), deploy.

Never edit the copied HTML by hand.

## Rules

- `public/` holds static HTML, CSS and the homepage's assets only. Never `publisher.json`, operator docs, server
  code, `.ait` bundles, service-account files or `.env` files.
- Hosting only: never enable Firestore, Functions, Auth or Analytics in `cultureand-tech-web`, and never deploy
  this site to another Firebase project. Each product's checkout pages call that product's own project (such as
  `chord-to-midi`) from the browser, and so do Clean Space's account, sign-in callback and activation pages; nothing
  of it runs in this one.
- The checkout pages load no third-party script, font or embed beyond Toss Payments and the product's Firebase
  backend, and Clean Space's account, sign-in callback and activation pages nothing beyond its Firebase project ("The
  central checkout", above). Links into those pages are full page loads (never client-side navigation), so that nothing
  another page loaded comes along.
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
