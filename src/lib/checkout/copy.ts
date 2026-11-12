/**
 * The checkout's own text in English and Korean, the same for every product (what each product says about itself is
 * in product-copy.ts). The agreement, payment and result wording is Chord to MIDI's, word for word
 * (chord-to-midi-web's src/i18n/{en,ko}.json): the checkout moved, its words didn't. Change both together.
 */
import type { Lang } from "./contract";

const en = {
  checkout: "Checkout",
  policies: "Before paying, please read the {terms} and the {refund}.",
  termsLink: "Terms of Service",
  refundLink: "Refund Policy",
  privacyLink: "Privacy Policy",
  businessLink: "Business Information",
  helpLink: "Help",
  currencyLegend: "Pay in",
  currencyNames: { KRW: "Korean won (KRW)", USD: "US dollars (USD)" },
  testPrice: "Test amount",
  receiptEmail: "Receipt and recovery email: {email}",
  reviewReceiptEmail: "This is Test payment mode. In the live environment the customer receives a receipt email.",
  reviewReceipt: "This is the receipt of a test payment.",
  agreeTerms: "I agree to the {terms} and the {refund}.",
  agreeAge: "I am 14 years old or older.",
  countryLabel: "Country or region you are in",
  countryChoose: "Choose…",
  countryNote:
    "PayPal asks for it to process the payment and to check it for fraud. It goes to Toss Payments and PayPal; we don't keep it.",
  continue: "Continue to payment",
  preparing: "Preparing the payment…",
  pay: "Pay {price}",
  agreeToss: "Tick the required agreements above to pay.",
  failed: "The payment could not start: {message}",
  retry: "Try again",
  priceChanged: "The price on this page is out of date. Reload the page and check the price before paying.",
  termChanged: "The term on this page is out of date. Reload the page and check it before paying.",
  offerChanged:
    "The offer or the terms changed since this page was opened. Reload it and review them before paying. Nothing was charged.",
  windowClosed: "The payment window was closed. Nothing was charged; you can pay again.",
  loading: "Loading…",
  opening: "Opening the checkout…",
  notConfigured: "The checkout isn't available right now.",
  // A product whose checkout this build keeps closed.
  closedTitle: "Checkout | Culture & Tech",
  closed: "This checkout isn't open. Nothing can be bought here, and nothing is charged.",
  inProgress: "Another payment of this account is still being confirmed. Wait a few minutes, then try again.",
  unavailable: "Purchases are not open yet.",
  openFailed: "The checkout could not open: {message}",
  seeAccount: "See your account",
  // The success and fail pages.
  confirming: "Confirming your payment…",
  successTitle: "Thank you! Your purchase is complete.",
  receiptSent: "Toss Payments sends the receipt for this order to {email}.",
  details: "Order {orderId} · {method} · {date}",
  receipt: "View the receipt",
  confirmFailed: "We could not confirm the payment: {message}",
  contactWithOrder: "If you were charged, contact us with order number {orderId}.",
  missing: "This page needs the payment details that Toss Payments sends.",
  inProgressResult: "Another payment of this account is still being confirmed. Wait a few minutes, then press Try again.",
  keeping: "Keeping your payment for your account…",
  chordLost: "The checkout ended before the payment was confirmed. A test payment charges nothing. Start again from Chord to MIDI's purchase page.",
  chordStartAgain: "Start again on Chord to MIDI",
  keepFailed: "We could not keep the payment for your account: {message}",
  failTitle: "The payment did not go through",
  canceled: "You cancelled the payment. Nothing was charged.",
  aborted: "The payment was not processed, so nothing was charged.",
  rejected: "The payment was declined.",
  notCompleted: "The payment was not completed.",
  reported: "The reason Toss Payments gave:",
  orderNumber: "Order {orderId}",
  // The footer: the seller's details.
  footer: {
    seller: "Seller",
    representative: "Representative",
    registrationNumber: "Business registration number",
    mailOrderNumber: "Mail-order business report number",
    address: "Address",
    phone: "Phone",
    email: "Email",
    hostingProvider: "Hosting provider",
    payments: "Payments are processed by Toss Payments.",
  },
};

export type CheckoutCopy = typeof en;

const ko: CheckoutCopy = {
  checkout: "결제",
  policies: "결제하기 전에 {terms}과 {refund}을 확인해 주세요.",
  termsLink: "이용약관",
  refundLink: "환불정책",
  privacyLink: "개인정보처리방침",
  businessLink: "사업자 정보",
  helpLink: "도움말",
  currencyLegend: "결제 통화",
  currencyNames: { KRW: "원화 (KRW)", USD: "미국 달러 (USD)" },
  testPrice: "테스트 금액",
  receiptEmail: "영수증 및 계정 복구 이메일: {email}",
  reviewReceiptEmail: "테스트 결제 모드입니다. 실제 운영 환경에서는 고객에게 영수증 이메일이 발송됩니다.",
  reviewReceipt: "테스트 결제입니다.",
  agreeTerms: "{terms}과 {refund}에 동의합니다.",
  agreeAge: "만 14세 이상입니다.",
  countryLabel: "현재 있는 국가 또는 지역",
  countryChoose: "선택…",
  countryNote: "PayPal이 결제 처리와 부정 거래 확인에 사용합니다. 토스페이먼츠와 PayPal에 전달되며, 저희는 보관하지 않습니다.",
  continue: "결제 계속하기",
  preparing: "결제를 준비하는 중…",
  pay: "{price} 결제하기",
  agreeToss: "위의 필수 약관에 동의해야 결제할 수 있습니다.",
  failed: "결제를 시작하지 못했습니다: {message}",
  retry: "다시 시도",
  priceChanged: "이 페이지의 가격이 최신이 아닙니다. 페이지를 새로 고쳐 가격을 확인한 뒤 결제해 주세요.",
  termChanged: "이 페이지의 이용 기간이 최신이 아닙니다. 페이지를 새로 고쳐 확인한 뒤 결제해 주세요.",
  offerChanged:
    "이 페이지를 연 뒤 상품이나 약관이 바뀌었습니다. 페이지를 새로 고쳐 내용을 다시 확인한 뒤 결제해 주세요. 청구된 금액은 없습니다.",
  windowClosed: "결제창을 닫았습니다. 청구된 금액은 없으며 다시 결제할 수 있습니다.",
  loading: "불러오는 중…",
  opening: "결제 페이지를 여는 중…",
  notConfigured: "지금은 결제 페이지를 이용할 수 없습니다.",
  closedTitle: "결제 | 컬처앤테크",
  closed: "이 결제 페이지는 열려 있지 않습니다. 여기서는 아무것도 구매되거나 청구되지 않습니다.",
  inProgress: "이 계정의 다른 결제를 아직 확인하고 있습니다. 몇 분 뒤에 다시 시도해 주세요.",
  unavailable: "아직 결제를 받지 않습니다.",
  openFailed: "결제 페이지를 열지 못했습니다: {message}",
  seeAccount: "계정 보기",
  confirming: "결제를 확인하는 중…",
  successTitle: "감사합니다! 구매가 완료되었습니다.",
  receiptSent: "토스페이먼츠가 이 주문의 영수증을 {email}(으)로 보냅니다.",
  details: "주문 {orderId} · {method} · {date}",
  receipt: "영수증 보기",
  confirmFailed: "결제를 확인하지 못했습니다: {message}",
  contactWithOrder: "결제가 되었다면 주문번호 {orderId}와 함께 문의해 주세요.",
  missing: "Toss Payments가 보내는 결제 정보가 없습니다.",
  inProgressResult: "이 계정의 다른 결제를 아직 확인하고 있습니다. 몇 분 뒤에 '다시 시도'를 눌러 주세요.",
  keeping: "계정을 위해 결제 정보를 보관하는 중…",
  chordLost: "결제가 확인되기 전에 결제 페이지가 종료되었습니다. 테스트 결제는 실제로 청구되지 않습니다. Chord to MIDI 구매 페이지에서 다시 시작해 주세요.",
  chordStartAgain: "Chord to MIDI에서 다시 시작",
  keepFailed: "계정을 위해 결제 정보를 보관하지 못했습니다: {message}",
  failTitle: "결제가 완료되지 않았습니다",
  canceled: "결제를 취소했습니다. 청구된 금액은 없습니다.",
  aborted: "결제가 처리되지 않아 청구된 금액은 없습니다.",
  rejected: "결제가 거절되었습니다.",
  notCompleted: "결제가 완료되지 않았습니다.",
  reported: "토스페이먼츠가 알려 준 사유:",
  orderNumber: "주문 {orderId}",
  footer: {
    seller: "상호",
    representative: "대표자",
    registrationNumber: "사업자등록번호",
    mailOrderNumber: "통신판매업 신고번호",
    address: "주소",
    phone: "전화",
    email: "이메일",
    hostingProvider: "호스팅 제공자",
    payments: "결제는 토스페이먼츠가 처리합니다.",
  },
};

export const CHECKOUT_COPY: Record<Lang, CheckoutCopy> = { en, ko };

/** `text` with each `{name}` replaced. */
export function fill(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => values[name] ?? whole);
}

/** "₩6,600" and "$5" (or "$4.99") on English pages; "₩6,600" and "US$5" on Korean ones (as Chord to MIDI shows them). */
export function formatPrice(amount: number, currency: "KRW" | "USD", lang: Lang): string {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat(lang === "ko" ? "ko-KR" : "en-US", {
    style: "currency",
    currency,
    ...(whole ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
  }).format(amount);
}

export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", { dateStyle: "medium" }).format(date);
}

/** An instant with its date, time and time zone, e.g. "Nov 7, 2027, 3:30:00 PM GMT+9" (a pass's start and end). */
export function formatInstant(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "long",
  }).format(date);
}
