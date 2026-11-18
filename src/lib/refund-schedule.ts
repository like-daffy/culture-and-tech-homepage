/** Same public instants as the portal. Without seven full days between them, the amendment stays off. */
function instant(value: string | undefined): number | null {
  if (!value || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}T(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:[.][0-9]{1,3})?(?:Z|[+-](?:[01][0-9]|2[0-3]):[0-5][0-9])$/.test(value)) return null;
  const day = value.slice(0, 10);
  const midnight = new Date(day + "T00:00:00Z");
  if (!Number.isFinite(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== day) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

export function refundWindow(published: string | undefined, effective: string | undefined) {
  const publishedAt = instant(published);
  const effectiveAt = instant(effective);
  if (publishedAt === null || effectiveAt === null || effectiveAt - publishedAt < 7 * 86_400_000) return null;
  return { publishedAt, effectiveAt };
}

export const REFUND_WINDOW = refundWindow(
  process.env.NEXT_PUBLIC_PORTAL_REFUND_NOTICE_PUBLISHED_AT,
  process.env.NEXT_PUBLIC_PORTAL_REFUND_NOTICE_EFFECTIVE_AT,
);
export type RefundPhase = "inactive" | "notice" | "effective";

export function refundPhase(window: ReturnType<typeof refundWindow>, now: number): RefundPhase {
  if (!window || now < window.publishedAt) return "inactive";
  return now < window.effectiveAt ? "notice" : "effective";
}

export function refundTime(at: number, lang: "en" | "ko"): string {
  return new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-GB", {
    timeZone: "Asia/Seoul", dateStyle: "long", timeStyle: "short", hourCycle: "h23",
  }).format(at) + " KST (UTC+09:00)";
}
