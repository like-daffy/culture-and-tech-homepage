/**
 * What the Clean Space pages keep in this tab's sessionStorage, under Clean Space's own keys (another product's
 * checkout on this site keeps its own). Nothing here is a credential: OAuth states, the unpaid checkout choices, a
 * payment's resume handle and an activation request id, each with its time so stale ones are dropped. Every access is
 * guarded: storage throws in some private modes and when site data is blocked.
 */

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const STORAGE_KEYS = {
  /** The Kakao or Naver sign-in under way in this tab (oauth.ts). */
  authPending: "cleanSpace.auth.pending",
  /** The buyer's unpaid choices: currency, country and accepted policy versions (kept across a sign-in). */
  checkoutIntent: "cleanSpace.checkout.intent",
  /** A payment's resume handle while its buyer signs in (preparePaymentResume). */
  paymentResume: "cleanSpace.checkout.resume",
  /** The activation request this tab is approving (the id only). */
  activationRequest: "cleanSpace.activate.request",
} as const;

/** This tab's sessionStorage, or null where it can't be used. */
export function sessionStore(): KeyValueStore | null {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return null;
    const probe = "cleanSpace.probe";
    window.sessionStorage.setItem(probe, "1");
    window.sessionStorage.removeItem(probe);
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readJSON(store: KeyValueStore | null, key: string): unknown {
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/** Saves and reads back: false when the value can't be kept (storage full or blocked). */
export function writeJSON(store: KeyValueStore | null, key: string, value: unknown): boolean {
  if (!store) return false;
  try {
    const text = JSON.stringify(value);
    store.setItem(key, text);
    return store.getItem(key) === text;
  } catch {
    return false;
  }
}

export function removeKey(store: KeyValueStore | null, key: string): void {
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    // Nothing to remove.
  }
}

/** A Map-backed store for tests and for pages whose storage is blocked (state then lasts as long as the page). */
export function memoryStore(): KeyValueStore & { size(): number } {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
    size: () => map.size,
  };
}
