import { describe, expect, it } from "vitest";
import { CLEAN_SPACE_SETTINGS, configProblems, isHttpsAddress, readConfig, type CleanSpaceEnv } from "../config-rules";
import { DEFAULT_FUNCTIONS_REGION, DURATION_SECONDS, OFFER_PRICES } from "../contract.generated";
import { formatCountdown, formatInstant, formatPrice, isoUtc, secondsLeft, termEndOf } from "../display";
import { CLEAN_SPACE_SITE_ORIGIN } from "../site";

const defaults = { functionsRegion: DEFAULT_FUNCTIONS_REGION, siteOrigin: CLEAN_SPACE_SITE_ORIGIN };
const production: CleanSpaceEnv = {
  NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT: "production",
  NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY: "public-api-key",
  NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_AUTH_DOMAIN: "clean-space-prod.firebaseapp.com",
  NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID: "clean-space-prod",
  NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID: "1:123:web:abc",
  NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY: "site-key",
  NEXT_PUBLIC_CLEAN_SPACE_KAKAO_CLIENT_ID: "kakao-id",
  NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID: "naver-id",
};

describe("build settings", () => {
  it("is closed by default: nothing set means not configured, no checkout, no website copy, no download", () => {
    const config = readConfig({}, defaults);
    expect(config).toMatchObject({
      configured: false,
      environment: null,
      checkoutOpen: false,
      websiteRelease: false,
      downloadUrl: "",
      siteOrigin: "https://cultureand.tech",
      functionsRegion: "asia-northeast3",
    });
    expect(configProblems({}, { deploy: true, ...defaults })).toEqual([]);
  });

  it("deploys a complete production build", () => {
    expect(configProblems(production, { deploy: true, ...defaults })).toEqual([]);
    expect(readConfig(production, defaults)).toMatchObject({ configured: true, functionsRegion: "asia-northeast3", emulatorHost: "", providerEmulatorUrl: "" });
  });

  it("names what is missing, never the values", () => {
    const problems = configProblems({ ...production, NEXT_PUBLIC_CLEAN_SPACE_NAVER_CLIENT_ID: "", NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY: " " }, { deploy: true, ...defaults });
    expect(problems.join("\n")).toMatch(/NAVER_CLIENT_ID/);
    expect(problems.join("\n")).toMatch(/RECAPTCHA_SITE_KEY/);
    for (const value of Object.values(production)) if (value && value.length > 9) expect(problems.join("\n")).not.toContain(value);
  });

  it("refuses emulator and staging builds, demo projects and emulator settings in a deployment", () => {
    const emulator: CleanSpaceEnv = { ...production, NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT: "emulator", NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID: "demo-clean-space-local" };
    expect(configProblems(emulator, { deploy: false, ...defaults })).toEqual([]);
    expect(configProblems(emulator, { deploy: true, ...defaults }).join()).toMatch(/emulator: only an unconfigured or a production build/);
    expect(configProblems({ ...production, NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT: "staging" }, { deploy: true, ...defaults }).join()).toMatch(/staging/);
    expect(configProblems({ ...production, NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID: "demo-x" }, { deploy: true, ...defaults }).join()).toMatch(/demo-/);
    expect(configProblems({ ...production, NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST: "127.0.0.1" }, { deploy: true, ...defaults }).join()).toMatch(/EMULATOR_HOST/);
    expect(configProblems({ ...emulator, NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID: "clean-space-prod" }, { deploy: false, ...defaults }).join()).toMatch(/demo- project/);
    expect(readConfig({ ...production, NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST: "10.0.0.1" }, defaults).emulatorHost).toBe("");
  });

  it("opens the purchase only with the central checkout's switch exactly on", () => {
    expect(readConfig({ ...production, NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: "on" }, defaults).checkoutOpen).toBe(true);
    for (const value of ["1", "true", "ON", " on"]) {
      expect(readConfig({ ...production, NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: value }, defaults).checkoutOpen).toBe(false);
    }
    // The switch alone is a Clean Space setting: the rest must come with it.
    expect(configProblems({ NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: "on" }, { deploy: true, ...defaults }).join()).toMatch(/ENVIRONMENT is empty/);
  });

  it("takes only an https download address, and a test build's own origin", () => {
    const withDownload = { ...production, NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL: "https://download.cultureand.tech/CleanSpace.dmg" };
    expect(readConfig(withDownload, defaults).downloadUrl).toBe("https://download.cultureand.tech/CleanSpace.dmg");
    expect(configProblems(withDownload, { deploy: true, ...defaults })).toEqual([]);
    for (const bad of ["http://download.cultureand.tech/x.dmg", "javascript:alert(1)", "download.cultureand.tech/x.dmg", "https://user:pw@example.com/x"]) {
      expect(readConfig({ ...production, NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL: bad }, defaults).downloadUrl).toBe("");
      expect(configProblems({ ...production, NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL: bad }, { deploy: true, ...defaults }).join()).toMatch(/DOWNLOAD_URL is not an https address/);
    }
    expect(isHttpsAddress("https://cultureand.tech/")).toBe(true);
    expect(readConfig({ ...production, NEXT_PUBLIC_CLEAN_SPACE_ORIGIN: "http://127.0.0.1:5000" }, defaults).siteOrigin).toBe("http://127.0.0.1:5000");
  });

  it("lists every setting config.ts reads", () => {
    expect(CLEAN_SPACE_SETTINGS.every((name) => name.startsWith("NEXT_PUBLIC_CLEAN_SPACE_"))).toBe(true);
    expect(new Set(CLEAN_SPACE_SETTINGS).size).toBe(CLEAN_SPACE_SETTINGS.length);
  });
});

describe("prices and times", () => {
  it("writes the exact amounts from minor units", () => {
    expect(formatPrice(OFFER_PRICES.KRW)).toBe("₩3,300");
    expect(formatPrice(OFFER_PRICES.USD)).toBe("US$2.49");
    expect(formatPrice({ currency: "KRW", amountMinor: 1_234_567 })).toBe("₩1,234,567");
    expect(formatPrice({ currency: "USD", amountMinor: 100_005 })).toBe("US$1,000.05");
  });

  it("writes instants to the second with their time zone", () => {
    const startsAt = 1_793_000_000;
    expect(isoUtc(startsAt)).toBe("2026-10-26T07:33:20Z");
    expect(formatInstant(startsAt, "en", "Asia/Seoul")).toBe("October 26, 2026 at 4:33:20 PM GMT+9");
    expect(formatInstant(startsAt, "en", "UTC")).toBe("October 26, 2026 at 7:33:20 AM UTC");
    expect(formatInstant(startsAt, "ko", "Asia/Seoul")).toMatch(/2026년 10월 26일.*오후 4시 33분 20초 GMT\+9/);
  });

  it("ends a term exactly 364 days of seconds later, across daylight saving time", () => {
    expect(termEndOf(1_793_000_000) - 1_793_000_000).toBe(DURATION_SECONDS);
    // New York changes its clocks inside this term; the end is still 31,449,600 seconds later.
    const start = Date.UTC(2027, 2, 1, 12, 0, 0) / 1000;
    expect(formatInstant(termEndOf(start), "en", "UTC")).toBe("February 28, 2028 at 12:00:00 PM UTC");
    // A term over 29 February 2028 still lasts 364 days, not "a year".
    const leap = Date.UTC(2027, 11, 1) / 1000;
    expect(isoUtc(termEndOf(leap))).toBe("2028-11-29T00:00:00Z");
  });

  it("counts down by the service's clock", () => {
    expect(secondsLeft(1000, 0, 400_000)).toBe(600);
    expect(secondsLeft(1000, 100, 400_000)).toBe(500);
    expect(secondsLeft(1000, 0, 2_000_000)).toBe(0);
    expect(formatCountdown(605)).toBe("10:05");
  });
});
