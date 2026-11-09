/**
 * "Continue with email" (passwordless email link; the owner's decision of 2026-11-09), after Chord to MIDI's
 * src/account/emailLink.ts. Firebase Auth emails the link (sendSignInLinkToEmail on the `clean-space` app); its
 * continue URL is the landing page PAGE_PATH.emailLink with this page's own query (`intent`, `return`, `action`), and
 * Firebase adds its one-time code (`oobCode`, `mode=signIn`). The landing page takes the query out of the address bar
 * (url.ts takeQueryOnce) and keeps it in this tab's sessionStorage only, until it is used; the service redeems the code
 * (completeEmailSignIn) and answers with its own session, never Firebase's. Three intents, authorised by the service,
 * never by the URL:
 * - signin: signs in to the address's own email account, creating one if it has none. Never another account because an
 *   address matches (a Google email, a contact email).
 * - reauth: the signed-in account proves itself again with its own email method.
 * - link: adds the email method to the signed-in account that began the link (beginEmailLink binds it to that account
 *   and sign-in), opened in this browser.
 * The sign-in email is a sign-in method only: the contact email (6-digit code) stays the receipt and support address.
 */
import type { CleanSpaceApi } from "./api";
import { describeError } from "./api";
import {
  canonicalEmail,
  EMAIL_LINK,
  EMAIL_SIGN_IN_INTENTS,
  isEmailAddress,
  isId22,
  isOobCode,
  PAGE_PATH,
  type EmailSignInIntent,
  type PageLang,
  type ReturnRoute,
  type ReturnTarget,
} from "./contract.generated";
import { parseReturnTarget } from "./return-target";
import { readJSON, removeKey, STORAGE_KEYS, writeJSON, type KeyValueStore } from "./storage";

/** How long this browser remembers the address it sent a sign-in link to (the link is good for less). */
export const SIGN_IN_EMAIL_TTL_MS = 24 * 3_600_000;
/** How long a link opened in this tab is kept for a reload or a sign-in in between. */
export const PENDING_LINK_TTL_MS = 3_600_000;

/** The landing page's address for an email link: `origin` + PAGE_PATH.emailLink + this page's own parameters. */
export function emailLinkContinueUrl(origin: string, intent: EmailSignInIntent, returnTo: ReturnTarget, actionID?: string): string {
  const params = new URLSearchParams({ [EMAIL_LINK.intentParam]: intent, [EMAIL_LINK.returnParam]: returnTo.route });
  if (intent === "link" && actionID) params.set(EMAIL_LINK.actionParam, actionID);
  return `${origin}${PAGE_PATH.emailLink[returnTo.lang]}?${params}`;
}

export interface EmailLink {
  intent: EmailSignInIntent;
  oobCode: string;
  /** For `link`: the binding the account page began. */
  actionID: string | null;
  /** Where to go afterwards: an allow-listed page in the landing page's language. */
  returnTo: ReturnTarget;
}

/**
 * The link in a landing page's query, or null. Only Firebase's sign-in code (`mode=signIn`, a bounded `oobCode`) and
 * the known parameters count; a link Firebase nests in `link` is read the same way.
 */
export function parseEmailLink(query: string, lang: PageLang): EmailLink | null {
  let params = new URLSearchParams(query);
  const nested = params.get("link");
  if (nested && !params.has("oobCode")) {
    try {
      const inner = new URL(nested);
      params = new URLSearchParams([...params.entries(), ...inner.searchParams.entries()]);
    } catch {
      return null;
    }
  }
  if (params.get("mode") !== "signIn") return null;
  const oobCode = params.get("oobCode");
  if (!isOobCode(oobCode)) return null;
  const intent = params.get(EMAIL_LINK.intentParam) ?? "signin";
  if (!(EMAIL_SIGN_IN_INTENTS as readonly string[]).includes(intent)) return null;
  const action = params.get(EMAIL_LINK.actionParam);
  if (intent === "link" && !isId22(action)) return null;
  const returnTo = parseReturnTarget({ route: params.get(EMAIL_LINK.returnParam) ?? "account", lang }) ?? { route: "account" as ReturnRoute, lang };
  return { intent: intent as EmailSignInIntent, oobCode, actionID: intent === "link" ? action : null, returnTo };
}

// ---- This tab's link (sessionStorage) and this browser's requests (localStorage) ----

/** Keeps the landing page's query in this tab until the link is used (a reload, a sign-in in between). */
export function keepPendingLink(store: KeyValueStore | null, query: string, now: number): boolean {
  return writeJSON(store, STORAGE_KEYS.emailLinkPending, { query, at: now });
}

export function recallPendingLink(store: KeyValueStore | null, now: number): string | null {
  const value = readJSON(store, STORAGE_KEYS.emailLinkPending) as { query?: unknown; at?: unknown } | null;
  if (!value || typeof value.query !== "string" || typeof value.at !== "number" || now - value.at > PENDING_LINK_TTL_MS || value.at - now > 60_000) {
    removeKey(store, STORAGE_KEYS.emailLinkPending);
    return null;
  }
  return value.query;
}

export function forgetPendingLink(store: KeyValueStore | null): void {
  removeKey(store, STORAGE_KEYS.emailLinkPending);
}

export function rememberSignInEmail(store: KeyValueStore | null, email: string, now: number): void {
  writeJSON(store, STORAGE_KEYS.emailSignIn, { email: canonicalEmail(email), at: now });
}

/** The address this browser last sent a sign-in link to, if recent. */
export function rememberedSignInEmail(store: KeyValueStore | null, now: number): string | null {
  const value = readJSON(store, STORAGE_KEYS.emailSignIn) as { email?: unknown; at?: unknown } | null;
  if (!value || typeof value.email !== "string" || !isEmailAddress(value.email) || typeof value.at !== "number" || now - value.at > SIGN_IN_EMAIL_TTL_MS) return null;
  return canonicalEmail(value.email);
}

type Actions = Record<string, { email: string; uid: string; at: number }>;

export function rememberLinkAction(store: KeyValueStore | null, actionID: string, email: string, uid: string, now: number): void {
  const actions = (readJSON(store, STORAGE_KEYS.emailLinkActions) ?? {}) as Actions;
  const kept = Object.fromEntries(Object.entries(actions).filter(([, value]) => typeof value?.at === "number" && now - value.at < PENDING_LINK_TTL_MS));
  writeJSON(store, STORAGE_KEYS.emailLinkActions, { ...kept, [actionID]: { email: canonicalEmail(email), uid, at: now } });
}

export function recalledLinkAction(store: KeyValueStore | null, actionID: string, now: number): { email: string; uid: string } | null {
  const actions = (readJSON(store, STORAGE_KEYS.emailLinkActions) ?? {}) as Actions;
  const value = actions[actionID];
  if (!value || typeof value.email !== "string" || typeof value.uid !== "string" || typeof value.at !== "number" || now - value.at > PENDING_LINK_TTL_MS) return null;
  return { email: value.email, uid: value.uid };
}

function forgetLinkAction(store: KeyValueStore | null, actionID: string): void {
  const actions = (readJSON(store, STORAGE_KEYS.emailLinkActions) ?? {}) as Actions;
  if (!(actionID in actions)) return;
  delete actions[actionID];
  writeJSON(store, STORAGE_KEYS.emailLinkActions, actions);
}

// ---- Completing a link ----

export type EmailLinkFailure =
  /** Not a link this page understands. */
  | "invalid"
  /** Used, expired, or replaced by a newer one. */
  | "expired"
  /** The address signs in to another account (link). */
  | "conflict"
  /** The account has an email sign-in already (link). */
  | "already-linked"
  /** The link belongs to another account than the one signed in here (link, reauth). */
  | "wrong-account"
  | "busy"
  | "deleted"
  | "unavailable"
  | "error";

export type EmailLinkOutcome =
  /** `linked`: the email method was added (no new session). */
  | { kind: "done"; returnTo: ReturnTarget; linked: boolean }
  /** Which address the link was sent to (another device, or not the address this browser remembers). */
  | { kind: "need-email"; mismatch: boolean }
  /** signin while an account is signed in here: switch only when the person says so. */
  | { kind: "switch"; email: string }
  /** link or reauth: the account that asked must be signed in here. */
  | { kind: "need-account" }
  | { kind: "failed"; reason: EmailLinkFailure; email?: string; message?: string };

export interface CompleteEmailLinkDeps {
  api: Pick<CleanSpaceApi, "completeEmailSignIn">;
  /** The uid signed in here now (after Firebase restored the session). */
  currentUid: () => Promise<string | null>;
  signInWithCustomToken: (token: string) => Promise<void>;
  /** sessionStorage (the pending link). */
  session: KeyValueStore | null;
  /** localStorage (the remembered address and bindings). */
  local: KeyValueStore | null;
  now: () => number;
}

const FINAL: ReadonlySet<EmailLinkFailure> = new Set(["invalid", "expired", "conflict", "already-linked", "deleted"]);

function refusal(error: unknown, email: string): EmailLinkOutcome {
  const info = describeError(error);
  switch (info.code) {
    case "EMAIL_MISMATCH":
      return { kind: "need-email", mismatch: true };
    case "EMAIL_LINK_INVALID":
      return { kind: "failed", reason: "expired" };
    case "IDENTITY_IN_USE":
      return { kind: "failed", reason: "conflict", email };
    case "PROVIDER_ALREADY_LINKED":
      return { kind: "failed", reason: "already-linked" };
    case "ACCOUNT_MISMATCH":
      return { kind: "failed", reason: "wrong-account" };
    case "UNAUTHENTICATED":
    case "SESSION_INVALID":
      return { kind: "need-account" };
    case "TOO_MANY_REQUESTS":
      return { kind: "failed", reason: "busy" };
    case "ACCOUNT_DELETED":
      return { kind: "failed", reason: "deleted" };
    case "PROVIDER_UNAVAILABLE":
      return { kind: "failed", reason: "unavailable" };
    default:
      return { kind: "failed", reason: "error", message: info.message };
  }
}

/**
 * Completes the link for whoever is signed in here now, or says what is needed first. Never signs in for a `link`,
 * never replaces a signed-in account without the person's word, and never rejects: anything else that goes wrong is a
 * failure of reason "error", and the link is kept for another try (it is forgotten once done, or when it can't work).
 */
export async function completeEmailLink(link: EmailLink, options: { email?: string; switchAccount?: boolean }, deps: CompleteEmailLinkDeps): Promise<EmailLinkOutcome> {
  let outcome: EmailLinkOutcome;
  try {
    outcome = await complete(link, options, deps);
  } catch (error) {
    outcome = { kind: "failed", reason: "error", message: describeError(error).message };
  }
  if (outcome.kind === "done" || (outcome.kind === "failed" && FINAL.has(outcome.reason))) {
    forgetPendingLink(deps.session);
    if (link.actionID && outcome.kind === "done") forgetLinkAction(deps.local, link.actionID);
  }
  return outcome;
}

async function complete(link: EmailLink, options: { email?: string; switchAccount?: boolean }, deps: CompleteEmailLinkDeps): Promise<EmailLinkOutcome> {
  const typed = options.email !== undefined ? canonicalEmail(options.email) : null;
  if (typed !== null && !isEmailAddress(typed)) return { kind: "need-email", mismatch: false };
  const current = await deps.currentUid();

  if (link.intent === "signin") {
    const email = typed ?? rememberedSignInEmail(deps.local, deps.now());
    if (!email) return { kind: "need-email", mismatch: false };
    if (current && !options.switchAccount) return { kind: "switch", email };
    let token: string | undefined;
    try {
      token = (await deps.api.completeEmailSignIn({ intent: "signin", email, oobCode: link.oobCode })).customToken;
    } catch (error) {
      return refusal(error, email);
    }
    if (!token) return { kind: "failed", reason: "error" };
    await deps.signInWithCustomToken(token);
    removeKey(deps.local, STORAGE_KEYS.emailSignIn);
    return { kind: "done", returnTo: link.returnTo, linked: false };
  }

  // reauth and link: the signed-in account, and only it.
  if (!current) return { kind: "need-account" };
  const bound = link.actionID ? recalledLinkAction(deps.local, link.actionID, deps.now()) : null;
  if (bound && bound.uid !== current) return { kind: "failed", reason: "wrong-account" };
  const email = typed ?? bound?.email ?? rememberedSignInEmail(deps.local, deps.now());
  if (!email) return { kind: "need-email", mismatch: false };
  try {
    if (link.intent === "link") {
      if (!link.actionID) return { kind: "failed", reason: "invalid" };
      await deps.api.completeEmailSignIn({ intent: "link", email, oobCode: link.oobCode, actionID: link.actionID });
      return { kind: "done", returnTo: link.returnTo, linked: true };
    }
    const { customToken } = await deps.api.completeEmailSignIn({ intent: "reauth", email, oobCode: link.oobCode });
    if (!customToken) return { kind: "failed", reason: "error" };
    await deps.signInWithCustomToken(customToken);
    removeKey(deps.local, STORAGE_KEYS.emailSignIn);
    return { kind: "done", returnTo: link.returnTo, linked: false };
  } catch (error) {
    return refusal(error, email);
  }
}
