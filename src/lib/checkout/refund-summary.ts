import type { Lang } from "./contract";
import type { RefundPhase } from "../refund-schedule";

const PRIOR = {
  en: "Full refund on request within 7 days of payment.",
  ko: "결제 후 7일 이내에 요청하면 전액 환불됩니다.",
};
const APPROVED = {
  "en": "Full refund within the applicable seven-day period, even after use. After that, cancel during the original 364-day term for an unused-period refund without a fee. Only the refunded order's access ends. Details and email requests are in the product's Refund Policy.",
  "ko": "적용되는 7일 이내에는 이용했더라도 전액 환불됩니다. 이후에는 원래의 364일 이용 기간 중 해지하여 남은 기간만큼 수수료 없이 환불받을 수 있습니다. 환불한 주문의 이용 권한만 종료됩니다. 자세한 내용과 이메일 요청 방법은 해당 상품의 환불정책을 참고해 주세요."
};

export function checkoutRefundSummary(lines: readonly string[], lang: Lang, phase: RefundPhase): readonly string[] {
  // DJ's existing refund-rights sentence is different and remains in force.
  return phase === "effective" ? lines.map((line) => line === PRIOR[lang] ? APPROVED[lang] : line) : lines;
}
