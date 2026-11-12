// clean-space.app, Clean Space's own site (README, "clean-space.app"): its structured data (src/lib/clean-space-app-site.ts)
// and the product page's links in its build, where __CLEAN_SPACE_APP_SITE__ is true; cultureand.tech's stay as they are.
import { afterEach, describe, expect, it } from "vitest";
import { APPS } from "@/lib/apps";
import { CLEAN_SPACE_APP_ORIGIN, cleanSpaceAppJsonLd, withCleanSpaceAppWording } from "@/lib/clean-space-app-site";
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

describe("clean-space.app's wording (the owner's approval of 2026-11-12)", () => {
  const download = "https://clean-space-cultureandtech.web.app/clean-space/1.0-7/Clean-Space-1.0.zip";
  const texts = (app: ReturnType<typeof withWebsiteChannel>, language: "en" | "ko") => [
    ...app.content[language].sections.flatMap((s) => s.items.map((i) => i.text)),
    ...app.content[language].faq.map((f) => f.answer),
  ];

  it("names cultureand.tech where the payment happens, in exactly the approved words, and changes nothing else", () => {
    const before = withWebsiteChannel(APPS["clean-space"], download);
    const after = withCleanSpaceAppWording(before);
    const price = (app: typeof before, language: "en" | "ko") => app.content[language].sections.flatMap((s) => s.items).find((i) => /Toss Payments|토스페이먼츠/.test(i.text))?.text;
    const unlock = (app: typeof before, language: "en" | "ko") => app.content[language].faq.find((f) => f.question === (language === "en" ? "What is the 364 days Unlock?" : "364일 잠금 해제는 무엇인가요?"))?.answer;
    expect(price(after, "en")).toBe(price(before, "en")?.replace("one payment on this site through Toss Payments", "one payment on cultureand.tech through Toss Payments"));
    expect(price(after, "en")).toContain("with PayPal: one payment on cultureand.tech through Toss Payments, signed in to your Culture & Tech account.");
    expect(unlock(after, "en")).toMatch(/^One payment of ₩3,300 \(VAT included\) or US\$2\.49 on cultureand\.tech that unlocks every feature of the Clean Space website edition for 364 days/);
    expect(price(after, "ko")).toContain("컬처앤테크 계정에 로그인한 뒤 cultureand.tech에서 토스페이먼츠로 한 번 결제합니다.");
    expect(unlock(after, "ko")).toMatch(/^cultureand\.tech에서 한 번 결제\(₩3,300, 부가세 포함\)하면 결제가 승인된 때부터 364일 동안/);
    for (const language of ["en", "ko"] as const) {
      const [a, b] = [texts(before, language), texts(after, language)];
      expect(b).toHaveLength(a.length);
      // Exactly two texts change per language; the download sentences ("from this site", "이 사이트에서도") stay
      expect(a.filter((t, i) => t !== b[i])).toHaveLength(2);
      expect(JSON.stringify(after.content[language].sections.map((s) => s.intro))).toBe(JSON.stringify(before.content[language].sections.map((s) => s.intro)));
    }
    expect(texts(after, "en").join("\n")).not.toMatch(/(payment|of [^\n]*) on this site/);
    expect(texts(after, "ko").join("\n")).not.toContain("이 사이트에서 토스페이먼츠");
    expect(after.content.en.sections.find((s) => s.title === "The website edition and the 364 days Unlock")?.intro).toContain("Clean Space also comes as a download from this site");
    expect(after.content.ko.sections.find((s) => s.title === "웹사이트 버전과 364일 잠금 해제")?.intro).toContain("Clean Space는 이 사이트에서도 내려받을 수 있습니다.");
  });

  it("is the same when applied twice, and stops the build when a sentence it changes is gone", () => {
    const once = withCleanSpaceAppWording(withWebsiteChannel(APPS["clean-space"], download));
    expect(withCleanSpaceAppWording(once)).toEqual(once);
    expect(() => withCleanSpaceAppWording(APPS["clean-space"])).toThrow(/appears 0 times/);
  });
});
