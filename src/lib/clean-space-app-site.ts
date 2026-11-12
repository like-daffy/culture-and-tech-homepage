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
