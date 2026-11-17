import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChordLost, recoverLostCheckout } from "@/components/checkout/CheckoutResult";
import { CHECKOUT_COPY } from "../copy";
import { CHORD_TO_MIDI_COPY } from "../product-copy";
import type { OpenProduct } from "../products";

const details = { orderId: "fixture", paymentKey: "fixture", amount: 100 };
describe("lost checkout recovery", () => {
  it("never keeps a Chord payment and instead shows the start-again state", () => {
    const show = vi.fn(), keep = vi.fn();
    recoverLostCheckout({ slug: "chord-to-midi" } as OpenProduct, details, show, keep);
    expect(show).toHaveBeenCalledOnce();
    expect(keep).not.toHaveBeenCalled();
  });
  it("keeps the existing recovery path for another product", () => {
    const show = vi.fn(), keep = vi.fn();
    recoverLostCheckout({ slug: "clean-space" } as OpenProduct, details, show, keep);
    expect(show).not.toHaveBeenCalled();
    expect(keep).toHaveBeenCalledWith(details);
  });
});

// The owner's decision 14 (17 Nov): the words must hold in TEST and once Chord sells for real, so that a real buyer is
// neither told a test payment charges nothing nor led to pay twice.
describe("Chord's lost checkout, in TEST and in LIVE", () => {
  it("says the page couldn't confirm the payment, to check Remove ADs before buying again, and how to go on", () => {
    expect(CHECKOUT_COPY.en.chordLost).toBe(
      "This page couldn't confirm the payment, for example because the checkout ended before the payment was confirmed. Before buying again, check whether Remove ADs is on your Chord to MIDI account. If it is, the purchase went through and you don't need to buy it again; if it isn't, start again from Chord to MIDI's purchase page."
    );
    // The owner's own Korean, exactly as typed (sheet row G7, option B), punctuation included.
    expect(CHECKOUT_COPY.ko.chordLost).toBe(
      "결제가 확인되기 전에 결제 페이지가 종료되는 사유 등의 이유로 이 페이지에서는 결제를 확인하지 못했습니다. 다시 구매하기 전에 Chord to MIDI 계정에 광고 제거가 적용되어 있는지 확인해 주세요. 적용되어 있다면 구매가 완료된 것이므로 다시 구매하실 필요는 없습니다, 적용되어 있지 않다면 Chord to MIDI 구매 페이지에서 다시 시작해 주세요."
    );
    // Nothing that holds only in TEST.
    for (const text of [CHECKOUT_COPY.en.chordLost, CHECKOUT_COPY.ko.chordLost]) {
      expect(text).not.toMatch(/test payment|charges nothing|테스트 결제|청구되지 않습니다/i);
    }
  });

  it("shows the words, the way back to Chord's purchase page and the order number to write to, in both languages", () => {
    const product = { slug: "chord-to-midi", copy: CHORD_TO_MIDI_COPY, enabled: true, origin: "https://chord.example.invalid", pages: { purchase: "purchase" } } as unknown as OpenProduct;
    for (const lang of ["en", "ko"] as const) {
      const markup = renderToStaticMarkup(createElement(ChordLost, { product, lang, orderId: "ctm_20261212_FIXTURE" }));
      const escaped = (s: string) => s.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");
      expect(markup).toContain(escaped(CHECKOUT_COPY[lang].chordLost));
      expect(markup).toContain(CHECKOUT_COPY[lang].chordStartAgain);
      expect(markup).toContain(`href="https://chord.example.invalid${lang === "ko" ? "/ko" : ""}/purchase"`);
      expect(markup).toContain(lang === "en" ? "If you were charged, contact us with order number ctm_20261212_FIXTURE." : "결제가 되었다면 주문번호 ctm_20261212_FIXTURE와 함께 문의해 주세요.");
      expect(markup).toContain('href="mailto:contact@cultureand.tech"');
    }
  });
});
