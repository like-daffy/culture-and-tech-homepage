/**
 * Firebase for Clean Space's account, sign-in and activation pages: a named web app, `clean-space`, of the Clean Space
 * licensing project, loaded on first use. Its sign-in is stored under its own name, apart from any other product's
 * Firebase app on this origin. The central checkout's Clean Space pages (other page loads: every link between them is a
 * full navigation) make their own app of the same project for the checkout's callables, without Auth
 * (src/lib/checkout/api.ts). Only types are imported statically, so pages that never call it never download Firebase,
 * and nothing runs while the static pages are pre-rendered.
 */
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Functions } from "firebase/functions";
import { createCallableApi, type CleanSpaceApi } from "./api";
import type { BEGIN_CHECKOUT } from "./checkout-handoff";
import { CLEAN_SPACE } from "./config";
import type { CallableName } from "./contract.generated";

export const CLEAN_SPACE_FIREBASE_APP_NAME = "clean-space";

export interface CleanSpaceFirebase {
  app: FirebaseApp;
  auth: Auth;
  functions: Functions;
}

export class CleanSpaceNotConfiguredError extends Error {
  constructor() {
    super("Clean Space's account pages are not configured in this build.");
    this.name = "CleanSpaceNotConfiguredError";
  }
}

let services: Promise<CleanSpaceFirebase> | null = null;

/** The named app and its services, initialised once. Rejects without a configuration. */
export function getCleanSpaceFirebase(): Promise<CleanSpaceFirebase> {
  if (!CLEAN_SPACE.configured) return Promise.reject(new CleanSpaceNotConfiguredError());
  if (!services) {
    const loading = initialize();
    services = loading;
    // A failed download (offline) may be retried by the next call.
    loading.catch(() => {
      if (services === loading) services = null;
    });
  }
  return services;
}

async function initialize(): Promise<CleanSpaceFirebase> {
  const emulator = CLEAN_SPACE.environment === "emulator";
  const siteKey = CLEAN_SPACE.recaptchaSiteKey;
  const [appModule, authModule, functionsModule, appCheckModule] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
    import("firebase/functions"),
    siteKey || emulator ? import("firebase/app-check") : Promise.resolve(null),
  ]);
  const app =
    appModule.getApps().find((existing) => existing.name === CLEAN_SPACE_FIREBASE_APP_NAME) ??
    appModule.initializeApp(CLEAN_SPACE.firebase, CLEAN_SPACE_FIREBASE_APP_NAME);

  // App Check before any request: the callables may refuse requests without a token (plan §8.4).
  if (appCheckModule && siteKey && !emulator) {
    appCheckModule.initializeAppCheck(app, {
      provider: new appCheckModule.ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } else if (appCheckModule && emulator) {
    // The Functions emulator decodes App Check tokens without verifying them; this unsigned stand-in exists only in an
    // emulator build (config-rules refuses emulator settings anywhere else), and real App Check would refuse it.
    const part = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, "");
    const token = `${part({ alg: "none", typ: "JWT" })}.${part({ sub: "emulator", iss: "emulator", exp: 4102444800 })}.`;
    appCheckModule.initializeAppCheck(app, {
      provider: new appCheckModule.CustomProvider({ getToken: async () => ({ token, expireTimeMillis: Date.now() + 3_600_000 }) }),
      isTokenAutoRefreshEnabled: false,
    });
  }

  const auth = authModule.getAuth(app);
  if (typeof document !== "undefined" && document.documentElement.lang) auth.languageCode = document.documentElement.lang;
  const functions = functionsModule.getFunctions(app, CLEAN_SPACE.functionsRegion);
  if (emulator) {
    // The Clean Space emulator suite's ports (mac-get-space services/licensing/firebase.json), apart from Chord to MIDI's.
    authModule.connectAuthEmulator(auth, `http://${CLEAN_SPACE.emulatorHost}:9199`, { disableWarnings: true });
    functionsModule.connectFunctionsEmulator(functions, CLEAN_SPACE.emulatorHost, 5101);
  }
  return { app, auth, functions };
}

/** Calls a callable of the Clean Space service. */
export async function callCleanSpace<Request, Response>(name: CallableName | typeof BEGIN_CHECKOUT, data: Request): Promise<Response> {
  const [{ functions }, { httpsCallable }] = await Promise.all([getCleanSpaceFirebase(), import("firebase/functions")]);
  const result = await httpsCallable<Request, Response>(functions, name, { timeout: 30_000 })(data);
  return result.data;
}

/** The service as the pages use it. */
export const cleanSpaceApi: CleanSpaceApi = createCallableApi(callCleanSpace);
