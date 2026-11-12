// clean-space.app, Clean Space's own site (README, "clean-space.app"): its structured data (src/lib/clean-space-app-site.ts)
// and the product page's links in its build, where __CLEAN_SPACE_APP_SITE__ is true; cultureand.tech's stay as they are.
import { afterEach, describe, expect, it } from "vitest";
import { APPS } from "@/lib/apps";
import { CLEAN_SPACE_APP_ORIGIN, cleanSpaceAppJsonLd } from "@/lib/clean-space-app-site";
import { appJsonLd } from "@/lib/seo";
import { withWebsiteChannel } from "../channel-copy";
import { DIRECT_SALE_POLICY_PATHS } from "../site";

const flag = globalThis as unknown as { __CLEAN_SPACE_APP_SITE__: boolean };
afterEach(() => {
  flag.__CLEAN_SPACE_APP_SITE__ = false;
});

type Node = Record<string, unknown>;
const graphOf = (ld: { "@graph": unknown }) => ld["@graph"] as Node[];
const byType = (graph: Node[], type: string) => graph.find((n) => n["@type"] === type) as Node;
const without = (node: Node, keys: string[]) => Object.fromEntries(Object.entries(node).filter(([key]) => !keys.includes(key)));
const addresses = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === "string" && /^https?:\/\//.test(value)) out.push(value);
  else if (value && typeof value === "object") for (const v of Object.values(value)) addresses(v, out);
  return out;
};

describe("clean-space.app's structured data", () => {
  it.each([["en", "/"], ["ko", "/ko/"]] as const)("puts the app and the page (%s) on clean-space.app, under its own website, with no breadcrumb", (language, path) => {
    const app = APPS["clean-space"];
    const url = `${CLEAN_SPACE_APP_ORIGIN}${path}`;
    const graph = graphOf(cleanSpaceAppJsonLd(app, language));
    const source = graphOf(appJsonLd(app, language));
    expect(graph.map((n) => n["@type"])).toEqual(["Organization", "WebSite", "SoftwareApplication", "FAQPage"]);
    expect(graph[0]).toEqual(source[0]);
    expect(graph[1]).toEqual({
      "@type": "WebSite",
      "@id": "https://clean-space.app/#website",
      url: "https://clean-space.app/",
      name: "Clean Space",
      inLanguage: ["en", "ko"],
      publisher: { "@id": "https://cultureand.tech/#organization" },
    });
    expect(graph[2]).toMatchObject({ "@id": `${url}#app`, url, image: "https://clean-space.app/images/apps/clean-space/icon.png", publisher: { "@id": "https://cultureand.tech/#organization" } });
    expect(graph[3]).toMatchObject({ "@id": `${url}#webpage`, url, isPartOf: { "@id": "https://clean-space.app/#website" }, about: { "@id": `${url}#app` } });
    expect(graph[3]).not.toHaveProperty("breadcrumb");
    // The same app and FAQ as cultureand.tech's page, moved: only the addresses differ
    const moved = ["@id", "url", "image"];
    expect(without(graph[2], moved)).toEqual(without(byType(source, "SoftwareApplication"), moved));
    expect(graph[3].mainEntity).toEqual(byType(source, "FAQPage").mainEntity);
    // cultureand.tech appears only as the organization
    for (const address of addresses(graph)) expect(address).toMatch(/^https:\/\/(clean-space\.app\/|cultureand\.tech\/(#organization)?$|schema\.org$)/);
  });
});

describe("the website-edition section's policy links", () => {
  const download = "https://clean-space-cultureandtech.web.app/clean-space/1.0-7/Clean-Space-1.0.zip";
  const links = () => {
    const app = withWebsiteChannel(APPS["clean-space"], download);
    return (["en", "ko"] as const).map((language) => app.content[language].sections.find((s) => s.linkLine)?.linkLine?.links ?? {});
  };

  it("stay relative on cultureand.tech, where the policies are", () => {
    for (const l of links()) expect([l.terms.href, l.refund.href, l.privacy.href]).toEqual([DIRECT_SALE_POLICY_PATHS.terms, DIRECT_SALE_POLICY_PATHS.refund, DIRECT_SALE_POLICY_PATHS.privacy]);
  });

  it("are absolute on clean-space.app, so they open cultureand.tech's pages", () => {
    flag.__CLEAN_SPACE_APP_SITE__ = true;
    for (const l of links()) {
      expect([l.terms.href, l.refund.href, l.privacy.href]).toEqual([
        "https://cultureand.tech/culture/clean-space/direct-terms.html",
        "https://cultureand.tech/culture/clean-space/direct-refunds.html",
        "https://cultureand.tech/culture/clean-space/direct-privacy.html",
      ]);
    }
  });
});
