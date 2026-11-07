// A fake Clean Space service for the unit tests: answers shaped exactly as the contract says, records every call, and
// refuses the way the real callables do (an object with `code: "functions/<status>"` and `details: { code, message }`).
import type { CleanSpaceApi } from "../api";
import {
  DURATION_DAYS,
  DURATION_SECONDS,
  OFFER_PRICES,
  OFFER_VERSION,
  PRODUCT_DISPLAY_NAME,
  PRODUCT_ID,
  type AccountSummary,
  type CreateOrderResponse,
  type ErrorCode,
  type GetAccountResponse,
  type GetOfferResponse,
} from "../contract.generated";

export const NOW = 1_795_595_600;

export function serviceError(status: string, code: ErrorCode, message = "Refused."): Error & { code: string; details: unknown } {
  return Object.assign(new Error(message), { code: `functions/${status}`, details: { code, message } });
}

export function offer(overrides: Partial<GetOfferResponse> = {}): GetOfferResponse {
  return {
    contractVersion: 1,
    productID: PRODUCT_ID,
    offerVersion: OFFER_VERSION,
    displayName: PRODUCT_DISPLAY_NAME,
    durationDays: DURATION_DAYS,
    durationSeconds: DURATION_SECONDS,
    prices: [
      { ...OFFER_PRICES.KRW, available: true },
      { ...OFFER_PRICES.USD, available: true },
    ],
    salesOpen: true,
    policyVersions: { terms: "2026-11-07", privacy: "2026-11-07", refunds: "2026-11-07" },
    serverTime: NOW,
    ...overrides,
  };
}

export function accountSummary(overrides: Partial<AccountSummary> = {}): AccountSummary {
  return {
    accountID: "uid-buyer",
    providers: ["kakao"],
    displayLabel: "b•••@example.com",
    contact: { email: "buyer@example.com", verifiedAt: NOW - 600 },
    ...overrides,
  };
}

export function account(overrides: Partial<GetAccountResponse> = {}): GetAccountResponse {
  return {
    account: accountSummary(),
    license: { productID: PRODUCT_ID, status: "none", startsAt: null, expiresAt: null, revision: 0 },
    deletionRequestedAt: null,
    acceptedPolicies: null,
    nativeSessions: [],
    serverTime: NOW,
    ...overrides,
  };
}

export function order(overrides: Partial<CreateOrderResponse> = {}): CreateOrderResponse {
  return {
    orderID: "cs_AAAAAAAAAAAAAAAAAAAAAA",
    money: OFFER_PRICES.KRW,
    orderName: "Clean Space 364 days Unlock",
    customerKey: "ck_random_opaque_key_0001",
    receiptEmail: "buyer@example.com",
    payableUntil: NOW + 1800,
    toss: { clientKey: "test_gck_FAKE0000FAKE0000FAKE", variantKey: null, environment: "test" },
    durationDays: DURATION_DAYS,
    serverTime: NOW,
    ...overrides,
  };
}

type Calls = Array<{ method: keyof CleanSpaceApi; request: unknown }>;

/** A fake service: each method answers from `answers` (a value or a function of the request), or refuses. */
export function fakeApi(answers: Partial<Record<keyof CleanSpaceApi, unknown>> = {}): CleanSpaceApi & { calls: Calls } {
  const calls: Calls = [];
  const handler = (method: keyof CleanSpaceApi) => async (request?: unknown) => {
    calls.push({ method, request });
    const answer = answers[method];
    if (answer instanceof Error) throw answer;
    if (typeof answer === "function") return (answer as (r: unknown) => unknown)(request);
    if (answer === undefined) throw serviceError("unimplemented", "INTERNAL", `${method} not faked`);
    return answer;
  };
  const methods = [
    "getOffer", "signInWithProvider", "getAccount", "beginContactVerification", "confirmContactVerification", "linkProvider",
    "unlinkProvider", "requestAccountDeletion", "endNativeSessions", "createOrder", "confirmPayment", "failOrder",
    "preparePaymentResume", "getAccountPurchases", "requestRefund", "inspectActivation", "approveActivation", "denyActivation",
  ] as const;
  const api = Object.fromEntries(methods.map((m) => [m, handler(m)])) as unknown as CleanSpaceApi;
  return Object.assign(api, { calls });
}
