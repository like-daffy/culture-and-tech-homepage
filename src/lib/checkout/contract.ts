/**
 * What the checkout pages exchange with Chord to MIDI's Cloud Functions (Firebase project chord-to-midi), which take
 * the payment: a copy of the parts of chord-to-midi-web's functions/src/contract.ts the checkout uses. Change both
 * together.
 */

export type Lang = "en" | "ko";
export type Currency = "KRW" | "USD";

/** Names of the callables the checkout calls. */
export const CALLABLE = {
  openCheckout: "openCheckout",
  createCheckoutOrder: "createCheckoutOrder",
  confirmCheckoutPayment: "confirmCheckoutPayment",
  failCheckoutOrder: "failCheckoutOrder",
  preparePaymentResume: "preparePaymentResume",
} as const;
export type CallableName = (typeof CALLABLE)[keyof typeof CALLABLE];

/** Codes in an error's `details.code` that come from Chord to MIDI rather than from Toss Payments. */
export const APP_ERROR = {
  termsNotAccepted: "TERMS_NOT_ACCEPTED",
  ageNotConfirmed: "AGE_NOT_CONFIRMED",
  alreadyAdFree: "ALREADY_AD_FREE",
  currencyUnavailable: "CURRENCY_UNAVAILABLE",
  amountMismatch: "AMOUNT_MISMATCH",
  notOrderOwner: "NOT_ORDER_OWNER",
  orderNotPayable: "ORDER_NOT_PAYABLE",
  checkoutInProgress: "CHECKOUT_IN_PROGRESS",
  accountDeleted: "ACCOUNT_DELETED",
  accountUnavailable: "ACCOUNT_UNAVAILABLE",
  emailNotConfirmed: "EMAIL_NOT_CONFIRMED",
  tooManyRequests: "TOO_MANY_REQUESTS",
  paymentResumeExpired: "PAYMENT_RESUME_EXPIRED",
  checkoutExpired: "CHECKOUT_EXPIRED",
} as const;

/** `details` of an error the callables throw. */
export interface ErrorDetails {
  code: string;
  message: string;
}

/** How the checkout page holds its session: the id from the handoff, and the random key the page made for it. */
export interface CheckoutCredential {
  checkoutId: string;
  checkoutKey: string;
}

/** The first open brings the handoff code, which binds the key to the session; later opens (a reload) the key alone. */
export interface OpenCheckoutRequest extends CheckoutCredential {
  handoffCode?: string;
}

/** A currency the checkout takes, and the Toss 결제위젯 of the MID that charges it. */
export interface CheckoutOption {
  currency: Currency;
  /** The server's price in this currency, which an order charges. */
  price: number;
  clientKey: string;
  variantKey: string;
  agreementVariantKey: string;
  /** The PayPal TEST checkout: test keys, PayPal Sandbox accounts and a test amount. */
  test: boolean;
}

export interface OpenCheckoutResponse {
  product: "remove_ads";
  lang: Lang;
  orderName: string;
  /** The account's confirmed email: the receipt address of an order made now. */
  receiptEmail: string;
  /** The currencies this checkout takes, won first. */
  options: CheckoutOption[];
  /** ISO 8601: the session ends. */
  expiresAt: string;
}

export interface CreateCheckoutOrderRequest extends CheckoutCredential {
  termsAccepted: true;
  ageConfirmed: true;
  currency: Currency;
}
export interface CreateOrderResponse {
  orderId: string;
  /** In `currency`; always the server's price. */
  amount: number;
  currency: Currency;
  orderName: string;
  /** Random, opaque Toss customerKey of the account. */
  customerKey: string;
  /** The account's confirmed email, frozen on the order: Toss sends the receipt there. */
  receiptEmail: string;
}

/** The query parameters Toss appends to the successUrl (`amount` as a number). */
export interface PaymentDetails {
  paymentKey: string;
  orderId: string;
  amount: number;
}
export type ConfirmCheckoutPaymentRequest = CheckoutCredential & PaymentDetails;
export interface ConfirmPaymentResponse {
  orderId: string;
  status: "PAID";
  method: string | null;
  provider?: string | null;
  currency?: Currency;
  /** ISO 8601. */
  approvedAt: string;
  receiptUrl: string | null;
  receiptEmail: string | null;
}

export interface FailCheckoutOrderRequest extends CheckoutCredential {
  orderId: string;
  code: string;
  message: string;
}
export interface FailOrderResponse {
  orderId: string;
  status: "FAILED";
}

/** Keeps Toss's parameters for the order's buyer, who finishes signed in on chord-to-midi.app. Needs no session. */
export type PreparePaymentResumeRequest = PaymentDetails;
export interface PreparePaymentResumeResponse {
  resumeId: string;
}
