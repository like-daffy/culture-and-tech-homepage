/**
 * Pages where a person pays, signs in or approves something (plan §5.1). They load nothing from other hosts but what
 * paying and signing in need: no web fonts, no monitoring or analytics script, no embeds (src/pages/_document.tsx), and
 * firebase.json gives them no stale cache, no framing and a restrictive referrer policy (Clean Space's account pages
 * also no-store and a content security policy).
 *
 * Every checkout page counts, whichever product it sells (the central checkout, README "The central checkout"), plus
 * Clean Space's account, sign-in callback and activation pages. Paths are Next.js page routes (`__NEXT_DATA__.page`,
 * no trailing slash) or addresses (with one).
 */

/** The central checkout's pages of every product, in both languages. */
export function isCheckoutPage(page: string): boolean {
  return /^(\/ko)?\/checkout(\/|$)/.test(page);
}

/** Clean Space's account, sign-in callback and activation pages, in both languages. */
const CLEAN_SPACE_ACCOUNT_PAGES = /^(\/ko)?\/apps\/clean-space\/(account|auth|activate)(\/|$)/;

export function isSensitivePage(page: string): boolean {
  return isCheckoutPage(page) || CLEAN_SPACE_ACCOUNT_PAGES.test(page);
}
