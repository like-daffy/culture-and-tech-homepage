/**
 * A product's checkout callables, called from this site: a Firebase app of the product's own project (named after the
 * product, never this site's) with App Check (reCAPTCHA Enterprise) and Cloud Functions only. No Firebase Auth: the
 * checkout session's id and key stand for the buyer's account, and nothing of the buyer's sign-in on the product's
 * site ever comes here. Each product's app is loaded on its first use, and a product whose checkout is closed in this
 * build is never called.
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
import { isProductConfigured, type OpenProduct, type ProductSlug } from "./products";

const loaded = new Map<ProductSlug, Promise<Functions>>();

function services(product: OpenProduct): Promise<Functions> {
  if (!isProductConfigured(product)) return Promise.reject(new Error("The checkout is not configured."));
  let functions = loaded.get(product.slug);
  if (!functions) {
    const loading = initialize(product);
    functions = loading;
    loaded.set(product.slug, loading);
    // A failed download (offline) may be retried by the next call.
    loading.catch(() => {
      if (loaded.get(product.slug) === loading) loaded.delete(product.slug);
    });
  }
  return functions;
}

async function initialize(product: OpenProduct): Promise<Functions> {
  const [appModule, appCheckModule, functionsModule] = await Promise.all([
    import("firebase/app"),
    import("firebase/app-check"),
    import("firebase/functions"),
  ]);
  const app =
    appModule.getApps().find((candidate) => candidate.name === product.slug) ??
    appModule.initializeApp(product.firebase, product.slug);

  // App Check before any call: the callables refuse requests without a token.
  if (product.emulators) {
    // The Functions emulator decodes App Check tokens without verifying them: an unsigned stand-in lets the callables
    // through. Only a test build (the product's NEXT_PUBLIC_…_EMULATORS=1) runs this; the real App Check refuses it.
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
      provider: new appCheckModule.ReCaptchaEnterpriseProvider(product.recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }

  const instance = functionsModule.getFunctions(app, product.region);
  if (product.emulators) {
    const { host, port } = product.functionsEmulator ?? { host: "127.0.0.1", port: 5001 };
    functionsModule.connectFunctionsEmulator(instance, host, port);
  }
  return instance;
}

async function call<Request, Response>(product: OpenProduct, name: CallableName, data: Request): Promise<Response> {
  const [instance, { httpsCallable }] = await Promise.all([services(product), import("firebase/functions")]);
  const result = await httpsCallable<Request, Response>(instance, name)(data);
  return result.data;
}

/** Binds this page's key to the checkout with the handoff code, or opens the checkout it holds again. */
export const openCheckout = (product: OpenProduct, request: OpenCheckoutRequest) =>
  call<OpenCheckoutRequest, OpenCheckoutResponse>(product, CALLABLE.openCheckout, request);

/** After the buyer chose a currency and agreed: the order, at the server's price. */
export const createCheckoutOrder = (product: OpenProduct, request: CreateCheckoutOrderRequest) =>
  call<CreateCheckoutOrderRequest, CreateOrderResponse>(product, CALLABLE.createCheckoutOrder, request);

/** The success page, with Toss's parameters: approves the payment and grants the product (a reload gets the same answer). */
export const confirmCheckoutPayment = (product: OpenProduct, request: ConfirmCheckoutPaymentRequest) =>
  call<ConfirmCheckoutPaymentRequest, ConfirmPaymentResponse>(product, CALLABLE.confirmCheckoutPayment, request);

/** The fail page, with Toss's parameters, when they include an orderId. */
export const failCheckoutOrder = (product: OpenProduct, request: FailCheckoutOrderRequest) =>
  call<FailCheckoutOrderRequest, FailOrderResponse>(product, CALLABLE.failCheckoutOrder, request);

/** A payment that came back without its checkout: kept for its buyer to finish signed in on the product's site. */
export const preparePaymentResume = (product: OpenProduct, request: PreparePaymentResumeRequest) =>
  call<PreparePaymentResumeRequest, PreparePaymentResumeResponse>(product, CALLABLE.preparePaymentResume, request);

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
