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
| G5 | Redirects | `scripts/check-live.sh` on a preview channel: every old address 301s to its portal page | t1f |

When G1–G5 pass, remove in one commit on this branch: `src/pages/{,ko/}apps/clean-space/{account,activate}.tsx`,
`src/pages/{,ko/}apps/clean-space/auth/`, the components in `src/components/clean-space/` and the modules and tests in
`src/lib/clean-space/` that only those pages use (the product page, `site.ts`, `channel-copy.ts`, `copy.ts` parts it
uses, and `contract.generated.ts` stay), and their `firebase.json` header blocks. `npx tsc --noEmit`, `npx vitest run`
and `npm run build` decide what is still used.
