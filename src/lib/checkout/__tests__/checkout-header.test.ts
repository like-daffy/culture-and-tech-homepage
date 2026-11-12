import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { PORTAL_ORIGIN } from "@/lib/clean-space/contract.generated";
import type { CheckoutProduct } from "../products";

// The header every checkout page and result page shares (CheckoutPage, CheckoutResult), for an open and a closed
// product: the logo to the account portal, "Official Page" to the homepage, the "Checkout" label kept (the owner,
// 2026-11-12). Both links open a new tab with no opener or referrer, as the logo always did.
const open = { enabled: true, slug: "clean-space", copy: { en: { pageTitle: "fixture" }, ko: { pageTitle: "fixture" } }, footerPages: [] } as unknown as CheckoutProduct;
const closed = { enabled: false, slug: "dj-duplicate-guard" } as unknown as CheckoutProduct;

function header(product: CheckoutProduct, lang: "en" | "ko") {
  // The page's content goes in as createElement's child argument (react/no-children-prop), so the props are cast.
  const props = { product, lang } as Parameters<typeof CheckoutLayout>[0];
  const html = renderToStaticMarkup(createElement(CheckoutLayout, props, "body"));
  const head = /<header[\s\S]*?<\/header>/.exec(html)?.[0] ?? "";
  const links = [...head.matchAll(/<a ([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attrs, inner]) => ({
    href: /href="([^"]*)"/.exec(attrs)?.[1],
    target: /target="([^"]*)"/.exec(attrs)?.[1],
    rel: /rel="([^"]*)"/.exec(attrs)?.[1],
    text: inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim(),
    image: /<img [^>]*logo-transparent-192\.png/.test(inner),
  }));
  return { head, links, text: head.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim() };
}

describe("the checkout header", () => {
  it.each([["open", open], ["closed", closed]] as const)("links the logo to the portal and Official Page to the homepage (%s product)", (_, product) => {
    for (const lang of ["en", "ko"] as const) {
      const { links, text } = header(product, lang);
      expect(links).toEqual([
        {
          href: lang === "ko" ? "https://portal.cultureand.tech/ko" : "https://portal.cultureand.tech",
          target: "_blank",
          rel: "noopener noreferrer",
          text: "Culture & Tech",
          image: true,
        },
        {
          href: lang === "ko" ? "https://cultureand.tech/ko/" : "https://cultureand.tech/",
          target: "_blank",
          rel: "noopener noreferrer",
          text: lang === "ko" ? "공식 페이지" : "Official Page",
          image: false,
        },
      ]);
      // The label stays, beside the new link at the right edge.
      expect(text).toBe(lang === "ko" ? "Culture & Tech 결제 공식 페이지" : "Culture & Tech Checkout Official Page");
    }
  });

  it("uses the portal of the checkout's other portal links, which is the contract's", () => {
    expect(header(open, "en").links[0].href).toBe(PORTAL_ORIGIN);
  });
});
