import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Checkout } from "@/components/checkout/CheckoutPage";
import { sameCheckoutIdentity, validCheckoutIdentity } from "../review";
import { CHORD_TO_MIDI_COPY, CLEAN_SPACE_COPY, DJ_DUPLICATE_GUARD_COPY, ALL_IN_ONE_COPY } from "../product-copy";
import type { OpenCheckoutResponse } from "../contract";
import type { OpenProduct } from "../products";

const options = [{ currency: "KRW", price: 100, test: true, clientKey: "test_fixture", variantKey: "fixture", agreementVariantKey: "fixture" }] as OpenCheckoutResponse["options"];
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

describe("All-in-one checkout before DJ V1", () => {
  afterEach(() => { vi.unstubAllEnvs(); });

  it.each([
    ["en", "DJ Duplicate Guard Expert joins All-in-one at its V1 release. If your All-in-one pass is active then, Expert is included automatically through your pass’s original end date."],
    ["ko", "DJ Duplicate Guard Expert는 V1 출시 시 All-in-one에 포함됩니다. 출시 시 All-in-one 이용권이 유효하면 원래 종료일까지 Expert를 자동으로 이용할 수 있습니다."],
  ] as const)("shows the %s label only for opted-in All-in-one checkout", (lang, label) => {
    const render = (slug: string, copy: OpenProduct["copy"]) => {
      const product = { slug, copy, origin: "https://example.invalid", pages: { en: {}, ko: {} }, startPage: "account" } as unknown as OpenProduct;
      return renderToStaticMarkup(createElement(Checkout, { product, lang, checkout: { ...base, lang, review: true, receiptEmail: null }, credential }));
    };
    vi.stubEnv("NEXT_PUBLIC_DJ_JOINING_AT_V1", undefined);
    const before = render("all-in-one", ALL_IN_ONE_COPY);
    expect(before).not.toContain(label);
    vi.stubEnv("NEXT_PUBLIC_DJ_JOINING_AT_V1", "0");
    expect(render("all-in-one", ALL_IN_ONE_COPY)).toBe(before);
    vi.stubEnv("NEXT_PUBLIC_DJ_JOINING_AT_V1", "1");
    const after = render("all-in-one", ALL_IN_ONE_COPY);
    expect(after).toContain(`<p>${label}</p>`);
    expect(after.replace(`<p>${label}</p>`, "")).toBe(before);
    for (const [slug, copy] of [["chord-to-midi", CHORD_TO_MIDI_COPY], ["clean-space", CLEAN_SPACE_COPY], ["dj-duplicate-guard", DJ_DUPLICATE_GUARD_COPY]] as const) {
      expect(render(slug, copy)).not.toContain(label);
    }
  });
});

describe("domestic TEST review guard", () => {
  const domestic = { ...options[0], test: false };
  const live = { ...domestic, clientKey: "live_fixture" };
  const paypal = { ...domestic, currency: "USD" as const, test: true };
  const product = { slug: "chord-to-midi", copy: CHORD_TO_MIDI_COPY, origin: "https://example.invalid",
    pages: { en: {}, ko: {} }, startPage: "account" } as unknown as OpenProduct;

  for (const lang of ["en", "ko"] as const) {
    const render = (options: OpenCheckoutResponse["options"], review: boolean) => renderToStaticMarkup(createElement(Checkout, {
      product, lang, credential, checkout: { ...base, lang, options, ...(review ? { review: true as const, receiptEmail: null } :
        { receiptEmail: "fixture@example.invalid" }) },
    }));
    const priceLabel = lang === "en" ? "Test amount" : "테스트 금액";
    const neutral = lang === "en" ? "Nothing will be charged." : "실제로 청구되지 않습니다.";
    const currencyLabel = lang === "en" ? "US dollars (USD)" : "미국 달러 (USD)";
    it(`offers only KRW TEST in ${lang}, even when its old flag is false`, () => {
      const safe = render([paypal, { ...live, test: true }, domestic], true);
      expect(safe).toContain(priceLabel);
      expect(safe).toContain(neutral);
      expect(safe).not.toContain(currencyLabel);
      expect(safe).not.toContain("Sandbox");
    });
    it(`fails closed in ${lang} for PayPal and a LIVE key mislabelled as TEST`, () => {
      const refused = render([paypal, { ...live, test: true }], true);
      expect(refused).toContain(lang === "en" ? "Nothing was charged." : "청구된 금액은 없습니다.");
      expect(refused).not.toContain('<input');
    });
    it(`preserves ordinary pre-launch TEST labels and normal USD availability in ${lang}`, () => {
      expect(render([domestic], false)).toContain(priceLabel);
      const normal = render([live, { ...paypal, clientKey: "live_fixture", test: false }], false);
      expect(normal).toContain(currencyLabel);
      expect(normal).not.toContain(priceLabel);
      expect(normal).not.toContain(neutral);
    });
  }
});
