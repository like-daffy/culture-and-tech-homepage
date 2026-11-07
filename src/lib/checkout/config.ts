/**
 * The seller every product's checkout names: Culture & Tech, which runs the products, as chord-to-midi-web's
 * site.config.json (`business`) and dj-duplicate-guard's site.config.json have it, and as registered with Toss
 * Payments. Change them together. The products themselves are in products.ts.
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
