/**
 * Clean Space's addresses on this site, and the code its licensing service refuses a second purchase with: constants
 * shared by its own pages (src/components/clean-space/) and its entry in the central checkout
 * (src/lib/checkout/products.ts). Dependency-free on purpose, so the checkout's entry uses them without loading any of
 * Clean Space's account code.
 */

/** Clean Space has no site of its own: its pages are on cultureand.tech (another origin only in test builds). */
export const CLEAN_SPACE_SITE_ORIGIN = "https://cultureand.tech";

/** Its pages below the language's root ("" or "/ko"), with their trailing slash (the contract's PAGE_PATH has them too). */
export const CLEAN_SPACE_PAGES = {
  home: "apps/clean-space/",
  account: "apps/clean-space/account/",
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
