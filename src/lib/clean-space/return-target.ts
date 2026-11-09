/**
 * Where a page goes after a sign-in: an allow-listed Clean Space page in one language, never an address taken from
 * input (plan §5.1). The paths come from the contract's PAGE_PATH only.
 */
import { PAGE_LANGS, PAGE_PATH, RETURN_ROUTES, type PageLang, type ReturnRoute, type ReturnTarget } from "./contract.generated";

export function isPageLang(value: unknown): value is PageLang {
  return typeof value === "string" && (PAGE_LANGS as readonly string[]).includes(value);
}

/** A return target with exactly `route` and `lang`, both allow-listed; anything else (a URL above all) is null. */
export function parseReturnTarget(value: unknown): ReturnTarget | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const entry = value as Record<string, unknown>;
  const keys = Object.keys(entry);
  if (keys.length !== 2 || !keys.includes("route") || !keys.includes("lang")) return null;
  if (typeof entry.route !== "string" || !(RETURN_ROUTES as readonly string[]).includes(entry.route)) return null;
  if (!isPageLang(entry.lang)) return null;
  return { route: entry.route as ReturnRoute, lang: entry.lang };
}

/** The page's path on this site, trailing slash included. */
export function returnTargetPath(target: ReturnTarget): string {
  return PAGE_PATH[target.route][target.lang];
}

/** The same Clean Space page in the other language (the language links of the pages). */
export function otherLanguagePath(route: keyof typeof PAGE_PATH, lang: PageLang): string {
  return PAGE_PATH[route][lang === "en" ? "ko" : "en"];
}
