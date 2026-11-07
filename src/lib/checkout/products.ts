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
import { APP_ERROR, type Lang } from "./contract";
import { CHORD_TO_MIDI_COPY, DJ_DUPLICATE_GUARD_COPY, type ProductCopy } from "./product-copy";

export type ProductSlug = "chord-to-midi" | "dj-duplicate-guard";

/** The product's pages a checkout may link to, by their path below the language's root; nothing from an address. */
export type ProductPage = "home" | "purchase" | "account" | "help" | "terms" | "refund" | "privacy" | "business";

interface ProductIdentity {
  slug: ProductSlug;
  /** The product's own site (another origin only in test builds). */
  origin: string;
  /** What its closed pages say of it: its public name. */
  name: Record<Lang, { productName: string; backToProduct: string }>;
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
  /** Test builds only: the product's Firebase emulators (Functions on 127.0.0.1:5001). */
  emulators: boolean;
  /** Region of the product's Cloud Functions. */
  region: string;
  /** Its pages the checkout links, by path. */
  pages: Partial<Record<ProductPage, string>>;
  /** The page where its customers sign in, begin a checkout, and finish a payment kept for them (`?resume=`). */
  startPage: ProductPage;
  resumePath: string;
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
    "Digital service, no shipping: no banner ads on Chord to MIDI for the buyer's account. One-time payment.",
  alreadyOwnedCode: APP_ERROR.alreadyAdFree,
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
    // Its account service runs in Seoul (its DL-45).
    region: "asia-northeast3",
    // Its site has clean URLs, English at the root and Korean under /ko/ (its apps/web/src/pages.ts). The account page
    // comes with its accounts (its M4a and M6), and its legal pages are published, before this checkout can open.
    pages: { home: "", account: "account", help: "help", terms: "terms", refund: "refund", privacy: "privacy" },
    startPage: "account",
    resumePath: "account",
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

export const PRODUCTS: Record<ProductSlug, CheckoutProduct> = {
  "chord-to-midi": chordToMidi,
  // Closed unless a build turns it on: Expert's sales are closed (DJ Duplicate Guard's DL-52), and the predeploy check
  // refuses the switch until its owner opens them. Closed, the build leaves djDuplicateGuardOpen() and its copy out.
  "dj-duplicate-guard":
    process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT === "on"
      ? djDuplicateGuardOpen()
      : { slug: "dj-duplicate-guard", enabled: false, origin: DJ_DUPLICATE_GUARD_ORIGIN, name: DJ_DUPLICATE_GUARD_NAME },
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

/** A page of the product's own site in the checkout's language (a closed product's: its home page only). */
export function productUrl(product: CheckoutProduct, lang: Lang, page: ProductPage): string {
  const path = product.enabled ? (product.pages[page] ?? "") : "";
  return `${product.origin}${lang === "ko" ? "/ko" : ""}/${path}`;
}

/** Where a customer whose checkout ended in this tab finishes a payment kept for them, signed in on the product's site. */
export function productResumeUrl(product: OpenProduct, lang: Lang, resumeId: string): string {
  return `${product.origin}${lang === "ko" ? "/ko" : ""}/${product.resumePath}?resume=${encodeURIComponent(resumeId)}`;
}
