/**
 * What the checkout page shows, as a pure function of what it knows (plan §9: signed out, contact verification,
 * preparing, ready, declined or cancelled, pending reconciliation, paid, already active, expired, sales unavailable).
 * The page renders the view and never decides a state itself, so the tests cover every state without a browser.
 */
import {
  isCurrency,
  type Currency,
  type GetAccountResponse,
  type GetOfferResponse,
  type PolicyVersions,
} from "./contract.generated";
import type { ErrorInfo } from "./api";
import { readJSON, removeKey, STORAGE_KEYS, writeJSON, type KeyValueStore } from "./storage";

export type Loadable<T> = { status: "loading" } | { status: "error"; error: ErrorInfo } | { status: "ready"; value: T };

export type AuthStatus = "loading" | "unconfigured" | "signed-out" | "signed-in";

export type UnavailableReason =
  /** The build has no Clean Space settings. */
  | "not-configured"
  /** The operator's switch is off (NEXT_PUBLIC_CLEAN_SPACE_SALES_ENABLED). */
  | "sales-disabled"
  /** The direct-sale policies are not published yet. */
  | "policies-unpublished"
  /** The service says sales are closed. */
  | "sales-closed"
  /** No currency can be paid now. */
  | "no-currency"
  /** The offer couldn't be read. */
  | "offer-error";

export type CheckoutView =
  | { kind: "loading" }
  | { kind: "unavailable"; reason: UnavailableReason; error?: ErrorInfo }
  | { kind: "signed-out"; offer: GetOfferResponse; currencies: Currency[] }
  | { kind: "account-error"; error: ErrorInfo }
  | { kind: "deleting"; requestedAt: number }
  | { kind: "already-active"; offer: GetOfferResponse; account: GetAccountResponse; expiresAt: number }
  | { kind: "contact-required"; offer: GetOfferResponse; account: GetAccountResponse }
  | { kind: "ready"; offer: GetOfferResponse; account: GetAccountResponse; currencies: Currency[]; previousEndedAt: number | null };

export interface CheckoutInputs {
  configured: boolean;
  salesEnabled: boolean;
  policiesPublished: boolean;
  offer: Loadable<GetOfferResponse>;
  auth: AuthStatus;
  /** Present once signed in. */
  account: Loadable<GetAccountResponse> | null;
}

/** The currencies that can be paid now: available in the offer, in the offer's order. */
export function purchasableCurrencies(offer: GetOfferResponse): Currency[] {
  return offer.prices.filter((price) => price.available && isCurrency(price.currency)).map((price) => price.currency);
}

export function checkoutView(input: CheckoutInputs): CheckoutView {
  if (!input.configured || input.auth === "unconfigured") return { kind: "unavailable", reason: "not-configured" };
  if (!input.salesEnabled) return { kind: "unavailable", reason: "sales-disabled" };
  if (!input.policiesPublished) return { kind: "unavailable", reason: "policies-unpublished" };
  if (input.offer.status === "loading") return { kind: "loading" };
  if (input.offer.status === "error") return { kind: "unavailable", reason: "offer-error", error: input.offer.error };
  const offer = input.offer.value;
  if (!offer.salesOpen) return { kind: "unavailable", reason: "sales-closed" };
  const currencies = purchasableCurrencies(offer);
  if (currencies.length === 0) return { kind: "unavailable", reason: "no-currency" };
  if (input.auth === "loading") return { kind: "loading" };
  if (input.auth === "signed-out") return { kind: "signed-out", offer, currencies };
  if (!input.account || input.account.status === "loading") return { kind: "loading" };
  if (input.account.status === "error") return { kind: "account-error", error: input.account.error };
  const account = input.account.value;
  if (account.deletionRequestedAt !== null) return { kind: "deleting", requestedAt: account.deletionRequestedAt };
  const license = account.license;
  if (license.status === "active" && license.expiresAt !== null) return { kind: "already-active", offer, account, expiresAt: license.expiresAt };
  if (account.account.contact === null) return { kind: "contact-required", offer, account };
  const previousEndedAt = license.status === "expired" ? license.expiresAt : null;
  return { kind: "ready", offer, account, currencies, previousEndedAt };
}

/** The buyer's unpaid choices, kept in this tab across a sign-in (plan §6.1: don't lose the unpaid checkout intent). */
export interface CheckoutIntent {
  currency: Currency | null;
  buyerCountry: string | null;
  /** The policy versions the buyer accepted; dropped when the offer's are different. */
  accepted: PolicyVersions | null;
  at: number;
}

/** How long the choices are kept. */
export const INTENT_TTL_MS = 60 * 60_000;

export function saveIntent(store: KeyValueStore | null, intent: Omit<CheckoutIntent, "at">, now: number): void {
  writeJSON(store, STORAGE_KEYS.checkoutIntent, { ...intent, at: now });
}

export function loadIntent(store: KeyValueStore | null, now: number): CheckoutIntent | null {
  const value = readJSON(store, STORAGE_KEYS.checkoutIntent);
  if (typeof value !== "object" || value === null) return null;
  const entry = value as Record<string, unknown>;
  if (typeof entry.at !== "number" || now - entry.at > INTENT_TTL_MS || entry.at - now > 60_000) {
    removeKey(store, STORAGE_KEYS.checkoutIntent);
    return null;
  }
  const accepted = entry.accepted;
  const validAccepted =
    typeof accepted === "object" &&
    accepted !== null &&
    ["terms", "privacy", "refunds"].every((k) => typeof (accepted as Record<string, unknown>)[k] === "string");
  return {
    currency: isCurrency(entry.currency) ? entry.currency : null,
    buyerCountry: typeof entry.buyerCountry === "string" && /^[A-Z]{2}$/.test(entry.buyerCountry) ? entry.buyerCountry : null,
    accepted: validAccepted ? (accepted as PolicyVersions) : null,
    at: entry.at,
  };
}

export function clearIntent(store: KeyValueStore | null): void {
  removeKey(store, STORAGE_KEYS.checkoutIntent);
}

export function samePolicies(a: PolicyVersions | null, b: PolicyVersions): boolean {
  return a !== null && a.terms === b.terms && a.privacy === b.privacy && a.refunds === b.refunds;
}

/** Whether the buyer may ask for an order now: a ready view, a currency it offers, a country for dollars, every policy accepted. */
export function orderBlocker(view: CheckoutView, choice: { currency: Currency | null; buyerCountry: string | null; accepted: PolicyVersions | null }): string | null {
  if (view.kind !== "ready") return "not-ready";
  if (choice.currency === null || !view.currencies.includes(choice.currency)) return "currency";
  if (choice.currency === "USD" && !choice.buyerCountry) return "country";
  if (!samePolicies(choice.accepted, view.offer.policyVersions)) return "policies";
  return null;
}

// ---- A payment's resume handle (the success page lost its sign-in) ----

export interface PaymentResume {
  resumeID: string;
  expiresAt: number;
}

export function saveResume(store: KeyValueStore | null, resume: PaymentResume): boolean {
  return writeJSON(store, STORAGE_KEYS.paymentResume, resume);
}

/** The resume handle this tab holds, if it hasn't expired (by the service's time, `nowSeconds`). */
export function loadResume(store: KeyValueStore | null, nowSeconds: number): PaymentResume | null {
  const value = readJSON(store, STORAGE_KEYS.paymentResume);
  if (typeof value !== "object" || value === null) return null;
  const { resumeID, expiresAt } = value as Record<string, unknown>;
  if (typeof resumeID !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(resumeID) || typeof expiresAt !== "number" || expiresAt <= nowSeconds) {
    removeKey(store, STORAGE_KEYS.paymentResume);
    return null;
  }
  return { resumeID, expiresAt };
}

export function clearResume(store: KeyValueStore | null): void {
  removeKey(store, STORAGE_KEYS.paymentResume);
}

/** Toss's success redirect parameters, checked: the order id and payment key in their formats, the amount a number. */
export function parseSuccessParams(params: URLSearchParams): { orderID: string; paymentKey: string; amount: number } | null {
  const orderID = params.get("orderId");
  const paymentKey = params.get("paymentKey");
  const amountText = params.get("amount");
  if (!orderID || !/^cs_[A-Za-z0-9_-]{22}$/.test(orderID)) return null;
  if (!paymentKey || !/^[A-Za-z0-9_-]{8,200}$/.test(paymentKey)) return null;
  if (!amountText || !/^\d{1,9}(\.\d{1,2})?$/.test(amountText)) return null;
  const amount = Number(amountText);
  return Number.isFinite(amount) && amount > 0 ? { orderID, paymentKey, amount } : null;
}

/** Toss's fail redirect parameters (a buyer's cancel may come without an order id). */
export function parseFailParams(params: URLSearchParams): { code: string; message: string; orderID: string | null } {
  const code = params.get("code") ?? "";
  const message = params.get("message") ?? "";
  const orderID = params.get("orderId");
  return {
    code: /^[A-Z0-9_]{1,64}$/.test(code) ? code : "UNKNOWN",
    message: message.slice(0, 300),
    orderID: orderID && /^cs_[A-Za-z0-9_-]{22}$/.test(orderID) ? orderID : null,
  };
}

/** Toss's codes for a payment the buyer stopped themselves. */
export function isBuyerCancel(code: string): boolean {
  return code === "PAY_PROCESS_CANCELED" || code === "USER_CANCEL";
}
