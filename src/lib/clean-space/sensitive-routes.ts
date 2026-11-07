/**
 * Pages where a person signs in, pays or approves something (plan §5.1). They load nothing from other hosts but what
 * signing in and paying need: no web fonts, no monitoring or analytics script, no embeds (src/pages/_document.tsx), and
 * firebase.json gives them no-store, no framing, a restrictive referrer policy and a content security policy.
 *
 * Every checkout page counts, whichever product it sells (Chord to MIDI's checkout work matches `/checkout/` the same
 * way), plus Clean Space's account, sign-in callback and activation pages. Paths are Next.js page routes
 * (`__NEXT_DATA__.page`, no trailing slash) or addresses (with one).
 */
const SENSITIVE = [/^(\/ko)?\/checkout(\/|$)/, /^(\/ko)?\/apps\/clean-space\/(account|auth|activate)(\/|$)/];

export function isSensitivePage(page: string): boolean {
  return SENSITIVE.some((pattern) => pattern.test(page));
}
