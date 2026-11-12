/**
 * clean-space.app, Clean Space's own site (README, "clean-space.app"), where Clean Space's product page is the home page
 * ("/", "/ko/"). Only that site's pages (src/pages/*.clean-space-app.js, through src/components/CleanSpaceAppPage.tsx)
 * import this file, so nothing here is part of cultureand.tech's build.
 */
import type { AppInfo } from "@/lib/apps";
import type { SupportedLanguage } from "@/lib/language-detection";
import { LANGUAGE_PATHS, SITE_URL, appJsonLd, appPaths } from "@/lib/seo";

export const CLEAN_SPACE_APP_ORIGIN = "https://clean-space.app";

type Node = Record<string, unknown>;

/**
 * clean-space.app's wording of the website edition's section: the payment happens on cultureand.tech, not on this site,
 * so the two sentences per language that said "on this site" ("이 사이트에서") name cultureand.tech. The owner approved
 * exactly these words on 2026-11-12 ("follow your proposed update wordings"); the download sentences stay, and nothing
 * else in the page's text changes. Each pair is [cultureand.tech's words, clean-space.app's].
 */
export const CLEAN_SPACE_APP_WORDING: Record<SupportedLanguage, [string, string][]> = {
  en: [
    // The price and access period (the section's third item)
    ["one payment on this site through Toss Payments", "one payment on cultureand.tech through Toss Payments"],
    // "What is the 364 days Unlock?" (the FAQ)
    ["on this site that unlocks every feature", "on cultureand.tech that unlocks every feature"],
  ],
  ko: [
    ["로그인한 뒤 이 사이트에서 토스페이먼츠로 한 번 결제합니다", "로그인한 뒤 cultureand.tech에서 토스페이먼츠로 한 번 결제합니다"],
    ["이 사이트에서 한 번 결제(", "cultureand.tech에서 한 번 결제("],
  ],
};

/**
 * The page's content with clean-space.app's wording: each of CLEAN_SPACE_APP_WORDING's sentences, found exactly once in
 * its language's section items and FAQ answers, takes the site's words. A sentence found neither way (its text changed
 * on cultureand.tech) stops the build, so the two never drift apart unnoticed. Applying it again changes nothing.
 */
export function withCleanSpaceAppWording(app: AppInfo): AppInfo {
  const content = { ...app.content };
  for (const language of Object.keys(CLEAN_SPACE_APP_WORDING) as SupportedLanguage[]) {
    let page = content[language];
    for (const [from, to] of CLEAN_SPACE_APP_WORDING[language]) {
      const texts = [...page.sections.flatMap((s) => s.items.map((i) => i.text)), ...page.faq.map((f) => f.answer)];
      const count = (words: string) => texts.reduce((n, t) => n + t.split(words).length - 1, 0);
      if (count(to) === 1 && count(from) === 0) continue;
      if (count(from) !== 1) throw new Error(`clean-space.app's wording: "${from}" (${language}) appears ${count(from)} times; update CLEAN_SPACE_APP_WORDING`);
      const swap = (text: string) => text.replace(from, to);
      page = {
        ...page,
        sections: page.sections.map((s) => ({ ...s, items: s.items.map((i) => ({ ...i, text: swap(i.text) })) })),
        faq: page.faq.map((f) => ({ ...f, answer: swap(f.answer) })),
      };
    }
    content[language] = page;
  }
  return { ...app, content };
}

/**
 * The page's structured data on clean-space.app: cultureand.tech's (appJsonLd) moved to this site. The organization stays
 * Culture & Tech's; the website is clean-space.app, which Culture & Tech publishes; the app and the page (with the FAQ
 * the page shows) are at this site's address, their images here too; there is no breadcrumb, since the page is this
 * site's top and a trail into another domain is not this site's hierarchy.
 */
export function cleanSpaceAppJsonLd(app: AppInfo, language: SupportedLanguage) {
  const source = appJsonLd(app, language);
  const graph = source["@graph"] as Node[];
  const from = `${SITE_URL}${appPaths(app.slug)[language]}`;
  const url = `${CLEAN_SPACE_APP_ORIGIN}${LANGUAGE_PATHS[language]}`;
  const websiteId = `${CLEAN_SPACE_APP_ORIGIN}/#website`;
  // The page's own addresses (with their #fragments) and its images move here; anything else is left as it is
  const here = (value: unknown) =>
    typeof value !== "string" ? value : value.startsWith(from) ? `${url}${value.slice(from.length)}` : value.startsWith(`${SITE_URL}/images/`) ? `${CLEAN_SPACE_APP_ORIGIN}${value.slice(SITE_URL.length)}` : value;
  const organization = graph.find((node) => node["@type"] === "Organization");
  const website = graph.find((node) => node["@type"] === "WebSite");
  const page = graph.find((node) => node["@type"] === "FAQPage");
  const appNode = graph.find((node) => node["@id"] === `${from}#app`);
  if (!organization || !website || !page || !appNode) throw new Error("appJsonLd changed: update cleanSpaceAppJsonLd");
  // The page without its breadcrumb (there is none here)
  const pageNode = Object.fromEntries(Object.entries(page).filter(([key]) => key !== "breadcrumb"));
  return {
    "@context": source["@context"],
    "@graph": [
      organization,
      { "@type": "WebSite", "@id": websiteId, url: `${CLEAN_SPACE_APP_ORIGIN}/`, name: app.content[language].name, inLanguage: website.inLanguage, publisher: website.publisher },
      Object.fromEntries(Object.entries(appNode).map(([key, value]) => [key, ["@id", "url", "image", "screenshot"].includes(key) ? here(value) : value])),
      { ...Object.fromEntries(Object.entries(pageNode).map(([key, value]) => [key, ["@id", "url"].includes(key) ? here(value) : value])), isPartOf: { "@id": websiteId }, about: { "@id": here(appNode["@id"]) } },
    ],
  };
}
