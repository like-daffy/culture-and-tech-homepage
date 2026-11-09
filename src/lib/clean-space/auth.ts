/**
 * Who is signed in to Clean Space in this browser, and the three ways to sign in (plan §6.1): Google through Firebase
 * Auth's popup on the named app, Kakao and Naver through the service's broker (oauth.ts). Linking a provider needs a
 * recent sign-in of the account, and never switches or merges accounts.
 */
import type { User } from "firebase/auth";
import type { AccountSummary, BrokeredProvider, ReturnTarget, SignInIntent } from "./contract.generated";
import type { CleanSpaceApi } from "./api";
import { CLEAN_SPACE } from "./config";
import { getCleanSpaceFirebase } from "./firebase";
import { beginBrokeredSignIn, ProviderSignInError } from "./oauth";
import { sessionStore } from "./storage";

export interface CleanSpaceUser {
  uid: string;
  /** Firebase Auth's email (Google's); a Kakao or Naver sign-in alone may have none. Never a sign-in method by itself. */
  email: string | null;
  /** Google is linked in Firebase Auth. Kakao and Naver come from the service's account summary. */
  googleLinked: boolean;
  /** How this session signed in: "google.com", or "custom" for the broker's token. */
  signInProvider: string | null;
  /** When this session signed in (ms), for what needs a recent sign-in. */
  signedInAt: number | null;
  /** Changes with every new sign-in (not with a token refresh): answers for an older one are discarded. */
  sessionKey: string;
}

async function toUser(user: User): Promise<CleanSpaceUser> {
  const token = await user.getIdTokenResult();
  const authTime = Date.parse(token.authTime);
  const signedInAt = Number.isNaN(authTime) ? null : authTime;
  return {
    uid: user.uid,
    email: user.email,
    googleLinked: user.providerData.some((info) => info.providerId === "google.com"),
    signInProvider: token.signInProvider ?? null,
    signedInAt,
    sessionKey: JSON.stringify([user.uid, token.signInProvider ?? null, signedInAt]),
  };
}

/**
 * Calls `listener` with the signed-in user (or null) once Firebase has restored the session, then on every sign-in,
 * sign-out and token refresh. Null when the build isn't configured or Firebase can't load. Returns an unsubscribe.
 */
export function onCleanSpaceUser(listener: (user: CleanSpaceUser | null) => void): () => void {
  let active = true;
  let stop: (() => void) | undefined;
  let latest = 0;
  const emit = (user: CleanSpaceUser | null) => {
    if (active) listener(user);
  };
  if (!CLEAN_SPACE.configured) {
    queueMicrotask(() => emit(null));
  } else {
    Promise.all([getCleanSpaceFirebase(), import("firebase/auth")]).then(
      ([{ auth }, { onIdTokenChanged }]) => {
        if (!active) return;
        stop = onIdTokenChanged(auth, (user) => {
          const call = ++latest;
          if (!user) {
            emit(null);
            return;
          }
          toUser(user).then(
            (value) => call === latest && emit(value),
            () => call === latest && emit(null),
          );
        });
      },
      () => emit(null),
    );
  }
  return () => {
    active = false;
    stop?.();
  };
}

/** Popup failures after which a full-page redirect still works. */
const POPUP_UNAVAILABLE = new Set(["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"]);
/** The person closed Google's window, or another one replaced it: nothing to show. */
export const POPUP_DISMISSED = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"]);

export function firebaseErrorCode(error: unknown): string | null {
  const code = typeof error === "object" && error !== null ? (error as { code?: unknown }).code : undefined;
  return typeof code === "string" ? code : null;
}

/** Google in a popup; a blocked popup falls back to a redirect (the promise then never settles: the page navigates). */
export async function signInWithGoogle(): Promise<void> {
  const [{ auth }, { GoogleAuthProvider, signInWithPopup, signInWithRedirect }] = await Promise.all([getCleanSpaceFirebase(), import("firebase/auth")]);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    if (!POPUP_UNAVAILABLE.has(firebaseErrorCode(error) ?? "")) throw error;
    await signInWithRedirect(auth, provider);
  }
}

export async function signInWithToken(token: string): Promise<void> {
  const [{ auth }, { signInWithCustomToken }] = await Promise.all([getCleanSpaceFirebase(), import("firebase/auth")]);
  await signInWithCustomToken(auth, token);
}

/** The uid signed in now, after Firebase restored the session. */
export async function currentUid(): Promise<string | null> {
  if (!CLEAN_SPACE.configured) return null;
  const { auth } = await getCleanSpaceFirebase();
  await auth.authStateReady();
  return auth.currentUser?.uid ?? null;
}

/** Signs this browser out of Clean Space only (other products' sessions on this site stay). */
export async function signOutCleanSpace(): Promise<void> {
  if (!CLEAN_SPACE.configured) return;
  const [{ auth }, { signOut }] = await Promise.all([getCleanSpaceFirebase(), import("firebase/auth")]);
  await signOut(auth);
}

/** Linking and removing a method need a sign-in within this window (the service checks it as well). */
export const RECENT_SIGN_IN_MS = 5 * 60_000;

export function signedInRecently(user: Pick<CleanSpaceUser, "signedInAt">, now: number = Date.now()): boolean {
  return user.signedInAt !== null && now - user.signedInAt <= RECENT_SIGN_IN_MS && user.signedInAt - now <= 60_000;
}

/**
 * Links the Google account chosen in a popup to the signed-in account (Firebase refuses a Google account that belongs
 * to another one: no merge), then has the service verify and record it. If the service refuses, the link is undone,
 * so the account never keeps a Google sign-in the service didn't accept.
 */
export async function linkGoogle(api: Pick<CleanSpaceApi, "linkProvider">): Promise<AccountSummary> {
  const [{ auth }, { GoogleAuthProvider, linkWithPopup, unlink }] = await Promise.all([getCleanSpaceFirebase(), import("firebase/auth")]);
  const user = auth.currentUser;
  if (!user) throw new ProviderSignInError("signed-out");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await linkWithPopup(user, provider);
  const googleIdToken = GoogleAuthProvider.credentialFromResult(result)?.idToken;
  try {
    if (!googleIdToken) throw new Error("Google did not return a sign-in to verify.");
    const { account } = await api.linkProvider({ provider: "google", googleIdToken });
    await user.getIdToken(true);
    return account;
  } catch (error) {
    await unlink(user, "google.com").catch(() => undefined);
    await user.getIdToken(true).catch(() => undefined);
    throw error;
  }
}

/** After the service removed Google, this browser's copy of the account drops it too (Firebase's reload only adds). */
export async function unlinkGoogleHere(): Promise<void> {
  const [{ auth }, { unlink }] = await Promise.all([getCleanSpaceFirebase(), import("firebase/auth")]);
  const user = auth.currentUser;
  if (user && user.providerData.some((info) => info.providerId === "google.com")) await unlink(user, "google.com");
}

/** Proves the account again with its Google sign-in, in a popup. */
export async function reauthenticateWithGoogle(): Promise<void> {
  const [{ auth }, { GoogleAuthProvider, reauthenticateWithPopup }] = await Promise.all([getCleanSpaceFirebase(), import("firebase/auth")]);
  const user = auth.currentUser;
  if (!user) throw new ProviderSignInError("signed-out");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await reauthenticateWithPopup(user, provider);
}

/** The brokered providers this build offers (all three are required in production; config-rules checks it). */
export function brokeredProvidersHere(): BrokeredProvider[] {
  return (["kakao", "naver"] as const).filter((provider) => CLEAN_SPACE.providerClientIds[provider] !== "");
}

/** Sends the browser to Kakao or Naver (the page leaves). Throws, staying on the page, when it can't. */
export async function startBrokeredSignIn(provider: BrokeredProvider, options: { returnTo: ReturnTarget; intent: SignInIntent }): Promise<void> {
  const expectedUid = options.intent === "signin" ? null : await currentUid();
  const url = beginBrokeredSignIn(
    provider,
    {
      clientId: CLEAN_SPACE.providerClientIds[provider],
      origin: window.location.origin,
      returnTo: options.returnTo,
      intent: options.intent,
      expectedUid,
      providerEmulatorUrl: CLEAN_SPACE.providerEmulatorUrl,
    },
    { store: sessionStore(), now: Date.now },
  );
  window.location.assign(url);
}
