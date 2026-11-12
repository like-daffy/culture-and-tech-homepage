import { describe, expect, it } from "vitest";
import { APPS } from "@/lib/apps";
import { jumpWithinPage, type JumpClick } from "@/lib/page-jump";
import { websiteDownloadUrl, withWebsiteChannel } from "../channel-copy";
import { CLEAN_SPACE } from "../config";
import { DIRECT_SALE_POLICY_PATHS } from "../site";

const DOWNLOAD = "https://download.cultureand.tech/CleanSpace.dmg";

describe("the product page's website edition", () => {
  it("is off in this build: the page is exactly src/lib/apps.ts's content", () => {
    expect(CLEAN_SPACE.websiteRelease).toBe(false);
    const page = APPS["clean-space"];
    for (const language of ["en", "ko"] as const) {
      expect(page.content[language].sections.some((s) => s.links || s.linkLine)).toBe(false);
    }
    expect(page.content.en.sections.map((s) => s.title)).not.toContain("The website edition and the 364 days Unlock");
  });

  it("relies on the page's current order: privacy last, its file-processing answer fifth, availability last", () => {
    const page = APPS["clean-space"];
    expect(page.content.en.sections.at(-1)?.items[0].title).toBe("Your files are processed on your Mac");
    expect(page.content.ko.sections.at(-1)?.items[0].title).toBe("파일은 Mac에서 처리합니다");
    expect(page.content.en.faq[4].question).toBe("Does it send anything about my files anywhere?");
    expect(page.content.ko.faq[4].question).toBe("파일에 관한 정보를 어딘가로 보내나요?");
    expect(page.content.en.faq.at(-1)?.question).toBe("Can I get it now?");
    expect(page.content.ko.faq.at(-1)?.question).toBe("지금 받을 수 있나요?");
  });

  it("shows what a buyer needs before paying, with the buy button to the account page on the portal and the three policies", () => {
    const released = withWebsiteChannel(APPS["clean-space"], DOWNLOAD);
    for (const language of ["en", "ko"] as const) {
      const sections = released.content[language].sections;
      const channel = sections.at(-2);
      const text = [channel?.intro, ...(channel?.items ?? []).map((item) => `${item.title} ${item.text}`), channel?.note].join(" ");
      expect(text).toMatch(/macOS 14/);
      expect(text).toContain(language === "en" ? "₩3,300 (VAT included), or US$2.49 with PayPal" : "₩3,300(부가세 포함)");
      expect(text).toContain(
        language === "en"
          ? "Access period: 364 days from the moment the payment is approved (shorter than 12 months), ending at the same time of day."
          : "이용 기간: 결제가 승인된 때부터 364일(12개월보다 짧음)이며, 같은 시각에 끝납니다.",
      );
      expect(text).toContain(language === "en" ? "It doesn't renew, and nothing is charged again." : "자동으로 갱신되거나 다시 결제되지 않습니다.");
      expect(text).toContain(language === "en" ? "Full refund on request within 7 days of payment." : "결제 후 7일 이내에 요청하면 전액 환불됩니다.");
      expect(text).toContain(language === "en" ? "basic features" : "기본 기능");
      expect(channel?.note).toContain(language === "en" ? "Test payment:" : "테스트 결제:");
      // Korean pages sell in won only.
      if (language === "ko") expect(text).not.toContain("US$");
      expect(channel?.links).toEqual([
        { label: language === "en" ? "Download for Mac" : "Mac용 다운로드", href: DOWNLOAD, download: true, id: "download" },
        {
          label: language === "en" ? "Buy the 364 days Unlock" : "364일 잠금 해제 구매하기",
          href: language === "ko" ? "https://portal.cultureand.tech/ko/products/clean-space" : "https://portal.cultureand.tech/products/clean-space",
        },
      ]);
      expect(Object.values(channel?.linkLine?.links ?? {}).map((link) => link.href)).toEqual([
        DIRECT_SALE_POLICY_PATHS.terms,
        DIRECT_SALE_POLICY_PATHS.refund,
        DIRECT_SALE_POLICY_PATHS.privacy,
      ]);
      expect(channel?.linkLine?.text).toMatch(/\{terms\}.*\{refund\}.*\{privacy\}/);
      // The privacy text says which edition has which account.
      expect(sections.at(-1)?.items[0].text).toMatch(language === "en" ? /website edition has no analytics/ : /웹사이트 버전에도 분석 도구가 없으며/);
      const questions = released.content[language].faq.map((f) => f.question);
      expect(questions).toContain(language === "en" ? "What is the 364 days Unlock?" : "364일 잠금 해제는 무엇인가요?");
      expect(released.content[language].faq.at(-1)?.answer).toMatch(language === "en" ? /^Yes: download/ : /^네\./);
    }
    // The App Store app's own facts stay as they were.
    expect(released.content.en.status).toBe(APPS["clean-space"].content.en.status);
    expect(released.content.en.cta).toEqual(APPS["clean-space"].content.en.cta);
    expect(released.content.en.screenshots).toBe(APPS["clean-space"].content.en.screenshots);
  });

  it("takes the download address from the build only when it is https", () => {
    expect(websiteDownloadUrl(` ${DOWNLOAD} `)).toBe(DOWNLOAD);
    for (const bad of [undefined, "", "http://download.cultureand.tech/x.dmg", "javascript:alert(1)", "/CleanSpace.dmg"]) {
      expect(websiteDownloadUrl(bad)).toBe("");
    }
  });

  it("has no download button, and doesn't say the download is there, without a download address", () => {
    const released = withWebsiteChannel(APPS["clean-space"], "");
    for (const language of ["en", "ko"] as const) {
      expect(released.content[language].sections.at(-2)?.links?.map((link) => link.href)).toEqual([
        language === "ko" ? "https://portal.cultureand.tech/ko/products/clean-space" : "https://portal.cultureand.tech/products/clean-space",
      ]);
      expect(released.content[language].faq.at(-1)).toEqual(APPS["clean-space"].content[language].faq.at(-1));
      // Nor a "Download" button after the introduction, with nothing to move to.
      expect(released.content[language].jump).toBeUndefined();
    }
  });

  it("puts a Download button right after the introduction that moves to the download button, only when there is one", () => {
    const released = withWebsiteChannel(APPS["clean-space"], DOWNLOAD);
    for (const language of ["en", "ko"] as const) {
      const content = released.content[language];
      // The owner's words: "Download"; in Korean the word the download button already uses.
      expect(content.jump).toEqual({ label: language === "en" ? "Download" : "다운로드", target: "download" });
      // Its target is the download button, and only that one: one element with that id on the page.
      const anchored = content.sections.flatMap((section) => section.links ?? []).filter((link) => link.id);
      expect(anchored).toEqual([expect.objectContaining({ id: content.jump?.target, href: DOWNLOAD, download: true })]);
      // The introduction itself and the App Store link are as they were.
      expect(content.intro).toBe(APPS["clean-space"].content[language].intro);
      expect(content.cta).toBe(APPS["clean-space"].content[language].cta);
    }
    // Only Clean Space's page, and not in a build without the website edition (this one).
    for (const language of ["en", "ko"] as const) {
      expect(APPS["clean-space"].content[language].jump).toBeUndefined();
      expect(APPS["chord-to-midi"].content[language].jump).toBeUndefined();
    }
  });

  it("never claims Docker, the helper or Spotlight for the App Store app, nor calls the website edition's features Expert", () => {
    const released = withWebsiteChannel(APPS["clean-space"], DOWNLOAD);
    const channel = released.content.en.sections.at(-2);
    expect(channel?.note).toMatch(/Expert bought in the Mac App Store doesn't unlock the website edition/);
    const unlock = channel?.items.find((item) => item.title === "With the 364 days Unlock");
    expect(unlock?.text).toMatch(/Docker and simulator management, the administrator helper and Spotlight maintenance/);
    expect(unlock?.text).not.toMatch(/Expert/);
    expect(channel?.items.map((item) => item.text).join(" ")).not.toMatch(/free features/);
  });
});

describe("a jump to a place further down the page", () => {
  const click = (over: Partial<JumpClick> = {}) => {
    const event = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false, prevented: 0, ...over };
    return Object.assign(event, { preventDefault: () => { event.prevented += 1; } });
  };
  const page = (reduced: boolean, present = true) => {
    const calls: unknown[] = [];
    const target = { scrollIntoView: (options: unknown) => calls.push(["scroll", options]), focus: (options: unknown) => calls.push(["focus", options]) };
    const ids: string[] = [];
    return { calls, ids, page: { getElementById: (id: string) => (ids.push(id), present ? target : null), prefersReducedMotion: () => reduced } };
  };

  it("scrolls smoothly to the target, centred, then puts the focus on it without another scroll", () => {
    const event = click();
    const { calls, ids, page: browser } = page(false);
    expect(jumpWithinPage(event, "download", browser)).toBe(true);
    expect(event.prevented).toBe(1);
    expect(ids).toEqual(["download"]);
    expect(calls).toEqual([["scroll", { behavior: "smooth", block: "center" }], ["focus", { preventScroll: true }]]);
  });

  it("moves at once, with no animation, for a visitor who asked for reduced motion", () => {
    const { calls, page: browser } = page(true);
    expect(jumpWithinPage(click(), "download", browser)).toBe(true);
    // "instant", not "auto": the site's stylesheet makes every scroll smooth.
    expect(calls[0]).toEqual(["scroll", { behavior: "instant", block: "center" }]);
  });

  it("leaves a new-tab or new-window click, another button, a handled click or a missing target to the browser", () => {
    for (const over of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) {
      const event = click(over);
      const { calls, page: browser } = page(false);
      expect(jumpWithinPage(event, "download", browser)).toBe(false);
      expect(event.prevented).toBe(0);
      expect(calls).toEqual([]);
    }
    const event = click();
    expect(jumpWithinPage(event, "download", page(false, false).page)).toBe(false);
    expect(event.prevented).toBe(0);
  });
});


it("labels the reviewed versioned fallback without changing other download labels", () => {
  const url = "https://clean-space-cultureandtech.web.app/clean-space/1.0-7/Clean-Space-1.0.zip";
  const app = withWebsiteChannel(APPS["clean-space"], url);
  for (const language of ["en", "ko"] as const) {
    const link = app.content[language].sections.flatMap((section) => section.links ?? []).find((item) => item.href === url);
    expect(link?.label).toBe(language === "en" ? "Download for Mac — 1.0 (build 7)" : "Mac용 다운로드 — 1.0 (빌드 7)");
  }
});
