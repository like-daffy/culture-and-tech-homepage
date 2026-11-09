/**
 * The Clean Space licensing service as the pages call it: one typed method per callable the account, sign-in and
 * activation pages use. The pages depend on this interface only, so the tests give them a fake one; `firebase.ts` makes
 * the real one from Firebase's callable functions on the named `clean-space` app (App Check and the signed-in user's ID
 * token go with each call). The payment itself is the central checkout's (src/lib/checkout/), which calls the same
 * service's checkout callables from its own pages: these pages only start it (beginCheckout) and finish a payment it
 * kept for its buyer (confirmPayment with a resume id). A refund request is an email to support (the account page's
 * mailto link, as Chord to MIDI's), so the service's requestRefund callable isn't used here.
 */
import {
  CALLABLE,
  type ApproveActivationRequest,
  type ApproveActivationResponse,
  type BeginEmailLinkRequest,
  type BeginEmailLinkResponse,
  type CompleteEmailSignInRequest,
  type CompleteEmailSignInResponse,
  type BeginContactVerificationRequest,
  type BeginContactVerificationResponse,
  type CallableName,
  type ConfirmContactVerificationRequest,
  type ConfirmContactVerificationResponse,
  type ConfirmPaymentRequest,
  type ConfirmPaymentResponse,
  type DenyActivationRequest,
  type DenyActivationResponse,
  type EndNativeSessionsResponse,
  type ErrorCode,
  type GetAccountPurchasesResponse,
  type GetAccountResponse,
  type GetOfferResponse,
  type InspectActivationRequest,
  type InspectActivationResponse,
  type LinkProviderRequest,
  type LinkProviderResponse,
  type RequestAccountDeletionRequest,
  type RequestAccountDeletionResponse,
  type SignInWithProviderRequest,
  type SignInWithProviderResponse,
  type UnlinkProviderRequest,
  type UnlinkProviderResponse,
} from "./contract.generated";
import { BEGIN_CHECKOUT, type BeginCheckoutRequest, type BeginCheckoutResponse } from "./checkout-handoff";

/** confirmPayment as the account page sends it: only the resume id of a payment the checkout kept for its buyer. */
export type ResumePaymentRequest = Extract<ConfirmPaymentRequest, { resumeID: string }>;

export interface CleanSpaceApi {
  getOffer(): Promise<GetOfferResponse>;
  signInWithProvider(request: SignInWithProviderRequest): Promise<SignInWithProviderResponse>;
  /** Binds an email sign-in link that adds the email method to the signed-in account (before Firebase sends it). */
  beginEmailLink(request: BeginEmailLinkRequest): Promise<BeginEmailLinkResponse>;
  /** "Continue with email": the service redeems the emailed link's one-time code and answers with its own session. */
  completeEmailSignIn(request: CompleteEmailSignInRequest): Promise<CompleteEmailSignInResponse>;
  getAccount(): Promise<GetAccountResponse>;
  beginContactVerification(request: BeginContactVerificationRequest): Promise<BeginContactVerificationResponse>;
  confirmContactVerification(request: ConfirmContactVerificationRequest): Promise<ConfirmContactVerificationResponse>;
  linkProvider(request: LinkProviderRequest): Promise<LinkProviderResponse>;
  unlinkProvider(request: UnlinkProviderRequest): Promise<UnlinkProviderResponse>;
  requestAccountDeletion(request: RequestAccountDeletionRequest): Promise<RequestAccountDeletionResponse>;
  endNativeSessions(): Promise<EndNativeSessionsResponse>;
  /** The account page's purchase: a checkout session for the signed-in account, on the central checkout's page. */
  beginCheckout(request: BeginCheckoutRequest): Promise<BeginCheckoutResponse>;
  /** A payment the checkout kept for its buyer (`?resume=` on the account page), finished signed in to that account. */
  confirmPayment(request: ResumePaymentRequest): Promise<ConfirmPaymentResponse>;
  getAccountPurchases(): Promise<GetAccountPurchasesResponse>;
  inspectActivation(request: InspectActivationRequest): Promise<InspectActivationResponse>;
  approveActivation(request: ApproveActivationRequest): Promise<ApproveActivationResponse>;
  denyActivation(request: DenyActivationRequest): Promise<DenyActivationResponse>;
}

/** Sends one callable request and gives its result's data. */
export type CallableTransport = <Request, Response>(name: CallableName | typeof BEGIN_CHECKOUT, data: Request) => Promise<Response>;

export function createCallableApi(call: CallableTransport): CleanSpaceApi {
  return {
    getOffer: () => call(CALLABLE.getOffer, {}),
    signInWithProvider: (request) => call(CALLABLE.signInWithProvider, request),
    beginEmailLink: (request) => call(CALLABLE.beginEmailLink, request),
    completeEmailSignIn: (request) => call(CALLABLE.completeEmailSignIn, request),
    getAccount: () => call(CALLABLE.getAccount, {}),
    beginContactVerification: (request) => call(CALLABLE.beginContactVerification, request),
    confirmContactVerification: (request) => call(CALLABLE.confirmContactVerification, request),
    linkProvider: (request) => call(CALLABLE.linkProvider, request),
    unlinkProvider: (request) => call(CALLABLE.unlinkProvider, request),
    requestAccountDeletion: (request) => call(CALLABLE.requestAccountDeletion, request),
    endNativeSessions: () => call(CALLABLE.endNativeSessions, {}),
    beginCheckout: (request) => call(BEGIN_CHECKOUT, request),
    confirmPayment: (request) => call(CALLABLE.confirmPayment, request),
    getAccountPurchases: () => call(CALLABLE.getAccountPurchases, {}),
    inspectActivation: (request) => call(CALLABLE.inspectActivation, request),
    approveActivation: (request) => call(CALLABLE.approveActivation, request),
    denyActivation: (request) => call(CALLABLE.denyActivation, request),
  };
}

export interface ErrorInfo {
  /** The callable status without "functions/": "unavailable", "failed-precondition", "unauthenticated", … */
  status: string;
  /** The service's code (details.code), or null when there is none (the network, Firebase itself). */
  code: ErrorCode | null;
  /** The service's English message, safe to show; otherwise a generic one (never a raw stack or token). */
  message: string;
  /** The same call may work if repeated (network, timeouts, the service briefly unavailable). */
  retryable: boolean;
  tossCode?: string;
  tossMessage?: string;
  retryAfterSeconds?: number;
}

const RETRYABLE_STATUSES = new Set(["unavailable", "deadline-exceeded", "internal", "aborted", "resource-exhausted"]);

/** What to show for an error from any callable (FunctionsError, a network failure, or anything else). */
export function describeError(error: unknown): ErrorInfo {
  type Fields = { code?: unknown; message?: unknown; details?: unknown };
  const fields: Fields = typeof error === "object" && error !== null ? (error as Fields) : {};
  const status = typeof fields.code === "string" ? fields.code.replace(/^functions\//, "") : "unknown";
  const details = typeof fields.details === "object" && fields.details !== null ? (fields.details as Record<string, unknown>) : null;
  const code = typeof details?.code === "string" && /^[A-Z][A-Z0-9_]{1,63}$/.test(details.code) ? (details.code as ErrorCode) : null;
  const message =
    code !== null && typeof details?.message === "string" && details.message.length <= 500
      ? details.message
      : RETRYABLE_STATUSES.has(status) || status === "unknown"
        ? "The Clean Space service could not be reached. Check your connection and try again."
        : "Something went wrong. Try again, or contact support if it keeps happening.";
  const info: ErrorInfo = { status, code, message, retryable: RETRYABLE_STATUSES.has(status) || status === "unknown" };
  if (typeof details?.tossCode === "string") info.tossCode = details.tossCode;
  if (typeof details?.tossMessage === "string" && details.tossMessage.length <= 500) info.tossMessage = details.tossMessage;
  if (typeof details?.retryAfterSeconds === "number" && Number.isFinite(details.retryAfterSeconds)) info.retryAfterSeconds = details.retryAfterSeconds;
  return info;
}
