import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Checkout } from "@/components/checkout/CheckoutPage";
import { sameCheckoutIdentity, validCheckoutIdentity } from "../review";
import { CHORD_TO_MIDI_COPY, CLEAN_SPACE_COPY, DJ_DUPLICATE_GUARD_COPY, ALL_IN_ONE_COPY } from "../product-copy";
import type { OpenCheckoutResponse } from "../contract";
import type { OpenProduct } from "../products";

const options = [{ currency: "KRW", price: 100, test: true, clientKey: "fixture", variantKey: "fixture", agreementVariantKey: "fixture" }] as OpenCheckoutResponse["options"];
const base = { product: "fixture", lang: "en", orderName: "fixture", options, expiresAt: "2026-12-01" } as OpenCheckoutResponse;
const credential = { checkoutId: "fixture", checkoutKey: "fixture" };

describe("explicit review checkout identity", () => {
  it("never infers review from missing email and rejects inconsistent order answers", () => {
    expect(validCheckoutIdentity({ receiptEmail: null })).toBe(false);
    expect(validCheckoutIdentity({ review: true, receiptEmail: null })).toBe(true);
    expect(validCheckoutIdentity({ review: true, receiptEmail: "fixture@example.invalid" })).toBe(false);
    expect(sameCheckoutIdentity({ review: true, receiptEmail: null }, { receiptEmail: "fixture@example.invalid" })).toBe(false);
    expect(sameCheckoutIdentity({ receiptEmail: "fixture@example.invalid" }, { review: true, receiptEmail: null })).toBe(false);
  });
  it.each([CHORD_TO_MIDI_COPY, CLEAN_SPACE_COPY, DJ_DUPLICATE_GUARD_COPY, ALL_IN_ONE_COPY])("shows review wording and no account prompt for each product", (copy) => {
    const product = { copy, origin: "https://example.invalid", pages: { en: {}, ko: {} }, startPage: "account" } as unknown as OpenProduct;
    for (const lang of ["en", "ko"] as const) {
      const markup = renderToStaticMarkup(createElement(Checkout, { product, lang, checkout: { ...base, lang, review: true, receiptEmail: null }, credential }));
      expect(markup).toContain(lang === "en" ? "This is Test payment mode." : "테스트 결제 모드입니다.");
      expect(markup).not.toContain("fixture@example.invalid");
      expect(markup).not.toContain(copy[lang].notYou);
      const normal = renderToStaticMarkup(createElement(Checkout, { product, lang, checkout: { ...base, lang, receiptEmail: "fixture@example.invalid" }, credential }));
      expect(normal).toContain("fixture@example.invalid");
      expect(normal).not.toContain(lang === "en" ? "This is Test payment mode." : "테스트 결제 모드입니다.");
    }
  });
});
