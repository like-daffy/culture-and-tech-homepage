/**
 * The text of Clean Space's account, sign-in callback and activation pages.
 *
 * COPY is English only for now. The Korean pages (/ko/…) show it, marked `lang="en"` (CONTENT_LANG), until the owner
 * reviews a Korean translation: no Korean is written there unless the site's published copy already has that meaning
 * (docs/clean-space-direct-sale.md lists those strings).
 *
 * PURCHASE_COPY, the account page's purchase part (the 364 days Unlock and its access period, the handoff to the
 * central checkout, the purchases with their refund requests, and the finish of a payment the checkout kept for its
 * buyer), is written in both languages and shown in the page's language (PURCHASE_LANG). Its Korean awaits the
 * owner's review (docs/clean-space-ko-review.md). Its sentences about the access period, renewal and refund are the
 * checkout's own words for Clean Space (src/lib/checkout/product-copy.ts, CLEAN_SPACE_COPY; a test keeps them equal),
 * and the seller block and the policy links use the checkout's reviewed labels (src/lib/checkout/copy.ts).
 *
 * The terms are the direct sale's (mac-get-space docs/13): "364 days Unlock" / "364일 잠금 해제", "access period" /
 * "이용 기간", "basic features" / "기본 기능", and "contact email" / "연락용 이메일", which receives Toss Payments'
 * receipts, support and notices and is never a way to sign in or recover the account.
 */
import type { PageLang, Provider, PurchaseStatus } from "./contract.generated";
import type { ProviderSignInFailure } from "./oauth";
import type { PurchaseRefusal, ResumeRefusal } from "./checkout-handoff";

/** The language the main text of a page is written in: English on both until Korean is reviewed. */
export const CONTENT_LANG: Record<PageLang, "en" | "ko"> = { en: "en", ko: "en" };

/** The language of the account page's purchase part: the page's own (its Korean pending the owner's review). */
export const PURCHASE_LANG: Record<PageLang, "en" | "ko"> = { en: "en", ko: "ko" };

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export const EN = {
  brand: "Culture & Tech",
  product: "Clean Space",
  languageLink: "한국어",
  loading: "Loading…",
  tryAgain: "Try again",
  notConfigured: "Clean Space accounts and purchases are not available on this site yet.",
  accountChanged: "You signed in to another account while this was in progress, so its answer was not used. Try again.",
  signedInAs: (label: string) => `Signed in as ${label}`,
  thisAccount: "this account",
  signOutHere: "Sign out of this browser",
  support: "Support",

  // Sign-in
  signInTitle: "Sign in",
  signInIntro: "Sign in with Google, Kakao or Naver. A purchase belongs to the account you sign in with.",
  continueWith: (provider: string) => `Continue with ${provider}`,
  signInBusy: "Signing in…",
  signInFailures: {
    cancelled: "Signing in was cancelled.",
    missing: "This sign-in did not start in this tab, or it was already finished. Start signing in again.",
    state: "This sign-in did not start in this tab, or it was already finished. Start signing in again.",
    expired: "Signing in took too long. Start again.",
    storage: "This browser blocks the storage that signing in needs. Allow site data for cultureand.tech, or use another browser.",
    "account-mismatch": "A different account is signed in now than the one that started this. Sign in to that account and try again.",
    "signed-out": "Sign in first.",
    unavailable: "This sign-in method is not available yet.",
    refused: "Signing in did not work. Start again.",
  } satisfies Record<ProviderSignInFailure, string>,
  popupFailed: "The Google window could not open. Allow pop-ups for cultureand.tech and try again.",
  callbackTitle: "Signing in",
  callbackWorking: "Finishing sign-in…",

  // Contact verification (the contact email: Toss Payments' receipts, support and notices; never a way to sign in)
  contactHeading: "Contact email",
  contactIntro:
    "Confirm an email address before you pay: Toss Payments sends your receipts there, and we use it for support and important notices. It only receives email: it is not a way to sign in.",
  contactEmailLabel: "Email address",
  contactSend: "Send code",
  contactCodeLabel: "6-digit code",
  contactCodeSent: (email: string) => `We sent a code to ${email}. Enter it within 15 minutes.`,
  contactConfirm: "Confirm",
  contactResend: "Use another address",
  contactConfirmed: (email: string) => `Contact email: ${email}`,
  contactInvalidEmail: "Enter a valid email address.",
  contactInvalidCode: "Enter the 6-digit code from the email.",

  // Activation
  activateTitle: "Sign in to Clean Space on your Mac",
  activateIntro: "Clean Space on a Mac asked to sign in with your account.",
  codeLabel: "Confirmation code",
  compareWarning:
    "Approve only if Clean Space on your Mac shows exactly this code right now and you started signing in there. Never approve a code someone sent you.",
  appVersion: (version: string) => `Clean Space ${version}`,
  expiresIn: (countdown: string) => `This request expires in ${countdown}.`,
  approve: "Approve",
  deny: "Deny",
  approvedText: "Approved. Return to Clean Space on your Mac: it finishes signing in by itself.",
  deniedText: "Denied. Clean Space on that Mac was not signed in.",
  expiredText: "This request expired. Start signing in again in Clean Space on your Mac.",
  consumedText: "This request was already used. If you didn't just sign in on your Mac, sign out of Clean Space on all Macs from your account page.",
  notFoundText: "This request is unknown. Start signing in again in Clean Space on your Mac.",
  noRequestText: "Open this page from Clean Space on your Mac: choose Sign In there.",

  // Account
  accountTitle: "Your Clean Space account",
  methodsHeading: "Sign-in methods",
  linkedLabel: "Linked",
  linkMethod: (provider: string) => `Link ${provider}`,
  removeMethod: "Remove",
  lastMethod: "Add another sign-in method before removing this one.",
  recentSignInNeeded: "For your security, sign in again before changing sign-in methods or deleting the account.",
  signInAgain: "Sign in again",
  contactNone: "No contact email confirmed yet.",
  contactChange: "Change contact email",
  appsHeading: "Clean Space on your Macs",
  appsNone: "No Mac is signed in with this account.",
  appRow: (version: string, approved: string) => `Clean Space ${version}, signed in on ${approved}`,
  endSessions: "Sign out of Clean Space on all Macs",
  endSessionsDone: (count: number) => `${plural(count, "app session", "app sessions")} ended. Each Mac returns to the basic features at its next check.`,
  deleteHeading: "Delete account",
  deleteText:
    "Deleting your account is not a refund. Any remaining access period ends, Clean Space on your Macs returns to the basic features, and payment records are kept as the law requires. To ask for a refund, use Request a refund first.",
  deleteConfirm: "I understand that deleting my account is not a refund.",
  deleteButton: "Delete account",
  deleteRequested: (date: string) => `Deletion was requested on ${date}. It finishes by itself.`,
  providerNames: { google: "Google", kakao: "Kakao", naver: "Naver" } satisfies Record<Provider, string>,
};

export type Copy = typeof EN;

/**
 * Korean pages: the English text above, except what the site has already published in Korean with the same meaning
 * (the brand "컬처앤테크" of the Korean navigation, the app pages' "문의" for Support) and the language link's own name.
 * Everything else waits for the owner's review.
 */
export const KO: Copy = {
  ...EN,
  brand: "컬처앤테크",
  languageLink: "English",
  support: "문의",
};

export const COPY: Record<PageLang, Copy> = { en: EN, ko: KO };

/** The account page's purchase part, in both languages (PURCHASE_LANG). `{name}` parts are filled in by the page. */
export interface PurchaseCopy {
  heading: string;
  none: string;
  /** `{start}`, `{end}`: the access period's exact start and end, with their time zone. */
  active: string;
  /** `{end}`, as `active`. */
  expired: string;
  revoked: string;
  /** What it is, in one line. */
  what: string;
  /** `{price}`: the won price from the offer. */
  priceKRW: string;
  /** `{price}`: the dollar price from the offer (English pages only: Korean pages sell in won). */
  priceUSD: string;
  period: string;
  renewal: string;
  refund: string;
  buy: string;
  buyAgain: string;
  opening: string;
  checkoutNote: string;
  notOnSale: string;
  salesPaused: string;
  offerFailed: string;
  contactFirst: string;
  deleting: string;
  testPayments: string;
  refusals: Record<PurchaseRefusal, string>;
  /** `{message}`: the service's own message, for a refusal without one of the codes above. */
  failed: string;
  badAddress: string;
  purchasesHeading: string;
  purchasesNone: string;
  purchaseStatus: Record<PurchaseStatus, string>;
  /** `{start}`, `{end}`, as `active`. */
  purchasePeriod: string;
  /** `{method}`: Toss's label of the payment method. */
  purchaseMethod: string;
  receiptLink: string;
  refundRequest: string;
  /** `{refund}`: a link to the Refund Policy. */
  refundNote: string;
  /** The refund request email, as Chord to MIDI's account page writes it: `{orderId}`, and `{email}` the contact email. */
  refundSubject: string;
  refundBody: string;
  resumeSignIn: string;
  resumeConfirming: string;
  paidHeading: string;
  /** `{start}`, `{end}`, as `active`. */
  paidBody: string;
  receipt: string;
  resumeRefusals: Record<ResumeRefusal, string>;
  /** `{message}`: the service's own message. */
  resumeFailed: string;
  /** `{email}`: the support address. */
  ifCharged: string;
  badResume: string;
  tryAgain: string;
  accountChanged: string;
}

export const PURCHASE_COPY: Record<PageLang, PurchaseCopy> = {
  en: {
    heading: "364 days Unlock",
    none: "This account has no 364 days Unlock.",
    active: "Access period: from {start} until {end}.",
    expired: "The access period ended on {end}.",
    revoked: "The access period ended early: refunded or cancelled.",
    what: "Every feature of the Clean Space Mac app's website edition, on every Mac signed in to this account. The basic features stay after the access period ends.",
    priceKRW: "{price} (VAT included)",
    priceUSD: "{price} with PayPal",
    period: "Access period: 364 days from the moment the payment is approved (shorter than 12 months), ending at the same time of day.",
    renewal: "It doesn't renew, and nothing is charged again.",
    refund: "Full refund on request within 7 days of payment.",
    buy: "Buy the 364 days Unlock",
    buyAgain: "Buy another 364 days",
    opening: "Opening the checkout…",
    checkoutNote: "You pay on Culture & Tech's checkout on this site (cultureand.tech), through Toss Payments.",
    notOnSale: "The 364 days Unlock isn't on sale yet.",
    salesPaused: "The 364 days Unlock isn't on sale now.",
    offerFailed: "The offer could not be loaded.",
    contactFirst: "Confirm a contact email below before buying.",
    deleting: "This account is being deleted, so it can't buy the 364 days Unlock.",
    testPayments:
      "Test payment: payments run in Toss Payments' test environment for now, and nothing is actually charged. An access period received through a test payment ends when sales start for real.",
    refusals: {
      alreadyOwned: "This account has the 364 days Unlock until its access period ends. Another can be bought after that.",
      salesClosed: "The 364 days Unlock isn't on sale now. Nothing was charged.",
      currencyUnavailable: "Purchases are not open yet.",
      accountDeleted: "This account is being deleted, so it can't buy the 364 days Unlock.",
      accountUnavailable: "This Clean Space account is not available.",
      contactRequired: "Confirm the contact email of this account before paying.",
      inProgress: "Another checkout of this account is still open or being confirmed. Finish it in its tab, or wait a few minutes and try again.",
      tooMany: "Too many checkouts were started for this account. Wait a few minutes, then try again.",
      signInAgain: "Your sign-in has ended. Sign in again, then try again.",
    },
    failed: "The checkout could not open: {message}",
    badAddress: "The checkout could not be opened. Try again, or contact support if it keeps happening.",
    purchasesHeading: "Purchases",
    purchasesNone: "No purchases yet.",
    purchaseStatus: {
      paid: "Paid",
      partially_refunded: "Partly refunded",
      refunded: "Refunded",
      pending: "Being recorded",
      failed: "Failed",
      canceled: "Cancelled",
    },
    purchasePeriod: "Access period: from {start} until {end}.",
    purchaseMethod: "Paid with {method}",
    receiptLink: "Toss Payments receipt",
    refundRequest: "Request a refund",
    refundNote: "Payments are refunded in full on request within 7 days; see the {refund}.",
    refundSubject: "Refund request: {orderId}",
    refundBody: "Order: {orderId}\nContact email: {email}\nReason (optional): ",
    resumeSignIn: "Sign in with the account you paid with to finish your payment.",
    resumeConfirming: "Finishing your payment…",
    paidHeading: "Thank you! Your purchase is complete.",
    paidBody:
      "The 364 days Unlock is on your account from {start} until {end}. Open Clean Space on your Mac and sign in with this account to use it.",
    receipt: "View the receipt",
    resumeRefusals: {
      pending:
        "Toss Payments approved the payment, and recording it isn't finished yet. Don't pay again: it shows on this page as soon as it is recorded. If it hasn't within an hour, contact us.",
      wrongAccount: "This payment belongs to another account. Sign out, then sign in with the account you paid with.",
      expired: "Finishing this payment took too long. If you were charged, the payment is recorded by itself and shows on this page.",
      alreadyOwned:
        "This account already has an access period of the 364 days Unlock that hasn't ended, so this payment was not made. Nothing was charged.",
      accountDeleted: "The account was deleted while the payment was being confirmed, so the 364 days Unlock could not be added to it.",
      inProgress: "Another payment of this account is still being confirmed. Wait a few minutes, then press Try again.",
    },
    resumeFailed: "We could not confirm the payment: {message}",
    ifCharged: "If you were charged and this doesn't resolve, contact {email}.",
    badResume: "This link to finish a payment isn't valid. If you were charged, the payment shows on this page once it is recorded.",
    tryAgain: "Try again",
    accountChanged: "You signed in to another account while this was in progress, so its answer was not used. Try again.",
  },
  ko: {
    heading: "364일 잠금 해제",
    none: "이 계정에는 364일 잠금 해제가 없습니다.",
    active: "이용 기간: {start}부터 {end}까지",
    expired: "이용 기간이 {end}에 끝났습니다.",
    revoked: "환불 또는 취소로 이용 기간이 일찍 끝났습니다.",
    what: "이 계정으로 로그인한 모든 Mac에서 Clean Space Mac 앱(웹사이트 버전)의 모든 기능을 쓸 수 있습니다. 이용 기간이 끝나도 기본 기능은 그대로 쓸 수 있습니다.",
    priceKRW: "{price} (부가세 포함)",
    priceUSD: "PayPal로 {price}",
    period: "이용 기간: 결제가 승인된 때부터 364일(12개월보다 짧음)이며, 같은 시각에 끝납니다.",
    renewal: "자동으로 갱신되거나 다시 결제되지 않습니다.",
    refund: "결제 후 7일 이내에 요청하면 전액 환불됩니다.",
    buy: "364일 잠금 해제 구매하기",
    buyAgain: "364일 다시 구매하기",
    opening: "결제 페이지를 여는 중…",
    checkoutNote: "결제는 이 사이트(cultureand.tech)의 컬처앤테크 결제 페이지에서 토스페이먼츠로 진행됩니다.",
    notOnSale: "364일 잠금 해제는 아직 판매하지 않습니다.",
    salesPaused: "지금은 364일 잠금 해제를 판매하지 않습니다.",
    offerFailed: "상품 정보를 불러오지 못했습니다.",
    contactFirst: "구매하기 전에 아래에서 연락용 이메일을 확인해 주세요.",
    deleting: "삭제 중인 계정이라 364일 잠금 해제를 구매할 수 없습니다.",
    testPayments:
      "테스트 결제: 지금은 토스페이먼츠의 테스트 환경에서 결제가 진행되어 실제로 청구되지 않습니다. 테스트 결제로 받은 이용 기간은 정식 판매가 시작되면 끝납니다.",
    refusals: {
      alreadyOwned: "이 계정에는 이용 기간이 남은 364일 잠금 해제가 있습니다. 다음 이용 기간은 지금 기간이 끝난 뒤에 구매할 수 있습니다.",
      salesClosed: "지금은 364일 잠금 해제를 판매하지 않습니다. 청구된 금액은 없습니다.",
      currencyUnavailable: "아직 결제를 받지 않습니다.",
      accountDeleted: "삭제 중인 계정이라 364일 잠금 해제를 구매할 수 없습니다.",
      accountUnavailable: "이 Clean Space 계정은 사용할 수 없습니다.",
      contactRequired: "결제하기 전에 이 계정의 연락용 이메일을 확인해 주세요.",
      inProgress: "이 계정의 다른 결제가 아직 열려 있거나 확인 중입니다. 그 탭에서 마무리하거나 몇 분 뒤에 다시 시도해 주세요.",
      tooMany: "이 계정으로 시작한 결제가 너무 많습니다. 몇 분 뒤에 다시 시도해 주세요.",
      signInAgain: "로그인이 만료되었습니다. 다시 로그인한 뒤 시도해 주세요.",
    },
    failed: "결제 페이지를 열지 못했습니다: {message}",
    badAddress: "결제 페이지를 열지 못했습니다. 다시 시도해 보시고, 계속 안 되면 문의해 주세요.",
    purchasesHeading: "구매 내역",
    purchasesNone: "아직 구매 내역이 없습니다.",
    purchaseStatus: {
      paid: "결제 완료",
      partially_refunded: "부분 환불됨",
      refunded: "환불됨",
      pending: "기록 중",
      failed: "실패",
      canceled: "취소됨",
    },
    purchasePeriod: "이용 기간: {start}부터 {end}까지",
    purchaseMethod: "결제 수단: {method}",
    receiptLink: "토스페이먼츠 영수증",
    refundRequest: "환불 요청",
    refundNote: "결제 후 7일 이내에 요청하면 전액 환불됩니다. {refund}을 확인해 주세요.",
    refundSubject: "환불 요청: {orderId}",
    refundBody: "주문번호: {orderId}\n연락용 이메일: {email}\n사유(선택): ",
    resumeSignIn: "결제를 마무리하려면 결제한 계정으로 로그인해 주세요.",
    resumeConfirming: "결제를 마무리하는 중…",
    paidHeading: "감사합니다! 구매가 완료되었습니다.",
    paidBody: "364일 잠금 해제가 {start}부터 {end}까지 계정에 적용됩니다. Mac에서 Clean Space를 열고 이 계정으로 로그인하면 쓸 수 있습니다.",
    receipt: "영수증 보기",
    resumeRefusals: {
      pending:
        "토스페이먼츠가 결제를 승인했고, 기록을 아직 마무리하는 중입니다. 다시 결제하지 마세요. 기록되는 대로 이 페이지에 표시되며, 한 시간이 지나도 표시되지 않으면 문의해 주세요.",
      wrongAccount: "이 결제는 다른 계정의 결제입니다. 로그아웃한 뒤 결제한 계정으로 로그인해 주세요.",
      expired: "결제를 마무리하는 데 시간이 너무 오래 걸렸습니다. 결제되었다면 자동으로 기록되어 이 페이지에 표시됩니다.",
      alreadyOwned: "이 계정에는 아직 끝나지 않은 364일 잠금 해제 이용 기간이 있어 이번 결제는 진행하지 않았습니다. 청구된 금액은 없습니다.",
      accountDeleted: "결제를 확인하는 동안 계정이 삭제되어 364일 잠금 해제를 적용하지 못했습니다.",
      inProgress: "이 계정의 다른 결제를 아직 확인하고 있습니다. 몇 분 뒤에 '다시 시도'를 눌러 주세요.",
    },
    resumeFailed: "결제를 확인하지 못했습니다: {message}",
    ifCharged: "결제가 되었는데 해결되지 않으면 {email}로 문의해 주세요.",
    badResume: "결제를 마무리하는 링크가 올바르지 않습니다. 결제되었다면 기록되는 대로 이 페이지에 표시됩니다.",
    tryAgain: "다시 시도",
    accountChanged: "진행하는 동안 다른 계정으로 로그인해서 그 결과는 쓰지 않았습니다. 다시 시도해 주세요.",
  },
};
