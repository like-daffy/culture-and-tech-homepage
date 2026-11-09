import { useCallback, useEffect, useRef, useState } from "react";
import Router, { useRouter } from "next/router";
import { describeError } from "@/lib/clean-space/api";
import { onCleanSpaceUser, type CleanSpaceUser } from "@/lib/clean-space/auth";
import { CLEAN_SPACE } from "@/lib/clean-space/config";
import type { AuthStatus, Loadable } from "@/lib/clean-space/state";
import { takeQueryOnce } from "@/lib/clean-space/url";

/**
 * This page load's query, read once and taken out of the address (url.ts), or null until it is. It waits for Next.js's
 * router to be ready: on a statically exported page opened with a query, the router writes the address it started with
 * back after hydrating, so a query taken out before that would come back.
 */
export function useQueryOnce(): URLSearchParams | null {
  const router = useRouter();
  const [params, setParams] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    if (!router.isReady) return;
    setParams(
      takeQueryOnce(window.location, window.history, (clean) => {
        void Router.replace(clean, undefined, { shallow: true, scroll: false }).catch(() => undefined);
      }),
    );
  }, [router.isReady]);
  return params;
}

export type UserState = { status: Exclude<AuthStatus, "signed-in">; user: null } | { status: "signed-in"; user: CleanSpaceUser };

/** The signed-in Clean Space user of this browser. "loading" until Firebase restored the session (and while pre-rendered). */
export function useCleanSpaceUser(): UserState {
  const [state, setState] = useState<UserState>({ status: "loading", user: null });
  useEffect(() => {
    if (!CLEAN_SPACE.configured) {
      setState({ status: "unconfigured", user: null });
      return;
    }
    return onCleanSpaceUser((user) => setState(user ? { status: "signed-in", user } : { status: "signed-out", user: null }));
  }, []);
  return state;
}

/**
 * Loads `loader` while `key` is set, again whenever it changes, and on reload(). An answer for an older key (another
 * account signed in meanwhile, plan §6.1) is dropped.
 */
export function useLoad<T>(key: string | null, loader: () => Promise<T>): [Loadable<T> | null, () => void] {
  const [state, setState] = useState<{ key: string | null; value: Loadable<T> | null }>({ key: null, value: null });
  const [round, setRound] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  useEffect(() => {
    if (key === null) {
      setState({ key: null, value: null });
      return;
    }
    let active = true;
    setState({ key, value: { status: "loading" } });
    loaderRef.current().then(
      (value) => active && setState({ key, value: { status: "ready", value } }),
      (error: unknown) => active && setState({ key, value: { status: "error", error: describeError(error) } }),
    );
    return () => {
      active = false;
    };
  }, [key, round]);
  const reload = useCallback(() => setRound((n) => n + 1), []);
  return [state.key === key ? state.value : key === null ? null : { status: "loading" }, reload];
}

/**
 * The current sign-in session's key, readable after an await: an operation started under one session compares it when
 * its answer arrives and drops the answer if another account signed in meanwhile.
 */
export function useSessionGuard(user: CleanSpaceUser | null): () => string | null {
  const ref = useRef<string | null>(user?.sessionKey ?? null);
  ref.current = user?.sessionKey ?? null;
  return useCallback(() => ref.current, []);
}

/** The service's clock offset in seconds (server time minus this browser's), from the latest answer that had one. */
export function useServerOffset(serverTime: number | null | undefined): number {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (typeof serverTime === "number" && Number.isFinite(serverTime)) setOffset(serverTime - Date.now() / 1000);
  }, [serverTime]);
  return offset;
}

/** Re-renders every `ms` while `on` (countdowns). */
export function useTicker(on: boolean, ms = 1000): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = window.setInterval(() => setTick((n) => n + 1), ms);
    return () => window.clearInterval(id);
  }, [on, ms]);
  return tick;
}
