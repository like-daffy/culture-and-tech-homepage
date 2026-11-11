import type { Lang } from "@/lib/checkout/contract";
import { CHECKOUT_COPY } from "@/lib/checkout/copy";

/** Shared review-only wording. Callers must establish review status from the agreed server contract. */
export function ReviewEmailNotice({ lang }: { lang: Lang }) {
  return <p>{CHECKOUT_COPY[lang].reviewReceiptEmail}</p>;
}

/** The existing verified receipt link opens the provider's web page; no document is generated here. */
export function ReviewReceiptNotice({ lang }: { lang: Lang }) {
  return <p>{CHECKOUT_COPY[lang].reviewReceipt}</p>;
}
