/**
 * What a page knows while it loads something from the Clean Space service, and who is signed in: the shapes the
 * account and activation pages decide their views from (activation.ts, components/clean-space/hooks.ts).
 */
import type { ErrorInfo } from "./api";

export type Loadable<T> = { status: "loading" } | { status: "error"; error: ErrorInfo } | { status: "ready"; value: T };

export type AuthStatus = "loading" | "unconfigured" | "signed-out" | "signed-in";
