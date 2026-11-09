// The account page's purchase logic (checkout-handoff.ts): which checkout address it opens, what each refusal says,
// how a payment the checkout kept is held and finished, the test-payment signal and the refund email.
import { describe, expect, it } from "vitest";
import { createCallableApi, describeError } from "../api";
import {
  BEGIN_CHECKOUT,
  checkoutAddress,
  forgetResume,
  keepsResume,
  mailtoLink,
  parseResumeId,
  purchaseRefusal,
  recallResume,
  rememberResume,
  RESUME_TTL_MS,
  resumeRefusal,
  testCurrencies,
} from "../checkout-handoff";
import { CALLABLE, ERROR_CODE } from "../contract.generated";
import { ALREADY_OWNED_CODE } from "../site";
import { memoryStore, STORAGE_KEYS } from "../storage";
import { offer, serviceError } from "./fake-api";

const SITE = "https://cultureand.tech";
const HANDOFF = `#handoff=${"A".repeat(22)}.${"b".repeat(43)}`;
const RESUME = "R".repeat(43);

describe("the checkout address beginCheckout gives", () => {
  it("is opened only on this site's origin, on Clean Space's checkout page, with a handoff", () => {
    expect(checkoutAddress(`https://cultureand.tech/checkout/clean-space/${HANDOFF}`, SITE)).toBe(`https://cultureand.tech/checkout/clean-space/${HANDOFF}`);
    expect(checkoutAddress(`https://cultureand.tech/ko/checkout/clean-space/${HANDOFF}`, SITE)).toBe(`https://cultureand.tech/ko/checkout/clean-space/${HANDOFF}`);
    for (const bad of [
      `http://cultureand.tech/checkout/clean-space/${HANDOFF}`,
      `https://evil.example/checkout/clean-space/${HANDOFF}`,
      `https://cultureand.tech.evil.example/checkout/clean-space/${HANDOFF}`,
      `https://user@cultureand.tech/checkout/clean-space/${HANDOFF}`,
      `https://cultureand.tech/checkout/chord-to-midi/${HANDOFF}`,
      `https://cultureand.tech/checkout/clean-space/?next=x${HANDOFF}`,
      "https://cultureand.tech/checkout/clean-space/",
      "https://cultureand.tech/checkout/clean-space/#handoff=",
      "javascript:alert(1)",
      "/checkout/clean-space/",
      "",
      null,
      42,
    ]) {
      expect(checkoutAddress(bad, SITE)).toBeNull();
    }
  });

  it("follows a test build's own origin, which may be a local http server", () => {
    const local = "http://127.0.0.1:5000";
    expect(checkoutAddress(`http://127.0.0.1:5000/checkout/clean-space/${HANDOFF}`, local)).not.toBeNull();
    expect(checkoutAddress(`https://cultureand.tech/checkout/clean-space/${HANDOFF}`, local)).toBeNull();
    expect(checkoutAddress(`http://127.0.0.1:5000/checkout/clean-space/${HANDOFF}`, SITE)).toBeNull();
  });

  it("agrees with the contract's names once the pinned copy has them", () => {
    const callables = CALLABLE as Readonly<Record<string, string>>;
    expect(callables.beginCheckout ?? BEGIN_CHECKOUT).toBe(BEGIN_CHECKOUT);
    const codes = ERROR_CODE as Readonly<Record<string, string>>;
    expect(codes.alreadyActive).toBe(ALREADY_OWNED_CODE);
    for (const code of ["SALES_CLOSED", "CURRENCY_UNAVAILABLE", "ACCOUNT_DELETED", "CONTACT_NOT_VERIFIED", "CHECKOUT_IN_PROGRESS", "TOO_MANY_REQUESTS", "PAYMENT_PENDING", "NOT_ORDER_OWNER", "PAYMENT_RESUME_EXPIRED"]) {
      expect(Object.values(codes)).toContain(code);
    }
  });

  it("is asked for with the page's language only, by the callable's name", async () => {
    const calls: Array<[string, unknown]> = [];
    const api = createCallableApi(async (name, data) => {
      calls.push([name, data]);
      return { checkoutUrl: "x", openBefore: "2026-11-09T00:00:00Z" } as never;
    });
    await api.beginCheckout({ lang: "ko" });
    await api.confirmPayment({ resumeID: RESUME });
    expect(calls).toEqual([
      [BEGIN_CHECKOUT, { lang: "ko" }],
      ["confirmPayment", { resumeID: RESUME }],
    ]);
  });
});

describe("what a refused purchase says", () => {
  it("has its own words for each of the service's codes", () => {
    expect(purchaseRefusal(ALREADY_OWNED_CODE)).toBe("alreadyOwned");
    expect(ALREADY_OWNED_CODE).toBe("ALREADY_ACTIVE");
    expect(purchaseRefusal("SALES_CLOSED")).toBe("salesClosed");
    expect(purchaseRefusal("CURRENCY_UNAVAILABLE")).toBe("currencyUnavailable");
    expect(purchaseRefusal("ACCOUNT_DELETED")).toBe("accountDeleted");
    expect(purchaseRefusal("ACCOUNT_DISABLED")).toBe("accountUnavailable");
    expect(purchaseRefusal("EMAIL_NOT_CONFIRMED")).toBe("contactRequired");
    expect(purchaseRefusal("CONTACT_NOT_VERIFIED")).toBe("contactRequired");
    expect(purchaseRefusal("CHECKOUT_IN_PROGRESS")).toBe("inProgress");
    expect(purchaseRefusal("TOO_MANY_REQUESTS")).toBe("tooMany");
    expect(purchaseRefusal("SESSION_INVALID")).toBe("signInAgain");
  });

  it("shows the service's own message for anything else", () => {
    expect(purchaseRefusal(null)).toBeNull();
    expect(purchaseRefusal("INTERNAL")).toBeNull();
    expect(purchaseRefusal("constructor")).toBeNull();
    expect(describeError(serviceError("failed-precondition", "EMAIL_NOT_CONFIRMED", "Confirm it."))).toMatchObject({ code: "EMAIL_NOT_CONFIRMED", message: "Confirm it." });
    expect(describeError(serviceError("resource-exhausted", "TOO_MANY_REQUESTS"))).toMatchObject({ code: "TOO_MANY_REQUESTS", retryable: true });
  });
});

describe("a payment the checkout kept for its buyer", () => {
  it("takes a resume id and nothing else from the address", () => {
    expect(parseResumeId(RESUME)).toBe(RESUME);
    for (const bad of [null, undefined, "", "short", `${RESUME}x`, `${"R".repeat(42)}/`, `${RESUME}&next=https://evil.example`]) {
      expect(parseResumeId(bad)).toBeNull();
    }
  });

  it("is held in this tab while its buyer signs in, and only while recent", () => {
    const store = memoryStore();
    expect(rememberResume(store, "not-an-id", 0)).toBe(false);
    expect(rememberResume(store, RESUME, 1_000)).toBe(true);
    expect(recallResume(store, 1_000 + RESUME_TTL_MS)).toBe(RESUME);
    expect(recallResume(store, 1_001 + RESUME_TTL_MS)).toBeNull();
    expect(store.getItem(STORAGE_KEYS.paymentResume)).toBeNull();
    rememberResume(store, RESUME, 1_000);
    forgetResume(store);
    expect(recallResume(store, 1_000)).toBeNull();
    expect(recallResume(null, 1_000)).toBeNull();
  });

  it("is kept after a refusal it may get past, and dropped once the service settled it", () => {
    expect(resumeRefusal("PAYMENT_PENDING")).toBe("pending");
    expect(resumeRefusal("NOT_ORDER_OWNER")).toBe("wrongAccount");
    expect(resumeRefusal("PAYMENT_RESUME_EXPIRED")).toBe("expired");
    expect(resumeRefusal(ALREADY_OWNED_CODE)).toBe("alreadyOwned");
    expect(resumeRefusal("ACCOUNT_DELETED")).toBe("accountDeleted");
    expect(resumeRefusal("CHECKOUT_IN_PROGRESS")).toBe("inProgress");
    expect(resumeRefusal("PAYMENT_NOT_APPROVED")).toBeNull();
    expect([null, "pending", "wrongAccount", "inProgress"].every((refusal) => keepsResume(refusal as never))).toBe(true);
    expect(["expired", "alreadyOwned", "accountDeleted"].some((refusal) => keepsResume(refusal as never))).toBe(false);
  });
});

describe("the test-payment notice", () => {
  it("shows in a test build whenever a currency is for sale, since its service sells on test keys only", () => {
    expect(testCurrencies(offer(), "staging")).toEqual(["KRW", "USD"]);
    expect(testCurrencies(offer(), "emulator")).toEqual(["KRW", "USD"]);
  });

  it("shows in production only for a currency the offer marks as sold on test keys", () => {
    expect(testCurrencies(offer(), "production")).toEqual([]);
    const marked = offer({ prices: [{ currency: "KRW", amountMinor: 3300, available: true, test: true }, { currency: "USD", amountMinor: 249, available: true, test: false }] });
    expect(testCurrencies(marked, "production")).toEqual(["KRW"]);
    const unavailable = offer({ prices: [{ currency: "KRW", amountMinor: 3300, available: false, test: true }] });
    expect(testCurrencies(unavailable, "production")).toEqual([]);
  });
});

describe("a refund request", () => {
  it("is an email to support with the order number and the contact email, encoded", () => {
    const link = mailtoLink("contact@cultureand.tech", "환불 요청: cs_A", "주문번호: cs_A\n연락용 이메일: a+b@example.com\n사유(선택): ");
    expect(link.startsWith("mailto:contact@cultureand.tech?subject=")).toBe(true);
    const url = new URL(link);
    expect(url.searchParams.get("subject")).toBe("환불 요청: cs_A");
    expect(url.searchParams.get("body")).toBe("주문번호: cs_A\n연락용 이메일: a+b@example.com\n사유(선택): ");
    expect(link).not.toContain(" ");
  });
});
