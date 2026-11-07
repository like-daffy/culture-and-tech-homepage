/**
 * Clean Space's product page once the website download is released (NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE=1): the
 * page then tells the Mac App Store app and the website download apart, and which one the 364 days Unlock is for,
 * before anyone pays (plan §9). Off by default: the page is exactly src/lib/apps.ts's content until the owner releases
 * the website build.
 *
 * Every claim is from mac-get-space's docs/plans/364-days-option.md (§2, §4.2, §5, §8.3) and its AGENTS.md (what the
 * App Store build leaves out). The App Store app's own facts are not changed here (its status, link and screenshots
 * follow the App Store release, README "When an app changes"). The new sentences are English on the Korean page too
 * until the owner reviews a translation (docs/clean-space-direct-sale.md).
 */
import type { AppContent, AppInfo, AppSection } from "@/lib/apps";
import type { SupportedLanguage } from "@/lib/language-detection";
import { OFFER_PRICES, PAGE_PATH } from "./contract.generated";
import { formatPrice } from "./display";

const KRW = formatPrice(OFFER_PRICES.KRW);
const USD = formatPrice(OFFER_PRICES.USD);

function channelSection(language: SupportedLanguage): AppSection {
  return {
    title: "Mac App Store or website download",
    intro: "Clean Space comes two ways. Both scan only on your Mac and never remove anything you haven't reviewed and approved.",
    items: [
      {
        title: "Mac App Store",
        text: "Free, with Expert as an in-app purchase that Apple handles. It runs in Apple's App Sandbox, so it has no Docker or simulator management, administrator helper or Spotlight maintenance.",
      },
      {
        title: "Website download",
        text: "A signed and notarized download from cultureand.tech. Without the 364 days Unlock it has the same basic cleanup as the free App Store app.",
      },
      {
        title: "364 days Unlock",
        text: `One payment of ${KRW} or ${USD} on cultureand.tech, signed in with Google, Kakao or Naver. It unlocks every feature of the website download, including Docker and simulator cleanup, the administrator helper and Spotlight maintenance, for exactly 364 days from the payment's approval. It never renews by itself.`,
      },
      {
        title: "After 364 days",
        text: "The free features stay, and so do your settings, history, reports and Put Back. You can buy the unlock again.",
      },
    ],
    note: "Purchases don't move between the two: Expert from the App Store doesn't unlock the website download, and the 364 days Unlock doesn't unlock the App Store app.",
    links: [{ label: "Get the 364 days Unlock", href: PAGE_PATH.checkout[language] }],
  };
}

const PRIVACY_ITEM = {
  title: "Your files are processed on your Mac",
  text: "Files and scan results are processed on your Mac and are not uploaded to our servers. The App Store app has no analytics and no account; Apple handles Expert purchases and restores. The website download has no analytics either: its account is only for the 364 days Unlock, and it sends no file names, paths or scan results.",
};

const PRIVACY_FAQ = {
  question: "Does it send anything about my files anywhere?",
  answer:
    "No. Files and scan results are processed on your Mac and are not uploaded to our servers. The App Store app has no account, and Apple handles Expert purchases. The website download's account is used only for the 364 days Unlock: it checks your access period and sends no file names, paths or scan results.",
};

const UNLOCK_FAQ = {
  question: "What is the 364 days Unlock?",
  answer: `A single payment of ${KRW} or ${USD} on cultureand.tech that unlocks every feature of the Clean Space website download for exactly 364 days from the payment's approval. It never renews by itself; afterwards the free features stay. It is for the website download only, not the App Store app.`,
};

/** The product page's content with the website download described next to the App Store app. */
export function withWebsiteChannel(app: AppInfo): AppInfo {
  const content = Object.fromEntries(
    (Object.keys(app.content) as SupportedLanguage[]).map((language) => {
      const base = app.content[language];
      const sections = base.sections.flatMap((section, index): AppSection[] => {
        // The privacy section is the last one: the channel section goes right before it, and its first item is replaced.
        if (index === base.sections.length - 1) {
          return [channelSection(language), { ...section, items: [PRIVACY_ITEM, ...section.items.slice(1)] }];
        }
        return [section];
      });
      const faq = base.faq.map((item, index) => (index === 4 ? PRIVACY_FAQ : item));
      const withUnlock = [...faq.slice(0, 4), UNLOCK_FAQ, ...faq.slice(4)];
      const next: AppContent = { ...base, sections, faq: withUnlock };
      return [language, next];
    }),
  ) as Record<SupportedLanguage, AppContent>;
  return { ...app, content };
}
