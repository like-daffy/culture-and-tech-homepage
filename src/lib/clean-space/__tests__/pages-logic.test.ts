import { beforeEach, describe, expect, it } from "vitest";
import { activationView, forgetRequest, recallRequest, rememberRequest, type ActivationInputs } from "../activation";
import { createCallableApi, describeError } from "../api";
import { CALLABLE, PAGE_PATH } from "../contract.generated";
import { isSensitivePage } from "../sensitive-routes";
import { otherLanguagePath, parseReturnTarget, returnTargetPath } from "../return-target";
import { memoryStore } from "../storage";
import { parseActivationFragment, resetCapturesForTests, stripAddress, takeFragmentOnce, takeQueryOnce, type HistoryLike, type LocationLike } from "../url";
import { NOW, serviceError } from "./fake-api";

const REQUEST = "q2V3cmlKd0x3cTRCcmVxdWVzdElEX2Zvcl90ZXN0czE";

describe("return targets", () => {
  it("accepts exactly an allow-listed route and language", () => {
    expect(parseReturnTarget({ route: "checkout", lang: "ko" })).toEqual({ route: "checkout", lang: "ko" });
    expect(parseReturnTarget({ route: "activate", lang: "en" })).toEqual({ route: "activate", lang: "en" });
    for (const bad of [
      null,
      "checkout",
      { route: "https://evil.example/", lang: "en" },
      { route: "admin", lang: "en" },
      { route: "account", lang: "fr" },
      { route: "account", lang: "en", next: "//evil.example" },
      ["checkout", "en"],
    ]) {
      expect(parseReturnTarget(bad)).toBeNull();
    }
  });

  it("maps to the contract's paths only", () => {
    expect(returnTargetPath({ route: "checkout", lang: "ko" })).toBe("/ko/checkout/clean-space/");
    expect(returnTargetPath({ route: "account", lang: "en" })).toBe("/apps/clean-space/account/");
    expect(otherLanguagePath("activate", "en")).toBe(PAGE_PATH.activate.ko);
  });
});

describe("taking secrets out of the address", () => {
  beforeEach(() => resetCapturesForTests());

  function browser(pathname: string, search: string, hash = "") {
    const location: LocationLike = { pathname, search, hash };
    const replaced: Array<{ state: unknown; url: string | null | undefined }> = [];
    const history: HistoryLike = {
      state: { url: `${pathname}${search}`, as: `${pathname}${search}${hash}`, options: {}, __N: true, key: "k" },
      replaceState(state, _unused, url) {
        replaced.push({ state, url });
        location.search = "";
        location.hash = "";
        this.state = state;
      },
    };
    return { location, history, replaced };
  }

  it("reads the query once, strips it, and gives the same values to later callers", () => {
    const { location, history, replaced } = browser("/apps/clean-space/auth/callback/", "?code=c&state=s");
    const cleaned: string[] = [];
    const first = takeQueryOnce(location, history, (clean) => cleaned.push(clean));
    expect(first.get("code")).toBe("c");
    expect(replaced).toHaveLength(1);
    expect(replaced[0].url).toBe("/apps/clean-space/auth/callback/");
    expect(replaced[0].state).toMatchObject({ as: "/apps/clean-space/auth/callback/", url: "/apps/clean-space/auth/callback/" });
    expect(cleaned).toEqual(["/apps/clean-space/auth/callback/"]);
    const second = takeQueryOnce(location, history);
    expect(second.get("state")).toBe("s");
    expect(replaced).toHaveLength(1);
  });

  it("reads the activation fragment once and accepts only a request id", () => {
    const { location, history, replaced } = browser("/apps/clean-space/activate/", "", `#request=${REQUEST}`);
    expect(parseActivationFragment(takeFragmentOnce(location, history))).toBe(REQUEST);
    expect(replaced[0].url).toBe("/apps/clean-space/activate/");
    expect(parseActivationFragment(takeFragmentOnce(location, history))).toBe(REQUEST);
    expect(parseActivationFragment("#request=short")).toBeNull();
    expect(parseActivationFragment(`#request=${REQUEST}&next=https://evil.example`)).toBeNull();
    expect(parseActivationFragment(`#token=${REQUEST}`)).toBeNull();
  });

  it("keeps a history state that isn't Next.js's as it is", () => {
    const location: LocationLike = { pathname: "/p/", search: "?a=1", hash: "" };
    const calls: unknown[] = [];
    const clean = stripAddress(location, { state: null, replaceState: (state, _u, url) => void calls.push([state, url]) });
    expect(clean).toBe("/p/");
    expect(calls).toEqual([[null, "/p/"]]);
  });
});

describe("the activation page", () => {
  const base: ActivationInputs = { configured: true, requestID: REQUEST, auth: "signed-in", inspection: null, decided: null, serverNow: NOW };
  const inspected = (status: "pending" | "approved" | "denied" | "expired" | "consumed", expiresAt = NOW + 300) => ({
    status: "ready" as const,
    value: { status, confirmationCode: "K7QM-4XRT", appVersion: "1.1 (8)", createdAt: NOW - 60, expiresAt, serverTime: NOW },
  });

  it("never approves by opening: a pending request waits for the explicit choice", () => {
    expect(activationView({ ...base, inspection: inspected("pending") })).toMatchObject({ kind: "pending", request: { confirmationCode: "K7QM-4XRT" } });
  });

  it("asks for a sign-in and a request first", () => {
    expect(activationView({ ...base, auth: "signed-out" }).kind).toBe("signed-out");
    expect(activationView({ ...base, requestID: null }).kind).toBe("no-request");
    expect(activationView({ ...base, configured: false }).kind).toBe("unavailable");
  });

  it("shows the request's end states, and expires a pending one by the service's clock", () => {
    expect(activationView({ ...base, inspection: inspected("pending", NOW) }).kind).toBe("expired");
    for (const status of ["approved", "denied", "expired", "consumed"] as const) expect(activationView({ ...base, inspection: inspected(status) }).kind).toBe(status);
    expect(activationView({ ...base, inspection: { status: "error", error: describeError(serviceError("not-found", "ACTIVATION_NOT_FOUND")) } }).kind).toBe("not-found");
    expect(activationView({ ...base, decided: "approved" }).kind).toBe("approved");
  });

  it("keeps the request id in this tab only while it can still be pending", () => {
    const store = memoryStore();
    expect(rememberRequest(store, "not-an-id", 0)).toBe(false);
    expect(rememberRequest(store, REQUEST, 1_000)).toBe(true);
    expect(recallRequest(store, 1_000 + 600_000)).toBe(REQUEST);
    expect(recallRequest(store, 1_000 + 661_000)).toBeNull();
    rememberRequest(store, REQUEST, 1_000);
    forgetRequest(store);
    expect(recallRequest(store, 1_000)).toBeNull();
  });
});

describe("the service client", () => {
  it("calls each callable by its contract name, with no extra fields", async () => {
    const calls: Array<[string, unknown]> = [];
    const api = createCallableApi(async (name, data) => {
      calls.push([name, data]);
      return {} as never;
    });
    await api.getOffer();
    await api.approveActivation({ requestID: REQUEST, confirmationCode: "K7QM-4XRT" });
    await api.endNativeSessions();
    expect(calls).toEqual([
      [CALLABLE.getOffer, {}],
      [CALLABLE.approveActivation, { requestID: REQUEST, confirmationCode: "K7QM-4XRT" }],
      [CALLABLE.endNativeSessions, {}],
    ]);
  });

  it("describes the service's errors without leaking anything else", () => {
    expect(describeError(serviceError("failed-precondition", "ALREADY_ACTIVE", "Already active."))).toMatchObject({ code: "ALREADY_ACTIVE", message: "Already active.", retryable: false });
    expect(describeError(Object.assign(new Error("boom: stack…"), { code: "functions/unavailable" }))).toMatchObject({ code: null, retryable: true });
    expect(describeError(new TypeError("Failed to fetch")).message).not.toContain("fetch");
    expect(describeError({ code: "functions/resource-exhausted", details: { code: "SLOW_DOWN", message: "Wait.", retryAfterSeconds: 10 } })).toMatchObject({ retryAfterSeconds: 10, retryable: true });
  });
});

describe("sensitive pages", () => {
  it("covers every checkout and Clean Space's account, callback and activation pages, in both languages", () => {
    for (const page of [
      "/checkout/clean-space",
      "/checkout/clean-space/success",
      "/ko/checkout/clean-space/fail",
      "/checkout/chord-to-midi",
      "/apps/clean-space/account",
      "/ko/apps/clean-space/auth/callback",
      "/apps/clean-space/activate",
      "/apps/clean-space/activate/",
    ]) {
      expect(isSensitivePage(page)).toBe(true);
    }
    for (const page of ["/", "/ko", "/apps/clean-space", "/ko/apps/clean-space", "/apps/chord-to-midi", "/apps/clean-space-other/account", "/404"]) {
      expect(isSensitivePage(page)).toBe(false);
    }
  });
});
