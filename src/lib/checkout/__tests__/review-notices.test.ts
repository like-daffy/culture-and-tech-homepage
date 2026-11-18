import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReviewEmailNotice, ReviewReceiptNotice } from "@/components/checkout/ReviewPaymentNotices";

describe("review payment notices", () => {
  it.each([
    ["en", "This is Test payment mode. In the live environment the customer receives a receipt email.", "This is the receipt of a test payment."],
    ["ko", "테스트 결제 모드입니다. 실제 운영 환경에서는 고객에게 영수증 이메일이 발송됩니다.", "테스트 결제입니다."],
  ] as const)("renders the requested %s text without an email address or document link", (lang, emailText, resultText) => {
    const email = renderToStaticMarkup(createElement(ReviewEmailNotice, { lang }));
    const result = renderToStaticMarkup(createElement(ReviewReceiptNotice, { lang }));
    expect(email).toContain(emailText);
    expect(result).toContain(resultText);
    expect(email + result).not.toMatch(/@|\.pdf|<a\b/i);
  });
});

describe("gated post-launch review receipt", () => {
  afterEach(() => vi.unstubAllEnvs());
  it.each([
    ["en", "Review test payment only — nothing was charged, and no paid pass is granted."],
    ["ko", "심사용 테스트 결제입니다 — 실제 금액은 청구되지 않으며 유료 이용권은 부여되지 않습니다."],
  ] as const)("keeps the %s candidate off until approved and post-launch", (lang, candidate) => {
    const render = (postLaunch: boolean) => renderToStaticMarkup(createElement(ReviewReceiptNotice, { lang, postLaunch }));
    const neutral = render(false);
    vi.stubEnv("NEXT_PUBLIC_CHECKOUT_POST_LAUNCH_REVIEW_COPY", undefined);
    expect(render(true)).toBe(neutral);
    vi.stubEnv("NEXT_PUBLIC_CHECKOUT_POST_LAUNCH_REVIEW_COPY", "1");
    expect(render(false)).toBe(neutral);
    expect(render(true)).toContain(candidate);
  });
});
