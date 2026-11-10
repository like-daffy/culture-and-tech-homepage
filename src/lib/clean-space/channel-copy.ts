/**
 * Clean Space's product page once the website edition is released (NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE=1): the page
 * then presents the download from this site and its one paid option, the 364 days Unlock, with what a buyer (and Toss
 * Payments' review) needs before paying: the download, its requirements, the basic features and what the Unlock adds,
 * the price, the access period, no renewal, the refund, the button to buy (on the account page, where the purchase
 * starts) and the three policies. It also tells the Mac App Store edition apart. Off by default: the page is exactly
 * src/lib/apps.ts's content until the owner releases the website edition.
 *
 * Every claim is from mac-get-space's facts sheet of the direct sale (docs/13-direct-sale/facts.md, the owner's
 * decisions of 2026-11-09) and its plan (docs/plans/364-days-option.md §0, §2, §4.2). The access period, renewal and
 * refund sentences are the checkout's (src/lib/checkout/product-copy.ts, CLEAN_SPACE_COPY), in Chord to MIDI's
 * Toss-reviewed wording. Korean pages sell in won only, so they state the won price alone. The App Store edition's own
 * facts are not changed here (its status, link and screenshots follow its release, README "When an app changes"). The
 * Korean text awaits the owner's review (docs/clean-space-ko-review.md).
 */
import type { AppContent, AppInfo, AppSection } from "@/lib/apps";
import { CHECKOUT_COPY } from "@/lib/checkout/copy";
import type { SupportedLanguage } from "@/lib/language-detection";
import { isHttpsAddress } from "./config-rules";
import { OFFER_PRICES, PORTAL_PAGE_PATH } from "./contract.generated";
import { formatPrice } from "./display";
import { CLEAN_SPACE_PORTAL, DIRECT_SALE_POLICY_PATHS } from "./site";

/**
 * The website download's address from the build's setting (NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL): an https address,
 * or '' (no download button).
 */
export function websiteDownloadUrl(setting: string | undefined): string {
  const value = setting?.trim() ?? "";
  return isHttpsAddress(value) ? value : "";
}

/** `{krw}` and `{usd}` in a text: the offer's exact prices ("₩3,300", "US$2.49"). */
function priced(text: string): string {
  return text.replace("{krw}", formatPrice(OFFER_PRICES.KRW)).replace("{usd}", formatPrice(OFFER_PRICES.USD));
}

interface ChannelCopy {
  title: string;
  intro: string;
  basicTitle: string;
  basicText: string;
  unlockTitle: string;
  unlockText: string;
  priceTitle: string;
  priceText: string;
  refundTitle: string;
  refundText: string;
  note: string;
  download: string;
  buy: string;
  /** `{terms}`, `{refund}`, `{privacy}`: the website edition's policies, linked. (`{krw}`/`{usd}` elsewhere: prices.) */
  policies: string;
  privacyItem: { title: string; text: string };
  privacyFaq: { question: string; answer: string };
  unlockFaq: { question: string; answer: string };
  /** Once the download is there: the page's "Can I get it now?" answered with it. */
  availableFaq: { question: string; answer: string };
}

const COPY: Record<SupportedLanguage, ChannelCopy> = {
  en: {
    title: "The website edition and the 364 days Unlock",
    intro:
      "Clean Space also comes as a download from this site, signed with our Apple Developer ID and notarized by Apple, for macOS 14 or later (Apple silicon or Intel). It is free to download and use with its basic features, and one paid option, the 364 days Unlock, unlocks every feature.",
    basicTitle: "Basic features, free",
    basicText:
      "Review caches, installers and development caches and move them to the Trash, and empty the Trash with every check. History, reports, exclusions, settings and Put Back are included, and so are all the safety rules.",
    unlockTitle: "With the 364 days Unlock",
    unlockText:
      "Every feature: the items the app marks as needing the Unlock, a deeper scan, duplicate verification and permanent removal, hidden-folder review and Plugin Cleaner, Docker and simulator management, the administrator helper and Spotlight maintenance.",
    priceTitle: "Price and access period",
    priceText:
      "{krw} (VAT included), or {usd} with PayPal: one payment on this site through Toss Payments, signed in with Google, Kakao or Naver. Access period: 364 days from the moment the payment is approved (shorter than 12 months), ending at the same time of day. It doesn't renew, and nothing is charged again.",
    refundTitle: "Refunds, and after the access period",
    refundText:
      "Full refund on request within 7 days of payment. When the access period ends, the basic features stay, and so do your settings, history, reports and Put Back.",
    note: "The two editions are separate products: Expert bought in the Mac App Store doesn't unlock the website edition, and the 364 days Unlock doesn't unlock the Mac App Store app.",
    download: "Download for Mac",
    buy: "Buy the 364 days Unlock",
    policies: "The website edition's {terms}, {refund} and {privacy}: please read them before you buy.",
    privacyItem: {
      title: "Your files are processed on your Mac",
      text: "Files and scan results are processed on your Mac and are not uploaded to our servers. The Mac App Store app has no analytics and no account; Apple handles Expert purchases and restores. The website edition has no analytics either: its account is only for the 364 days Unlock, and it sends no file names, paths or scan results.",
    },
    privacyFaq: {
      question: "Does it send anything about my files anywhere?",
      answer:
        "No. Files and scan results are processed on your Mac and are not uploaded to our servers. The Mac App Store app has no account, and Apple handles Expert purchases. The website edition's account is used only for the 364 days Unlock: it checks your access period and sends no file names, paths or scan results.",
    },
    unlockFaq: {
      question: "What is the 364 days Unlock?",
      answer:
        "One payment of {krw} (VAT included) or {usd} on this site that unlocks every feature of the Clean Space website edition for 364 days from the moment the payment is approved. It doesn't renew, and the basic features stay after the access period. It is for the website edition only, not the Mac App Store app.",
    },
    availableFaq: {
      question: "Can I get it now?",
      answer:
        "Yes: download the website edition from this page. Its Mac App Store listing is being prepared, and this page will link to it once it is available.",
    },
  },
  ko: {
    title: "웹사이트 버전과 364일 잠금 해제",
    intro:
      "Clean Space는 이 사이트에서도 내려받을 수 있습니다. 컬처앤테크의 Apple Developer ID로 서명하고 Apple의 공증을 받은 앱이며, macOS 14 이상(Apple silicon 또는 Intel)에서 쓸 수 있습니다. 무료로 내려받아 기본 기능을 쓸 수 있고, 유료 옵션인 364일 잠금 해제로 모든 기능을 쓸 수 있습니다.",
    basicTitle: "기본 기능 (무료)",
    basicText:
      "캐시, 설치 파일, 개발 캐시를 검토해 휴지통으로 옮기고, 모든 확인을 거쳐 휴지통을 비울 수 있습니다. 기록, 보고서, 예외, 설정, 복구하기와 모든 안전 규칙도 포함됩니다.",
    unlockTitle: "364일 잠금 해제로 쓸 수 있는 기능",
    unlockText:
      "모든 기능: 앱에서 잠금 해제가 필요하다고 표시하는 항목, 심층 검사, 중복 검증과 영구 삭제, 숨김 폴더 검토와 플러그인 클리너, Docker와 시뮬레이터 관리, 관리자 도우미와 Spotlight 유지 관리.",
    priceTitle: "가격과 이용 기간",
    priceText:
      "{krw}(부가세 포함). 이 사이트에서 Google, Kakao 또는 Naver로 로그인한 뒤 토스페이먼츠로 한 번 결제합니다. 이용 기간: 결제가 승인된 때부터 364일(12개월보다 짧음)이며, 같은 시각에 끝납니다. 자동으로 갱신되거나 다시 결제되지 않습니다.",
    refundTitle: "환불과 이용 기간이 끝난 뒤",
    refundText:
      "결제 후 7일 이내에 요청하면 전액 환불됩니다. 이용 기간이 끝나도 기본 기능은 그대로 쓸 수 있고, 설정, 기록, 보고서, 복구하기도 그대로 남습니다.",
    note: "두 버전은 서로 다른 상품입니다. Mac App Store에서 구매한 Expert는 웹사이트 버전에 적용되지 않고, 364일 잠금 해제는 Mac App Store 버전에 적용되지 않습니다.",
    download: "Mac용 다운로드",
    buy: "364일 잠금 해제 구매하기",
    policies: "구매하기 전에 웹사이트 버전의 {terms}, {refund}, {privacy}을 확인해 주세요.",
    privacyItem: {
      title: "파일은 Mac에서 처리합니다",
      text: "파일과 검사 결과는 Mac에서 처리하며 개발자 서버로 업로드하지 않습니다. Mac App Store 버전에는 분석 도구도 계정도 없고, Expert 구매와 복원은 Apple이 처리합니다. 웹사이트 버전에도 분석 도구가 없으며, 계정은 364일 잠금 해제에만 쓰이고 파일 이름, 경로, 검사 결과는 보내지 않습니다.",
    },
    privacyFaq: {
      question: "파일에 관한 정보를 어딘가로 보내나요?",
      answer:
        "아니요. 파일과 검사 결과는 Mac에서 처리하며 개발자 서버로 업로드하지 않습니다. Mac App Store 버전에는 계정이 없고, Expert 구매는 Apple이 처리합니다. 웹사이트 버전의 계정은 364일 잠금 해제에만 쓰이며, 이용 기간을 확인할 뿐 파일 이름, 경로, 검사 결과는 보내지 않습니다.",
    },
    unlockFaq: {
      question: "364일 잠금 해제는 무엇인가요?",
      answer:
        "이 사이트에서 한 번 결제({krw}, 부가세 포함)하면 결제가 승인된 때부터 364일 동안 Clean Space 웹사이트 버전의 모든 기능을 쓸 수 있습니다. 자동으로 갱신되지 않으며, 이용 기간이 끝나도 기본 기능은 그대로 쓸 수 있습니다. 웹사이트 버전에만 적용되며 Mac App Store 버전에는 적용되지 않습니다.",
    },
    availableFaq: {
      question: "지금 받을 수 있나요?",
      answer: "네. 이 페이지에서 웹사이트 버전을 내려받을 수 있습니다. Mac App Store 버전은 출시를 준비하고 있으며, 출시되면 이 페이지에 링크를 걸어 두겠습니다.",
    },
  },
};

/** Reviewed versioned fallback for the notarized website edition; update the label with each release. */
const REVIEWED_DOWNLOAD_1_0_7 = "https://clean-space-cultureandtech.web.app/clean-space/1.0-7/Clean-Space-1.0.zip";

function channelSection(language: SupportedLanguage, downloadUrl: string): AppSection {
  const copy = COPY[language];
  const labels = CHECKOUT_COPY[language];
  return {
    title: copy.title,
    intro: copy.intro,
    items: [
      { title: copy.basicTitle, text: copy.basicText },
      { title: copy.unlockTitle, text: copy.unlockText },
      { title: copy.priceTitle, text: priced(copy.priceText) },
      { title: copy.refundTitle, text: copy.refundText },
    ],
    note: copy.note,
    // The account page is where the purchase starts: a full page load, so that nothing this page loads goes along.
    links: [
      ...(downloadUrl ? [{ label: downloadUrl === REVIEWED_DOWNLOAD_1_0_7 ? (language === "en" ? "Download for Mac — 1.0 (build 7)" : "Mac용 다운로드 — 1.0 (빌드 7)") : copy.download, href: downloadUrl, download: true }] : []),
      { label: copy.buy, href: `${CLEAN_SPACE_PORTAL.origin}${PORTAL_PAGE_PATH.account[language]}` },
    ],
    linkLine: {
      text: copy.policies,
      links: {
        terms: { label: labels.termsLink, href: DIRECT_SALE_POLICY_PATHS.terms },
        refund: { label: labels.refundLink, href: DIRECT_SALE_POLICY_PATHS.refund },
        privacy: { label: labels.privacyLink, href: DIRECT_SALE_POLICY_PATHS.privacy },
      },
    },
  };
}

/**
 * The product page's content with the website edition: its section goes right before the privacy section (the last
 * one), whose first item then covers both editions; the file-processing answer (the fifth) does too, the 364 days
 * Unlock gets its own question after it, and, once there is a download, "Can I get it now?" (the last) says so.
 */
export function withWebsiteChannel(app: AppInfo, downloadUrl: string): AppInfo {
  const content = Object.fromEntries(
    (Object.keys(app.content) as SupportedLanguage[]).map((language) => {
      const base = app.content[language];
      const copy = COPY[language];
      const sections = base.sections.flatMap((section, index): AppSection[] => {
        if (index === base.sections.length - 1) {
          return [channelSection(language, downloadUrl), { ...section, items: [copy.privacyItem, ...section.items.slice(1)] }];
        }
        return [section];
      });
      const faq = base.faq.map((item, index) => {
        if (index === 4) return copy.privacyFaq;
        if (downloadUrl && index === base.faq.length - 1) return copy.availableFaq;
        return item;
      });
      const unlockFaq = { question: copy.unlockFaq.question, answer: priced(copy.unlockFaq.answer) };
      const next: AppContent = { ...base, sections, faq: [...faq.slice(0, 5), unlockFaq, ...faq.slice(5)] };
      return [language, next];
    }),
  ) as Record<SupportedLanguage, AppContent>;
  return { ...app, content };
}
