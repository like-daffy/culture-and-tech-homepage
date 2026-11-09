/**
 * Kakao and Naver sign-in in the browser (plan §6.1). The page sends the browser to the provider with a random,
 * single-use state remembered in this tab together with what it is for: the provider, the exact redirect URI, the
 * intent (sign in, link, prove again), the account a link or a reauthentication is bound to, and an allow-listed page
 * to return to. The provider sends the browser back to the callback page with a code, which the service exchanges once
 * (signInWithProvider); for a sign-in the service's custom token signs the browser in. Codes, states and tokens never
 * go into another URL, and nothing is exchanged twice (React StrictMode's double effects, a reload, a second tab).
 *
 * Everything that touches the browser is passed in, so the tests run it without one.
 */
import {
  BROKERED_PROVIDERS,
  PAGE_PATH,
  type AccountSummary,
  type BrokeredProvider,
  type PageLang,
  type ReturnTarget,
  type SignInIntent,
} from "./contract.generated";
import type { CleanSpaceApi } from "./api";
import { parseReturnTarget } from "./return-target";
import { readJSON, removeKey, STORAGE_KEYS, writeJSON, type KeyValueStore } from "./storage";

/** How long a sign-in may take at the provider. */
export const SIGN_IN_TTL_MS = 15 * 60_000;

export type ProviderSignInFailure =
  /** The person cancelled at the provider (or refused consent). */
  | "cancelled"
  /** No sign-in was started in this tab, or its callback was used already (a reload). */
  | "missing"
  /** The callback's state isn't the one this tab made. */
  | "state"
  | "expired"
  /** sessionStorage can't be used here, so a sign-in can't be checked safely. */
  | "storage"
  /** Another account is signed in than the one that started a link or a reauthentication. */
  | "account-mismatch"
  | "signed-out"
  /** The provider isn't set up in this build. */
  | "unavailable"
  /** The service (or Firebase) refused: `cause` has its error. */
  | "refused";

export class ProviderSignInError extends Error {
  readonly reason: ProviderSignInFailure;
  readonly provider: BrokeredProvider | null;
  /** Where the sign-in meant to go, when known: the page to try again from. */
  readonly returnTo: ReturnTarget | null;
  readonly cause: unknown;

  constructor(reason: ProviderSignInFailure, provider: BrokeredProvider | null = null, returnTo: ReturnTarget | null = null, cause?: unknown) {
    super(`Sign-in failed: ${reason}`);
    this.name = "ProviderSignInError";
    this.reason = reason;
    this.provider = provider;
    this.returnTo = returnTo;
    this.cause = cause;
  }
}

/** The sign-in in progress in this tab. */
export interface PendingSignIn {
  state: string;
  provider: BrokeredProvider;
  intent: SignInIntent;
  /** link and reauth: the account that started them. */
  expectedUid: string | null;
  /** Exactly the redirect_uri sent to the provider: the token request repeats it. */
  redirectUri: string;
  returnTo: ReturnTarget;
  /** Date.now() when it started. */
  at: number;
}

export function isBrokeredProvider(value: unknown): value is BrokeredProvider {
  return typeof value === "string" && (BROKERED_PROVIDERS as readonly string[]).includes(value);
}

/** The callback page in a language, with its trailing slash: registered exactly so at the providers. */
export function callbackUri(lang: PageLang, origin: string): string {
  return `${origin}${PAGE_PATH.callback[lang]}`;
}

/** The provider's own host, or the fake providers of the end-to-end tests (emulator builds only). */
export function providerBase(provider: BrokeredProvider, providerEmulatorUrl = ""): string {
  if (providerEmulatorUrl) return `${providerEmulatorUrl.replace(/\/$/, "")}/${provider}/auth`;
  return provider === "kakao" ? "https://kauth.kakao.com" : "https://nid.naver.com";
}

/**
 * The provider's authorization URL. No scope is sent to Kakao: it asks for the consent items set in its console, and
 * the service copes with whatever the person agreed to (an email is optional; plan §6.2). A reauthentication makes
 * the person sign in to the provider again.
 */
export function authorizeUrl(
  provider: BrokeredProvider,
  options: { clientId: string; redirectUri: string; state: string; intent: SignInIntent; base: string },
): string {
  if (provider === "kakao") {
    const params = new URLSearchParams({
      client_id: options.clientId,
      redirect_uri: options.redirectUri,
      response_type: "code",
      state: options.state,
      ...(options.intent === "reauth" ? { prompt: "login" } : {}),
    });
    return `${options.base}/oauth/authorize?${params}`;
  }
  const params = new URLSearchParams({
    response_type: "code",
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    state: options.state,
    ...(options.intent === "reauth" ? { auth_type: "reauthenticate" } : {}),
  });
  return `${options.base}/oauth2.0/authorize?${params}`;
}

/** 32 random bytes, base64url (43 characters). */
export function randomState(getRandomValues: (bytes: Uint8Array) => Uint8Array = (bytes) => crypto.getRandomValues(bytes)): string {
  const bytes = getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export interface BeginOptions {
  clientId: string;
  origin: string;
  returnTo: ReturnTarget;
  intent: SignInIntent;
  /** link and reauth: the account signed in now. */
  expectedUid: string | null;
  providerEmulatorUrl?: string;
}

/**
 * Remembers the sign-in in this tab and gives the provider's URL to send the browser to. Throws when the provider
 * isn't set up, a link or reauthentication has no account, or this tab can't remember the sign-in.
 */
export function beginBrokeredSignIn(
  provider: BrokeredProvider,
  options: BeginOptions,
  deps: { store: KeyValueStore | null; now: () => number; random?: () => string },
): string {
  if (!options.clientId) throw new ProviderSignInError("unavailable", provider, options.returnTo);
  if (options.intent !== "signin" && !options.expectedUid) throw new ProviderSignInError("signed-out", provider, options.returnTo);
  const state = (deps.random ?? randomState)();
  const redirectUri = callbackUri(options.returnTo.lang, options.origin);
  const pending: PendingSignIn = {
    state,
    provider,
    intent: options.intent,
    expectedUid: options.intent === "signin" ? null : options.expectedUid,
    redirectUri,
    returnTo: options.returnTo,
    at: deps.now(),
  };
  if (!writeJSON(deps.store, STORAGE_KEYS.authPending, pending)) throw new ProviderSignInError("storage", provider, options.returnTo);
  return authorizeUrl(provider, {
    clientId: options.clientId,
    redirectUri,
    state,
    intent: options.intent,
    base: providerBase(provider, options.providerEmulatorUrl),
  });
}

/** Reads this tab's sign-in and forgets it at once, so its code is exchanged at most once. */
export function takePending(store: KeyValueStore | null): PendingSignIn | null {
  if (!store) throw new ProviderSignInError("storage");
  const value = readJSON(store, STORAGE_KEYS.authPending);
  removeKey(store, STORAGE_KEYS.authPending);
  if (typeof value !== "object" || value === null) return null;
  const entry = value as Record<string, unknown>;
  const returnTo = parseReturnTarget(entry.returnTo);
  const intent = entry.intent;
  if (
    !returnTo ||
    !isBrokeredProvider(entry.provider) ||
    (intent !== "signin" && intent !== "link" && intent !== "reauth") ||
    typeof entry.state !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(entry.state) ||
    typeof entry.redirectUri !== "string" ||
    typeof entry.at !== "number" ||
    (intent !== "signin" && typeof entry.expectedUid !== "string")
  ) {
    return null;
  }
  return {
    state: entry.state,
    provider: entry.provider,
    intent,
    expectedUid: intent === "signin" ? null : (entry.expectedUid as string),
    redirectUri: entry.redirectUri,
    returnTo,
    at: entry.at,
  };
}

export type CallbackCheck = { kind: "ok"; code: string; state: string; pending: PendingSignIn } | { kind: "failed"; error: ProviderSignInError };

/** Checks the provider's answer against this tab's sign-in (no network). */
export function checkCallback(params: URLSearchParams, pending: PendingSignIn | null, now: number): CallbackCheck {
  if (!pending) return { kind: "failed", error: new ProviderSignInError("missing") };
  const fail = (reason: ProviderSignInFailure): CallbackCheck => ({ kind: "failed", error: new ProviderSignInError(reason, pending.provider, pending.returnTo) });
  const state = params.get("state");
  if (state !== null && state !== pending.state) return fail("state");
  // Kakao: error=access_denied (consent refused); Naver: error=access_denied or error_description. Either way, cancelled.
  if (params.has("error")) return fail("cancelled");
  const code = params.get("code");
  if (!code || state === null) return fail("missing");
  if (code.length > 2048) return fail("missing");
  const age = now - pending.at;
  if (age > SIGN_IN_TTL_MS || age < -60_000) return fail("expired");
  return { kind: "ok", code, state, pending };
}

export interface FinishedSignIn {
  provider: BrokeredProvider;
  intent: SignInIntent;
  returnTo: ReturnTarget;
  account: AccountSummary;
  created: boolean;
}

export interface FinishDeps {
  store: KeyValueStore | null;
  now: () => number;
  api: Pick<CleanSpaceApi, "signInWithProvider">;
  /** The uid signed in now, once Firebase restored the session (null when none). */
  currentUid: () => Promise<string | null>;
  signInWithCustomToken: (token: string) => Promise<void>;
}

/** Completes a provider's callback: check, one exchange, then the browser signs in for a sign-in or reauthentication. */
export async function finishBrokeredSignIn(params: URLSearchParams, deps: FinishDeps): Promise<FinishedSignIn> {
  const checked = checkCallback(params, takePending(deps.store), deps.now());
  if (checked.kind === "failed") throw checked.error;
  const { pending, code, state } = checked;
  const { provider, intent, returnTo } = pending;
  if (intent !== "signin") {
    // Only for the account that started it: a code is never redeemed for whichever account is signed in now.
    if ((await deps.currentUid()) !== pending.expectedUid) throw new ProviderSignInError("account-mismatch", provider, returnTo);
  }
  try {
    const result = await deps.api.signInWithProvider({ provider, code, state, redirectUri: pending.redirectUri, intent });
    if (intent !== "link") {
      if (!result.customToken) throw new Error("The service sent no sign-in token.");
      await deps.signInWithCustomToken(result.customToken);
    }
    return { provider, intent, returnTo, account: result.account, created: result.created };
  } catch (error) {
    throw new ProviderSignInError("refused", provider, returnTo, error);
  }
}

let finishing: Promise<FinishedSignIn> | null = null;

/** The callback page's one completion per page load: every caller (StrictMode runs effects twice) shares it. */
export function finishBrokeredSignInOnce(params: URLSearchParams, deps: FinishDeps): Promise<FinishedSignIn> {
  finishing ??= finishBrokeredSignIn(params, deps);
  return finishing;
}

/** Tests only: forget the page load's completion. */
export function resetFinishForTests(): void {
  finishing = null;
}
