/**
 * The products the central checkout sells, each with its own backend and site. A product's orders, prices,
 * payments and entitlements are its own backend's (its Firebase project's Cloud Functions): the checkout pages render
 * what that backend answers and send its customers back only to that product's own pages. Nothing of one product is
 * ever used for another. The values below are public (web app settings), set at build time
 * (README, "The central checkout"); scripts/check-checkout-config.mjs checks them before a deployment.
 *
 * A product whose checkout a build keeps closed is only its public name and site: its pages say the checkout isn't
 * open, call nothing, and the build carries none of its offer (its copy, settings or price terms), so nothing about a
 * product is published here before its owner opens its sales.
 */
import {
  ALREADY_OWNED_CODE as CLEAN_SPACE_ALREADY_OWNED,
  CLEAN_SPACE_PAGES,
  CLEAN_SPACE_PORTAL,
  CLEAN_SPACE_SITE_ORIGIN,
  DIRECT_SALE_POLICY_PATHS,
} from "@/lib/clean-space/site";
import { APP_ERROR, type Lang } from "./contract";
import { ALL_IN_ONE_COPY, CHORD_TO_MIDI_COPY, CLEAN_SPACE_COPY, DJ_DUPLICATE_GUARD_COPY, type ProductCopy } from "./product-copy";

export type ProductSlug = "chord-to-midi" | "dj-duplicate-guard" | "clean-space" | "all-in-one";

/**
 * The product's pages a checkout may link to, by their path below the language's root, or from the site's root for a
 * page that exists once for both languages (it then starts with "/"); nothing from an address.
 */
export type ProductPage = "home" | "purchase" | "account" | "help" | "terms" | "refund" | "privacy" | "business";

/**
 * A page on another of the operator's sites (the account portal), by its path below the language's root there
 * (English at the root, Korean under /ko); the portal's URLs have no trailing slash.
 */
export interface ExternalPage {
  origin: string;
  path: string;
}

/** The account portal (portal.cultureand.tech): accounts, All-in-one and the portal's policies live there. */
const PORTAL_ORIGIN = CLEAN_SPACE_PORTAL.origin;

interface ProductIdentity {
  slug: ProductSlug;
  /** The product's own site (another origin only in test builds). */
  origin: string;
  /** What its closed pages say of it: its public name. */
  name: Record<Lang, { productName: string; backToProduct: string }>;
  /** Its home page below the language's root, when that isn't its site's root (Clean Space's pages are on this site). */
  home?: string;
}

/** A product whose checkout this build keeps closed. */
export interface ClosedProduct extends ProductIdentity {
  enabled: false;
}

/** A product whose checkout this build opens. */
export interface OpenProduct extends ProductIdentity {
  enabled: true;
  firebase: { apiKey: string; projectId: string; appId: string };
  /** App Check's reCAPTCHA Enterprise key of that web app: its domains must list cultureand.tech. */
  recaptchaSiteKey: string;
  /** Test builds only: the product's Firebase emulators (Functions on 127.0.0.1:5001 unless functionsEmulator says). */
  emulators: boolean;
  /** Where its emulator suite's Functions listen, when not on 127.0.0.1:5001. */
  functionsEmulator?: { host: string; port: number };
  /** Region of the product's Cloud Functions. */
  region: string;
  /** Its pages the checkout links, by path, or on the portal. */
  pages: Partial<Record<ProductPage, string | ExternalPage>>;
  /** The page where its customers sign in, begin a checkout, and finish a payment kept for them (`?resume=`). */
  startPage: ProductPage;
  resumePath: string | ExternalPage;
  /** The legal and help pages the checkout's footer links. */
  footerPages: ProductPage[];
  /** This tab's hold on a checkout of the product (sessionStorage). */
  storageKey: string;
  /** What PayPal is told about the purchase, in English (a digital service, so no shipping). */
  paypalDescription: string;
  /** The backend's error code for an account that already has the product (APP_ERROR). */
  alreadyOwnedCode: string;
  /**
   * A product sold as a pass: its length in days, which its copy states in fixed words. A checkout whose server says
   * another length takes no payment.
   */
  passDays?: number;
  copy: Record<Lang, ProductCopy>;
}

export type CheckoutProduct = OpenProduct | ClosedProduct;

const chordToMidi: OpenProduct = {
  slug: "chord-to-midi",
  enabled: true,
  origin: process.env.NEXT_PUBLIC_CHORD_TO_MIDI_ORIGIN || "https://chord-to-midi.app",
  name: {
    en: { productName: CHORD_TO_MIDI_COPY.en.productName, backToProduct: CHORD_TO_MIDI_COPY.en.backToProduct },
    ko: { productName: CHORD_TO_MIDI_COPY.ko.productName, backToProduct: CHORD_TO_MIDI_COPY.ko.backToProduct },
  },
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_API_KEY ?? "",
    projectId: process.env.NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_PROJECT_ID ?? "",
    appId: process.env.NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_APP_ID ?? "",
  },
  recaptchaSiteKey: process.env.NEXT_PUBLIC_CHORD_TO_MIDI_RECAPTCHA_SITE_KEY ?? "",
  emulators: process.env.NEXT_PUBLIC_CHORD_TO_MIDI_EMULATORS === "1",
  region: "asia-northeast3",
  pages: {
    home: "",
    purchase: "purchase",
    account: "account",
    terms: "terms",
    refund: "refund",
    privacy: "privacy",
    business: "business",
  },
  startPage: "purchase",
  resumePath: "purchase/success",
  footerPages: ["terms", "refund", "privacy", "business"],
  storageKey: "cultureandtech.checkout.chord-to-midi",
  paypalDescription:
    "Digital service, no shipping: no banner ads on Chord to MIDI for the buyer's account for 364 days from payment. One-time payment; it doesn't renew.",
  alreadyOwnedCode: APP_ERROR.alreadyAdFree,
  // Remove Ads — 364 days (chord-to-midi-web's REMOVE_ADS_OFFER), stated in the copy's fixed words.
  passDays: 364,
  copy: CHORD_TO_MIDI_COPY,
};

const DJ_DUPLICATE_GUARD_ORIGIN = process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_ORIGIN || "https://dj-duplicate-guard.app";
const DJ_DUPLICATE_GUARD_NAME: ProductIdentity["name"] = {
  en: { productName: "DJ Duplicate Guard", backToProduct: "Back to DJ Duplicate Guard" },
  ko: { productName: "DJ Duplicate Guard", backToProduct: "DJ Duplicate Guard로 돌아가기" },
};

/** DJ Duplicate Guard's Expert pass, once its owner opens the sales (its DL-52). */
function djDuplicateGuardOpen(): OpenProduct {
  return {
    slug: "dj-duplicate-guard",
    enabled: true,
    origin: DJ_DUPLICATE_GUARD_ORIGIN,
    name: DJ_DUPLICATE_GUARD_NAME,
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FIREBASE_API_KEY ?? "",
      projectId: process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FIREBASE_PROJECT_ID ?? "",
      appId: process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FIREBASE_APP_ID ?? "",
    },
    recaptchaSiteKey: process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_RECAPTCHA_SITE_KEY ?? "",
    emulators: process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_EMULATORS === "1",
    // Test builds only: the shared portal suite runs DJ's Functions emulator on another port (t1g's serve-dj: 5601).
    ...(process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FUNCTIONS_EMULATOR_PORT
      ? { functionsEmulator: { host: "127.0.0.1", port: Number(process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FUNCTIONS_EMULATOR_PORT) } }
      : {}),
    // Its account service runs in Seoul (its DL-45).
    region: "asia-northeast3",
    // Its site has clean URLs, English at the root and Korean under /ko/ (its apps/web/src/pages.ts); its legal pages
    // are published there before this checkout can open. Its account page is the shared portal's (the owner's choice A,
    // t1g's portal adapter): buyers start, resume (resumeCheckoutPayment) and see their pass there.
    pages: {
      home: "",
      account: { origin: PORTAL_ORIGIN, path: "products/dj-duplicate-guard" },
      help: "help",
      terms: "terms",
      refund: "refund",
      privacy: "privacy",
    },
    startPage: "account",
    resumePath: { origin: PORTAL_ORIGIN, path: "products/dj-duplicate-guard" },
    footerPages: ["terms", "refund", "privacy", "help"],
    storageKey: "cultureandtech.checkout.dj-duplicate-guard",
    paypalDescription:
      "Digital service, no shipping: a 364-day Expert pass for the buyer's DJ Duplicate Guard account. One payment, no renewal.",
    // Its CHECKOUT_ERROR.activePass: a pass that hasn't ended (no stacking).
    alreadyOwnedCode: "ACTIVE_PASS",
    // 364 × 24 hours from the payment's approval (its D38 and DL-50, terms Article 2(7)).
    passDays: 364,
    copy: DJ_DUPLICATE_GUARD_COPY,
  };
}

/**
 * Clean Space's checkout links back to this site (another origin only in test builds): its legal pages are here, its
 * account page is on the portal, and its product page's former address here (CLEAN_SPACE_PAGES.home) redirects to its
 * own site, clean-space.app, since 2026-11-12.
 */
const CLEAN_SPACE_ORIGIN = process.env.NEXT_PUBLIC_CLEAN_SPACE_ORIGIN || CLEAN_SPACE_SITE_ORIGIN;
const CLEAN_SPACE_NAME: ProductIdentity["name"] = {
  en: { productName: "Clean Space", backToProduct: "Back to Clean Space" },
  ko: { productName: "Clean Space", backToProduct: "Clean Space로 돌아가기" },
};

/** Clean Space's 364 days Unlock, once its owner opens the sales (README, "Opening Clean Space's checkout"). */
function cleanSpaceOpen(): OpenProduct {
  return {
    slug: "clean-space",
    enabled: true,
    origin: CLEAN_SPACE_ORIGIN,
    name: CLEAN_SPACE_NAME,
    home: CLEAN_SPACE_PAGES.home,
    // The Clean Space licensing project's web app: the same settings as its account pages (src/lib/clean-space/config.ts).
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY ?? "",
      projectId: process.env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID ?? "",
      appId: process.env.NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID ?? "",
    },
    recaptchaSiteKey: process.env.NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY ?? "",
    // One switch for its test builds, the one its account pages read; its emulator suite's Functions listen on port 5101
    // (mac-get-space services/licensing/firebase.json), apart from Chord to MIDI's.
    emulators: process.env.NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT === "emulator",
    functionsEmulator: { host: process.env.NEXT_PUBLIC_CLEAN_SPACE_EMULATOR_HOST || "127.0.0.1", port: 5101 },
    // Its licensing service runs in Seoul (its contract's DEFAULT_FUNCTIONS_REGION).
    region: "asia-northeast3",
    // Its legal pages exist once for both languages, from the site's root.
    pages: {
      home: CLEAN_SPACE_PAGES.home,
      account: { origin: PORTAL_ORIGIN, path: CLEAN_SPACE_PORTAL.account },
      terms: DIRECT_SALE_POLICY_PATHS.terms,
      refund: DIRECT_SALE_POLICY_PATHS.refund,
      privacy: DIRECT_SALE_POLICY_PATHS.privacy,
    },
    startPage: "account",
    resumePath: { origin: PORTAL_ORIGIN, path: CLEAN_SPACE_PORTAL.account },
    footerPages: ["terms", "refund", "privacy"],
    storageKey: "cultureandtech.checkout.clean-space",
    paypalDescription:
      "Digital service, no shipping: the 364 days Unlock of the Clean Space Mac app for the buyer's account for 364 days from payment. One payment; it doesn't renew.",
    // A 364 days Unlock that hasn't ended: another can be bought only after it ends (a provisional code, site.ts).
    alreadyOwnedCode: CLEAN_SPACE_ALREADY_OWNED,
    // 364 days (31,449,600 seconds) from the payment's approval (its contract's DURATION_DAYS).
    passDays: 364,
    copy: CLEAN_SPACE_COPY,
  };
}

const ALL_IN_ONE_NAME: ProductIdentity["name"] = {
  // The option's name stays in English in both languages (the owner, 2026-11-09).
  en: { productName: "All-in-one — 364 Days", backToProduct: "Back to your Culture & Tech account" },
  ko: { productName: "All-in-one — 364 Days", backToProduct: "컬처앤테크 계정으로 돌아가기" },
};

/**
 * Its server's code for a second All-in-one while one hasn't ended (the same-SKU rule, IDENTITY.md section 9):
 * services/commerce CODE.alreadyActive (6ec1abf), the shared checkout's APP_ERROR value. An individual pass never
 * triggers it (overlap is allowed).
 */
export const ALL_IN_ONE_ALREADY_OWNED_CODE = "ALREADY_ACTIVE";

/**
 * All-in-one — 364 Days, once its owner opens the sales: the central commerce codebase (services/commerce, t1b) in the
 * portal's project cultureand-tech-web takes the payment; the customer starts and finishes on the portal.
 */
function allInOneOpen(): OpenProduct {
  return {
    slug: "all-in-one",
    enabled: true,
    origin: PORTAL_ORIGIN,
    name: ALL_IN_ONE_NAME,
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_ALL_IN_ONE_FIREBASE_API_KEY ?? "",
      projectId: process.env.NEXT_PUBLIC_ALL_IN_ONE_FIREBASE_PROJECT_ID ?? "",
      appId: process.env.NEXT_PUBLIC_ALL_IN_ONE_FIREBASE_APP_ID ?? "",
    },
    // A portal-project App Check key whose domains list cultureand.tech (coordinated by t1g).
    recaptchaSiteKey: process.env.NEXT_PUBLIC_ALL_IN_ONE_RECAPTCHA_SITE_KEY ?? "",
    emulators: process.env.NEXT_PUBLIC_ALL_IN_ONE_EMULATORS === "1",
    functionsEmulator: { host: "127.0.0.1", port: 5301 },
    // The portal's region (IDENTITY.md section 13).
    region: "asia-northeast3",
    pages: {
      home: "",
      purchase: "products/all-in-one",
      account: "account",
      terms: "terms",
      refund: "refund",
      privacy: "privacy",
    },
    startPage: "purchase",
    resumePath: "products/all-in-one",
    footerPages: ["terms", "refund", "privacy"],
    storageKey: "cultureandtech.checkout.all-in-one",
    paypalDescription:
      "Digital service, no shipping: All-in-one access to every Culture & Tech service for the buyer's account for 364 days from payment. One payment; it doesn't renew.",
    alreadyOwnedCode: ALL_IN_ONE_ALREADY_OWNED_CODE,
    // 364 days from the payment's approval (ALL_IN_ONE.durationMs in the portal's contract).
    passDays: 364,
    copy: ALL_IN_ONE_COPY,
  };
}

export const PRODUCTS: Record<ProductSlug, CheckoutProduct> = {
  "chord-to-midi": chordToMidi,
  // Closed unless a build turns it on: Expert's sales are closed (DJ Duplicate Guard's DL-52), and the predeploy check
  // refuses the switch until its owner opens them. Closed, the build leaves djDuplicateGuardOpen() and its copy out.
  "dj-duplicate-guard":
    process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT === "on"
      ? djDuplicateGuardOpen()
      : { slug: "dj-duplicate-guard", enabled: false, origin: DJ_DUPLICATE_GUARD_ORIGIN, name: DJ_DUPLICATE_GUARD_NAME },
  // Closed unless a build turns it on: the 364 days Unlock isn't on sale until its owner opens it (on Toss's test keys
  // first, for Toss's review), and the predeploy check refuses the switch until then. Closed, the build leaves
  // cleanSpaceOpen() and its copy out.
  "clean-space":
    process.env.NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT === "on"
      ? cleanSpaceOpen()
      : { slug: "clean-space", enabled: false, origin: CLEAN_SPACE_ORIGIN, name: CLEAN_SPACE_NAME, home: CLEAN_SPACE_PAGES.home },
  // Closed unless a build turns it on: All-in-one isn't on sale until its owner opens it, and the predeploy check
  // refuses the switch until then (ALL_IN_ONE_SALES_OPEN). Closed, the build leaves allInOneOpen() and its copy out.
  "all-in-one":
    process.env.NEXT_PUBLIC_ALL_IN_ONE_CHECKOUT === "on"
      ? allInOneOpen()
      : { slug: "all-in-one", enabled: false, origin: PORTAL_ORIGIN, name: ALL_IN_ONE_NAME },
};

/** With its backend's settings: only then is the product's backend ever called. */
export function isProductConfigured(product: OpenProduct): boolean {
  const { apiKey, projectId, appId } = product.firebase;
  return Boolean(apiKey && projectId && appId && (product.recaptchaSiteKey || product.emulators));
}

/** The product's checkout pages on this site, in each language. */
export function checkoutPath(product: CheckoutProduct, lang: Lang, page: "" | "success" | "fail" = ""): string {
  return `${lang === "ko" ? "/ko" : ""}/checkout/${product.slug}/${page ? `${page}/` : ""}`;
}

/**
 * A page of the product's own site in the checkout's language (a closed product's: its home page only). A page given
 * from the site's root (it starts with "/") exists once for both languages, and is linked as it is.
 */
export function productUrl(product: CheckoutProduct, lang: Lang, page: ProductPage): string {
  return pageUrl(product.origin, product.enabled ? (product.pages[page] ?? "") : (product.home ?? ""), lang);
}

/** A page by its path below the language's root (or from the site's root when it starts with "/"), or on the portal. */
function pageUrl(origin: string, ref: string | ExternalPage, lang: Lang): string {
  const prefix = lang === "ko" ? "/ko" : "";
  if (typeof ref !== "string") return ref.path ? `${ref.origin}${prefix}/${ref.path}` : `${ref.origin}${prefix || "/"}`;
  if (ref.startsWith("/")) return `${origin}${ref}`;
  return `${origin}${prefix}/${ref}`;
}

/** Where a customer whose checkout ended in this tab finishes a payment kept for them, signed in on the product's site. */
export function productResumeUrl(product: OpenProduct, lang: Lang, resumeId: string): string {
  return `${pageUrl(product.origin, product.resumePath, lang)}?resume=${encodeURIComponent(resumeId)}`;
}
