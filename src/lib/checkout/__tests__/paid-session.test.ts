import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { paidOrder, rememberPaid } from "../session";
import type { OpenProduct } from "../products";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PassTerm } from "@/components/checkout/CheckoutResult";
import { CHORD_TO_MIDI_COPY } from "../product-copy";

const chord = { storageKey: "checkout.chord" } as OpenProduct;
const other = { storageKey: "checkout.other" } as OpenProduct;
const pass = { start: "2026-01-01T00:00:00Z", end: "2027-01-01T00:00:00Z" };
let entries: Map<string, string>;
beforeEach(() => {
  entries = new Map();
  vi.stubGlobal("window", { sessionStorage: {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  } });
});
afterEach(() => vi.unstubAllGlobals());

describe("paid checkout cache", () => {
  it.each(["test", "live"] as const)("retains %s with or without a pass on reload", (environment) => {
    for (const savedPass of [pass, null]) {
      rememberPaid(chord, { orderId: "order-one", pass: savedPass, environment });
      expect(paidOrder(chord)).toEqual({ orderId: "order-one", pass: savedPass, environment });
    }
  });
  it("does not inherit a previous environment for an unknown payment or another product", () => {
    rememberPaid(chord, { orderId: "order-one", pass, environment: "live" });
    rememberPaid(other, { orderId: "order-other", pass: null, environment: "test" });
    rememberPaid(chord, { orderId: "order-two", pass: null });
    expect(paidOrder(chord)).toEqual({ orderId: "order-two", pass: null, environment: undefined });
    expect(paidOrder(other)?.environment).toBe("test");
  });
  it.each(['not-json', JSON.stringify({ orderId: 'other', environment: 'live' }), JSON.stringify({ orderId: 'order-one', environment: 'production' })])("treats malformed or mismatched environment as unknown", (raw) => {
    rememberPaid(chord, { orderId: "order-one", pass, environment: "test" });
    entries.set("checkout.chord.environment", raw);
    expect(paidOrder(chord)?.environment).toBeUndefined();
  });
  it("treats old cache entries without environment as unknown", () => {
    entries.set("checkout.chord.paid", "order-one");
    expect(paidOrder(chord)).toEqual({ orderId: "order-one", pass: null, environment: undefined });
  });
  it("retains only explicitly marked test-review receipt metadata for the same order", () => {
    rememberPaid(chord, { orderId: "order-one", pass: null, environment: "test", review: true, receiptUrl: "https://example.invalid/receipt" });
    expect(paidOrder(chord)).toMatchObject({ orderId: "order-one", environment: "test", review: true, receiptUrl: "https://example.invalid/receipt" });
    entries.set("checkout.chord.paid", "other-order");
    expect(paidOrder(chord)?.review).toBeUndefined();
    rememberPaid(chord, { orderId: "order-two", pass: null, environment: "live", review: true });
    expect(paidOrder(chord)?.review).toBeUndefined();
  });
  it.each(["en", "ko"] as const)("renders the cached %s test, live, and unknown terms safely", (lang) => {
    const product = { ...chord, copy: CHORD_TO_MIDI_COPY } as OpenProduct;
    const render = () => { const paid = paidOrder(product)!; return renderToStaticMarkup(createElement(PassTerm, { product, lang, pass: paid.pass, environment: paid.environment })); };
    rememberPaid(product, { orderId: "order-one", pass, environment: "test" });
    expect(render()).toContain('data-pass-term="test"');
    expect(render()).toContain(lang === "en" ? "nothing is charged" : "청구되지 않습니다");
    expect(render()).not.toContain("2027");
    rememberPaid(product, { orderId: "order-two", pass, environment: "live" });
    expect(render()).toContain("2027");
    expect(render()).not.toContain('data-pass-term="test"');
    rememberPaid(product, { orderId: "order-three", pass });
    expect(render()).toBe("");
  });
});
