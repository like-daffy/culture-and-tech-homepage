/**
 * The activation page's request (plan §8.1): Clean Space on the Mac opens the page with only an opaque request id in
 * the fragment. The page keeps the id in this tab's sessionStorage (it survives a Kakao or Naver round trip), never in
 * a URL it builds, and forgets it once the request is decided or expired. Opening the page never approves anything:
 * approval is an explicit click that sends the confirmation code the page displayed.
 */
import { ACTIVATION_TTL_SECONDS, isId43, type InspectActivationResponse } from "./contract.generated";
import type { ErrorInfo } from "./api";
import type { AuthStatus, Loadable } from "./checkout-machine";
import { readJSON, removeKey, STORAGE_KEYS, writeJSON, type KeyValueStore } from "./storage";

export function rememberRequest(store: KeyValueStore | null, requestID: string, nowMs: number): boolean {
  if (!isId43(requestID)) return false;
  return writeJSON(store, STORAGE_KEYS.activationRequest, { requestID, at: nowMs });
}

/** The request this tab is approving, while it can still be pending (the service's TTL, with a minute of slack). */
export function recallRequest(store: KeyValueStore | null, nowMs: number): string | null {
  const value = readJSON(store, STORAGE_KEYS.activationRequest);
  if (typeof value !== "object" || value === null) return null;
  const { requestID, at } = value as Record<string, unknown>;
  if (!isId43(requestID) || typeof at !== "number" || nowMs - at > (ACTIVATION_TTL_SECONDS + 60) * 1000 || at - nowMs > 60_000) {
    removeKey(store, STORAGE_KEYS.activationRequest);
    return null;
  }
  return requestID;
}

export function forgetRequest(store: KeyValueStore | null): void {
  removeKey(store, STORAGE_KEYS.activationRequest);
}

export type ActivationView =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "no-request" }
  | { kind: "signed-out" }
  | { kind: "error"; error: ErrorInfo }
  | { kind: "not-found" }
  | { kind: "pending"; request: InspectActivationResponse }
  | { kind: "approved" }
  | { kind: "denied" }
  | { kind: "expired" }
  | { kind: "consumed" };

export interface ActivationInputs {
  configured: boolean;
  requestID: string | null;
  auth: AuthStatus;
  inspection: Loadable<InspectActivationResponse> | null;
  /** What this page did: approved or denied it just now. */
  decided: "approved" | "denied" | null;
  /** The service's time now (seconds), for expiry while the page is open. */
  serverNow: number;
}

export function activationView(input: ActivationInputs): ActivationView {
  if (!input.configured || input.auth === "unconfigured") return { kind: "unavailable" };
  if (input.decided) return { kind: input.decided };
  if (input.requestID === null) return { kind: "no-request" };
  if (input.auth === "loading") return { kind: "loading" };
  if (input.auth === "signed-out") return { kind: "signed-out" };
  if (!input.inspection || input.inspection.status === "loading") return { kind: "loading" };
  if (input.inspection.status === "error") {
    const code = input.inspection.error.code;
    if (code === "ACTIVATION_NOT_FOUND" || code === "NOT_FOUND") return { kind: "not-found" };
    if (code === "ACTIVATION_EXPIRED") return { kind: "expired" };
    return { kind: "error", error: input.inspection.error };
  }
  const request = input.inspection.value;
  switch (request.status) {
    case "pending":
      return request.expiresAt <= input.serverNow ? { kind: "expired" } : { kind: "pending", request };
    case "approved":
      return { kind: "approved" };
    case "denied":
      return { kind: "denied" };
    case "expired":
      return { kind: "expired" };
    case "consumed":
      return { kind: "consumed" };
    default:
      return { kind: "error", error: { status: "unknown", code: null, message: "The service answered with an unknown state.", retryable: true } };
  }
}
