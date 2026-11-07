/**
 * How the pages write prices, times and sign-in methods. Prices come from the service's integer minor units through
 * the contract's tossAmountText (exact decimal text, never float arithmetic); times are exact instants with seconds
 * and a time zone, never "a year" (plan §2.2).
 */
import { DURATION_SECONDS, tossAmountText, type Money, type PageLang, type Provider } from "./contract.generated";

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** "₩3,300" or "US$2.49": the exact amount the buyer is charged, in the currency's own symbol. */
export function formatPrice(money: Money): string {
  const text = tossAmountText(money);
  if (money.currency === "KRW") return `₩${groupThousands(text)}`;
  const [whole, fraction] = text.split(".");
  return `US$${groupThousands(whole)}.${fraction}`;
}

/** The currency's name next to the choice. */
export function currencyLabel(currency: Money["currency"]): string {
  return currency === "KRW" ? "Korean won (KRW)" : "US dollars (USD), with PayPal";
}

const LOCALES: Record<PageLang, string> = { en: "en-US", ko: "ko-KR" };

/**
 * An instant (whole seconds) with date, time to the second and the time zone's name, in the viewer's zone unless one is
 * given: "November 7, 2027 at 3:12:45 PM GMT+9".
 */
export function formatInstant(seconds: number, lang: PageLang, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: "long", timeStyle: "long", ...(timeZone ? { timeZone } : {}) }).format(new Date(seconds * 1000));
}

/** The same instant in UTC, ISO 8601 ("2027-11-07T06:12:45Z"): the `dateTime` of a <time> and the exact reference. */
export function isoUtc(seconds: number): string {
  return new Date(seconds * 1000).toISOString().replace(".000Z", "Z");
}

/** The viewer's time zone name ("Asia/Seoul"), or null when the browser doesn't say. */
export function viewerTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

/** When a term that started at `startsAt` ends: exactly 364 days of seconds later (the contract's rule). */
export function termEndOf(startsAt: number): number {
  return startsAt + DURATION_SECONDS;
}

/** Seconds left until `until`, by the service's clock offset (server time minus this browser's when it answered). */
export function secondsLeft(until: number, serverOffsetSeconds: number, nowMs: number = Date.now()): number {
  return Math.max(0, Math.floor(until - (nowMs / 1000 + serverOffsetSeconds)));
}

/** "9:45" (minutes and seconds) for a countdown. */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function providerLabel(provider: Provider): string {
  return provider === "google" ? "Google" : provider === "kakao" ? "Kakao" : "Naver";
}

/** Toss's method label as it reported it, with PayPal by name. */
export function paymentMethodLabel(method: string | null): string {
  if (!method) return "—";
  return /paypal|페이팔/i.test(method) ? "PayPal" : method;
}
