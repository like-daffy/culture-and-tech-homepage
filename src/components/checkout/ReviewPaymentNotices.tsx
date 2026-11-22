import type { Lang } from "@/lib/checkout/contract";
import { CHECKOUT_COPY } from "@/lib/checkout/copy";

/** Shared review-only wording. Callers must establish review status from the agreed server contract. */
export function ReviewEmailNotice({ lang }: { lang: Lang }) {
  return <p>{CHECKOUT_COPY[lang].reviewReceiptEmail}</p>;
}

// Owner-approved Row 7A for confirmed post-launch review TEST receipts.
const POST_LAUNCH_REVIEW_RECEIPT = {
  en: "Review test payment only — nothing was charged, and no paid pass is granted.",
  ko: "심사용 테스트 결제입니다 — 실제 금액은 청구되지 않으며 유료 이용권은 부여되지 않습니다.",
} satisfies Record<Lang, string>;

export function ReviewReceiptNotice({ lang, postLaunch = false }: { lang: Lang; postLaunch?: boolean }) {
  const approvedCopy = postLaunch && process.env.NEXT_PUBLIC_CHECKOUT_POST_LAUNCH_REVIEW_COPY !== "0";
  return <p>{approvedCopy ? POST_LAUNCH_REVIEW_RECEIPT[lang] : CHECKOUT_COPY[lang].reviewReceipt}</p>;
}
