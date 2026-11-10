/**
 * The checkout session this tab holds for a product. The product's site opens the checkout with a one-time handoff
 * code after the address's `#` (`#handoff=<checkoutId>.<code>`): browsers send that part neither to servers nor in a
 * Referer. The page takes it out of the address at once, makes a random key of its own, and binds the key to the
 * session with the code (openCheckout); from then on the session's id and key are the checkout's hold on the buyer's
 * account. They stay in this tab's sessionStorage, under the product's own key (one product's checkout never reads
 * another's), for Toss's return to the success or fail page, and nowhere else. Every storage access is guarded: it
 * throws in some private modes and when storage is blocked (the checkout then works in this page, and a payment that
 * comes back is finished on the product's site).
 */
import Router from "next/router";
import type { CheckoutCredential } from "./contract";
import type { OpenProduct } from "./products";

const ID = /^[A-Za-z0-9_-]{22}$/;
const SECRET = /^[A-Za-z0-9_-]{43}$/;

/** The order this tab saw paid, once its checkout is forgotten: a reload of the success page still says so. */
const paidKey = (product: OpenProduct) => `${product.storageKey}.paid`;
/** That order's pass, for a product sold as a pass: its start and end (no key, nothing personal). */
const passKey = (product: OpenProduct) => `${product.storageKey}.pass`;

/** What the tab holds: the session's credential, and the handoff code until the session was opened with it. */
export interface CheckoutHold extends CheckoutCredential {
  handoffCode?: string;
}

declare global {
  interface Window {
    /** The address's `#…`, which the checkout pages' first script took out of it (src/pages/_document.tsx). */
    __checkoutHandoff?: string;
  }
}

/**
 * The handoff the page was opened with, if any, read once. The checkout pages' first script took the `#…` out of the
 * address before Next.js started (_document.tsx), so neither the history entry nor Next's copies of the address ever
 * had it. Should the address still have it (that script didn't run), it loses it here, and so do the history entry and
 * Next's copies (its history state's `as` and its router's `asPath`), which later scripts on the page could read.
 */
export function takeHandoff(): { checkoutId: string; handoffCode: string } | null {
  const early = window.__checkoutHandoff;
  delete window.__checkoutHandoff;
  const hash = early ?? window.location.hash;
  if (!hash) return null;
  if (window.location.hash) {
    const clean = window.location.pathname + window.location.search;
    const state: unknown = window.history.state;
    const cleanState = typeof state === "object" && state !== null ? { ...state, as: clean } : state;
    window.history.replaceState(cleanState, "", clean);
    void Router.replace(clean, undefined, { shallow: true, scroll: false }).catch(() => {});
  }
  const match = /^#handoff=([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{43})$/.exec(hash);
  return match ? { checkoutId: match[1], handoffCode: match[2] } : null;
}

/** A key for a session: 32 random bytes, base64url. */
export function newCheckoutKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function readHold(product: OpenProduct): CheckoutHold | null {
  try {
    const value: unknown = JSON.parse(window.sessionStorage.getItem(product.storageKey) ?? "null");
    if (typeof value !== "object" || value === null) return null;
    const { checkoutId, checkoutKey, handoffCode } = value as Record<string, unknown>;
    if (typeof checkoutId !== "string" || !ID.test(checkoutId)) return null;
    if (typeof checkoutKey !== "string" || !SECRET.test(checkoutKey)) return null;
    return typeof handoffCode === "string" && SECRET.test(handoffCode)
      ? { checkoutId, checkoutKey, handoffCode }
      : { checkoutId, checkoutKey };
  } catch {
    return null;
  }
}

export function saveHold(product: OpenProduct, hold: CheckoutHold): void {
  try {
    window.sessionStorage.setItem(product.storageKey, JSON.stringify(hold));
  } catch {
    // Storage unavailable: the page keeps the hold in memory.
  }
}

/** The session ended, was never this tab's, or did its job: nothing of it is kept. */
export function forgetHold(product: OpenProduct): void {
  try {
    window.sessionStorage.removeItem(product.storageKey);
  } catch {
    // Nothing to forget.
  }
}

export interface PaidOrder {
  orderId: string;
  /** The pass's start and end (ISO 8601), for a product sold as a pass. */
  pass: { start: string; end: string } | null;
  /** From the confirm answer; a test payment's dates are not shown. */
  environment?: "test" | "live";
}

/**
 * The payment went through: the checkout is forgotten, and only its order number stays (no key, nothing personal),
 * with the pass's start and end for a product sold as a pass.
 */
export function rememberPaid(product: OpenProduct, paid: PaidOrder): void {
  forgetHold(product);
  try {
    window.sessionStorage.setItem(paidKey(product), paid.orderId);
    if (paid.pass) {
      window.sessionStorage.setItem(passKey(product), JSON.stringify({ orderId: paid.orderId, ...paid.pass }));
    } else {
      window.sessionStorage.removeItem(passKey(product));
    }
  } catch {
    // A reload then finishes on the product's site instead.
  }
}

export function paidOrder(product: OpenProduct): PaidOrder | null {
  let orderId: string | null;
  try {
    orderId = window.sessionStorage.getItem(paidKey(product));
  } catch {
    return null;
  }
  return orderId === null ? null : { orderId, pass: paidPass(product, orderId) };
}

function paidPass(product: OpenProduct, orderId: string): PaidOrder["pass"] {
  try {
    const value: unknown = JSON.parse(window.sessionStorage.getItem(passKey(product)) ?? "null");
    if (typeof value !== "object" || value === null) return null;
    const { orderId: passOrder, start, end } = value as Record<string, unknown>;
    return passOrder === orderId && typeof start === "string" && typeof end === "string" ? { start, end } : null;
  } catch {
    return null;
  }
}
