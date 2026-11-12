/**
 * Clean Space's addresses on this site, and the code its licensing service refuses a second purchase with: constants
 * shared by its own pages (src/components/clean-space/) and its entry in the central checkout
 * (src/lib/checkout/products.ts). Dependency-free on purpose, so the checkout's entry uses them without loading any of
 * Clean Space's account code.
 */

/**
 * Where Clean Space's pages here are: its checkout and its policies are on cultureand.tech (another origin only in test
 * builds). Its product page is on its own site, clean-space.app, since 2026-11-12; its former address here redirects there.
 */
export const CLEAN_SPACE_SITE_ORIGIN = "https://cultureand.tech";

/** Its product page below the language's root ("" or "/ko"), with its trailing slash (the contract's PAGE_PATH too). */
export const CLEAN_SPACE_PAGES = {
  home: "apps/clean-space/",
} as const;

/**
 * Its account page is on the shared portal: where its buyers sign in, begin a checkout and finish a payment kept for
 * them. Product page and checkout stay here. Written out here (this file stays dependency-free, for
 * scripts/check-clean-space-config.mjs); the checkout's tests pin both to the contract's PORTAL_ORIGIN and
 * PORTAL_PAGE_PATH (mac-get-space 99437af).
 */
export const CLEAN_SPACE_PORTAL = {
  origin: process.env.NEXT_PUBLIC_PORTAL_ORIGIN || "https://portal.cultureand.tech",
  /** Below the language's root on the portal, without a trailing slash. */
  account: "products/clean-space",
} as const;

/**
 * The website edition's terms of sale, refund policy and privacy policy. Each is one bilingual page, from the site's
 * root (no /ko/ copy), published from mac-get-space (docs/13) like the App Store edition's privacy page.
 */
export const DIRECT_SALE_POLICY_PATHS = {
  terms: "/culture/clean-space/direct-terms.html",
  refund: "/culture/clean-space/direct-refunds.html",
  privacy: "/culture/clean-space/direct-privacy.html",
} as const;

/**
 * The licensing service's code (`details.code`) for an account whose 364 days Unlock hasn't ended: another can't be
 * bought before it ends. beginCheckout and the checkout's callables refuse with it. Provisional until the service's
 * checkout contract is final (contract v1 names it ERROR_CODE.alreadyActive; its current source, CHECKOUT_ERROR.alreadyOwned,
 * the same value); change it here only.
 */
export const ALREADY_OWNED_CODE = "ALREADY_ACTIVE";
