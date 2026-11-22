import { describe, expect, it } from "vitest";
import { refundPhase, refundWindow } from "../../refund-schedule";
import { ALL_IN_ONE_COPY, CHORD_TO_MIDI_COPY, CLEAN_SPACE_COPY, DJ_DUPLICATE_GUARD_COPY } from "../product-copy";
import { checkoutRefundSummary } from "../refund-summary";

describe("scheduled refund wording", () => {
  const P = "2026-12-05T12:00:00+09:00";
  const E = "2026-12-12T23:00:00+09:00";
  it("is off when missing or less than seven full days and uses inclusive P and E", () => {
    expect(refundWindow(undefined, E)).toBeNull();
    expect(refundWindow(P, "2026-12-12T11:59:59.999+09:00")).toBeNull();
    expect(refundWindow("2026-11-31T12:00:00+09:00", E)).toBeNull();
    const window = refundWindow(P, E);
    expect([Date.parse(P) - 1, Date.parse(P), Date.parse(E) - 1, Date.parse(E)].map((at) => refundPhase(window, at)))
      .toEqual(["inactive", "notice", "notice", "effective"]);
  });
  for (const lang of ["en", "ko"] as const) {
    it("switches only the three affected checkout statements after E in " + lang, () => {
      const amended = lang === "en"
        ? "Full refund within the applicable seven-day period, even after use. After that, cancel during the original 364-day term for an unused-period refund without a fee. Only the refunded order's access ends. Details and email requests are in the product's Refund Policy."
        : "적용되는 7일 이내에는 이용했더라도 전액 환불됩니다. 이후에는 원래의 364일 이용 기간 중 해지하여 남은 기간만큼 수수료 없이 환불받을 수 있습니다. 환불한 주문의 이용 권한만 종료됩니다. 자세한 내용과 이메일 요청 방법은 해당 상품의 환불정책을 참고해 주세요.";
      for (const copy of [ALL_IN_ONE_COPY, CLEAN_SPACE_COPY, CHORD_TO_MIDI_COPY]) {
        const baseline = copy[lang].includes;
        expect(checkoutRefundSummary(baseline, lang, "inactive")).toEqual(baseline);
        expect(checkoutRefundSummary(baseline, lang, "notice")).toEqual(baseline);
        const result = checkoutRefundSummary(baseline, lang, "effective");
        expect(result.filter((line, index) => line !== baseline[index])).toEqual([amended]);
      }
      expect(checkoutRefundSummary(DJ_DUPLICATE_GUARD_COPY[lang].includes, lang, "effective"))
        .toEqual(DJ_DUPLICATE_GUARD_COPY[lang].includes);
    });
  }
});
