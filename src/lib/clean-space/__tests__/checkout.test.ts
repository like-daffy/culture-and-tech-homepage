import { describe, expect, it } from "vitest";
import {
  checkoutView,
  isBuyerCancel,
  loadIntent,
  loadResume,
  orderBlocker,
  parseFailParams,
  parseSuccessParams,
  purchasableCurrencies,
  saveIntent,
  saveResume,
  type CheckoutInputs,
} from "../checkout-machine";
import { memoryStore } from "../storage";
import { account, accountSummary, NOW, offer } from "./fake-api";

const ready = <T,>(value: T) => ({ status: "ready" as const, value });
const base: CheckoutInputs = {
  configured: true,
  salesEnabled: true,
  policiesPublished: true,
  offer: ready(offer()),
  auth: "signed-in",
  account: ready(account()),
};
const kind = (input: Partial<CheckoutInputs>) => checkoutView({ ...base, ...input }).kind;
const error = { status: "unavailable", code: null, message: "x", retryable: true };

describe("the checkout page's states", () => {
  it("is unavailable until configured, switched on and the policies are published (default: closed)", () => {
    expect(checkoutView({ ...base, configured: false })).toEqual({ kind: "unavailable", reason: "not-configured" });
    expect(checkoutView({ ...base, salesEnabled: false })).toEqual({ kind: "unavailable", reason: "sales-disabled" });
    expect(checkoutView({ ...base, policiesPublished: false })).toEqual({ kind: "unavailable", reason: "policies-unpublished" });
  });

  it("follows the service's sale gate and currencies", () => {
    expect(checkoutView({ ...base, offer: ready(offer({ salesOpen: false })) })).toMatchObject({ kind: "unavailable", reason: "sales-closed" });
    const none = offer({ prices: offer().prices.map((p) => ({ ...p, available: false })) });
    expect(checkoutView({ ...base, offer: ready(none) })).toMatchObject({ kind: "unavailable", reason: "no-currency" });
    expect(checkoutView({ ...base, offer: { status: "error", error } })).toMatchObject({ kind: "unavailable", reason: "offer-error" });
    expect(purchasableCurrencies(offer({ prices: [{ currency: "KRW", amountMinor: 3300, available: false }, { currency: "USD", amountMinor: 249, available: true }] }))).toEqual(["USD"]);
  });

  it("asks a signed-out visitor to sign in, showing the offer", () => {
    expect(kind({ auth: "signed-out", account: null })).toBe("signed-out");
    expect(kind({ auth: "loading", account: null })).toBe("loading");
    expect(kind({ offer: { status: "loading" } })).toBe("loading");
  });

  it("needs a verified receipt address before checkout", () => {
    expect(kind({ account: ready(account({ account: accountSummary({ contact: null }) })) })).toBe("contact-required");
  });

  it("refuses a second purchase during an active term, and offers one again after it ended", () => {
    const active = account({ license: { productID: "clean_space_unlock_364d", status: "active", startsAt: NOW - 100, expiresAt: NOW + 1000, revision: 1 } });
    expect(checkoutView({ ...base, account: ready(active) })).toMatchObject({ kind: "already-active", expiresAt: NOW + 1000 });
    const expired = account({ license: { productID: "clean_space_unlock_364d", status: "expired", startsAt: NOW - 2000, expiresAt: NOW - 1000, revision: 1 } });
    expect(checkoutView({ ...base, account: ready(expired) })).toMatchObject({ kind: "ready", previousEndedAt: NOW - 1000 });
  });

  it("takes no order for an account being deleted, or whose summary failed", () => {
    expect(kind({ account: ready(account({ deletionRequestedAt: NOW })) })).toBe("deleting");
    expect(kind({ account: { status: "error", error } })).toBe("account-error");
  });

  it("needs a currency it offers, a country for dollars and every current policy accepted", () => {
    const view = checkoutView(base);
    const accepted = offer().policyVersions;
    expect(orderBlocker(view, { currency: null, buyerCountry: null, accepted })).toBe("currency");
    expect(orderBlocker(view, { currency: "USD", buyerCountry: null, accepted })).toBe("country");
    expect(orderBlocker(view, { currency: "USD", buyerCountry: "US", accepted })).toBeNull();
    expect(orderBlocker(view, { currency: "KRW", buyerCountry: null, accepted: { ...accepted, refunds: "2026-01-01" } })).toBe("policies");
    expect(orderBlocker(view, { currency: "KRW", buyerCountry: null, accepted })).toBeNull();
    expect(orderBlocker(checkoutView({ ...base, auth: "signed-out", account: null }), { currency: "KRW", buyerCountry: null, accepted })).toBe("not-ready");
  });
});

describe("what the tab keeps", () => {
  it("keeps the unpaid choices across a sign-in for an hour", () => {
    const store = memoryStore();
    saveIntent(store, { currency: "USD", buyerCountry: "JP", accepted: offer().policyVersions }, 1000);
    expect(loadIntent(store, 1000 + 59 * 60_000)).toMatchObject({ currency: "USD", buyerCountry: "JP" });
    expect(loadIntent(store, 1000 + 61 * 60_000)).toBeNull();
  });

  it("keeps a payment's resume handle until it expires", () => {
    const store = memoryStore();
    expect(saveResume(store, { resumeID: "R".repeat(43), expiresAt: NOW + 600 })).toBe(true);
    expect(loadResume(store, NOW)).toEqual({ resumeID: "R".repeat(43), expiresAt: NOW + 600 });
    expect(loadResume(store, NOW + 600)).toBeNull();
    expect(loadResume(store, NOW)).toBeNull();
  });
});

describe("Toss's redirect parameters", () => {
  it("accepts only an order id, payment key and amount in their formats", () => {
    expect(parseSuccessParams(new URLSearchParams("paymentType=NORMAL&orderId=cs_AAAAAAAAAAAAAAAAAAAAAA&paymentKey=tgen_20261107abc&amount=2.49"))).toEqual({
      orderID: "cs_AAAAAAAAAAAAAAAAAAAAAA",
      paymentKey: "tgen_20261107abc",
      amount: 2.49,
    });
    expect(parseSuccessParams(new URLSearchParams("orderId=other&paymentKey=tgen_20261107abc&amount=3300"))).toBeNull();
    expect(parseSuccessParams(new URLSearchParams("orderId=cs_AAAAAAAAAAAAAAAAAAAAAA&paymentKey=tgen_20261107abc&amount=1e3"))).toBeNull();
    expect(parseSuccessParams(new URLSearchParams("orderId=cs_AAAAAAAAAAAAAAAAAAAAAA&amount=3300"))).toBeNull();
  });

  it("reads a fail redirect, with or without an order", () => {
    expect(parseFailParams(new URLSearchParams("code=PAY_PROCESS_CANCELED&message=취소&orderId=cs_AAAAAAAAAAAAAAAAAAAAAA"))).toEqual({
      code: "PAY_PROCESS_CANCELED",
      message: "취소",
      orderID: "cs_AAAAAAAAAAAAAAAAAAAAAA",
    });
    expect(parseFailParams(new URLSearchParams("code=<script>&orderId=x"))).toEqual({ code: "UNKNOWN", message: "", orderID: null });
    expect(isBuyerCancel("PAY_PROCESS_CANCELED")).toBe(true);
    expect(isBuyerCancel("REJECT_CARD_COMPANY")).toBe(false);
  });
});
