/**
 * Clean Space's direct-sale pages: what their build settings mean, and which combinations may be deployed.
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
  "NEXT_PUBLIC_CLEAN_SPACE_FUNCTIONS_REGION",
  "NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY",
  "NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID",
  "NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID",
  "NEXT_PUBLIC_CLEAN_SPACE_SALES_ENABLED",
  "NEXT_PUBLIC_CLEAN_SPACE_POLICIES_PUBLISHED",
  "NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE",
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
  functionsRegion: string;
  /** App Check (reCAPTCHA Enterprise) site key of the web app; its domains must list cultureand.tech. */
  recaptchaSiteKey: string;
  /** Public client ids of the brokered providers; '' when a provider isn't set up in this build. */
  providerClientIds: { kakao: string; naver: string };
  /** The operator's switch for taking payments. Off unless exactly "1". */
  salesEnabled: boolean;
  /** The direct-sale privacy policy, terms and refund policy are published. Off unless exactly "1". */
  policiesPublished: boolean;
  /** The product page describes the website download next to the App Store app. Off unless exactly "1". */
  websiteRelease: boolean;
  /** Emulator builds only: where the Firebase emulators listen, and the fake OAuth providers of the tests. */
  emulatorHost: string;
  providerEmulatorUrl: string;
}

const trimmed = (value: string | undefined): string => (typeof value === "string" ? value.trim() : "");

function environmentOf(value: string): CleanSpaceEnvironment | null {
  return value === "emulator" || value === "staging" || value === "production" ? value : null;
}

/** The pages' settings from an environment (Next.js's inlined values, or the shell's in the check script). */
export function readConfig(env: CleanSpaceEnv, defaults: { functionsRegion: string }): CleanSpaceConfig {
  const environment = environmentOf(trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT));
  const firebase = {
    apiKey: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY),
    authDomain: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN),
    projectId: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID),
    appId: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID),
  };
  const emulator = environment === "emulator";
  return {
    configured: environment !== null && Object.values(firebase).every((value) => value !== ""),
    environment,
    firebase,
    functionsRegion: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_FUNCTIONS_REGION) || defaults.functionsRegion,
    recaptchaSiteKey: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY),
    providerClientIds: {
      kakao: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID),
      naver: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID),
    },
    salesEnabled: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_SALES_ENABLED) === "1",
    policiesPublished: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_POLICIES_PUBLISHED) === "1",
    websiteRelease: trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE) === "1",
    // Never honoured outside an emulator build, whatever is set.
    emulatorHost: emulator ? trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST) || "127.0.0.1" : "",
    providerEmulatorUrl: emulator ? trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_PROVIDER_EMULATOR_URL) : "",
  };
}

/**
 * What stops a build from being used, by setting name. `deploy` is a build going to Firebase Hosting (the predeploy
 * check): only an unconfigured build (the pages then say the purchase isn't available) or a complete production one
 * may go there. Emulator and staging builds are for local tests (README "Clean Space's direct sale").
 */
export function configProblems(env: CleanSpaceEnv, options: { deploy: boolean; functionsRegion: string }): string[] {
  const anySet = CLEAN_SPACE_SETTINGS.some((name) => trimmed(env[name]) !== "");
  if (!anySet) return [];
  const problems: string[] = [];
  const raw = trimmed(env.NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT);
  const config = readConfig(env, { functionsRegion: options.functionsRegion });
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
  if (!/^[a-z0-9-]{1,63}$/.test(config.functionsRegion)) problems.push("NEXT_PUBLIC_CLEAN_SPACE_FUNCTIONS_REGION is not a region name");
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
    // All three sign-in methods are required (plan §2.1): Google comes with the Firebase settings.
    if (config.providerClientIds.kakao === "") problems.push("NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID is empty (Kakao Login is required)");
    if (config.providerClientIds.naver === "") problems.push("NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID is empty (Naver Login is required)");
  }
  if (config.salesEnabled && !config.policiesPublished) {
    problems.push("NEXT_PUBLIC_CLEAN_SPACE_SALES_ENABLED is 1 while NEXT_PUBLIC_CLEAN_SPACE_POLICIES_PUBLISHED is not: publish the direct-sale policies first");
  }
  if (options.deploy && config.environment !== "production") {
    problems.push(`NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT is ${config.environment}: only an unconfigured or a production build may be deployed`);
  }
  return problems;
}
