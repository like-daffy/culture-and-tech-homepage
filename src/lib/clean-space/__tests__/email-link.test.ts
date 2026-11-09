import { describe, expect, it } from "vitest";
import { createCallableApi } from "../api";
import { CALLABLE, PAGE_PATH } from "../contract.generated";
import {
  completeEmailLink,
  emailLinkContinueUrl,
  keepPendingLink,
  parseEmailLink,
  PENDING_LINK_TTL_MS,
  recallPendingLink,
  rememberedSignInEmail,
  rememberLinkAction,
  rememberSignInEmail,
  type CompleteEmailLinkDeps,
  type EmailLink,
} from "../email-link";
import { isSensitivePage } from "../sensitive-routes";
import { memoryStore, STORAGE_KEYS } from "../storage";
import { fakeApi, serviceError } from "./fake-api";

const ACTION = "AAECAwQFBgcICQoLDA0ODw";
const T = 1_800_000_000_000;

/** The landing page's query as Firebase's action handler leaves it: the page's own parameters plus Firebase's. */
const firebaseQuery = (own: string, code = "oob-code-123") => `?${own}&apiKey=AIzaKey&oobCode=${code}&mode=signIn&lang=en`;

function deps(overrides: Partial<CompleteEmailLinkDeps> & { uid?: string | null } = {}) {
  const signedIn: string[] = [];
  const base: CompleteEmailLinkDeps = {
    api: fakeApi({ completeEmailSignIn: { customToken: "custom-token", account: {}, created: true } }),
    currentUid: async () => overrides.uid ?? null,
    signInWithCustomToken: async (token) => void signedIn.push(token),
    session: memoryStore(),
    local: memoryStore(),
    now: () => T,
  };
  return { deps: { ...base, ...overrides }, signedIn };
}

function must<T>(value: T | null): T {
  if (value === null) throw new Error("expected a value");
  return value;
}

const signinLink = (lang: "en" | "ko" = "en"): EmailLink => must(parseEmailLink(firebaseQuery("intent=signin&return=account"), lang));

describe("the email link's addresses", () => {
  it("lands on the exact page in the page's language, with only the page's own parameters", () => {
    expect(emailLinkContinueUrl("https://cultureand.tech", "signin", { route: "account", lang: "en" })).toBe(
      "https://cultureand.tech/apps/clean-space/auth/email/?intent=signin&return=account",
    );
    expect(emailLinkContinueUrl("https://cultureand.tech", "link", { route: "account", lang: "ko" }, ACTION)).toBe(
      `https://cultureand.tech/ko/apps/clean-space/auth/email/?intent=link&return=account&action=${ACTION}`,
    );
    expect(PAGE_PATH.emailLink).toEqual({ en: "/apps/clean-space/auth/email/", ko: "/ko/apps/clean-space/auth/email/" });
    expect(isSensitivePage("/apps/clean-space/auth/email")).toBe(true);
    expect(isSensitivePage("/ko/apps/clean-space/auth/email/")).toBe(true);
  });

  it("reads Firebase's sign-in code and the allow-listed parameters only", () => {
    expect(signinLink()).toEqual({ intent: "signin", oobCode: "oob-code-123", actionID: null, returnTo: { route: "account", lang: "en" } });
    expect(parseEmailLink(firebaseQuery(`intent=link&return=account&action=${ACTION}`), "ko")).toMatchObject({ intent: "link", actionID: ACTION, returnTo: { lang: "ko" } });
    // An unknown return page goes to the account page; never an address.
    expect(parseEmailLink(firebaseQuery("intent=signin&return=https://evil.example/"), "en")?.returnTo).toEqual({ route: "account", lang: "en" });
    expect(parseEmailLink(firebaseQuery("intent=signin&return=activate"), "en")?.returnTo).toEqual({ route: "activate", lang: "en" });
    // Not a sign-in code, no code, an unknown intent, a link without its binding.
    expect(parseEmailLink("?intent=signin&oobCode=x&mode=resetPassword", "en")).toBeNull();
    expect(parseEmailLink("?intent=signin&mode=signIn", "en")).toBeNull();
    expect(parseEmailLink(firebaseQuery("intent=merge"), "en")).toBeNull();
    expect(parseEmailLink(firebaseQuery("intent=link&return=account"), "en")).toBeNull();
    // A link Firebase nests in `link`.
    const nested = `?link=${encodeURIComponent("https://example.firebaseapp.com/__/auth/action?mode=signIn&oobCode=nested-code")}&intent=signin`;
    expect(parseEmailLink(nested, "en")?.oobCode).toBe("nested-code");
  });
});

describe("what this tab and browser keep", () => {
  it("keeps the opened link in this tab for an hour, and the requested address for a day", () => {
    const session = memoryStore();
    keepPendingLink(session, "mode=signIn&oobCode=c", T);
    expect(recallPendingLink(session, T + 1000)).toBe("mode=signIn&oobCode=c");
    expect(recallPendingLink(session, T + PENDING_LINK_TTL_MS + 1)).toBeNull();
    expect(session.size()).toBe(0);
    const local = memoryStore();
    rememberSignInEmail(local, " Me@Example.com ", T);
    expect(rememberedSignInEmail(local, T + 3_600_000)).toBe("me@example.com");
    expect(rememberedSignInEmail(local, T + 25 * 3_600_000)).toBeNull();
  });
});

describe("completing a link", () => {
  it("signin: the service redeems the code and the browser signs in with its token; the link is forgotten", async () => {
    const { deps: d, signedIn } = deps();
    rememberSignInEmail(d.local, "me@example.com", T);
    keepPendingLink(d.session, "q", T);
    const outcome = await completeEmailLink(signinLink(), {}, d);
    expect(outcome).toEqual({ kind: "done", returnTo: { route: "account", lang: "en" }, linked: false });
    expect(signedIn).toEqual(["custom-token"]);
    expect((d.api as ReturnType<typeof fakeApi>).calls).toEqual([{ method: "completeEmailSignIn", request: { intent: "signin", email: "me@example.com", oobCode: "oob-code-123" } }]);
    expect(recallPendingLink(d.session, T)).toBeNull();
    expect(must(d.local).getItem(STORAGE_KEYS.emailSignIn)).toBeNull();
  });

  it("signin on another device asks for the address; a wrong one asks again; nothing is sent without it", async () => {
    const api = fakeApi({ completeEmailSignIn: serviceError("invalid-argument", "EMAIL_MISMATCH") });
    const { deps: d } = deps({ api });
    expect(await completeEmailLink(signinLink(), {}, d)).toEqual({ kind: "need-email", mismatch: false });
    expect(api.calls).toHaveLength(0);
    expect(await completeEmailLink(signinLink(), { email: "wrong@example.com" }, d)).toEqual({ kind: "need-email", mismatch: true });
    expect(await completeEmailLink(signinLink(), { email: "not an address" }, d)).toEqual({ kind: "need-email", mismatch: false });
  });

  it("signin never replaces the account signed in here without the person's word", async () => {
    const { deps: d, signedIn } = deps({ uid: "someone" });
    expect(await completeEmailLink(signinLink(), { email: "me@example.com" }, d)).toEqual({ kind: "switch", email: "me@example.com" });
    expect(signedIn).toHaveLength(0);
    expect(await completeEmailLink(signinLink(), { email: "me@example.com", switchAccount: true }, d)).toMatchObject({ kind: "done" });
    expect(signedIn).toEqual(["custom-token"]);
  });

  it("link: needs the account that began it, signed in here; adds the method without a new session", async () => {
    const link = must(parseEmailLink(firebaseQuery(`intent=link&return=account&action=${ACTION}`), "en"));
    const { deps: signedOut } = deps();
    expect(await completeEmailLink(link, {}, signedOut)).toEqual({ kind: "need-account" });

    const api = fakeApi({ completeEmailSignIn: { account: {}, created: false } });
    const { deps: other } = deps({ uid: "other", api });
    rememberLinkAction(other.local, ACTION, "me@example.com", "owner", T);
    expect(await completeEmailLink(link, {}, other)).toEqual({ kind: "failed", reason: "wrong-account" });
    expect(api.calls).toHaveLength(0);

    const { deps: owner, signedIn } = deps({ uid: "owner", api });
    rememberLinkAction(owner.local, ACTION, "me@example.com", "owner", T);
    expect(await completeEmailLink(link, {}, owner)).toEqual({ kind: "done", returnTo: { route: "account", lang: "en" }, linked: true });
    expect(api.calls.at(-1)?.request).toEqual({ intent: "link", email: "me@example.com", oobCode: "oob-code-123", actionID: ACTION });
    expect(signedIn).toHaveLength(0);
  });

  it("says what the service's refusals mean, and keeps the link only when trying again can work", async () => {
    const cases: Array<[string, string, object]> = [
      ["failed-precondition", "EMAIL_LINK_INVALID", { kind: "failed", reason: "expired" }],
      ["already-exists", "IDENTITY_IN_USE", { kind: "failed", reason: "conflict", email: "me@example.com" }],
      ["already-exists", "PROVIDER_ALREADY_LINKED", { kind: "failed", reason: "already-linked" }],
      ["permission-denied", "ACCOUNT_MISMATCH", { kind: "failed", reason: "wrong-account" }],
      ["resource-exhausted", "TOO_MANY_REQUESTS", { kind: "failed", reason: "busy" }],
      ["failed-precondition", "ACCOUNT_DELETED", { kind: "failed", reason: "deleted" }],
      ["failed-precondition", "PROVIDER_UNAVAILABLE", { kind: "failed", reason: "unavailable" }],
    ];
    for (const [status, code, expected] of cases) {
      const { deps: d } = deps({ api: fakeApi({ completeEmailSignIn: serviceError(status, code) }) });
      keepPendingLink(d.session, "q", T);
      expect(await completeEmailLink(signinLink(), { email: "me@example.com" }, d)).toEqual(expected);
      const kept = recallPendingLink(d.session, T) !== null;
      expect(kept, code).toBe(code === "TOO_MANY_REQUESTS" || code === "ACCOUNT_MISMATCH" || code === "PROVIDER_UNAVAILABLE");
    }
  });

  it("the client calls the two new callables by their contract names", async () => {
    const calls: Array<[string, unknown]> = [];
    const api = createCallableApi(async (name, data) => {
      calls.push([name, data]);
      return {} as never;
    });
    await api.beginEmailLink({ email: "a@example.com", lang: "en" });
    await api.completeEmailSignIn({ intent: "signin", email: "a@example.com", oobCode: "c" });
    expect(calls.map(([name]) => name)).toEqual([CALLABLE.beginEmailLink, CALLABLE.completeEmailSignIn]);
  });
});
