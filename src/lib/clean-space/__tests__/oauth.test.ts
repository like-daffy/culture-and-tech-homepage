import { beforeEach, describe, expect, it } from "vitest";
import {
  authorizeUrl,
  beginBrokeredSignIn,
  callbackUri,
  checkCallback,
  finishBrokeredSignIn,
  finishBrokeredSignInOnce,
  ProviderSignInError,
  randomState,
  resetFinishForTests,
  SIGN_IN_TTL_MS,
  takePending,
} from "../oauth";
import { memoryStore, STORAGE_KEYS } from "../storage";
import { accountSummary, fakeApi, serviceError } from "./fake-api";

const ORIGIN = "https://cultureand.tech";
const STATE = "S".repeat(43);
const T0 = 1_800_000_000_000;

function started(intent: "signin" | "link" | "reauth" = "signin", provider: "kakao" | "naver" = "kakao") {
  const store = memoryStore();
  const url = beginBrokeredSignIn(
    provider,
    { clientId: "client-id", origin: ORIGIN, returnTo: { route: "checkout", lang: "ko" }, intent, expectedUid: intent === "signin" ? null : "uid-1" },
    { store, now: () => T0, random: () => STATE },
  );
  return { store, url: new URL(url) };
}

describe("authorization URLs", () => {
  it("sends Kakao the exact callback, the state and no scope", () => {
    const { url } = started();
    expect(url.origin + url.pathname).toBe("https://kauth.kakao.com/oauth/authorize");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: "client-id",
      redirect_uri: "https://cultureand.tech/ko/apps/clean-space/auth/callback/",
      response_type: "code",
      state: STATE,
    });
  });

  it("sends Naver its code flow with the state", () => {
    const { url } = started("signin", "naver");
    expect(url.origin + url.pathname).toBe("https://nid.naver.com/oauth2.0/authorize");
    expect(url.searchParams.get("state")).toBe(STATE);
    expect(url.searchParams.get("redirect_uri")).toBe("https://cultureand.tech/ko/apps/clean-space/auth/callback/");
  });

  it("makes the person sign in again for a reauthentication", () => {
    expect(new URL(authorizeUrl("kakao", { clientId: "c", redirectUri: "r", state: STATE, intent: "reauth", base: "https://kauth.kakao.com" })).searchParams.get("prompt")).toBe("login");
    expect(new URL(authorizeUrl("naver", { clientId: "c", redirectUri: "r", state: STATE, intent: "reauth", base: "https://nid.naver.com" })).searchParams.get("auth_type")).toBe("reauthenticate");
  });

  it("registers callbacks with their trailing slash in both languages", () => {
    expect(callbackUri("en", ORIGIN)).toBe("https://cultureand.tech/apps/clean-space/auth/callback/");
    expect(callbackUri("ko", ORIGIN)).toBe("https://cultureand.tech/ko/apps/clean-space/auth/callback/");
  });

  it("makes 43-character base64url states", () => {
    const state = randomState();
    expect(state).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(randomState()).not.toBe(state);
  });

  it("refuses to start without a client id, an account to link or storage", () => {
    const store = memoryStore();
    const base = { origin: ORIGIN, returnTo: { route: "account" as const, lang: "en" as const }, expectedUid: null };
    expect(() => beginBrokeredSignIn("kakao", { ...base, clientId: "", intent: "signin" }, { store, now: () => T0 })).toThrow(ProviderSignInError);
    expect(() => beginBrokeredSignIn("kakao", { ...base, clientId: "c", intent: "link" }, { store, now: () => T0 })).toThrow(/signed-out/);
    expect(() => beginBrokeredSignIn("kakao", { ...base, clientId: "c", intent: "signin" }, { store: null, now: () => T0 })).toThrow(/storage/);
  });
});

describe("the callback's checks", () => {
  it("uses this tab's sign-in once", () => {
    const { store } = started();
    expect(takePending(store)?.state).toBe(STATE);
    expect(takePending(store)).toBeNull();
    expect(store.getItem(STORAGE_KEYS.authPending)).toBeNull();
  });

  it("refuses a pending sign-in whose return target is not allow-listed", () => {
    const store = memoryStore();
    store.setItem(
      STORAGE_KEYS.authPending,
      JSON.stringify({ state: STATE, provider: "kakao", intent: "signin", expectedUid: null, redirectUri: "x", returnTo: { route: "https://evil.example", lang: "en" }, at: T0 }),
    );
    expect(takePending(store)).toBeNull();
  });

  it("refuses another state, a cancel, a missing code and an old sign-in", () => {
    const { store } = started();
    const pending = takePending(store);
    const ok = (query: string, now = T0 + 1000) => checkCallback(new URLSearchParams(query), pending, now);
    expect(ok(`code=abc&state=${STATE}`).kind).toBe("ok");
    const reason = (query: string, now?: number) => {
      const result = ok(query, now);
      return result.kind === "failed" ? result.error.reason : null;
    };
    expect(reason(`code=abc&state=${"X".repeat(43)}`)).toBe("state");
    expect(reason(`error=access_denied&state=${STATE}`)).toBe("cancelled");
    expect(reason(`state=${STATE}`)).toBe("missing");
    expect(reason("code=abc")).toBe("missing");
    expect(reason(`code=abc&state=${STATE}`, T0 + SIGN_IN_TTL_MS + 1)).toBe("expired");
    const none = checkCallback(new URLSearchParams(`code=abc&state=${STATE}`), null, T0);
    expect(none.kind === "failed" && none.error.reason).toBe("missing");
  });
});

describe("finishing a sign-in", () => {
  beforeEach(() => resetFinishForTests());

  it("exchanges the code once and signs in with the service's token", async () => {
    const { store } = started();
    const api = fakeApi({ signInWithProvider: { customToken: "custom-token", account: accountSummary(), created: true } });
    const tokens: string[] = [];
    const deps = { store, now: () => T0 + 1000, api, currentUid: async () => null, signInWithCustomToken: async (t: string) => void tokens.push(t) };
    const params = new URLSearchParams(`code=the-code&state=${STATE}`);
    // React StrictMode's second effect, or a re-render, joins the first completion.
    const [first, second] = await Promise.all([finishBrokeredSignInOnce(params, deps), finishBrokeredSignInOnce(params, deps)]);
    expect(first).toBe(second);
    expect(api.calls).toEqual([
      { method: "signInWithProvider", request: { provider: "kakao", code: "the-code", state: STATE, redirectUri: "https://cultureand.tech/ko/apps/clean-space/auth/callback/", intent: "signin" } },
    ]);
    expect(tokens).toEqual(["custom-token"]);
    expect(first.returnTo).toEqual({ route: "checkout", lang: "ko" });
  });

  it("never exchanges a reloaded callback (the pending sign-in is gone)", async () => {
    const { store } = started();
    const api = fakeApi({ signInWithProvider: { customToken: "t", account: accountSummary(), created: false } });
    const deps = { store, now: () => T0 + 1000, api, currentUid: async () => null, signInWithCustomToken: async () => undefined };
    await finishBrokeredSignIn(new URLSearchParams(`code=c&state=${STATE}`), deps);
    await expect(finishBrokeredSignIn(new URLSearchParams(`code=c&state=${STATE}`), deps)).rejects.toMatchObject({ reason: "missing" });
    expect(api.calls).toHaveLength(1);
  });

  it("links only for the account that started it, and signs nobody in for a link", async () => {
    const { store } = started("link");
    const api = fakeApi({ signInWithProvider: { account: accountSummary({ providers: ["google", "kakao"] }), created: false } });
    const signedIn: string[] = [];
    const wrong = { store, now: () => T0 + 1000, api, currentUid: async () => "uid-other", signInWithCustomToken: async (t: string) => void signedIn.push(t) };
    await expect(finishBrokeredSignIn(new URLSearchParams(`code=c&state=${STATE}`), wrong)).rejects.toMatchObject({ reason: "account-mismatch" });
    expect(api.calls).toHaveLength(0);

    const again = started("link");
    const right = { ...wrong, store: again.store, currentUid: async () => "uid-1" };
    const result = await finishBrokeredSignIn(new URLSearchParams(`code=c&state=${STATE}`), right);
    expect(result.intent).toBe("link");
    expect(signedIn).toEqual([]);
  });

  it("reports the service's refusal with where to start again", async () => {
    const { store } = started();
    const api = fakeApi({ signInWithProvider: serviceError("already-exists", "IDENTITY_IN_USE", "This Kakao account belongs to another account.") });
    const deps = { store, now: () => T0 + 1000, api, currentUid: async () => null, signInWithCustomToken: async () => undefined };
    const error = await finishBrokeredSignIn(new URLSearchParams(`code=c&state=${STATE}`), deps).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ProviderSignInError);
    expect((error as ProviderSignInError).reason).toBe("refused");
    expect((error as ProviderSignInError).returnTo).toEqual({ route: "checkout", lang: "ko" });
  });
});
