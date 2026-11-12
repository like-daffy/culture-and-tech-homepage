import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Apps } from "@/components/Apps";
import { APP_SLUGS } from "@/lib/apps";

// The homepage's "Apps for Musicians" section: the two apps with a page here, then DJ Duplicate Guard, whose card text
// is the owner's, confirmed on 2026-11-12, character for character, and whose links go to its own site in a new tab.
const state = vi.hoisted(() => ({ language: "en" as "en" | "ko" }));
vi.mock("@/contexts/LanguageProvider", () => ({ useLanguage: () => ({ language: state.language }) }));

const OWNER = {
  en: {
    badge: "Chrome extension",
    name: "DJ Duplicate Guard",
    tagline: "Don't buy the same track twice.",
    summary:
      "A Chrome extension for DJs. On Beatport, it marks the tracks you already bought, and tells you when a preview is a recording you've already heard. The free features need no account.",
    points: [
      "Badges on search results, charts, label, release and track pages, and your cart",
      "Says when only the version may differ, so you can compare before you buy",
      "With listening history on, a quiet notice when you've already heard a preview",
      "Purchases and listening history stay in your browser, never sent to us",
    ],
    button: "Learn more",
    site: "https://dj-duplicate-guard.app/",
  },
  ko: {
    badge: "Chrome 확장 프로그램",
    name: "DJ Duplicate Guard",
    tagline: "구매한 트랙을 또 구매했나요?",
    summary:
      "DJ를 위한 Chrome 확장 프로그램입니다. Beatport에서 이미 산 트랙을 표시하고, 미리 듣기가 이미 들어 본 녹음이면 알려 줍니다. 무료 기능은 계정 없이 쓸 수 있습니다.",
    points: [
      "검색 결과, 차트, 레이블·릴리스·트랙 페이지, Cart에서 이미 가진 트랙에 배지(Badge)가 붙습니다.",
      "버전만 다를 수 있으면 그렇게 알려 주어, 사기 전에 비교할 수 있습니다.",
      "청취 기록을 켜 두면, 이미 들은 녹음의 미리 듣기를 조용한 알림으로 알려 줍니다.",
      "구매 기록과 청취 기록은 브라우저에 저장되며, 저희에게 전송되지 않습니다.",
    ],
    button: "자세히 보기",
    site: "https://dj-duplicate-guard.app/ko/",
  },
};

const decode = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').trim();
function cards(language: "en" | "ko") {
  state.language = language;
  const html = renderToStaticMarkup(createElement(Apps));
  // Each card: the markup from one card's root to the next (the cards are the grid's children).
  const grid = html.slice(html.indexOf('<div class="grid'));
  return grid.split(/(?=<div class="rounded-lg border bg-card)/).slice(1).map((card) => ({
    card,
    badge: decode(/<span class="inline-flex items-center rounded-full[^>]*>([\s\S]*?)<\/span>/.exec(card)?.[1] ?? ""),
    name: decode(/<h3[^>]*>([\s\S]*?)<\/h3>/.exec(card)?.[1] ?? ""),
    tagline: decode(/<p class="text-base font-semibold[^>]*>([\s\S]*?)<\/p>/.exec(card)?.[1] ?? ""),
    // CardDescription: a div whose classes include text-muted-foreground and leading-relaxed, in the order cn gives.
    summary: decode(/<div class="[^"]*text-muted-foreground[^"]*leading-relaxed[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(card)?.[1] ?? ""),
    points: [...card.matchAll(/<li[^>]*><span[^>]*>•<\/span><span>([\s\S]*?)<\/span><\/li>/g)].map(([, p]) => decode(p)),
    links: [...card.matchAll(/<a ([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attrs, inner]) => ({
      href: /href="([^"]*)"/.exec(attrs)?.[1],
      target: /target="([^"]*)"/.exec(attrs)?.[1],
      rel: /rel="([^"]*)"/.exec(attrs)?.[1],
      text: decode(inner),
    })),
    icon: /<img [^>]*src="([^"]*)"/.exec(card)?.[1],
  }));
}

describe("the homepage's Apps section", () => {
  it("shows DJ Duplicate Guard third, in the owner's words, linking to its own site in a new tab", () => {
    for (const language of ["en", "ko"] as const) {
      const all = cards(language);
      expect(all.map((c) => c.name)).toEqual(["Chord to MIDI", "Clean Space", "DJ Duplicate Guard"]);
      const dj = all[2], owner = OWNER[language];
      expect([dj.badge, dj.name, dj.tagline, dj.summary]).toEqual([owner.badge, owner.name, owner.tagline, owner.summary]);
      expect(dj.points).toEqual(owner.points);
      // The name and the one button go to the product's site, opened as "Open Chord to MIDI" is.
      expect(dj.links).toEqual([
        { href: owner.site, target: "_blank", rel: "noopener", text: owner.name },
        { href: owner.site, target: "_blank", rel: "noopener", text: owner.button },
      ]);
      expect(decodeURIComponent(dj.icon ?? "")).toContain("/images/apps/dj-duplicate-guard/icon.png");
      // Alone in its row from medium width, one column wide, centred; the other two cards as they were.
      expect(dj.card).toContain("md:col-span-2 md:mx-auto md:w-[calc((100%_-_1.5rem)/2)]");
      for (const other of all.slice(0, 2)) expect(other.card).not.toContain("md:col-span-2");
      expect(all[0].links.map((l) => l.href)).toEqual([language === "ko" ? "/ko/apps/chord-to-midi" : "/apps/chord-to-midi", language === "ko" ? "/ko/apps/chord-to-midi" : "/apps/chord-to-midi", language === "ko" ? "https://chord-to-midi.app/ko/" : "https://chord-to-midi.app/"].map((h) => h));
    }
  });

  it("gives it no page here: the apps with pages, their 'More apps' block, sitemap and structured data stay two", () => {
    expect(APP_SLUGS).toEqual(["chord-to-midi", "clean-space"]);
  });

  it("links Clean Space, whose page moved to clean-space.app (2026-11-12), to that site in a new tab, as DJ Duplicate Guard", () => {
    for (const language of ["en", "ko"] as const) {
      const site = language === "ko" ? "https://clean-space.app/ko/" : "https://clean-space.app/";
      const cleanSpace = cards(language)[1];
      expect(cleanSpace.name).toBe("Clean Space");
      expect(cleanSpace.links.map(({ href, target, rel }) => ({ href, target, rel }))).toEqual([
        { href: site, target: "_blank", rel: "noopener" },
        { href: site, target: "_blank", rel: "noopener" },
      ]);
    }
  });
});
