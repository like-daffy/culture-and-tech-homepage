/**
 * The checkout of Chord to MIDI's Remove Ads on cultureand.tech: where its backend is, where its product lives, and
 * the business facts the checkout shows.
 *
 * The payment is taken by Chord to MIDI's own Cloud Functions, orders and records, in its Firebase project
 * (chord-to-midi, region asia-northeast3): this site's project stays Hosting only. The values below are that project's
 * public web app settings (the same as chord-to-midi-web's VITE_FIREBASE_* and VITE_RECAPTCHA_ENTERPRISE_SITE_KEY),
 * set at build time in .env.production.local (README, "Chord to MIDI's checkout"); scripts/check-checkout-config.mjs
 * refuses a deployment without them. Next.js writes each `process.env.NEXT_PUBLIC_…` below into the pages as text.
 */
import type { Lang } from "./contract";

export const CHORD_TO_MIDI_FIREBASE = {
  apiKey: process.env.NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_API_KEY ?? "",
  projectId: process.env.NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_PROJECT_ID ?? "",
  appId: process.env.NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_APP_ID ?? "",
};

/** App Check's reCAPTCHA Enterprise key of that web app: its domains must list cultureand.tech. */
export const CHORD_TO_MIDI_RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_CHORD_TO_MIDI_RECAPTCHA_SITE_KEY ?? "";

/** Test builds only: Chord to MIDI's Firebase emulators (Functions on 127.0.0.1:5001). */
export const USES_EMULATORS = process.env.NEXT_PUBLIC_CHORD_TO_MIDI_EMULATORS === "1";

/** Chord to MIDI's site, the only place the checkout links back to (another origin only in test builds). */
export const CHORD_TO_MIDI_ORIGIN = process.env.NEXT_PUBLIC_CHORD_TO_MIDI_ORIGIN || "https://chord-to-midi.app";

/** Region of Chord to MIDI's Cloud Functions. */
export const FUNCTIONS_REGION = "asia-northeast3";

export function isCheckoutConfigured(): boolean {
  const { apiKey, projectId, appId } = CHORD_TO_MIDI_FIREBASE;
  return Boolean(apiKey && projectId && appId && (CHORD_TO_MIDI_RECAPTCHA_SITE_KEY || USES_EMULATORS));
}

/** The checkout's own pages on this site, in each language. */
export function checkoutPath(lang: Lang, page: "" | "success" | "fail" = ""): string {
  return `${lang === "ko" ? "/ko" : ""}/checkout/chord-to-midi/${page ? `${page}/` : ""}`;
}

/** A page of Chord to MIDI in the checkout's language: `/`, `/account`, `/terms`, `/purchase/success?resume=…`. */
export function chordToMidiUrl(lang: Lang, path: "" | "purchase" | "account" | "terms" | "refund" | "privacy" | "business"): string {
  const prefix = lang === "ko" ? "/ko" : "";
  return `${CHORD_TO_MIDI_ORIGIN}${prefix}/${path}`;
}

/** Where a buyer whose checkout ended in this tab finishes a payment, signed in on Chord to MIDI. */
export function chordToMidiResumeUrl(lang: Lang, resumeId: string): string {
  return `${CHORD_TO_MIDI_ORIGIN}${lang === "ko" ? "/ko" : ""}/purchase/success?resume=${encodeURIComponent(resumeId)}`;
}

/**
 * The seller: Culture & Tech, which runs Chord to MIDI, as chord-to-midi-web's site.config.json (`business`) has it and
 * as registered with Toss Payments. Change both together.
 */
export const BUSINESS = {
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
