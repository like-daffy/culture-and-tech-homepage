import { describe, expect, it } from "vitest";
import { APPS } from "@/lib/apps";
import { withWebsiteChannel } from "../channel-copy";
import { CLEAN_SPACE } from "../config";

describe("the product page's website copy", () => {
  it("is off in this build: the page is exactly src/lib/apps.ts's content", () => {
    expect(CLEAN_SPACE.websiteRelease).toBe(false);
    const page = APPS["clean-space"];
    expect(page.content.en.sections.map((s) => s.title)).not.toContain("Mac App Store or website download");
    expect(page.content.en.sections.some((s) => s.links)).toBe(false);
  });

  it("relies on the page's current order: privacy last, its file-processing answer fifth", () => {
    const page = APPS["clean-space"];
    expect(page.content.en.sections.at(-1)?.items[0].title).toBe("Your files are processed on your Mac");
    expect(page.content.ko.sections.at(-1)?.items[0].title).toBe("파일은 Mac에서 처리합니다");
    expect(page.content.en.faq[4].question).toBe("Does it send anything about my files anywhere?");
    expect(page.content.ko.faq[4].question).toBe("파일에 관한 정보를 어딘가로 보내나요?");
  });

  it("tells the two downloads apart before the privacy section, with a link to the checkout", () => {
    const released = withWebsiteChannel(APPS["clean-space"]);
    for (const language of ["en", "ko"] as const) {
      const sections = released.content[language].sections;
      const channel = sections.at(-2);
      expect(channel?.title).toBe("Mac App Store or website download");
      expect(channel?.links).toEqual([{ label: "Get the 364 days Unlock", href: language === "ko" ? "/ko/checkout/clean-space/" : "/checkout/clean-space/" }]);
      expect(channel?.items.map((item) => item.text).join(" ")).toMatch(/₩3,300 or US\$2\.49/);
      // The privacy text no longer says the app has no account without saying which download.
      expect(sections.at(-1)?.items[0].text).toMatch(/website download's|website download has no analytics/);
      expect(released.content[language].faq.map((f) => f.question)).toContain("What is the 364 days Unlock?");
    }
    // The App Store app's own facts stay as they were.
    expect(released.content.en.status).toBe(APPS["clean-space"].content.en.status);
    expect(released.content.en.cta).toEqual(APPS["clean-space"].content.en.cta);
    expect(released.content.en.screenshots).toBe(APPS["clean-space"].content.en.screenshots);
  });

  it("never claims Docker, the helper or Spotlight for the App Store app", () => {
    const released = withWebsiteChannel(APPS["clean-space"]);
    const appStore = released.content.en.sections.at(-2)?.items.find((item) => item.title === "Mac App Store");
    expect(appStore?.text).toMatch(/has no Docker or simulator management, administrator helper or Spotlight maintenance/);
  });
});
