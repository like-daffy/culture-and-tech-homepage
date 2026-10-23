/**
 * Site-wide SEO data: the canonical origin, the language versions of every page, their titles and descriptions,
 * and their structured data.
 * public/sitemap.xml and public/llms.txt repeat these URLs and facts; keep them in sync.
 */

import type { AppInfo, AppSlug } from "./apps";
import type { SupportedLanguage } from "./language-detection";

export const SITE_URL = "https://cultureand.tech";

// Every language has its own pre-rendered homepage; they are hreflang alternates of each other
export const LANGUAGE_PATHS: Record<SupportedLanguage, string> = {
  en: "/",
  ko: "/ko/",
};

/** The page of an app in each language */
export function appPaths(slug: AppSlug): Record<SupportedLanguage, string> {
  return { en: `/apps/${slug}/`, ko: `/ko/apps/${slug}/` };
}

export const OG_LOCALES: Record<SupportedLanguage, string> = {
  en: "en_US",
  ko: "ko_KR",
};

export const HOME_METADATA: Record<SupportedLanguage, { title: string; description: string }> = {
  en: {
    title: "Live-idol Music Production in Seoul | Culture & Tech",
    description:
      "Original songs for Live-idols, produced by Sochan: full mix, instrumental and stems, exclusive or non-exclusive. Plus keyboard sessions and apps for musicians.",
  },
  ko: {
    title: "라이브아이돌 오리지널곡(오리곡) 제작 | 컬처앤테크",
    description:
      "라이브아이돌·지하아이돌 오리지널곡(오리곡) 제작 전문 컬처앤테크. 풀 믹스·인스트루멘탈·스템 제공, 독점/비독점 계약. 최근 작품과 데모를 확인하세요.",
  },
};

export const APP_METADATA: Record<AppSlug, Record<SupportedLanguage, { title: string; description: string }>> = {
  "chord-to-midi": {
    en: {
      title: "Chord to MIDI: Turn Chords into MIDI Files | Culture & Tech",
      description:
        "Type a chord progression, hear it on a piano and download a MIDI file for your DAW, or read a MIDI file's chords. Free, in your browser.",
    },
    ko: {
      title: "Chord to MIDI: 코드 진행을 MIDI 파일로 | 컬처앤테크",
      description:
        "코드 진행을 입력해 피아노로 들어 보고 DAW용 MIDI 파일로 내려받으세요. MIDI 파일의 코드도 읽어 줍니다. 브라우저에서 무료로 쓰는 음악 도구입니다.",
    },
  },
  "mac-get-space": {
    en: {
      title: "Mac Get Space: Mac Cleaner for Musicians | Culture & Tech",
      description:
        "A Mac storage cleaner for musicians: music files that match its default protection rules are excluded, and nothing is deleted until you approve a plan.",
    },
    ko: {
      title: "Mac Get Space: 음악가를 위한 Mac 용량 정리 앱 | 컬처앤테크",
      description:
        "음악가를 위한 Mac 용량 정리 앱. 기본 보호 규칙에 해당하는 음악 작업 파일은 삭제 대상에서 제외하고, 직접 승인하기 전에는 아무것도 지우지 않습니다.",
    },
  },
};

/**
 * Language a page is pre-rendered in, from its route: "/ko" and below are Korean
 */
export function pageLanguageFromPath(pathname: string): SupportedLanguage {
  return pathname === "/ko" || pathname.startsWith("/ko/") ? "ko" : "en";
}

/**
 * The language versions of the page at a route: the English version is at the route without "/ko",
 * the Korean version under "/ko". "/apps/mac-get-space" gives "/apps/mac-get-space/" and
 * "/ko/apps/mac-get-space/"; "/" and "/ko" give the two homepages.
 */
export function languagePathsFor(pathname: string): Record<SupportedLanguage, string> {
  const english = pageLanguageFromPath(pathname) === "ko" ? pathname.slice("/ko".length) || "/" : pathname;
  const path = english.endsWith("/") ? english : `${english}/`;
  return { en: path, ko: path === "/" ? LANGUAGE_PATHS.ko : `/ko${path}` };
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SITE_NAMES: Record<SupportedLanguage, string> = { en: "Culture & Tech", ko: "컬처앤테크" };

// Only facts the page footer shows
const ORGANIZATION = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "Culture & Tech",
  alternateName: "컬처앤테크",
  url: `${SITE_URL}/`,
  email: "sochan@cultureand.tech",
  taxID: "111-20-53033",
  address: {
    "@type": "PostalAddress",
    streetAddress: "3rd floor, 18 Jayangbeonyeong-ro",
    addressLocality: "Gwangjin-gu",
    addressRegion: "Seoul",
    postalCode: "05098",
    addressCountry: "KR",
  },
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: "Culture & Tech",
  alternateName: "컬처앤테크",
  inLanguage: Object.keys(LANGUAGE_PATHS),
  publisher: { "@id": ORGANIZATION_ID },
};

const faqEntities = (faq: { question: string; answer: string }[]) =>
  faq.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  }));

/**
 * JSON-LD for one language version of the homepage.
 * The FAQ must be exactly the questions and answers that page shows.
 */
export function homeJsonLd(
  language: SupportedLanguage,
  faq: { question: string; answer: string }[]
) {
  const url = `${SITE_URL}${LANGUAGE_PATHS[language]}`;
  const { title, description } = HOME_METADATA[language];

  return {
    "@context": "https://schema.org",
    "@graph": [
      ORGANIZATION,
      WEBSITE,
      {
        "@type": "FAQPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: language,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORGANIZATION_ID },
        mainEntity: faqEntities(faq),
      },
    ],
  };
}

/**
 * JSON-LD for one language version of an app's page: the app, the page with its FAQ, and the breadcrumb the page
 * shows. Every value comes from the content the page shows (src/lib/apps.ts).
 */
export function appJsonLd(app: AppInfo, language: SupportedLanguage) {
  const content = app.content[language];
  const url = `${SITE_URL}${appPaths(app.slug)[language]}`;
  const appId = `${url}#app`;
  const { title, description } = APP_METADATA[app.slug][language];
  // A screenshot with a note (a development build) is labelled on the page only, so it stays out of the JSON-LD
  const screenshot = content.screenshots.find((shot) => !shot.note);

  return {
    "@context": "https://schema.org",
    "@graph": [
      ORGANIZATION,
      WEBSITE,
      {
        "@type": app.schema.type,
        "@id": appId,
        name: content.name,
        url: content.cta?.href ?? url,
        description: content.summary,
        applicationCategory: app.schema.applicationCategory,
        operatingSystem: app.schema.operatingSystem,
        featureList: content.highlights,
        ...(app.icon && { image: `${SITE_URL}${app.icon}` }),
        ...(screenshot && { screenshot: `${SITE_URL}${screenshot.src}` }),
        ...(app.schema.free && {
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: language === "ko" ? "KRW" : "USD" },
        }),
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: language,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": appId },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: faqEntities(content.faq),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAMES[language],
            item: `${SITE_URL}${LANGUAGE_PATHS[language]}`,
          },
          { "@type": "ListItem", position: 2, name: content.name, item: url },
        ],
      },
    ],
  };
}
