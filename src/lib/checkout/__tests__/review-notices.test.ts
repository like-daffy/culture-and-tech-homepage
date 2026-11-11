import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReviewEmailNotice, ReviewReceiptNotice } from "@/components/checkout/ReviewPaymentNotices";

describe("review payment notices", () => {
  it.each([
    ["en", "This is Test payment mode. In the live environment the customer receives a receipt email.", "This is the receipt of a test payment."],
    ["ko", "테스트 결제 모드입니다. 실제 운영 환경에서는 고객에게 영수증 이메일이 발송됩니다.", "테스트 결제 영수증입니다."],
  ] as const)("renders the requested %s text without an email address or document link", (lang, emailText, resultText) => {
    const email = renderToStaticMarkup(createElement(ReviewEmailNotice, { lang }));
    const result = renderToStaticMarkup(createElement(ReviewReceiptNotice, { lang }));
    expect(email).toContain(emailText);
    expect(result).toContain(resultText);
    expect(email + result).not.toMatch(/@|\.pdf|<a\b/i);
  });
});
