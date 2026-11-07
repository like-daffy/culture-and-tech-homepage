/**
 * Chord to MIDI's checkout callables, called from this site: a Firebase app of the chord-to-midi project with App Check
 * (reCAPTCHA Enterprise) and Cloud Functions only. No Firebase Auth: the checkout session's id and key stand for the
 * buyer's account, and nothing of the buyer's sign-in on chord-to-midi.app ever comes here. Loaded on first use.
 */
import type { Functions } from "firebase/functions";
import {
  CALLABLE,
  type CallableName,
  type ConfirmCheckoutPaymentRequest,
  type ConfirmPaymentResponse,
  type CreateCheckoutOrderRequest,
  type CreateOrderResponse,
  type ErrorDetails,
  type FailCheckoutOrderRequest,
  type FailOrderResponse,
  type OpenCheckoutRequest,
  type OpenCheckoutResponse,
  type PreparePaymentResumeRequest,
  type PreparePaymentResumeResponse,
} from "./contract";
import {
  CHORD_TO_MIDI_FIREBASE,
  CHORD_TO_MIDI_RECAPTCHA_SITE_KEY,
  FUNCTIONS_REGION,
  isCheckoutConfigured,
  USES_EMULATORS,
} from "./config";

/** The Firebase app's name here: Chord to MIDI's project, never this site's own. */
const APP_NAME = "chord-to-midi";

let functions: Promise<Functions> | null = null;

function services(): Promise<Functions> {
  if (!isCheckoutConfigured()) return Promise.reject(new Error("The checkout is not configured."));
  if (!functions) {
    const loading = initialize();
    functions = loading;
    // A failed download (offline) may be retried by the next call.
    loading.catch(() => {
      if (functions === loading) functions = null;
    });
  }
  return functions;
}

async function initialize(): Promise<Functions> {
  const [appModule, appCheckModule, functionsModule] = await Promise.all([
    import("firebase/app"),
    import("firebase/app-check"),
    import("firebase/functions"),
  ]);
  const app =
    appModule.getApps().find((candidate) => candidate.name === APP_NAME) ??
    appModule.initializeApp(CHORD_TO_MIDI_FIREBASE, APP_NAME);

  // App Check before any call: the callables refuse requests without a token.
  if (USES_EMULATORS) {
    // The Functions emulator decodes App Check tokens without verifying them: an unsigned stand-in lets the callables
    // through. Only a test build (NEXT_PUBLIC_CHORD_TO_MIDI_EMULATORS=1) runs this; the real App Check refuses it.
    const part = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, "");
    const token = `${part({ alg: "none", typ: "JWT" })}.${part({ sub: "emulator", iss: "emulator", exp: 4102444800 })}.`;
    appCheckModule.initializeAppCheck(app, {
      provider: new appCheckModule.CustomProvider({
        getToken: async () => ({ token, expireTimeMillis: Date.now() + 3_600_000 }),
      }),
      isTokenAutoRefreshEnabled: false,
    });
  } else {
    appCheckModule.initializeAppCheck(app, {
      provider: new appCheckModule.ReCaptchaEnterpriseProvider(CHORD_TO_MIDI_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  }

  const instance = functionsModule.getFunctions(app, FUNCTIONS_REGION);
  if (USES_EMULATORS) functionsModule.connectFunctionsEmulator(instance, "127.0.0.1", 5001);
  return instance;
}

async function call<Request, Response>(name: CallableName, data: Request): Promise<Response> {
  const [instance, { httpsCallable }] = await Promise.all([services(), import("firebase/functions")]);
  const result = await httpsCallable<Request, Response>(instance, name)(data);
  return result.data;
}

/** Binds this page's key to the checkout with the handoff code, or opens the checkout it holds again. */
export const openCheckout = (request: OpenCheckoutRequest) =>
  call<OpenCheckoutRequest, OpenCheckoutResponse>(CALLABLE.openCheckout, request);

/** After the buyer chose a currency and agreed: the order, at the server's price. */
export const createCheckoutOrder = (request: CreateCheckoutOrderRequest) =>
  call<CreateCheckoutOrderRequest, CreateOrderResponse>(CALLABLE.createCheckoutOrder, request);

/** The success page, with Toss's parameters: approves the payment and grants Remove Ads (a reload gets the same answer). */
export const confirmCheckoutPayment = (request: ConfirmCheckoutPaymentRequest) =>
  call<ConfirmCheckoutPaymentRequest, ConfirmPaymentResponse>(CALLABLE.confirmCheckoutPayment, request);

/** The fail page, with Toss's parameters, when they include an orderId. */
export const failCheckoutOrder = (request: FailCheckoutOrderRequest) =>
  call<FailCheckoutOrderRequest, FailOrderResponse>(CALLABLE.failCheckoutOrder, request);

/** A payment that came back without its checkout: kept for its buyer to finish signed in on chord-to-midi.app. */
export const preparePaymentResume = (request: PreparePaymentResumeRequest) =>
  call<PreparePaymentResumeRequest, PreparePaymentResumeResponse>(CALLABLE.preparePaymentResume, request);

export interface CallableErrorInfo {
  /** The callable error code without "functions/": "unavailable", "failed-precondition", … */
  status: string;
  /** details.code: a Toss Payments error code, or one of APP_ERROR. Null when there is none. */
  code: string | null;
  /** Toss's message (Korean) for Toss codes, otherwise the error message. */
  message: string;
  /** The same call may succeed if repeated (Toss or the network was unavailable, another payment was in progress). */
  retryable: boolean;
}

/** What to show for an error thrown by a callable or by Toss's SDK. */
export function describeCallableError(error: unknown): CallableErrorInfo {
  type Fields = { code?: unknown; message?: unknown; details?: unknown };
  const fields: Fields = typeof error === "object" && error !== null ? (error as Fields) : {};
  const status = typeof fields.code === "string" ? fields.code.replace(/^functions\//, "") : "unknown";
  const details = (typeof fields.details === "object" ? fields.details : null) as Partial<ErrorDetails> | null;
  const code = typeof details?.code === "string" ? details.code : null;
  return {
    status,
    code,
    message: code !== null && typeof details?.message === "string" ? details.message : String(fields.message ?? error),
    retryable: ["unavailable", "deadline-exceeded", "internal", "aborted"].includes(status),
  };
}
