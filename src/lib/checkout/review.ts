import type { CheckoutOption, ConfirmPaymentResponse } from "./contract";

/** Review mode is explicit; a missing email alone never means review. */
export function validCheckoutIdentity(value: { review?: unknown; receiptEmail?: unknown }): boolean {
  return value.review === true ? value.receiptEmail === null : value.review === undefined && typeof value.receiptEmail === "string" && value.receiptEmail.length > 0;
}

export function sameCheckoutIdentity(open: { review?: true; receiptEmail: string | null }, order: { review?: true; receiptEmail: string | null }): boolean {
  return validCheckoutIdentity(open) && validCheckoutIdentity(order) && (open.review === true) === (order.review === true);
}

/** Older products flag only their USD sandbox option. The TEST key identifies a domestic test option too. */
export function isTestOption(option: Pick<CheckoutOption, "test" | "clientKey">): boolean {
  return option.test === true || hasTestKey(option.clientKey);
}

const hasTestKey = (key: unknown): boolean => typeof key === "string" && key.startsWith("test_");

/** A review account may only reach a domestic TEST widget. A boolean cannot make a LIVE key safe. */
export function allowsPaymentOption(review: true | undefined, option: Pick<CheckoutOption, "currency" | "clientKey">): boolean {
  return review !== true || (option.currency === "KRW" && hasTestKey(option.clientKey));
}

export function isPostLaunchReview(result: Pick<ConfirmPaymentResponse, "environment" | "review" | "postLaunchReview" | "pass">): boolean {
  if (result.review !== true || result.environment !== "test") return false;
  if (result.postLaunchReview === true) return true;
  if (!result.pass) return false;
  const start = Date.parse(result.pass.start);
  const end = Date.parse(result.pass.end);
  return Number.isFinite(start) && Number.isFinite(end) && end <= start;
}
