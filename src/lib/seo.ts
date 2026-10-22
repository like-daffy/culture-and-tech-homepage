/**
 * Site-wide SEO data: the canonical origin, the language versions of the homepage and their structured data.
 * public/sitemap.xml and public/llms.txt repeat these URLs and facts; keep them in sync.
 */

import type { SupportedLanguage } from "./language-detection";

export const SITE_URL = "https://cultureand.tech";

// Every language has its own pre-rendered homepage; they are hreflang alternates of each other
export const LANGUAGE_PATHS: Record<SupportedLanguage, string> = {
  en: "/",
  ko: "/ko/",
};

export const OG_LOCALES: Record<SupportedLanguage, string> = {
  en: "en_US",
  ko: "ko_KR",
};

export const HOME_METADATA: Record<SupportedLanguage, { title: string; description: string }> = {
  en: {
    title: "Live-Idol Music Production & QA in Seoul | Culture & Tech",
    description:
      "Original songs for live idols, produced by Sochan: full mix, instrumental and stems, exclusive or non-exclusive. Plus QA and session services in Seoul.",
  },
  ko: {
    title: "라이브아이돌 오리지널곡(오리곡) 제작 | 컬처앤테크",
    description:
      "라이브아이돌·지하아이돌 오리지널곡(오리곡) 제작 전문 컬처앤테크. 풀 믹스·인스트루멘탈·스템 제공, 독점/비독점 계약. 최근 작품과 데모를 확인하세요.",
  },
};

/**
 * Language a page is pre-rendered in, from its route: "/ko" and below are Korean
 */
export function pageLanguageFromPath(pathname: string): SupportedLanguage {
  return pathname === "/ko" || pathname.startsWith("/ko/") ? "ko" : "en";
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

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
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: "Culture & Tech",
        alternateName: "컬처앤테크",
        inLanguage: Object.keys(LANGUAGE_PATHS),
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
        about: { "@id": ORGANIZATION_ID },
        mainEntity: faq.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
}
