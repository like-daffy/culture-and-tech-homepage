/**
 * Clean Space's pages on this site (its product page's website-edition section, and its account, sign-in callback and
 * activation pages): what their build settings mean, and which combinations may be deployed. Its checkout is the
 * central checkout's (src/lib/checkout/products.ts), whose own settings scripts/check-checkout-config.mjs checks; the
 * two share the Firebase web app settings, the checkout switch and the emulator switch below.
 *
 * Dependency-free on purpose (no imports): `config.ts` reads the settings Next.js writes into the pages, and
 * `scripts/check-clean-space-config.mjs` (firebase.json predeploy) imports this file with Node's own TypeScript
 * support, so the build and the check apply the same rules. Problems name settings, never their values.
 *
 * The pages talk to the Clean Space licensing service in its own Firebase project (not this site's Hosting-only
 * project, README "Rules"); the values are that project's public web app settings and the public client ids of the
 * sign-in providers. Nothing here is a secret, and no secret may ever be put in a NEXT_PUBLIC_ setting.
 */

export type CleanSpaceEnvironment = "emulator" | "staging" | "production";

/** Every setting the pages read, by name. Each one is read literally in config.ts (Next.js inlines them). */
export const CLEAN_SPACE_SETTINGS = [
  "NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT",
  "NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY",
  "NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID",
  "NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY",
  "NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID",
  "NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID",
  "NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT",
  "NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE",
  "NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL",
  "NEXT_PUBLIC_CLEAN_SPACE_ORIGIN",
  "NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST",
  "NEXT_PUBLIC_CLEAN_SPACE_PROVIDER_EMULATOR_URL",
] as const;
export type CleanSpaceSetting = (typeof CLEAN_SPACE_SETTINGS)[number];
export type CleanSpaceEnv = Partial<Record<CleanSpaceSetting, string | undefined>>;

export interface CleanSpaceConfig {
  /** The environment is set and the Firebase web app settings are complete: the pages can reach the service. */
  configured: boolean;
  environment: CleanSpaceEnvironment | null;
  firebase: { apiKey: string; authDomain: string; projectId: string; appId: string };
  /** The service's region (the contract's, asia-northeast3), as the central checkout's entry has it. */
  functionsRegion: string;
  /** App Check (reCAPTCHA Enterprise) site key of the web app; its domains must list cultureand.tech. */
  recaptchaSiteKey: string;
  /** Public client ids of the brokered providers; '' when a provider isn't set up in this build. */
  providerClientIds: { kakao: string; naver: string };
  /**
   * The central checkout sells the 364 days Unlock in this build: NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT is exactly "on", as
   * src/lib/checkout/products.ts reads it. Only then does the account page offer the purchase.
   */
  checkoutOpen: boolean;
  /** The product page describes the website download and the 364 days Unlock (src/lib/apps.ts). Off unless exactly "1". */
  websiteRelease: boolean;
  /** The website download's https address, or '' when this build has none (the product page then shows no button). */
  downloadUrl: string;
  /** This site's origin, where the checkout is: https://cultureand.tech, or a test build's own server. */
  siteOrigin: string;
  /** Emulator builds only: where the Firebase emulators listen, and the fake OAuth providers of the tests. */
  emulatorHost: string;
  providerEmulatorUrl: string;
}

const trimmed = (value: string | undefined): string => (typeof value === "string" ? value.trim() : "");

function environmentOf(value: string): CleanSpaceEnvironment | null {
  return value === "emulator" || value === "staging" || value === "production" ? value : null;
}

/** An https address with a host, and nothing that could run as a script. */
export function isHttpsAddress(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname !== "" && url.username === "" && url.password === "";
  } catch {
    return false;
  }
}

/** The pages' settings from an environment (Next.js's inlined values, or the shell's in the check script). */
export function readConfig(env: CleanSpaceEnv, defaults: { functionsRegion: string; siteOrigin: string }): CleanSpaceConfig {
  const environment = environmentOf(trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT));
  const firebase = {
    apiKey: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY),
    authDomain: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN),
    projectId: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID),
    appId: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID),
  };
  const emulator = environment === "emulator";
  const downloadUrl = trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL);
  return {
    configured: environment !== null && Object.values(firebase).every((value) => value !== ""),
    environment,
    firebase,
    functionsRegion: defaults.functionsRegion,
    recaptchaSiteKey: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY),
    providerClientIds: {
      kakao: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID),
      naver: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID),
    },
    // Exactly as src/lib/checkout/products.ts and src/lib/apps.ts read them (Next.js writes them in at build time).
    checkoutOpen: env.NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT === "on",
    websiteRelease: env.NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE === "1",
    downloadUrl: isHttpsAddress(downloadUrl) ? downloadUrl : "",
    siteOrigin: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_ORIGIN) || defaults.siteOrigin,
    // Never honoured outside an emulator build, whatever is set.
    emulatorHost: emulator ? trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST) || "127.0.0.1" : "",
    providerEmulatorUrl: emulator ? trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_PROVIDER_EMULATOR_URL) : "",
  };
}

/**
 * What stops a build from being used, by setting name. `deploy` is a build going to Firebase Hosting (the predeploy
 * check): only an unconfigured build (the pages then say accounts and purchases aren't available) or a complete
 * production one may go there. Emulator and staging builds are for local tests (docs/clean-space-direct-sale.md).
 * The checkout switch and the test origin are checked again by scripts/check-checkout-config.mjs, with the central
 * checkout's other products.
 */
export function configProblems(env: CleanSpaceEnv, options: { deploy: boolean; functionsRegion: string; siteOrigin: string; portalRedirects?: boolean; portalMigration?: boolean }): string[] {
  const anySet = CLEAN_SPACE_SETTINGS.some((name) => trimmed(env[name]) !== "");
  if (!anySet) return [];
  const problems: string[] = [];
  const raw = trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT);
  const config = readConfig(env, options);
  if (config.environment === null) {
    problems.push(
      raw === ""
        ? "NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT is empty while other NEXT_PUBLIC_CLEAN_SPACE_ settings are set"
        : "NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT is not one of emulator, staging, production",
    );
    return problems;
  }
  const required: CleanSpaceSetting[] = [
    "NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY",
    "NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID",
  ];
  for (const name of required) if (trimmed(env[name]) === "") problems.push(`${name} is empty`);
  const project = config.firebase.projectId;
  const authDomain = config.firebase.authDomain;

  if (config.environment === "emulator") {
    if (project !== "" && !project.startsWith("demo-")) {
      problems.push("NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID must be a demo- project in an emulator build (never a real project)");
    }
  } else {
    if (trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST) !== "") problems.push("NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST is set outside an emulator build");
    if (trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_PROVIDER_EMULATOR_URL) !== "") {
      problems.push("NEXT_PUBLIC_CLEAN_SPACE_PROVIDER_EMULATOR_URL is set outside an emulator build");
    }
    if (project.startsWith("demo-")) problems.push("NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID is a demo- (emulator) project");
    if (authDomain !== "" && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(authDomain)) {
      problems.push("NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN is not a host name");
    }
    if (/^(localhost|127\.|0\.0\.0\.0)/.test(authDomain)) problems.push("NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN points at this computer");
  }

  if (config.environment === "production") {
    if (config.recaptchaSiteKey === "") problems.push("NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY is empty (App Check on the callables)");
    if (options.deploy && options.portalMigration && !options.portalRedirects) problems.push("Clean Space portal 301 redirects are incomplete or preceded by unreviewed rules");
    // Direct sign-in needs provider clients. Verified portal redirects must not configure the legacy surface.
    if (options.deploy && options.portalRedirects) {
      if (config.providerClientIds.kakao !== "") problems.push("NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID must be unset with portal redirects");
      if (config.providerClientIds.naver !== "") problems.push("NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID must be unset with portal redirects");
    } else {
      if (config.providerClientIds.kakao === "") problems.push("NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID is empty (Kakao Login is required)");
      if (config.providerClientIds.naver === "") problems.push("NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID is empty (Naver Login is required)");
    }
  }
  if (trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL) !== "" && config.downloadUrl === "") {
    problems.push("NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL is not an https address");
  }
  if (options.deploy && config.environment !== "production") {
    problems.push(`NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT is ${config.environment}: only an unconfigured or a production build may be deployed`);
  }
  return problems;
}
