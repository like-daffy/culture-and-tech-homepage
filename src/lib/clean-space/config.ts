/**
 * The build's Clean Space settings (config-rules.ts explains them). Next.js writes each `process.env.NEXT_PUBLIC_…`
 * below into the pages as text at build time, so each is named literally here; nothing else in src/lib/clean-space
 * reads process.env. The central checkout's entry (src/lib/checkout/products.ts) reads the same names for its own.
 */
import { readConfig } from "./config-rules";
import { DEFAULT_FUNCTIONS_REGION } from "./contract.generated";
import { CLEAN_SPACE_SITE_ORIGIN } from "./site";

export const CLEAN_SPACE = readConfig(
  {
    NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT: process.env.NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT,
    NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY,
    NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID,
    NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID: process.env.NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID,
    NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID: process.env.NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID,
    NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: process.env.NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT,
    NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE: process.env.NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE,
    NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL: process.env.NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL,
    NEXT_PUBLIC_CLEAN_SPACE_ORIGIN: process.env.NEXT_PUBLIC_CLEAN_SPACE_ORIGIN,
    NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST: process.env.NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST,
    NEXT_PUBLIC_CLEAN_SPACE_PROVIDER_EMULATOR_URL: process.env.NEXT_PUBLIC_CLEAN_SPACE_PROVIDER_EMULATOR_URL,
  },
  { functionsRegion: DEFAULT_FUNCTIONS_REGION, siteOrigin: CLEAN_SPACE_SITE_ORIGIN },
);

/** Support for the direct sale: the same address as the app pages (src/lib/apps.ts) and the checkout's seller details. */
export const SUPPORT_EMAIL = "contact@cultureand.tech";
