import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Navigation } from "@/components/Navigation";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { getTranslations } from "@/lib/translations";
import type { CheckoutProduct } from "@/lib/checkout/products";

// The site's top navigation (the homepage and the app pages): the Culture & Tech logo before the name, inside the
// same link, as in the checkout header (the owner, 2026-11-12). The language comes from the page; the language switch
// is left out here (it has its own menu).
const state = vi.hoisted(() => ({ language: "en" as "en" | "ko" }));
vi.mock("@/contexts/LanguageProvider", async () => {
  const { getTranslations: translations } = await import("@/lib/translations");
  return { useLanguage: () => ({ language: state.language, setLanguage: () => {}, translations: translations(state.language), isLoading: false }) };
});
vi.mock("@/components/LanguageSwitch", () => ({ LanguageSwitch: () => null }));

const attr = (tag: string, name: string) => /\s/.test(tag) ? new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] : undefined;
const logoFile = (src: string | undefined) => decodeURIComponent(src ?? "").match(/\/brand\/[\w.-]+\.png/)?.[0];

function brand(language: "en" | "ko", homePath?: string) {
  state.language = language;
  const html = renderToStaticMarkup(createElement(Navigation, { homePath }));
  const link = /<a ([^>]*)>([\s\S]*?)<\/a>/.exec(html);
  const images = [...(link?.[2] ?? "").matchAll(/<img [^>]*>/g)].map(([tag]) => tag);
  return { html, href: attr(` ${link?.[1]}`, "href"), images, text: (link?.[2] ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim(), startsWithImage: /^<img /.test(link?.[2] ?? "") };
}

describe("the top navigation", () => {
  it.each([[undefined, "#home"], ["/", "/"], ["/ko/", "/ko/"]] as const)("puts the logo before the name, inside the same link (home %s)", (homePath, href) => {
    for (const language of ["en", "ko"] as const) {
      const b = brand(language, homePath);
      // next/link keeps a trailing slash only with the site's trailingSlash setting (next.config.mjs, in the build).
      expect(b.href?.replace(/(.)\/$/, "$1")).toBe(href.replace(/(.)\/$/, "$1"));
      expect(b.text).toBe(language === "en" ? "Culture & Tech" : "컬처앤테크");
      expect(b.startsWithImage).toBe(true);
      expect(b.images).toHaveLength(1);
      const [img] = b.images;
      expect(logoFile(attr(img, "src"))).toBe("/brand/logo-transparent-192.png");
      // Its own size, so the bar keeps its height; no text of its own, since the name follows.
      expect([attr(img, "width"), attr(img, "height"), attr(img, "alt")]).toEqual(["32", "32", ""]);
      // The menu is as it was.
      const menu = getTranslations(language).navigation;
      for (const label of [menu.home, menu.about, menu.apps, menu.services, menu.contact]) expect(b.html).toContain(`>${label}<`);
    }
  });

  it("uses the same logo file as the checkout header", () => {
    const props = { product: { enabled: false } as unknown as CheckoutProduct, lang: "en" } as Parameters<typeof CheckoutLayout>[0];
    const checkout = renderToStaticMarkup(createElement(CheckoutLayout, props, "body"));
    const header = /<header[\s\S]*?<\/header>/.exec(checkout)?.[0] ?? "";
    const checkoutImg = /<img [^>]*>/.exec(header)?.[0] ?? "";
    expect(logoFile(attr(checkoutImg, "src"))).toBe(logoFile(attr(brand("en").images[0], "src")));
  });
});
