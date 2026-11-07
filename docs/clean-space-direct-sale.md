# Clean Space's direct sale: account, sign-in, activation and checkout pages

Status (2026-11-07): **implemented locally, not deployed, sales off.** The pages are built into the static export
but say that accounts and purchases are not available until the build is configured (below). Nothing here was
deployed, no Firebase or Toss console was changed, and no payment was made. The plan is mac-get-space's
`docs/plans/364-days-option.md` (§5, §6, §7, §9: Stage C, the website pages); the Clean Space licensing service is in
mac-get-space `services/licensing/` (its own Firebase projects, never this site's Hosting-only project).

## Routes

Every path comes from the contract's `PAGE_PATH` (one source), with its trailing slash, in English and under `/ko/`.

| Page | English / Korean | What it does |
|---|---|---|
| Checkout | `/checkout/clean-space/`, `/ko/checkout/clean-space/` | The one offer (364 days, KRW 3,300 / US$2.49 from the service), sign-in, receipt email, policies, Toss Payments |
| Payment result | `…/checkout/clean-space/success/`, `…/fail/` | Success shows only the service's confirmation; fail closes the order; nothing is shown as paid from the redirect alone |
| Account | `/apps/clean-space/account/` (+ `/ko/`) | Sign-in methods (link, remove), receipt email, access period, purchases, refund request, Macs signed in, sign-out, deletion |
| Sign-in callback | `/apps/clean-space/auth/callback/` (+ `/ko/`) | Kakao and Naver return here; the code is exchanged once and the browser goes on to an allow-listed page |
| Activation | `/apps/clean-space/activate/` (+ `/ko/`) | Approves Clean Space on a Mac: shows the request's code, approves only on an explicit click |

The pages are client-rendered inside the static export (no API routes); they call the Clean Space service's Firebase
callables. `src/pages/…` holds only thin page files; the components are in `src/components/clean-space/` and the logic
(tested without a browser) in `src/lib/clean-space/`.

## The contract

`src/lib/clean-space/contract.generated.ts` is a pinned copy of the Clean Space licensing contract (version 1, SHA-256
in its header), written by mac-get-space's `services/licensing/contract/scripts/export.mjs`. It is committed here and
never imported from another checkout. `scripts/check-clean-space-contract.mjs` (predeploy, and `npm test`) recomputes
the body's SHA-256 and fails on any edit. To take a new contract version: in mac-get-space,
`node services/licensing/contract/scripts/export.mjs <this repo>/src/lib/clean-space/contract.generated.ts`, then adapt
the pages, test and commit both.

## Build settings (no values here)

All are public values (`NEXT_PUBLIC_…`, inlined into the pages). Never put a secret in one. They are read only in
`src/lib/clean-space/config.ts`; the rules are `config-rules.ts`, shared with `scripts/check-clean-space-config.mjs`
(which needs Node 22.18+ or 23.6+: it imports the TypeScript rules directly). Set them for a release in
`.env.production.local` (git-ignored), like Chord to MIDI's checkout settings.

| Setting | Meaning | Production |
|---|---|---|
| `NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT` | `emulator`, `staging` or `production`; empty = not configured | `production` |
| `NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_APP_ID` | The Clean Space project's web app (named app `clean-space` in the pages) | required; not a `demo-` project |
| `NEXT_PUBLIC_CLEAN_SPACE_FUNCTIONS_REGION` | Region of the callables | optional (default `asia-northeast3`, the contract's proposal) |
| `NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY` | App Check (reCAPTCHA Enterprise) key; its domains must list `cultureand.tech` | required |
| `NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID` | Kakao REST API key (public client id) | required |
| `NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID` | Naver client id | required |
| `NEXT_PUBLIC_CLEAN_SPACE_SALES_ENABLED` | `1` lets the checkout take orders (also needs the service's `salesOpen`) | off until the owner opens sales |
| `NEXT_PUBLIC_CLEAN_SPACE_POLICIES_PUBLISHED` | `1` once the direct-sale privacy policy, terms and refund policy are published | off; sales can't be on without it |
| `NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE` | `1` makes the product page tell the App Store app and the website download apart | off until the website build is released |
| `NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST`, `_PROVIDER_EMULATOR_URL` | Emulator builds only (Firebase emulators; fake OAuth providers) | must be empty |

`node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-clean-space-config.mjs --deploy` (predeploy) passes
only an unconfigured build or a complete production one: it refuses emulator and staging builds, `demo-` projects,
emulator settings, a missing setting (named, never its value) and sales without published policies. Toss client keys
are not settings: the service sends the currency's client key and widget variant with each order, and the page refuses
a test key on the production build and a live key on any other.

The checkout takes an order only when all of these hold: configured, `SALES_ENABLED=1`, `POLICIES_PUBLISHED=1`, the
service's offer says `salesOpen`, and the currency is available. Otherwise it explains why and takes nothing.

## Sensitive routes

Every page above (`src/lib/clean-space/sensitive-routes.ts`, which also covers any `/checkout/` page):
- `<meta name="robots" content="noindex, nofollow">`, a minimal layout (no site navigation, no footer video, no other
  embed), the seller and policy links in the footer.
- `src/pages/_document.tsx` leaves out the Google Fonts stylesheet and the Softgen monitoring script there. The font
  import moved from `globals.css` to a `<link>` in `_document.tsx` for every other page (same fonts, same CSS rules).
- `firebase.json` headers (EN and KO): `Cache-Control: no-store`, `Referrer-Policy: strict-origin`,
  `X-Frame-Options: DENY`, `X-Robots-Tag: noindex, nofollow`, `Permissions-Policy` without camera, microphone,
  location or USB, and a `Content-Security-Policy` allowing only the site itself, Toss Payments (`js.tosspayments.com`,
  `*.tosspayments.com`, PayPal frames and forms through Toss), Firebase Auth, Functions and App Check (`*.googleapis.com`,
  `*.cloudfunctions.net`, `apis.google.com`, the auth domain's frames on `*.firebaseapp.com`/`*.web.app`), reCAPTCHA,
  `frame-ancestors 'none'`. These rules come after the site's general ones; the local Hosting emulator applied them with
  `no-store` winning over `/apps/**`'s cache rule (2026-11-07). Verify on a preview channel before release with
  `scripts/check-live.sh <preview-host>`, which now checks these pages' status, headers, noindex and that they load no
  font, monitoring script or YouTube.
- The callback, success and fail pages read their query once and replace the address (and Next.js's copy of it) with
  the bare path at once; the activation page does the same with its `#request=…` fragment. Nothing is cached by a
  service worker (the site has none).

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
  browser's copy. Kakao and Naver are linked through the callback with intent `link`. The service must accept this
  order (backend alignment).
- Changing sign-in methods and deleting the account need a sign-in within 5 minutes (checked here and by the
  service); the page offers "Sign in again" with a method the account still has.

## Checkout

States: signed out, receipt-email verification (a 6-digit code to an address on the signed-in account; never a
sign-in method), ready, preparing, payment (Toss widget), declined or cancelled, pending recording, paid, already
active, previous term ended (buy again), and unavailable (with the reason). Before payment the page shows Clean Space,
364 days, the exact price per currency, no automatic renewal, the start rule (approval time, exactly 364 days of
seconds), what it unlocks (the website download only, not the App Store app), compatibility, the signed-in account and
the three policies with their versions. The buyer picks the currency; for US dollars they choose their country
(PayPal's `foreignEasyPay.country`; nothing is inferred from the language). The unpaid choices survive a sign-in in
this tab.

Toss Payments v2 renders with the order's client key and variant; dollars carry `foreignEasyPay` with the product and
no shipping. One order at a time: changing the currency after an order was made closes it with
`failOrder({ code: "CHECKOUT_CHANGED" })` before a new one (backend alignment: the service should treat that as
closing an unpaid order). The success page confirms only Toss's parameters; signed out, it keeps them on the service
with `preparePaymentResume`, and the checkout page finishes them after the buyer signs in (only that buyer can). A
pending answer never suggests paying again, and a receipt link shows only when the service has one.

## Activation

The app opens `/apps/clean-space/activate/#request=<id>`. The page keeps the id in this tab only, asks for a sign-in,
shows the request's confirmation code, the app version, its expiry and the signed-in account with a warning to approve
only if the Mac shows the same code now, and approves only on Approve (sending the code it displayed). Deny, expiry and
an already used request have their own states. Opening the page approves nothing.

## Seller

The checkout's footer shows the seller as Korean e-commerce law asks: the facts the site footer already publishes, and
the mail-order registration, phone and hosting provider as chord-to-midi-web's `site.config.json` `business` has them
(committed at 79c96ac; `SELLER` in `src/lib/clean-space/config.ts`). **The owner confirms them for Clean Space's direct
sale before sales open.**

## Policies

The pages link to `/culture/clean-space/direct-privacy.html`, `direct-terms.html` and `direct-refunds.html`; nothing
here writes them. They are drafted in mac-get-space and published with the same sync pattern as the App Store privacy
page. `scripts/sync-mac-get-space-legal.sh` allows only `privacy.html` today: extend its page list on purpose when the
direct-sale pages are published, then set `NEXT_PUBLIC_CLEAN_SPACE_POLICIES_PUBLISHED=1`.

## Product page

With `NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE=1` the Clean Space page adds a "Mac App Store or website download"
section before its privacy section (with a button to the checkout), says the website download's account is only for
the 364 days Unlock and sends no file names, paths or scan results, and adds the FAQ "What is the 364 days Unlock?"
(`src/lib/clean-space/channel-copy.ts`; its structured data follows the page). It never claims Docker, the helper or
Spotlight for the App Store app. Off by default: the page's visible content is unchanged. When releasing, also update
`public/llms.txt` and the sitemap's `<lastmod>` (README, SEO).

## Korean text needing review

The Korean pages show the English text (marked `lang="en"`) until the owner reviews a translation. Already Korean,
from the site's published copy: the brand `컬처앤테크` (Korean navigation), `문의` (Support, the app pages), the
language link `English`, and the seller block (the footer's Korean facts). Everything below is English on `/ko/` today.

From `src/lib/clean-space/copy.ts` (functions shown with `{a}`, `{b}`, `{c}` for their values):

| Key | English |
|---|---|
| `loading` | Loading… |
| `tryAgain` | Try again |
| `back` | Back |
| `notConfigured` | Clean Space accounts and purchases are not available on this site yet. |
| `accountChanged` | You signed in to another account while this was in progress, so its answer was not used. Try again. |
| `signedInAs` | Signed in as {a} |
| `thisAccount` | this account |
| `signOutHere` | Sign out of this browser |
| `sellerHeading`, `sellerLabels.*` | Seller; Representative, Business registration, Mail-order business registration, Address, Phone, Email, Hosting |
| `policyLinks.*` | Terms of Sale, Privacy Policy, Refund Policy |
| `signInTitle`, `signInIntro`, `continueWith`, `signInBusy` | Sign in; Sign in with Google, Kakao or Naver. A purchase belongs to the account you sign in with.; Continue with {a}; Signing in… |
| `signInFailures.*`, `popupFailed` | The nine sign-in failure messages, and the blocked-popup message |
| `callbackTitle`, `callbackWorking` | Signing in; Finishing sign-in… |
| `checkoutTitle`, `offerName` | 364 days Unlock; Clean Space 364 days Unlock |
| `offerWhat`, `offerNotAppStore`, `offerTerm`, `offerNoRenewal`, `offerAfter`, `offerCompatibility` | The six lines of the offer summary |
| `priceLabel`, `currencyHeading`, `currencyNames.*`, `countryLabel`, `countryPlaceholder` | Price; Pay in; Korean won (KRW), US dollars (USD), with PayPal; the country field |
| `policiesHeading`, `acceptTerms`, `acceptPrivacy`, `acceptRefunds`, `policyVersions` | Before you pay, the three acceptances and the versions line |
| `continueToPayment`, `changeChoice`, `preparing`, `payButton`, `paying`, `agreeTossTerms`, `declined` | The payment step's buttons and notes |
| `alreadyActive`, `previousEnded`, `signInToBuy`, `deleting`, `unavailable.*`, `checkoutInProgress`, `offerChanged`, `finishingPayment`, `accountLink` | The checkout's states |
| `contactHeading`, `contactIntro`, `contactEmailLabel`, `contactSend`, `contactCodeLabel`, `contactCodeSent`, `contactConfirm`, `contactResend`, `contactConfirmed`, `contactInvalidEmail`, `contactInvalidCode` | Receipt-email verification |
| `resultTitle`, `confirming`, `paidHeading`, `paidPeriod`, `paidNext`, `receiptLink`, `receiptNone`, `pendingHeading`, `pendingText`, `orderNumber`, `signInToFinish`, `wrongAccount`, `noPayment`, `ifCharged`, `resumeExpired` | The success page |
| `failTitle`, `failCancelled`, `failOther`, `tossSaid`, `backToCheckout` | The fail page |
| `activateTitle`, `activateIntro`, `codeLabel`, `compareWarning`, `appVersion`, `expiresIn`, `approve`, `deny`, `approvedText`, `deniedText`, `expiredText`, `consumedText`, `notFoundText`, `noRequestText` | The activation page |
| `accountTitle`, `methodsHeading`, `linkedLabel`, `linkMethod`, `removeMethod`, `lastMethod`, `recentSignInNeeded`, `signInAgain`, `contactNone`, `contactChange` | The account page's sign-in methods and receipt email |
| `accessHeading`, `accessNone`, `accessActive`, `accessExpired`, `accessRevoked`, `buy`, `buyAgain` | The access period |
| `purchasesHeading`, `purchasesNone`, `purchaseStatus.*`, `purchaseMethod`, `refundRequest`, `refundReason`, `refundSend`, `refundNote`, `refundSent` | Purchases and refund requests |
| `appsHeading`, `appsNone`, `appRow`, `endSessions`, `endSessionsDone` | Macs signed in |
| `deleteHeading`, `deleteText`, `deleteConfirm`, `deleteButton`, `deleteRequested` | Account deletion |
| `providerNames.*` | Google, Kakao, Naver |

Every one of those 164 strings is in `copy.ts` with its exact English (the review table can be regenerated from it).
From `src/lib/clean-space/channel-copy.ts` (product page, only with the release flag): the section "Mac App Store or
website download" (its intro, four items, note and button), the replaced privacy item "Your files are processed on
your Mac", the replaced FAQ answer "Does it send anything about my files anywhere?" and the new FAQ "What is the 364
days Unlock?". On the Korean product page these replace reviewed Korean text with English until a translation is
reviewed.

## Checks

```bash
npm ci && npm run lint && node_modules/.bin/tsc --noEmit --incremental false
npm test                                   # vitest: the logic modules with a fake service, and the contract copy check
node scripts/check-clean-space-contract.mjs
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-clean-space-config.mjs --deploy
npm run build                              # static export: the 12 pages are out/<route>/index.html
```

Local results (2026-11-07, branch `claude/clean-space-website-unlock` from `901b0ae`): lint clean, tsc clean, 56 of 56
unit tests, contract copy v1 `052af3e0…7e6`, config check "not configured" (passes `--deploy`), build exported 20 pages
including the 12 new ones (each with noindex and no font, monitoring script or YouTube). The Clean Space product page's
visible content is byte-identical to `main`'s build with the release flag off (EN and KO); its `<head>` gains only the
fonts `<link>` that replaced the CSS `@import`, and every pre-existing CSS rule is unchanged (22 utility rules were
added for the new pages). An emulator-settings build compiles and is refused by `--deploy`.

Not verified here: the pages in a browser against the service (the backend is being built in parallel; run them with
the Firebase emulators and fake providers once its emulator suite exists), real Google, Kakao and Naver sign-ins, Toss
test payments in both currencies and PayPal Sandbox, App Check, the CSP against the real SDKs, and the headers on a
Hosting preview channel.

## Overlap with Chord to MIDI's checkout work

The uncommitted `claude/checkout-chord-to-midi` worktree changes the same shared files. When both land, merge by hand:
- `package.json` / `package-lock.json`: both add `firebase@12.19.0` and `@tosspayments/tosspayments-sdk@2.9.0`
  (same lines); this branch also adds `vitest@5.0.3` and a `test` script. Installing vitest moved four transitive
  build packages up (`postcss` 8.5.28 → 8.5.32, `nanoid` 3.3.19 → 3.3.20, `source-map-js` 1.2.1 → 1.2.2,
  `@jridgewell/sourcemap-codec` 1.5.5 → 1.6.0).
- `src/pages/_document.tsx` and `src/styles/globals.css`: the same change (fonts by `<link>`, no fonts or monitoring on
  checkout pages); this branch's matcher (`isSensitivePage`) also covers Clean Space's account, callback and activation
  pages and is a superset of `/^(\/ko)?\/checkout(\/|$)/`.
- `firebase.json`: both add predeploy checks at the top and checkout headers; that branch's rule covers `/checkout/**`
  with `Referrer-Policy: strict-origin-when-cross-origin`, this one `/checkout/clean-space/**` with `strict-origin`
  (its check-live expects `strict-origin`): keep the stricter, more specific Clean Space rules after the general one.
- `scripts/check-live.sh` and `README.md`: separate blocks for each product's checkout.
