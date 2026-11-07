/**
 * The build's Clean Space settings (config-rules.ts explains them). Next.js writes each `process.env.NEXT_PUBLIC_…`
 * below into the pages as text at build time, so each is named literally here; nothing else reads process.env.
 */
import { readConfig } from "./config-rules";
import { DEFAULT_FUNCTIONS_REGION } from "./contract.generated";

export const CLEAN_SPACE = readConfig(
  {
    NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT: process.env.NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT,
    NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY,
    NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID,
    NEXT_PUBLIC_CLEAN_SPACE_FUNCTIONS_REGION: process.env.NEXT_PUBLIC_CLEAN_SPACE_FUNCTIONS_REGION,
    NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID: process.env.NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID,
    NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID: process.env.NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID,
    NEXT_PUBLIC_CLEAN_SPACE_SALES_ENABLED: process.env.NEXT_PUBLIC_CLEAN_SPACE_SALES_ENABLED,
    NEXT_PUBLIC_CLEAN_SPACE_POLICIES_PUBLISHED: process.env.NEXT_PUBLIC_CLEAN_SPACE_POLICIES_PUBLISHED,
    NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE: process.env.NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE,
    NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST: process.env.NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST,
    NEXT_PUBLIC_CLEAN_SPACE_PROVIDER_EMULATOR_URL: process.env.NEXT_PUBLIC_CLEAN_SPACE_PROVIDER_EMULATOR_URL,
  },
  { functionsRegion: DEFAULT_FUNCTIONS_REGION },
);

/**
 * The direct-sale policies, published from mac-get-space with the same sync pattern as the App Store privacy page
 * (README). The pages only link to them; checkout stays closed while NEXT_PUBLIC_CLEAN_SPACE_POLICIES_PUBLISHED is off.
 */
export const DIRECT_SALE_POLICY_PATHS = {
  privacy: "/culture/clean-space/direct-privacy.html",
  terms: "/culture/clean-space/direct-terms.html",
  refunds: "/culture/clean-space/direct-refunds.html",
} as const;

/** Support for the direct sale: the same address as the app pages (src/lib/apps.ts). */
export const SUPPORT_EMAIL = "contact@cultureand.tech";

/**
 * The seller, as Korean e-commerce law asks a sales page to show it. The same business that runs the site: the
 * footer's published facts, and the mail-order registration, phone and hosting provider as chord-to-midi-web's
 * site.config.json `business` has them (committed at 79c96ac). The owner confirms them for Clean Space's direct sale
 * before sales open (docs/clean-space-direct-sale.md); change them with that source.
 */
export const SELLER = {
  en: {
    companyName: "Culture & Tech",
    representative: "Chan Baek",
    registrationNumber: "111-20-53033",
    mailOrderNumber: "2026-서울광진-1686",
    address: "3rd floor, 18 Jayangbeonyeong-ro, Gwangjin-gu, Seoul, 05098, South Korea",
    phone: "+82-10-2265-8170",
    email: "contact@cultureand.tech",
    hostingProvider: "Google LLC (Firebase Hosting)",
  },
  ko: {
    companyName: "컬처앤테크",
    representative: "백찬",
    registrationNumber: "111-20-53033",
    mailOrderNumber: "2026-서울광진-1686",
    address: "서울특별시 광진구 자양번영로 18, 3층 (05098)",
    phone: "+82-10-2265-8170",
    email: "contact@cultureand.tech",
    hostingProvider: "Google LLC (Firebase 호스팅)",
  },
} as const;
