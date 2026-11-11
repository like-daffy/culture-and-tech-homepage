/**
 * What the checkout pages exchange with a product's Cloud Functions, which take the payment: the same callables for
 * every product. Copied from chord-to-midi-web's functions/src/contract.ts and dj-duplicate-guard's
 * packages/commerce/src/checkout.ts; change them together.
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

/**
 * Codes in an error's `details.code` that come from the product's backend rather than from Toss Payments: Chord to
 * MIDI's, which DJ Duplicate Guard's CHECKOUT_ERROR shares for the same cases. A product's own code for an account
 * that already has it is in its entry (products.ts, `alreadyOwnedCode`).
 */
export const APP_ERROR = {
  termsNotAccepted: "TERMS_NOT_ACCEPTED",
  ageNotConfirmed: "AGE_NOT_CONFIRMED",
  alreadyAdFree: "ALREADY_AD_FREE",
  /** The product's server has its sales switch off, whatever a page shows. */
  salesClosed: "SALES_CLOSED",
  /** The offer or the policies the page showed aren't the server's current ones (OfferVersions): reload the page. */
  offerChanged: "OFFER_CHANGED",
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

/**
 * The versions of the offer and of the terms and refund policy that a product's server gives with the checkout and
 * takes back with its order: the page sends exactly what it was given, and the server takes only its current ones
 * (OFFER_CHANGED otherwise). Chord to MIDI's server gives them; a server that gives none gets none back.
 */
export interface OfferVersions {
  productVersion?: string;
  termsVersion?: string;
  refundPolicyVersion?: string;
}

export interface OpenCheckoutResponse extends OfferVersions {
  /** The product's own id on its orders (`remove_ads`, `expert_pass_364d`). */
  product: string;
  lang: Lang;
  orderName: string;
  /** The account's confirmed email: the receipt address of an order made now. */
  receiptEmail: string | null;
  review?: true;
  /** The currencies this checkout takes, won first. */
  options: CheckoutOption[];
  /** A pass's length in days, for a product sold as a pass (shown before payment); absent otherwise. */
  passDays?: number;
  /** ISO 8601: the session ends. */
  expiresAt: string;
}

export interface CreateCheckoutOrderRequest extends CheckoutCredential, OfferVersions {
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
  receiptEmail: string | null;
  review?: true;
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
  review?: true;
  /** A pass's start and end (ISO 8601 instants), for a product sold as a pass: shown with their time zone. */
  pass?: { start: string; end: string };
  /**
   * Whether Toss's test or live keys took it (portal contract rev 4.13, every product). A test payment's access ends
   * when paid sales open, so its 364-day dates are not shown.
   */
  environment?: "test" | "live";
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

/** Keeps Toss's parameters for the order's buyer, who finishes signed in on the product's site. Needs no session. */
export type PreparePaymentResumeRequest = PaymentDetails;
export interface PreparePaymentResumeResponse {
  resumeId: string;
}
