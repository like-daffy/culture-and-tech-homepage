# Clean Space's direct sale: account, sign-in and activation pages, and its checkout

Status (2026-11-09): **implemented locally, not deployed, sales closed.** The pages are built into the static export,
but say that accounts and purchases are not available until the build is configured, and Clean Space's checkout says
it isn't open until its owner opens the sales (README, "The central checkout" → "Clean Space"). Nothing here was
deployed, no Firebase or Toss console was changed, and no payment was made. The plan is mac-get-space's
`docs/plans/364-days-option.md` (§0 for the change of 2026-11-09: Toss reviews Clean Space on test keys before its
contract, and the checkout is Culture & Tech's shared one); the facts the pages state are its
`docs/13-direct-sale/facts.md`. The Clean Space licensing service is in mac-get-space `services/licensing/` (its own
Firebase project, never this site's Hosting-only project).

The first version of these pages (commit `b79c77c`, 2026-11-07) had a checkout of its own. Since 2026-11-09 Clean Space
is a product of the central checkout instead (`src/lib/checkout/products.ts`, `src/components/checkout/`): its own
checkout page, result pages, order logic, Toss loader and country list were removed, and its account page hands the
buyer over to the central checkout.

## Routes

| Page | English / Korean | What it does |
|---|---|---|
| Product page | `/apps/clean-space/`, `/ko/apps/clean-space/` | The app; with the release switch, also the website edition: its download, the 364 days Unlock (price, access period, no renewal, refund), the basic features and what the Unlock adds, the policies, and a button to the account page (`src/lib/clean-space/channel-copy.ts`) |
| Account | `/apps/clean-space/account/` (+ `/ko/`) | Sign-in, the access period, the purchase (hands over to the checkout), purchases and refund requests (email), sign-in methods (link, remove), contact email, Macs signed in, sign-out, deletion; finishes a payment the checkout kept (`?resume=`) |
| Sign-in callback | `/apps/clean-space/auth/callback/` (+ `/ko/`) | Kakao and Naver return here; the code is exchanged once and the browser goes on to an allow-listed page |
| Activation | `/apps/clean-space/activate/` (+ `/ko/`) | Approves Clean Space on a Mac: shows the request's code, approves only on an explicit click |
| Checkout | `/checkout/clean-space/` (`success/`, `fail/`) (+ `/ko/`) | The central checkout's pages for Clean Space (README, "The central checkout") |

Every path is the contract's `PAGE_PATH` (one source; `src/lib/clean-space/site.ts` repeats the account and product
paths for the checkout's entry, and a test keeps them equal), with its trailing slash, in English and under `/ko/`.
The pages are client-rendered inside the static export (no API routes); they call the Clean Space service's Firebase
callables. `src/pages/…` holds only thin page files; the components are in `src/components/clean-space/` and the
logic (tested without a browser) in `src/lib/clean-space/`.

## The contract

`src/lib/clean-space/contract.generated.ts` is a pinned copy of the Clean Space licensing contract (version 1, SHA-256
in its header), written by mac-get-space's `services/licensing/contract/scripts/export.mjs`. It is committed here and
never imported from another checkout. `scripts/check-clean-space-contract.mjs` (predeploy, and `npm test`) recomputes
the body's SHA-256 and fails on any edit. To take a new contract version: in mac-get-space,
`node services/licensing/contract/scripts/export.mjs <this repo>/src/lib/clean-space/contract.generated.ts`, then adapt
the pages, test and commit both.

The pinned copy is still the one of 2026-11-07 (sha256 `052af3e0…`). The contract's source has since gained the shared
checkout (mac-get-space commit `5b1ccfe`, sha256 `b80bcedc…`: `beginCheckout`, `CHECKOUT_CALLABLE`, `CHECKOUT_ERROR`,
the removal of the browser `createOrder`, `failOrder`, `preparePaymentResume` and `requestRefund`). Exporting it here
works, but the copy then fails `tsc` in this repository, which compiles without `strictNullChecks`: four early returns
in its new parsers (`parseCreateCheckoutOrder`, `parseConfirmCheckoutPayment` twice, `parseFailCheckoutOrder`) are
written `if (!credential.ok) return credential;`, which TypeScript narrows only with `strictNullChecks`. Written
`if (credential.ok === false) return credential;` they compile in both settings (checked with this repository's
`tsc`). Until the source is changed so, and exported again, these pages keep, in one place each, what they need of it
(`src/lib/clean-space/checkout-handoff.ts`, `site.ts`), with the source's exact names and shapes: the `beginCheckout`
callable (`{ lang }` → `{ checkoutUrl, openBefore }`), the codes it refuses with that the pinned copy doesn't list
(`EMAIL_NOT_CONFIRMED`, `ACCOUNT_UNAVAILABLE`), and the code for an access period in force (`ALREADY_OWNED_CODE`,
`ALREADY_ACTIVE`, the source's `CHECKOUT_ERROR.alreadyOwned`); a test compares them with the copy once it has them.
Neither the copy nor the source marks a currency the offer sells on Toss's test keys (the account page would read
`test: true` on a price). The checkout's callables (`openCheckout`, `createCheckoutOrder`, `confirmCheckoutPayment`,
`failCheckoutOrder`, `preparePaymentResume`) are the central checkout's contract (`src/lib/checkout/contract.ts`), which
the service implements. The pages no longer call the browser `createOrder`, `failOrder`, `preparePaymentResume` or
`requestRefund`.

## Build settings (no values here)

All are public values (`NEXT_PUBLIC_…`, inlined into the pages). Never put a secret in one. The account pages read them
only in `src/lib/clean-space/config.ts`, with the rules of `config-rules.ts`, shared with
`scripts/check-clean-space-config.mjs` (which needs Node 22.18+ or 23.6+: it imports the TypeScript rules directly).
The central checkout's entry for Clean Space (`src/lib/checkout/products.ts`) reads the same Firebase settings, the
checkout switch and the test settings. Set them for a release in `.env.production.local` (git-ignored).

| Setting | Meaning | Production |
|---|---|---|
| `NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT` | `emulator`, `staging` or `production`; empty = not configured. `emulator` is also the checkout's emulator switch | `production` |
| `NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_APP_ID` | The Clean Space project's web app (named app `clean-space` in the pages; the checkout uses the API key, project and app ids) | required; not a `demo-` project |
| `NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY` | App Check (reCAPTCHA Enterprise) key; its domains must list `cultureand.tech` | required |
| `NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID` | Kakao REST API key (public client id) | required |
| `NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID` | Naver client id | required |
| `NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT` | `on` opens Clean Space's checkout and the account page's purchase (also needs the service's sales open) | refused until `CLEAN_SPACE_SALES_OPEN` in `scripts/check-checkout-config.mjs` is `true` |
| `NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE` | `1` adds the website edition's section to the product page | off until the website edition is released |
| `NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL` | The website download's https address (the product page's download button) | with the release switch; no button without it |
| `NEXT_PUBLIC_CLEAN_SPACE_ORIGIN` | Test builds only: this site served elsewhere (the checkout's links back, the account page's allowed checkout origin) | must be empty (or `https://cultureand.tech`) |
| `NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST`, `_PROVIDER_EMULATOR_URL` | Emulator builds only (Firebase emulators; fake OAuth providers) | must be empty |

The region is the contract's (`asia-northeast3`) for both the account pages and the checkout; b79c77c's
`NEXT_PUBLIC_CLEAN_SPACE_FUNCTIONS_REGION`, `_SALES_ENABLED` and `_POLICIES_PUBLISHED` are gone (the checkout switch
replaces the sales switch, and the predeploy check requires the published policies when the sales open).
`node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-clean-space-config.mjs --deploy` (predeploy) passes
only an unconfigured build or a complete production one: it refuses emulator and staging builds, `demo-` projects,
emulator settings, a download address that isn't https, and a missing setting (named, never its value).
`scripts/check-checkout-config.mjs` refuses the checkout switch while the sales are closed, and the emulator switch or
another origin in any deployment. Toss client keys are not settings here: the service gives each currency's client key
and widget variant with the checkout session.

## Sensitive routes

The account, sign-in callback and activation pages (`src/lib/clean-space/sensitive-routes.ts`, which also covers every
`/checkout/` page):
- `<meta name="robots" content="noindex, nofollow">`, a minimal layout (no site navigation, no footer video, no other
  embed), the policy links and the seller's details in the footer (the checkout's `BUSINESS`, with its reviewed labels).
- `src/pages/_document.tsx` leaves out the Google Fonts stylesheet and the Softgen monitoring script there (and gives
  only the checkout pages the early script that takes the handoff out of the address).
- `firebase.json` headers (EN and KO): `Cache-Control: no-store`, `Referrer-Policy: strict-origin`,
  `X-Frame-Options: DENY`, `X-Robots-Tag: noindex, nofollow`, `Permissions-Policy` without camera, microphone,
  location or USB, and a `Content-Security-Policy` allowing only the site itself, Firebase Auth, Functions and App Check
  (`*.googleapis.com`, `*.cloudfunctions.net`, `apis.google.com`, the auth domain's frames on
  `*.firebaseapp.com`/`*.web.app`) and reCAPTCHA, with `frame-ancestors 'none'`. These pages take no payment, so the
  Toss Payments and PayPal sources of b79c77c's policy are gone. The checkout pages have the central checkout's headers.
  Verify on a preview channel before release with `scripts/check-live.sh <preview-host>`.
- The callback and account pages read their query once and replace the address (and Next.js's copy of it) with the
  bare path, after Next.js's router is ready (it writes back the address it started with after hydrating a page opened
  with a query); the activation page does the same with its `#request=…` fragment. Links into these pages, and out of
  them, are full page loads.

## Sign-in

- Google: Firebase Auth popup on the named app (redirect if the popup is blocked). Kakao and Naver: full redirect to
  the provider with a random, single-use state kept in this tab with the provider, the exact redirect URI, the intent
  (sign in, link, prove again), the account a link or reauthentication is for, and an allow-listed return page. The
  callback checks the state once, exchanges the code once (StrictMode and reloads can't repeat it) through
  `signInWithProvider`, and signs in with the service's custom token.
- Register exactly these redirect URIs at Kakao and Naver (production): `https://cultureand.tech/apps/clean-space/auth/callback/`
  and `https://cultureand.tech/ko/apps/clean-space/auth/callback/`.
- In the Clean Space Firebase project: add `cultureand.tech` to Authentication's authorized domains; the web app's
  auth domain stays the project's own (`<project>.firebaseapp.com`).
- Linking Google (account page): `linkWithPopup` on the signed-in account (Firebase itself refuses a Google account that
  belongs to another account), then `linkProvider({ provider: "google", googleIdToken })` so the service verifies and
  records it; if the service refuses, the page unlinks Google again. Removing Google: the service first, then this
  browser's copy. Kakao and Naver are linked through the callback with intent `link`.
- Changing sign-in methods and deleting the account need a sign-in within 5 minutes (checked here and by the
  service); the page offers "Sign in again" with a method the account still has.

## Purchase

The account page shows the 364 days Unlock's access period (start and end to the second, with the time zone), or none,
and, while none is in force and this build opens the checkout (`NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT=on`), the offer as the
service states it (`getOffer`): what it unlocks, the price (won with "VAT included"; dollars with PayPal on English
pages only, since Korean pages sell in won), the access period, no renewal and the 7-day refund, in the checkout's
words. A test-payment notice shows while a currency is on Toss's test keys: always in a test build, whose service has
only test keys, and in production where the offer marks a currency `test: true`. The purchase needs a confirmed contact
email (a 6-digit code, never a sign-in method).

The purchase button calls `beginCheckout({ lang })`. The page opens the address it gets only when it is https on this
site's origin (a test build's configured origin), Clean Space's checkout page in either language, with a handoff after
`#` and nothing else (`checkoutAddress`). Each refusal has its own words: sales closed, currency unavailable, account
being deleted or unavailable, contact email not confirmed (`EMAIL_NOT_CONFIRMED` or v1's `CONTACT_NOT_VERIFIED`),
another checkout in progress, too many checkouts, signed out, and an access period in force (`ALREADY_OWNED_CODE`);
anything else shows the service's message.

The central checkout takes it from there. Its success page confirms the payment with the service; a tab that no longer
holds the checkout keeps the payment for its buyer (`preparePaymentResume`) and links to the account page with
`?resume=<id>`. The account page takes the id (43 base64url characters, nothing else) out of the address, keeps it in
this tab across a Kakao or Naver sign-in (at most an hour; the service decides when it expires), and finishes it with
`confirmPayment({ resumeID })` once its buyer is signed in, at most once per sign-in. A payment still being recorded,
another account signed in (it waits for the buyer's), an expired handle, an access period already in force and a
deleted account each have their own words; nothing suggests paying again.

Refund requests are emails to `contact@cultureand.tech` from the purchases list (a `mailto:` link with the subject
"Refund request: {orderId}" / "환불 요청: {orderId}" and the order number and contact email in the body), as on Chord to
MIDI's account page; support answers and the operator refunds through Toss Payments.

## Activation

The app opens `/apps/clean-space/activate/#request=<id>`. The page keeps the id in this tab only, asks for a sign-in,
shows the request's confirmation code, the app version, its expiry and the signed-in account with a warning to approve
only if the Mac shows the same code now, and approves only on Approve (sending the code it displayed). Deny, expiry and
an already used request have their own states. Opening the page approves nothing.

## Seller

The account page's footer, like the checkout's, shows the seller as registered with Toss Payments (`BUSINESS` in
`src/lib/checkout/config.ts`, the same as the site footer), labelled in the page's language with the checkout's
reviewed words.

## Policies

The pages link to the website edition's Terms of Service, Refund Policy and Privacy Policy at
`/culture/clean-space/direct-terms.html`, `direct-refunds.html` and `direct-privacy.html` (one bilingual page each;
English titles "Terms of Service", "Refund Policy", "Privacy Policy"). Nothing here writes them: they are drafted in
mac-get-space (`docs/13-direct-sale/`) and published with the same sync pattern as the App Store edition's privacy page.
`scripts/sync-mac-get-space-legal.sh` allows only `privacy.html` today: extend its page list on purpose when they are
published. The predeploy check requires the three files once Clean Space's sales are open.

## Product page

With `NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE=1` the Clean Space page adds "The website edition and the 364 days
Unlock" ("웹사이트 버전과 364일 잠금 해제") before its privacy section: macOS 14 or later, the basic features and what
the Unlock adds, the price, the access period, no renewal, the 7-day refund, a note that purchases don't move between
the editions, a download button (only with `NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL`), a "Buy the 364 days Unlock" button
to the account page, and the three policies. Its privacy item and file-processing answer then cover both editions, an
FAQ "What is the 364 days Unlock?" is added, and with a download "Can I get it now?" says so. The switch is written into
the pages either way (`next.config.mjs`), so a build without it renders the page exactly as before and carries none of
that copy. It never claims Docker, the helper or Spotlight for the App Store app. When releasing, also update
`public/llms.txt` and the sitemap's `<lastmod>`.

## Korean text

New Korean text (the checkout's wording for Clean Space, the account page's purchase part, the product page's section
and the test-payment notices, and since 2026-11-09 the account page's sign-in, contact email, sign-in methods and account
deletion and the sign-in callback page) is listed for the owner's review in `docs/clean-space-ko-review.md`. The
activation page and the account page's Macs section still show their English text on `/ko/`, marked `lang="en"`, until
the owner approves a translation. Already Korean, from the site's published copy: the brand `컬처앤테크` (Korean navigation), `문의`
(Support, the app pages), the language link `English`, and the footer (the checkout's reviewed seller and policy
labels).

From `src/lib/clean-space/copy.ts` (`COPY`; functions shown with `{a}`, `{b}` for their values):

| Key | English |
|---|---|
| `loading`, `tryAgain` | Loading…; Try again |
| `notConfigured` | Clean Space accounts and purchases are not available on this site yet. |
| `accountChanged` | You signed in to another account while this was in progress, so its answer was not used. Try again. |
| `signedInAs`, `thisAccount`, `signOutHere` | Signed in as {a}; this account; Sign out of this browser |
| `signInTitle`, `signInIntro`, `continueWith`, `signInBusy` | Sign in; Sign in with Google, Kakao or Naver. A purchase belongs to the account you sign in with.; Continue with {a}; Signing in… |
| `signInFailures.*`, `popupFailed` | The nine sign-in failure messages, and the blocked-popup message |
| `callbackTitle`, `callbackWorking` | Signing in; Finishing sign-in… |
| `contactHeading`, `contactIntro`, `contactEmailLabel`, `contactSend`, `contactCodeLabel`, `contactCodeSent`, `contactConfirm`, `contactResend`, `contactConfirmed`, `contactInvalidEmail`, `contactInvalidCode` | Contact email verification |
| `activateTitle`, `activateIntro`, `codeLabel`, `compareWarning`, `appVersion`, `expiresIn`, `approve`, `deny`, `approvedText`, `deniedText`, `expiredText`, `consumedText`, `notFoundText`, `noRequestText` | The activation page |
| `accountTitle`, `methodsHeading`, `linkedLabel`, `linkMethod`, `removeMethod`, `lastMethod`, `recentSignInNeeded`, `signInAgain`, `contactNone`, `contactChange` | The account page's sign-in methods and contact email |
| `appsHeading`, `appsNone`, `appRow`, `endSessions`, `endSessionsDone` | Macs signed in |
| `deleteHeading`, `deleteText`, `deleteConfirm`, `deleteButton`, `deleteRequested` | Account deletion |
| `providerNames.*` | Google, Kakao, Naver |

## Checks

```bash
npm ci && npm run lint && node_modules/.bin/tsc --noEmit --incremental false
npm test                                   # vitest: the logic modules with a fake service, the checkout entry, the predeploy checks
node scripts/check-clean-space-contract.mjs
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-clean-space-config.mjs --deploy
node scripts/check-checkout-config.mjs     # needs Chord to MIDI's settings, as every deployment does
npm run build                              # static export
```

Not verified here: the pages in a browser against the service (its emulator suite: Auth 9199, Functions 5101), real
Google, Kakao and Naver sign-ins, `beginCheckout` and the resume against the service, Toss test payments in both
currencies and PayPal Sandbox, App Check, the content security policy against the real SDKs, and the headers on a
Hosting preview channel.
