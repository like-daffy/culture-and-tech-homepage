/**
 * The checkout's text in English and Korean. What describes Remove Ads, its price, period, refunds and the agreements is
 * Chord to MIDI's own wording (chord-to-midi-web's src/i18n/{en,ko}.json, `purchase` and `purchaseResult`), word for
 * word: the checkout moved, the product and its terms didn't. Change both together.
 */
import type { Lang } from "./contract";

const en = {
  pageTitle: "Checkout: Chord to MIDI Remove Ads | Culture & Tech",
  checkout: "Checkout",
  productName: "Chord to MIDI — Remove Ads",
  seller:
    "Sold by Culture & Tech, which runs Chord to MIDI. You pay here, on cultureand.tech, Culture & Tech's checkout; Remove Ads applies to your Chord to MIDI account.",
  account: "For the Chord to MIDI account whose receipt and recovery email is {email}.",
  notYou: "Not your account? Back to Chord to MIDI",
  lead: "A one-time purchase that keeps ads off Chord to MIDI whenever you're signed in to your account.",
  priceTerms: "A one-time payment, not a subscription.",
  period: "Period: from the moment you buy it until the service ends, with no time limit.",
  includes: [
    "No banner ads on any page while you are signed in.",
    "Applies in every browser where you sign in to the same account.",
    "The tool stays the same, and free for everyone.",
    "Full refund on request within 7 days of payment.",
  ],
  policies: "Before paying, please read the {terms} and the {refund}.",
  termsLink: "Terms of Service",
  refundLink: "Refund Policy",
  privacyLink: "Privacy Policy",
  businessLink: "Business Information",
  currencyLegend: "Pay in",
  currencyNames: { KRW: "Korean won (KRW)", USD: "US dollars (USD)" },
  currencyNotes: { KRW: "For Korean cards and easy-pay services. VAT included.", USD: "Pay with PayPal." },
  testMode:
    "Test checkout: dollar payments go to the PayPal Sandbox, and nothing is charged. {price} is a test amount, not the price of Remove Ads.",
  testPrice: "Test amount",
  receiptEmail: "Receipt and recovery email: {email}",
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
  windowClosed: "The payment window was closed. Nothing was charged; you can pay again.",
  loading: "Loading…",
  opening: "Opening the checkout…",
  notConfigured: "The checkout isn't available right now.",
  noCheckout: "Start your purchase on Chord to MIDI: sign in there, then continue to the checkout.",
  ended: "This checkout has ended, or was opened in another tab. Start again from Chord to MIDI.",
  already: "You already have Remove Ads. Thank you!",
  inProgress: "Another payment of this account is still being confirmed. Wait a few minutes, then try again.",
  accountDeleted: "This account is being deleted, so it cannot buy Remove Ads.",
  emailNotConfirmed: "Confirm the email of your Chord to MIDI account before paying.",
  unavailable: "Purchases are not open yet.",
  accountUnavailable: "This Chord to MIDI account is not available.",
  openFailed: "The checkout could not open: {message}",
  backToChordToMidi: "Back to Chord to MIDI",
  backToPurchase: "Back to Chord to MIDI",
  seeAccount: "See your account",
  // The success and fail pages.
  confirming: "Confirming your payment…",
  successTitle: "Thank you! Your purchase is complete.",
  successBody: "Remove Ads is now on your account and applies wherever you sign in to it.",
  receiptSent: "Toss Payments sends the receipt for this order to {email}.",
  details: "Order {orderId} · {method} · {date}",
  receipt: "View the receipt",
  confirmFailed: "We could not confirm the payment: {message}",
  contactWithOrder: "If you were charged, contact us with order number {orderId}.",
  missing: "This page needs the payment details that Toss Payments sends.",
  alreadyOwned: "This account already has Remove Ads, so this payment was not made. Nothing was charged.",
  inProgressResult: "Another payment of this account is still being confirmed. Wait a few minutes, then press Try again.",
  accountDeletedResult:
    "The account was deleted while the payment was being confirmed, so Remove Ads could not be added to it.",
  keeping: "Keeping your payment for your account…",
  keepFailed: "We could not keep the payment for your account: {message}",
  finishOnChordToMidi:
    "This tab no longer holds the checkout. To finish the payment, sign in on Chord to MIDI to the account you paid with.",
  finishButton: "Finish on Chord to MIDI",
  failTitle: "The payment did not go through",
  canceled: "You cancelled the payment. Nothing was charged.",
  aborted: "The payment was not processed, so nothing was charged.",
  rejected: "The payment was declined.",
  notCompleted: "The payment was not completed.",
  reported: "The reason Toss Payments gave:",
  orderNumber: "Order {orderId}",
  // The footer: the seller's details, as Chord to MIDI's pages show them.
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
  pageTitle: "결제: Chord to MIDI 광고 제거 | 컬처앤테크",
  checkout: "결제",
  productName: "Chord to MIDI — 광고 제거",
  seller:
    "Chord to MIDI를 운영하는 컬처앤테크가 판매합니다. 결제는 이곳, 컬처앤테크의 결제 페이지(cultureand.tech)에서 진행되며, 광고 제거는 Chord to MIDI 계정에 적용됩니다.",
  account: "영수증 및 계정 복구 이메일이 {email}인 Chord to MIDI 계정에 적용됩니다.",
  notYou: "내 계정이 아닌가요? Chord to MIDI로 돌아가기",
  lead: "한 번 결제하면 구매한 계정으로 로그인해 있는 동안 Chord to MIDI에 광고가 표시되지 않습니다.",
  priceTerms: "구독이 아닌 1회 결제입니다.",
  period: "이용 기간: 구매한 때부터 서비스가 종료될 때까지, 기간 제한 없이 이용할 수 있습니다.",
  includes: [
    "로그인한 동안 모든 페이지에 배너 광고가 나오지 않습니다.",
    "같은 계정으로 로그인한 모든 브라우저에 적용됩니다.",
    "도구는 지금과 같고, 누구에게나 무료입니다.",
    "결제 후 7일 이내에 요청하면 전액 환불됩니다.",
  ],
  policies: "결제하기 전에 {terms}과 {refund}을 확인해 주세요.",
  termsLink: "이용약관",
  refundLink: "환불정책",
  privacyLink: "개인정보처리방침",
  businessLink: "사업자 정보",
  currencyLegend: "결제 통화",
  currencyNames: { KRW: "원화 (KRW)", USD: "미국 달러 (USD)" },
  currencyNotes: { KRW: "국내 카드·간편결제로 결제, 부가세 포함", USD: "PayPal로 결제" },
  testMode:
    "테스트 결제: 달러 결제는 PayPal 샌드박스로 처리되며 실제로 청구되지 않습니다. {price}는 테스트 금액이며 광고 제거의 가격이 아닙니다.",
  testPrice: "테스트 금액",
  receiptEmail: "영수증 및 계정 복구 이메일: {email}",
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
  windowClosed: "결제창을 닫았습니다. 청구된 금액은 없으며 다시 결제할 수 있습니다.",
  loading: "불러오는 중…",
  opening: "결제 페이지를 여는 중…",
  notConfigured: "지금은 결제 페이지를 이용할 수 없습니다.",
  noCheckout: "Chord to MIDI에서 로그인한 뒤 결제 페이지로 이동해 주세요.",
  ended: "이 결제 페이지는 끝났거나 다른 탭에서 열렸습니다. Chord to MIDI에서 다시 시작해 주세요.",
  already: "이미 광고 제거를 구매하셨습니다. 감사합니다!",
  inProgress: "이 계정의 다른 결제를 아직 확인하고 있습니다. 몇 분 뒤에 다시 시도해 주세요.",
  accountDeleted: "삭제 중인 계정이라 광고 제거를 구매할 수 없습니다.",
  emailNotConfirmed: "결제하기 전에 Chord to MIDI 계정의 이메일을 확인해 주세요.",
  unavailable: "아직 결제를 받지 않습니다.",
  accountUnavailable: "이 Chord to MIDI 계정은 사용할 수 없습니다.",
  openFailed: "결제 페이지를 열지 못했습니다: {message}",
  backToChordToMidi: "Chord to MIDI로 돌아가기",
  backToPurchase: "Chord to MIDI로 돌아가기",
  seeAccount: "계정 보기",
  confirming: "결제를 확인하는 중…",
  successTitle: "감사합니다! 구매가 완료되었습니다.",
  successBody: "광고 제거가 계정에 적용되었으며, 이 계정으로 로그인한 곳 어디에서나 유지됩니다.",
  receiptSent: "토스페이먼츠가 이 주문의 영수증을 {email}(으)로 보냅니다.",
  details: "주문 {orderId} · {method} · {date}",
  receipt: "영수증 보기",
  confirmFailed: "결제를 확인하지 못했습니다: {message}",
  contactWithOrder: "결제가 되었다면 주문번호 {orderId}와 함께 문의해 주세요.",
  missing: "Toss Payments가 보내는 결제 정보가 없습니다.",
  alreadyOwned: "이 계정에는 이미 광고 제거가 적용되어 있어 이번 결제는 진행하지 않았습니다. 청구된 금액은 없습니다.",
  inProgressResult: "이 계정의 다른 결제를 아직 확인하고 있습니다. 몇 분 뒤에 '다시 시도'를 눌러 주세요.",
  accountDeletedResult: "결제를 확인하는 동안 계정이 삭제되어 광고 제거를 적용하지 못했습니다.",
  keeping: "계정을 위해 결제 정보를 보관하는 중…",
  keepFailed: "계정을 위해 결제 정보를 보관하지 못했습니다: {message}",
  finishOnChordToMidi:
    "이 탭에는 결제 정보가 남아 있지 않습니다. Chord to MIDI에서 결제한 계정으로 로그인하면 결제가 마무리됩니다.",
  finishButton: "Chord to MIDI에서 마무리하기",
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
