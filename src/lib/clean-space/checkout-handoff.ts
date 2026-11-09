/**
 * Clean Space's purchase as its account page starts and finishes it. The payment itself is the central checkout's
 * (README, "The central checkout"; src/lib/checkout/): the signed-in account asks the licensing service for a checkout
 * session (beginCheckout), and the tab goes to the address the service gives, Clean Space's checkout page on this site
 * with a one-time handoff code after `#`. A payment that came back to a tab no longer holding its checkout is kept for
 * its buyer and comes here as `?resume=<id>`; the account page finishes it with confirmPayment({ resumeID }) once that
 * buyer is signed in.
 *
 * Pure functions and constants (whatever touches the browser is passed in), so the tests run them without one.
 */
import type { CleanSpaceEnvironment } from "./config-rules";
import { isId43, PAGE_PATH, type Currency, type GetOfferResponse, type PageLang } from "./contract.generated";
import { ALREADY_OWNED_CODE } from "./site";
import { readJSON, removeKey, STORAGE_KEYS, writeJSON, type KeyValueStore } from "./storage";

/**
 * The callable that starts a checkout, with its request and answer. Not in this pinned copy of the contract (v1,
 * sha256 052af3e0…); the contract's current source (mac-get-space 5b1ccfe) has them with exactly these names and shapes
 * (CALLABLE.beginCheckout, BeginCheckoutRequest, BeginCheckoutResponse), so take them from the copy once it is exported
 * again (docs/clean-space-direct-sale.md, "The contract"); a test compares them then.
 */
export const BEGIN_CHECKOUT = "beginCheckout";

export interface BeginCheckoutRequest {
  lang: PageLang;
}
export interface BeginCheckoutResponse {
  /** `https://cultureand.tech[/ko]/checkout/clean-space/#handoff=<checkoutId>.<code>` */
  checkoutUrl: string;
  /** ISO 8601: the handoff has to be opened before then. */
  openBefore: string;
}

/**
 * The checkout address the service gave, if this page may send the tab there: https on this site's origin (a test
 * build's configured origin, which may be a local http server), Clean Space's checkout page in either language, a
 * handoff after `#`, and nothing else. Null for anything else: another site or page, a `javascript:` address, a query,
 * credentials, or something that isn't an address at all.
 */
export function checkoutAddress(value: unknown, siteOrigin: string): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  let url: URL;
  let site: URL;
  try {
    url = new URL(value);
    site = new URL(siteOrigin);
  } catch {
    return null;
  }
  const protocolAllowed = url.protocol === "https:" || (site.protocol === "http:" && url.protocol === "http:");
  if (!protocolAllowed || url.origin !== site.origin) return null;
  if (url.username !== "" || url.password !== "" || url.search !== "") return null;
  if (url.pathname !== PAGE_PATH.checkout.en && url.pathname !== PAGE_PATH.checkout.ko) return null;
  if (!/^#handoff=[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(url.hash)) return null;
  return url.href;
}

/** Why beginCheckout refused, as the account page says it; null: the service's own message is shown. */
export type PurchaseRefusal =
  | "alreadyOwned"
  | "salesClosed"
  | "currencyUnavailable"
  | "accountDeleted"
  | "accountUnavailable"
  | "contactRequired"
  | "inProgress"
  | "tooMany"
  | "signInAgain";

/** The service's code (`details.code`) as one of the account page's messages. */
export function purchaseRefusal(code: string | null): PurchaseRefusal | null {
  if (code === null) return null;
  if (code === ALREADY_OWNED_CODE) return "alreadyOwned";
  switch (code) {
    case "SALES_CLOSED":
      return "salesClosed";
    case "CURRENCY_UNAVAILABLE":
      return "currencyUnavailable";
    case "ACCOUNT_DELETED":
      return "accountDeleted";
    case "ACCOUNT_UNAVAILABLE":
    case "ACCOUNT_DISABLED":
      return "accountUnavailable";
    // A receipt email that isn't confirmed: the central checkout's name for it, and contract v1's.
    case "EMAIL_NOT_CONFIRMED":
    case "CONTACT_NOT_VERIFIED":
      return "contactRequired";
    case "CHECKOUT_IN_PROGRESS":
      return "inProgress";
    case "TOO_MANY_REQUESTS":
      return "tooMany";
    case "UNAUTHENTICATED":
    case "SESSION_INVALID":
      return "signInAgain";
    default:
      return null;
  }
}

/** A resume id as the checkout gives it (preparePaymentResume): 43 base64url characters, and nothing else. */
export function parseResumeId(value: string | null | undefined): string | null {
  return typeof value === "string" && isId43(value) ? value : null;
}

/** How long this tab keeps a resume id while its buyer signs in; the service decides when it expires. */
export const RESUME_TTL_MS = 60 * 60_000;

/** Keeps the resume id in this tab across a Kakao or Naver sign-in, which leaves the page. */
export function rememberResume(store: KeyValueStore | null, resumeID: string, nowMs: number): boolean {
  if (!isId43(resumeID)) return false;
  return writeJSON(store, STORAGE_KEYS.paymentResume, { resumeID, at: nowMs });
}

/** The resume id this tab holds, while it is recent. */
export function recallResume(store: KeyValueStore | null, nowMs: number): string | null {
  const value = readJSON(store, STORAGE_KEYS.paymentResume);
  if (typeof value !== "object" || value === null) return null;
  const { resumeID, at } = value as Record<string, unknown>;
  if (!isId43(resumeID) || typeof at !== "number" || nowMs - at > RESUME_TTL_MS || at - nowMs > 60_000) {
    removeKey(store, STORAGE_KEYS.paymentResume);
    return null;
  }
  return resumeID;
}

export function forgetResume(store: KeyValueStore | null): void {
  removeKey(store, STORAGE_KEYS.paymentResume);
}

/** Why confirmPayment didn't finish a kept payment, as the account page says it; null: the service's own message. */
export type ResumeRefusal = "pending" | "wrongAccount" | "expired" | "alreadyOwned" | "accountDeleted" | "inProgress";

export function resumeRefusal(code: string | null): ResumeRefusal | null {
  if (code === null) return null;
  if (code === ALREADY_OWNED_CODE) return "alreadyOwned";
  switch (code) {
    case "PAYMENT_PENDING":
      return "pending";
    case "NOT_ORDER_OWNER":
      return "wrongAccount";
    case "PAYMENT_RESUME_EXPIRED":
      return "expired";
    case "ACCOUNT_DELETED":
      return "accountDeleted";
    case "CHECKOUT_IN_PROGRESS":
      return "inProgress";
    default:
      return null;
  }
}

/**
 * Whether this tab keeps the resume id after a refusal: to try again later (still being recorded, another payment
 * being confirmed, a passing error), or once its buyer signs in instead of another account. Not when the service has
 * settled it (expired, or refused for good).
 */
export function keepsResume(refusal: ResumeRefusal | null): boolean {
  return refusal === null || refusal === "pending" || refusal === "wrongAccount" || refusal === "inProgress";
}

/**
 * A refund request: an email to support with the order number and the account's contact email filled in, as Chord to
 * MIDI's account page writes it (no form and no callable: support answers by email, and the operator refunds through
 * Toss Payments).
 */
export function mailtoLink(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * The currencies the offer sells on Toss Payments' test keys, for the test-payment notice. A staging or emulator build's
 * service sells on test keys alone. In production the service sells on test keys before its launch (mac-get-space plan
 * §0, LAUNCH_AT) and says so per currency (`OfferPrice.test`), so the notice follows the server's answer and disappears
 * at the launch; the checkout page reads its options' client keys the same way.
 */
export function testCurrencies(offer: GetOfferResponse, environment: CleanSpaceEnvironment | null): Currency[] {
  return offer.prices
    .filter((price) => price.available && (environment !== "production" || price.test === true))
    .map((price) => price.currency);
}
