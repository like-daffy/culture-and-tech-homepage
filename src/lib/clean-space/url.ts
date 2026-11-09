/**
 * Taking secrets out of the address bar (plan §5.1: "Strip OAuth/payment query parameters promptly after capturing
 * them"). The callback, success and fail pages read their query once and replace the address with the bare path
 * before anything else runs; the activation page does the same with its `#request=…` fragment, which browsers send to
 * no server and in no Referer. Each capture happens once per page load and is kept in memory, so React StrictMode's
 * second effect, or a component mounted later, reads the same values instead of an address that no longer has them.
 */
import { isId43 } from "./contract.generated";

export interface LocationLike {
  pathname: string;
  search: string;
  hash: string;
}

export interface HistoryLike {
  state: unknown;
  replaceState(data: unknown, unused: string, url?: string | null): void;
}

/**
 * Replaces the current history entry with the bare path. Next.js keeps its own copy of the address in the history
 * state (`as`, `url`); those lose the query and fragment too. Returns the clean address.
 */
export function stripAddress(location: LocationLike, history: HistoryLike): string {
  const clean = location.pathname;
  const state = history.state;
  const cleanState =
    typeof state === "object" && state !== null ? { ...(state as Record<string, unknown>), as: clean, url: (state as Record<string, unknown>).url && clean } : state;
  history.replaceState(cleanState, "", clean);
  return clean;
}

const captures = new Map<string, string>();

/**
 * The query of this page load, read once: the first call takes it and strips the address; later calls get the same
 * values. `afterStrip` lets the page bring Next.js's router in line (a shallow replace to the clean path).
 */
export function takeQueryOnce(location: LocationLike, history: HistoryLike, afterStrip?: (clean: string) => void): URLSearchParams {
  const key = `query:${location.pathname}`;
  if (!captures.has(key)) {
    captures.set(key, location.search);
    if (location.search || location.hash) {
      const clean = stripAddress(location, history);
      afterStrip?.(clean);
    }
  }
  return new URLSearchParams(captures.get(key) ?? "");
}

/** The fragment of this page load, read once and stripped the same way. */
export function takeFragmentOnce(location: LocationLike, history: HistoryLike, afterStrip?: (clean: string) => void): string {
  const key = `hash:${location.pathname}`;
  if (!captures.has(key)) {
    captures.set(key, location.hash);
    if (location.hash || location.search) {
      const clean = stripAddress(location, history);
      afterStrip?.(clean);
    }
  }
  return captures.get(key) ?? "";
}

/** The activation request id in `#request=<43 base64url characters>`, and nothing else; null for anything else. */
export function parseActivationFragment(hash: string): string | null {
  const match = /^#request=([A-Za-z0-9_-]+)$/.exec(hash);
  return match && isId43(match[1]) ? match[1] : null;
}

/** Tests only. */
export function resetCapturesForTests(): void {
  captures.clear();
}
