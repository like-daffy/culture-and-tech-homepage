/**
 * The checkout session this tab holds. Chord to MIDI's purchase page opens the checkout with a one-time handoff code
 * after the address's `#` (`#handoff=<checkoutId>.<code>`): browsers send that part neither to servers nor in a
 * Referer. The page takes it out of the address at once, makes a random key of its own, and binds the key to the
 * session with the code (openCheckout); from then on the session's id and key are the checkout's hold on the buyer's
 * account. They stay in this tab's sessionStorage, for Toss's return to the success or fail page, and nowhere else.
 * Every storage access is guarded: it throws in some private modes and when storage is blocked (the checkout then
 * works in this page, and a payment that comes back is finished on chord-to-midi.app).
 */
import Router from "next/router";
import type { CheckoutCredential } from "./contract";

const STORAGE_KEY = "cultureandtech.checkout.chord-to-midi";
/** The order this tab saw paid, once its checkout is forgotten: a reload of the success page still says so. */
const PAID_KEY = "cultureandtech.checkout.chord-to-midi.paid";
const ID = /^[A-Za-z0-9_-]{22}$/;
const SECRET = /^[A-Za-z0-9_-]{43}$/;

/** What the tab holds: the session's credential, and the handoff code until the session was opened with it. */
export interface CheckoutHold extends CheckoutCredential {
  handoffCode?: string;
}

/**
 * The handoff in the address, if any. The address loses its `#…` either way, before anything else happens, and so do
 * the history entry and Next's own copies of the address (its history state's `as` and its router's `asPath`), which
 * later scripts on the page could otherwise read.
 */
export function takeHandoff(): { checkoutId: string; handoffCode: string } | null {
  const hash = window.location.hash;
  if (!hash) return null;
  const clean = window.location.pathname + window.location.search;
  const state: unknown = window.history.state;
  const cleanState = typeof state === "object" && state !== null ? { ...state, as: clean } : state;
  window.history.replaceState(cleanState, "", clean);
  void Router.replace(clean, undefined, { shallow: true, scroll: false }).catch(() => {});
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

export function readHold(): CheckoutHold | null {
  try {
    const value: unknown = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null");
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

export function saveHold(hold: CheckoutHold): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(hold));
  } catch {
    // Storage unavailable: the page keeps the hold in memory.
  }
}

/** The session ended, was never this tab's, or did its job: nothing of it is kept. */
export function forgetHold(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to forget.
  }
}

/** The payment went through: the checkout is forgotten, and only its order number stays (no key, nothing personal). */
export function rememberPaid(orderId: string): void {
  forgetHold();
  try {
    window.sessionStorage.setItem(PAID_KEY, orderId);
  } catch {
    // A reload then finishes on Chord to MIDI instead.
  }
}

export function paidOrder(): string | null {
  try {
    return window.sessionStorage.getItem(PAID_KEY);
  } catch {
    return null;
  }
}
