import { useEffect, useState } from "react";
import { REFUND_WINDOW, refundPhase, refundTime, type RefundPhase } from "@/lib/refund-schedule";

const copy = {
  en: {
    label: "View refund policy changes",
    productLabel: "View the changes and effective date",
    productNotice: "Refund policy update. From {effective}, if you cancel during the original 364-day term after the applicable seven-day period, you may receive an unused-period refund without a fee.",
  },
  ko: {
    label: "환불정책 변경 내용 보기",
    productLabel: "변경 내용과 시행 일시 보기",
    productNotice: "환불정책 변경 안내. {effective}부터 적용되는 7일이 지난 뒤에도 원래의 364일 이용 기간 중 해지하면 남은 기간만큼 수수료 없이 환불받을 수 있습니다.",
  },
};

export function useRefundPhase(): RefundPhase {
  const [phase, setPhase] = useState<RefundPhase>("inactive");
  useEffect(() => {
    if (!REFUND_WINDOW) return;
    const { publishedAt, effectiveAt } = REFUND_WINDOW;
    let timer: ReturnType<typeof setTimeout>;
    function sync() {
      clearTimeout(timer);
      const now = Date.now();
      setPhase(refundPhase(REFUND_WINDOW, now));
      const next = now < publishedAt ? publishedAt : effectiveAt;
      if (now < next) timer = setTimeout(sync, Math.min(next - now, 2_147_483_647));
    }
    sync();
    return () => clearTimeout(timer);
  }, []);
  return phase;
}

export function RefundAmendmentLink({ lang, productNotice = false }: { lang: "en" | "ko"; productNotice?: boolean }) {
  if (useRefundPhase() !== "notice" || !REFUND_WINDOW) return null;
  const { label, productLabel, productNotice: notice } = copy[lang];
  const href = "https://portal.cultureand.tech" + (lang === "ko" ? "/ko" : "") + "/refund-policy-update";
  return <p className="text-sm text-muted-foreground">
    {productNotice && <>{notice.replace("{effective}", refundTime(REFUND_WINDOW.effectiveAt, lang))}{" "}</>}
    <a className="underline" href={href} target="_blank" rel="noopener noreferrer">{productNotice ? productLabel : label}</a>
  </p>;
}
