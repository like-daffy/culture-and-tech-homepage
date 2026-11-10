# Portal integration (branch `integration/portal-checkout`)

Accounts for Chord to MIDI, DJ Duplicate Guard and Clean Space move to the shared portal
(`https://portal.cultureand.tech`, repo `cultureand-tech-portal`). Products and checkout stay on cultureand.tech.
Owner decisions of 2026-11-09, relayed by the Codex orchestrator.

## What this branch changes

- **All-in-one — 364 Days**, closed: `/checkout/all-in-one/` (+ success, fail, `/ko/`), README "All-in-one".
- **Clean Space links**: its account page is the portal's `/products/clean-space` (contract `PORTAL_ORIGIN`,
  `PORTAL_PAGE_PATH`, pinned from mac-get-space `99437af`). The checkout's start, resume and "back to account" links
  and the product page's buy link go there. `src/lib/checkout/products.ts` gained `ExternalPage` for pages on the
  portal.
- **Redirects** (`firebase.json`): the old Clean Space account, activation and sign-in addresses 301 to the portal.
  Do not deploy them before the portal's replacement pages work (owner).

## Clean Space test checkout: atomic release (owner rule, path A; 2026-11-10)

The homepage's Clean Space checkout and its old account pages read the same `NEXT_PUBLIC_CLEAN_SPACE_*` settings
(`src/lib/clean-space/config.ts`). The backend runs with `IDENTITY_MODE=portal` and refuses the old pages' direct
provider paths, so with production settings those pages would be a broken duplicate sign-in surface. Therefore:

1. Clean Space's functions are deployed, and the portal's Clean Space entry has its production config and App Check
   key (portal `dad908f`).
2. The portal's Clean Space flow works on portal.cultureand.tech (owner-led real check: connect, status, checkout
   start).
3. Only then, in ONE homepage release: the Clean Space checkout env (`NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT=production`,
   `_FIREBASE_PROJECT_ID`, `_FIREBASE_APP_ID`, `_FIREBASE_API_KEY`, `_FIREBASE_AUTH_DOMAIN`, `_RECAPTCHA_SITE_KEY`; the
   emulator, provider-emulator, Kakao and Naver variables stay unset) together with the `firebase.json` 301s from the
   old account, activation and sign-in routes to the portal. Never deploy that env without the 301s.
4. The checkout switch (`NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT`, `CLEAN_SPACE_SALES_OPEN`) is a separate owner-go commit,
   with Toss test keys only.
5. The old source stays until G1-G5 pass, then is removed as below.

## Removal gate for the old Clean Space account source

The owner approved removing the homepage's duplicate Clean Space login, account and activation source only after the
portal replacements pass integration tests. Keep the redirects and Git history; no account data is deleted. Until
every item below passes, the files stay.

| # | Replacement | Test that establishes it | Owner of the test |
|---|---|---|---|
| G1 | Portal sign-in (email link in a new tab, Google, Kakao, Naver) and account page (`getPortalAccount`) | Browser journey against `npm run serve -w services/auth` (portal repo), portal built with `NEXT_PUBLIC_PORTAL_BACKEND=emulator`; plus services/auth emulator tests | t1f (journey), t1g (service) |
| G2 | Clean Space product session from the portal (`exchangePortalSession`) and its status on `/products/clean-space` | Portal journey with Clean Space's licensing emulator: signed-in portal account shows the normalized license summary | t1f, t1b |
| G3 | Mac activation on the portal (`/products/clean-space/activate#request=`) | Journey: native or fixture request → `inspectActivation` shows the code → `approveActivation` / `denyActivation`, error cases reload; the old address 301s with the fragment kept | t1f, t1b |
| G4 | Purchase from the portal | Journey: portal → Clean Space `beginCheckout` → `/checkout/clean-space/` (test keys) → success → account link and `?resume=` on the portal | t1f, t1b |
| G5 | Redirects | `scripts/check-live.sh` on a preview channel: slashless, slash and direct `index.html` account, activation and auth addresses 301 to their portal pages | t1f |

When G1–G5 pass, remove in one commit on this branch: `src/pages/{,ko/}apps/clean-space/{account,activate}.tsx`,
`src/pages/{,ko/}apps/clean-space/auth/`, the components in `src/components/clean-space/` and the modules and tests in
`src/lib/clean-space/` that only those pages use (the product page, `site.ts`, `channel-copy.ts`, `copy.ts` parts it
uses, and `contract.generated.ts` stay), and their `firebase.json` header blocks. `npx tsc --noEmit`, `npx vitest run`
and `npm run build` decide what is still used.
