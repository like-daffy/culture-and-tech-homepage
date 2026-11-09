// Clean Space as the central checkout's third product (products.ts, product-copy.ts): closed unless a build opens it,
// its pages on this site (its legal pages once for both languages), and the other products' links unchanged.
import { afterEach, describe, expect, it, vi } from "vitest";
import { PAGE_PATH, PORTAL_ORIGIN, PORTAL_PAGE_PATH } from "@/lib/clean-space/contract.generated";
import { PURCHASE_COPY } from "@/lib/clean-space/copy";
import { ALREADY_OWNED_CODE, CLEAN_SPACE_PAGES, CLEAN_SPACE_PORTAL } from "@/lib/clean-space/site";
import { ALL_IN_ONE_COPY, CHORD_TO_MIDI_COPY, CLEAN_SPACE_COPY } from "../product-copy";
import { checkoutPath, PRODUCTS, productResumeUrl, productUrl, type OpenProduct } from "../products";

const RESUME = "R".repeat(43);

/** products.ts as a build with these settings makes it (Next.js writes them in at build time). */
async function productsWith(settings: Record<string, string>) {
  vi.resetModules();
  for (const [name, value] of Object.entries(settings)) vi.stubEnv(name, value);
  return import("../products");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Clean Space's checkout, closed", () => {
  it("is closed in a build without its switch: its name, its home page, nothing of its offer", () => {
    const product = PRODUCTS["clean-space"];
    expect(product).toEqual({
      slug: "clean-space",
      enabled: false,
      origin: "https://cultureand.tech",
      name: {
        en: { productName: "Clean Space", backToProduct: "Back to Clean Space" },
        ko: { productName: "Clean Space", backToProduct: "Clean Space로 돌아가기" },
      },
      home: "apps/clean-space/",
    });
    expect(productUrl(product, "en", "home")).toBe("https://cultureand.tech/apps/clean-space/");
    expect(productUrl(product, "ko", "home")).toBe("https://cultureand.tech/ko/apps/clean-space/");
    expect(checkoutPath(product, "ko", "success")).toBe("/ko/checkout/clean-space/success/");
  });

  it("stays closed unless the switch is exactly on", async () => {
    for (const value of ["", "1", "true", "ON"]) {
      const { PRODUCTS: built } = await productsWith({ NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: value });
      expect(built["clean-space"].enabled).toBe(false);
    }
  });
});

describe("Clean Space's checkout, open", () => {
  it("links its account page on the portal (start, resume), its home page here, and its policies once", async () => {
    const { PRODUCTS: built } = await productsWith({ NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: "on" });
    const product = built["clean-space"] as OpenProduct;
    expect(product.enabled).toBe(true);
    expect(product).toMatchObject({
      region: "asia-northeast3",
      startPage: "account",
      resumePath: { origin: "https://portal.cultureand.tech", path: "products/clean-space" },
      footerPages: ["terms", "refund", "privacy"],
      storageKey: "cultureandtech.checkout.clean-space",
      alreadyOwnedCode: "ALREADY_ACTIVE",
      passDays: 364,
      emulators: false,
      paypalDescription:
        "Digital service, no shipping: the 364 days Unlock of the Clean Space Mac app for the buyer's account for 364 days from payment. One payment; it doesn't renew.",
    });
    expect(productUrl(product, "en", "account")).toBe("https://portal.cultureand.tech/products/clean-space");
    expect(productUrl(product, "ko", "account")).toBe("https://portal.cultureand.tech/ko/products/clean-space");
    expect(productUrl(product, "ko", "home")).toBe("https://cultureand.tech/ko/apps/clean-space/");
    for (const lang of ["en", "ko"] as const) {
      expect(productUrl(product, lang, "terms")).toBe("https://cultureand.tech/culture/clean-space/direct-terms.html");
      expect(productUrl(product, lang, "refund")).toBe("https://cultureand.tech/culture/clean-space/direct-refunds.html");
      expect(productUrl(product, lang, "privacy")).toBe("https://cultureand.tech/culture/clean-space/direct-privacy.html");
    }
    expect(productResumeUrl(product, "ko", RESUME)).toBe(`https://portal.cultureand.tech/ko/products/clean-space?resume=${RESUME}`);
    expect(productResumeUrl(product, "en", RESUME)).toBe(`https://portal.cultureand.tech/products/clean-space?resume=${RESUME}`);
  });

  it("uses its own Firebase settings, and its emulator suite in a test build", async () => {
    const { PRODUCTS: built, isProductConfigured } = await productsWith({
      NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: "on",
      NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY: "key",
      NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID: "demo-clean-space",
      NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID: "app",
      NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT: "emulator",
      NEXT_PUBLIC_CLEAN_SPACE_ORIGIN: "http://127.0.0.1:5000",
    });
    const product = built["clean-space"] as OpenProduct;
    expect(product.firebase).toEqual({ apiKey: "key", projectId: "demo-clean-space", appId: "app" });
    expect(product.emulators).toBe(true);
    expect(product.functionsEmulator).toEqual({ host: "127.0.0.1", port: 5101 });
    expect(isProductConfigured(product)).toBe(true);
    expect(productUrl(product, "en", "terms")).toBe("http://127.0.0.1:5000/culture/clean-space/direct-terms.html");
    // Another product's settings never reach it.
    expect((built["chord-to-midi"] as OpenProduct).firebase.projectId).not.toBe("demo-clean-space");
  });

  it("agrees with the contract's page paths and the account page's links", async () => {
    const { PRODUCTS: built } = await productsWith({ NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: "on" });
    const product = built["clean-space"];
    for (const lang of ["en", "ko"] as const) expect(checkoutPath(product, lang)).toBe(PAGE_PATH.checkout[lang]);
    expect(CLEAN_SPACE_PORTAL.origin).toBe(PORTAL_ORIGIN);
    for (const lang of ["en", "ko"] as const) {
      expect(productUrl(product, lang, "account")).toBe(`${PORTAL_ORIGIN}${PORTAL_PAGE_PATH.account[lang]}`);
    }
    expect(`/${CLEAN_SPACE_PAGES.home}`).toBe(PAGE_PATH.product.en);
    expect(ALREADY_OWNED_CODE).toBe((product as OpenProduct).alreadyOwnedCode);
  });
});

describe("the other products' links", () => {
  it("are as they were", () => {
    const chordToMidi = PRODUCTS["chord-to-midi"];
    expect(productUrl(chordToMidi, "en", "terms")).toBe("https://chord-to-midi.app/terms");
    expect(productUrl(chordToMidi, "ko", "refund")).toBe("https://chord-to-midi.app/ko/refund");
    expect(productUrl(chordToMidi, "ko", "home")).toBe("https://chord-to-midi.app/ko/");
    expect(productUrl(chordToMidi, "en", "help")).toBe("https://chord-to-midi.app/");
    expect(productResumeUrl(chordToMidi as OpenProduct, "en", RESUME)).toBe(`https://chord-to-midi.app/purchase/success?resume=${RESUME}`);
    const dj = PRODUCTS["dj-duplicate-guard"];
    expect(dj.enabled).toBe(false);
    expect(productUrl(dj, "en", "home")).toBe("https://dj-duplicate-guard.app/");
    expect(productUrl(dj, "ko", "terms")).toBe("https://dj-duplicate-guard.app/ko/");
  });
});

describe("Clean Space's checkout wording", () => {
  it("states the period, the price terms and the refund in Chord to MIDI's Toss-reviewed words", () => {
    expect(CLEAN_SPACE_COPY.ko.period).toBe(CHORD_TO_MIDI_COPY.ko.period);
    expect(CLEAN_SPACE_COPY.ko.priceTerms).toBe(CHORD_TO_MIDI_COPY.ko.priceTerms);
    expect(CLEAN_SPACE_COPY.en.priceTerms).toBe(CHORD_TO_MIDI_COPY.en.priceTerms);
    expect(CLEAN_SPACE_COPY.ko.includes.at(-1)).toBe("결제 후 7일 이내에 요청하면 전액 환불됩니다.");
    expect(CLEAN_SPACE_COPY.en.includes.at(-1)).toBe(CHORD_TO_MIDI_COPY.en.includes.at(-1));
    expect(CLEAN_SPACE_COPY.ko.productName).toContain("364일 잠금 해제");
    expect(CLEAN_SPACE_COPY.en.productName).toContain("364 days Unlock");
  });

  it("calls its account email the contact email, never a recovery address", () => {
    expect(CLEAN_SPACE_COPY.en.receiptEmail).toBe("Receipt and contact email: {email}");
    expect(CLEAN_SPACE_COPY.ko.receiptEmail).toBe("영수증 및 연락용 이메일: {email}");
    for (const lang of ["en", "ko"] as const) {
      expect(JSON.stringify(CLEAN_SPACE_COPY[lang])).not.toMatch(/recovery|복구 이메일|free features/);
    }
    // Chord to MIDI keeps the checkout's own wording.
    expect(CHORD_TO_MIDI_COPY.en.receiptEmail).toBeUndefined();
  });

  it("says on the account page what the checkout says", () => {
    for (const lang of ["en", "ko"] as const) {
      expect(CLEAN_SPACE_COPY[lang].period.startsWith(PURCHASE_COPY[lang].period)).toBe(true);
      expect(PURCHASE_COPY[lang].renewal).toBe(CLEAN_SPACE_COPY[lang].priceTerms);
      expect(PURCHASE_COPY[lang].refund).toBe(CLEAN_SPACE_COPY[lang].includes.at(-1));
      expect(PURCHASE_COPY[lang].testPayments).toBe(CLEAN_SPACE_COPY[lang].testKeys);
      expect(PURCHASE_COPY[lang].refusals.alreadyOwned).toBe(CLEAN_SPACE_COPY[lang].already);
    }
    expect(CLEAN_SPACE_COPY.ko.testKeys).toBe(
      "테스트 결제: 지금은 토스페이먼츠의 테스트 환경에서 결제가 진행되어 실제로 청구되지 않습니다. 테스트 결제로 받은 이용 기간은 정식 판매가 시작되면 끝납니다.",
    );
  });
});

describe("All-in-one's checkout", () => {
  it("is closed in a build without its switch: its name and the portal, nothing of its offer", async () => {
    const product = PRODUCTS["all-in-one"];
    expect(product).toEqual({
      slug: "all-in-one",
      enabled: false,
      origin: "https://portal.cultureand.tech",
      name: {
        en: { productName: "All-in-one — 364 Days", backToProduct: "Back to your Culture & Tech account" },
        ko: { productName: "All-in-one — 364 Days", backToProduct: "컬처앤테크 계정으로 돌아가기" },
      },
    });
    expect(productUrl(product, "ko", "home")).toBe("https://portal.cultureand.tech/ko/");
    expect(checkoutPath(product, "en")).toBe("/checkout/all-in-one/");
    for (const value of ["", "1", "true", "ON"]) {
      const { PRODUCTS: built } = await productsWith({ NEXT_PUBLIC_ALL_IN_ONE_CHECKOUT: value });
      expect(built["all-in-one"].enabled).toBe(false);
    }
  });

  it("open, starts and resumes on the portal's All-in-one page, in the portal's project and region", async () => {
    const { PRODUCTS: built } = await productsWith({ NEXT_PUBLIC_ALL_IN_ONE_CHECKOUT: "on" });
    const product = built["all-in-one"] as OpenProduct;
    expect(product).toMatchObject({ region: "asia-northeast3", startPage: "purchase", passDays: 364, alreadyOwnedCode: "ALREADY_ACTIVE", footerPages: ["terms", "refund", "privacy"] });
    expect(productUrl(product, "en", "purchase")).toBe("https://portal.cultureand.tech/products/all-in-one");
    expect(productUrl(product, "ko", "terms")).toBe("https://portal.cultureand.tech/ko/terms");
    expect(productResumeUrl(product, "ko", RESUME)).toBe(`https://portal.cultureand.tech/ko/products/all-in-one?resume=${RESUME}`);
  });

  it("keeps the English name in both languages and states the owner's terms", () => {
    for (const lang of ["en", "ko"] as const) {
      expect(ALL_IN_ONE_COPY[lang].productName).toBe("All-in-one — 364 Days");
      expect(ALL_IN_ONE_COPY[lang].period).toBe(CLEAN_SPACE_COPY[lang].period);
      expect(ALL_IN_ONE_COPY[lang].priceTerms).toBe(CHORD_TO_MIDI_COPY[lang].priceTerms);
      expect(JSON.stringify(ALL_IN_ONE_COPY[lang])).not.toMatch(/올인원|연장|renew your|extend/);
    }
    expect(ALL_IN_ONE_COPY.ko.includes.join(" ")).toContain("기존 구매 금액은 자동으로 차감되지 않으며");
    expect(ALL_IN_ONE_COPY.en.includes.at(-1)).toBe(CHORD_TO_MIDI_COPY.en.includes.at(-1));
  });
});

describe("DJ Duplicate Guard's checkout, open (portal accounts)", () => {
  it("starts and resumes on the portal's DJ page; its legal pages stay on its own site", async () => {
    const { PRODUCTS: built } = await productsWith({ NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT: "on" });
    const dj = built["dj-duplicate-guard"] as OpenProduct;
    expect(productUrl(dj, "ko", "account")).toBe("https://portal.cultureand.tech/ko/products/dj-duplicate-guard");
    expect(productResumeUrl(dj, "en", RESUME)).toBe(`https://portal.cultureand.tech/products/dj-duplicate-guard?resume=${RESUME}`);
    expect(productUrl(dj, "en", "terms")).toBe("https://dj-duplicate-guard.app/terms");
    expect(dj.functionsEmulator).toBeUndefined();
  });
});
