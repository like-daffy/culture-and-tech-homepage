/**
 * What each product's checkout says about the product, in English and Korean, in the product's own words:
 * - Chord to MIDI: chord-to-midi-web's src/i18n/{en,ko}.json (`purchase`, `purchaseResult`), word for word, except
 *   that the English text here writes "Remove ADs" (the owner, 2026-11-08).
 * - DJ Duplicate Guard: its decisions D38 and DL-50 and its terms (Articles 2(7), 9, 11 and 15-2) in
 *   dj-duplicate-guard's apps/web/content/. A build carries it only when it opens that checkout (products.ts): until
 *   its owner opens the sales (DL-52), none of it is published.
 * - Clean Space: the facts sheet of its direct sale (mac-get-space docs/13-direct-sale/facts.md, the owner's decisions
 *   of 2026-11-09), in Chord to MIDI's Toss-reviewed wording for the period, the price terms, the refund and the test
 *   payments; the Korean name "364일 잠금 해제" is the owner's. Its Korean text awaits the owner's review
 *   (docs/clean-space-ko-review.md). A build carries it only when it opens that checkout (products.ts).
 * Change them with their sources.
 */
import type { Currency, Lang } from "./contract";

export interface ProductCopy {
  pageTitle: string;
  productName: string;
  seller: string;
  account: string;
  /**
   * The label of the address the order's receipt goes to (`{email}`), for a product whose account email is something
   * else than the checkout's own wording says (copy.ts `receiptEmail`, "Receipt and recovery email").
   */
  receiptEmail?: string;
  notYou: string;
  lead: string;
  priceTerms: string;
  period: string;
  /** A product sold for a term: buying again after it, and what never restarts or extends it. */
  renewal?: string;
  /** Where the product's terms set out the period: `{terms}` links that article (`anchor`) of its terms page. */
  periodTerms?: { text: string; link: string; anchor: string };
  includes: string[];
  testMode: string;
  /**
   * For a product sold on Toss's test keys before its launch: shown while a currency's client key is a test key (and
   * it isn't the PayPal TEST checkout, which testMode covers). Products without it show nothing for that.
   */
  testKeys?: string;
  /**
   * The success page's line for a payment taken on Toss's test keys (confirm answer environment 'test'), in place of
   * the pass's dates. Falls back to testKeys; testMode (PayPal Sandbox, with {price}) is never used there.
   */
  testPassTerm?: string;
  currencyNotes: Record<Currency, string>;
  /** The product's server says its sales are closed (SALES_CLOSED). */
  salesClosed: string;
  already: string;
  accountDeleted: string;
  emailNotConfirmed: string;
  accountUnavailable: string;
  noCheckout: string;
  ended: string;
  backToProduct: string;
  successBody: string;
  /** The pass's start and end, for a product sold as a pass with a term; empty otherwise. */
  passTerm: string;
  alreadyOwned: string;
  accountDeletedResult: string;
  finishOnProduct: string;
  finishButton: string;
}

export const CHORD_TO_MIDI_COPY: Record<Lang, ProductCopy> = {
  en: {
    pageTitle: "Checkout: Chord to MIDI Remove ADs | Culture & Tech",
    productName: "Chord to MIDI — Remove ADs, 364 days",
    seller:
      "Sold by Culture & Tech, which runs Chord to MIDI. You pay here, on cultureand.tech, Culture & Tech's checkout; Remove ADs applies to your Chord to MIDI account.",
    account: "For the Chord to MIDI account whose receipt and recovery email is {email}.",
    notYou: "Not your account? Back to Chord to MIDI",
    lead: "One payment keeps ads off Chord to MIDI for 364 days whenever you're signed in to your account.",
    priceTerms: "It doesn't renew, and nothing is charged again.",
    period:
      "Period: 364 days from the moment the payment is approved (shorter than 12 months), ending at the same time of day. Your account page shows the exact start and end.",
    renewal:
      "After it ends, you can buy another 364 days yourself, at the price shown then. Signing in again, another device or a transfer by us never restarts or extends a period.",
    periodTerms: {
      text: "The period, its end and buying again are set out in {terms}.",
      link: "Article 12 of the Terms of Service",
      anchor: "article-12-supply",
    },
    includes: [
      "No banner ads on any page while you are signed in, for 364 days.",
      "Applies in every browser where you sign in to the same account.",
      "The tool stays the same, and free for everyone.",
      "Full refund on request within 7 days of payment.",
    ],
    testMode:
      "Test checkout: dollar payments go to PayPal's Sandbox on test keys, and nothing real is charged. {price} matches the planned dollar price, but dollars aren't sold for real yet.",
    // chord-to-midi-web purchaseResult.testPayments, word for word: the checkout's notice while a currency is on
    // Toss's test keys, and the success page's line for a test payment.
    testKeys: "Test payments: checkout runs in Toss Payments' test environment for now, and nothing is charged. You don't need to pay.",
    testPassTerm: "Test payments: checkout runs in Toss Payments' test environment for now, and nothing is charged. You don't need to pay.",
    currencyNotes: { KRW: "For Korean cards and easy-pay services. VAT included.", USD: "Pay with PayPal." },
    salesClosed: "Remove ADs isn't on sale now. Nothing was charged.",
    already: "This account has Remove ADs until its period ends. Another period can be bought after that.",
    accountDeleted: "This account is being deleted, so it cannot buy Remove ADs.",
    emailNotConfirmed: "Confirm the email of your Chord to MIDI account before paying.",
    accountUnavailable: "This Chord to MIDI account is not available.",
    noCheckout: "Start your purchase on Chord to MIDI: sign in there, then continue to the checkout.",
    ended: "This checkout has ended, or was opened in another tab. Start again from Chord to MIDI.",
    backToProduct: "Back to Chord to MIDI",
    successBody: "Remove ADs is on your account for 364 days and applies wherever you sign in to it.",
    passTerm: "Remove ADs — 364 days: from {start} to {end}. It doesn't renew.",
    alreadyOwned:
      "This account already has a period of Remove ADs that hasn’t ended, so this payment was not made. Nothing was charged.",
    accountDeletedResult:
      "The account was deleted while the payment was being confirmed, so Remove ADs could not be added to it.",
    finishOnProduct:
      "This tab no longer holds the checkout. To finish the payment, sign in on Chord to MIDI to the account you paid with.",
    finishButton: "Finish on Chord to MIDI",
  },
  ko: {
    pageTitle: "결제: Chord to MIDI 광고 제거 | 컬처앤테크",
    productName: "Chord to MIDI — 광고 제거, 364일",
    seller:
      "Chord to MIDI를 운영하는 컬처앤테크가 판매합니다. 결제는 이곳, 컬처앤테크의 결제 페이지(cultureand.tech)에서 진행되며, 광고 제거는 Chord to MIDI 계정에 적용됩니다.",
    account: "영수증 및 계정 복구 이메일이 {email}인 Chord to MIDI 계정에 적용됩니다.",
    notYou: "내 계정이 아닌가요? Chord to MIDI로 돌아가기",
    lead: "한 번 결제하면 364일 동안, 구매한 계정으로 로그인해 있는 동안 Chord to MIDI에 광고가 표시되지 않습니다.",
    priceTerms: "자동으로 갱신되거나 다시 결제되지 않습니다.",
    period:
      "이용 기간: 결제가 승인된 때부터 364일(12개월보다 짧음)이며, 같은 시각에 끝납니다. 정확한 시작과 만료 일시는 계정 페이지에 표시됩니다.",
    renewal:
      "이용 기간이 끝난 뒤에는 그때 표시되는 가격으로 직접 다시 구매할 수 있습니다. 다시 로그인하거나 기기를 바꾸거나 운영자가 계정을 옮겨도 이용 기간은 다시 시작되거나 늘어나지 않습니다.",
    periodTerms: {
      text: "이용 기간과 만료, 재구매는 {terms}에 정해져 있습니다.",
      link: "이용약관 제12조",
      anchor: "제12조-공급",
    },
    includes: [
      "364일 동안, 로그인한 동안 모든 페이지에 배너 광고가 나오지 않습니다.",
      "같은 계정으로 로그인한 모든 브라우저에 적용됩니다.",
      "도구는 지금과 같고, 누구에게나 무료입니다.",
      "결제 후 7일 이내에 요청하면 전액 환불됩니다.",
    ],
    testMode:
      "테스트 결제: 달러 결제는 테스트 키로 PayPal 샌드박스에서 처리되며 실제로 청구되지 않습니다. {price}는 예정된 달러 가격과 같지만, 달러 결제는 아직 실제로 판매하지 않습니다.",
    testKeys: "테스트 결제: 지금은 토스페이먼츠의 테스트 환경에서 결제가 진행되어 실제로 청구되지 않습니다. 결제하지 않으셔도 됩니다.",
    testPassTerm: "테스트 결제: 지금은 토스페이먼츠의 테스트 환경에서 결제가 진행되어 실제로 청구되지 않습니다. 결제하지 않으셔도 됩니다.",
    currencyNotes: { KRW: "국내 카드·간편결제로 결제, 부가세 포함", USD: "PayPal로 결제" },
    salesClosed: "지금은 광고 제거를 판매하지 않습니다. 청구된 금액은 없습니다.",
    already: "이 계정에는 이용 기간이 남은 광고 제거가 있습니다. 다음 이용 기간은 지금 기간이 끝난 뒤에 구매할 수 있습니다.",
    accountDeleted: "삭제 중인 계정이라 광고 제거를 구매할 수 없습니다.",
    emailNotConfirmed: "결제하기 전에 Chord to MIDI 계정의 이메일을 확인해 주세요.",
    accountUnavailable: "이 Chord to MIDI 계정은 사용할 수 없습니다.",
    noCheckout: "Chord to MIDI에서 로그인한 뒤 결제 페이지로 이동해 주세요.",
    ended: "이 결제 페이지는 끝났거나 다른 탭에서 열렸습니다. Chord to MIDI에서 다시 시작해 주세요.",
    backToProduct: "Chord to MIDI로 돌아가기",
    successBody: "광고 제거가 364일 동안 계정에 적용되며, 이 계정으로 로그인한 곳 어디에서나 유지됩니다.",
    passTerm: "광고 제거 — 364일: {start}부터 {end}까지. 자동으로 갱신되지 않습니다.",
    alreadyOwned:
      "이 계정에는 아직 끝나지 않은 광고 제거 이용 기간이 있어 이번 결제는 진행하지 않았습니다. 청구된 금액은 없습니다.",
    accountDeletedResult: "결제를 확인하는 동안 계정이 삭제되어 광고 제거를 적용하지 못했습니다.",
    finishOnProduct:
      "이 탭에는 결제 정보가 남아 있지 않습니다. Chord to MIDI에서 결제한 계정으로 로그인하면 결제가 마무리됩니다.",
    finishButton: "Chord to MIDI에서 마무리하기",
  },
};

export const DJ_DUPLICATE_GUARD_COPY: Record<Lang, ProductCopy> = {
  en: {
    pageTitle: "Checkout: DJ Duplicate Guard Expert | Culture & Tech",
    productName: "DJ Duplicate Guard — Expert, 364-day pass",
    seller:
      "Sold by Culture & Tech, which runs DJ Duplicate Guard. You pay here, on cultureand.tech, Culture & Tech's checkout; Expert applies to your DJ Duplicate Guard account.",
    account: "For the DJ Duplicate Guard account whose receipt and recovery email is {email}.",
    notYou: "Not your account? Back to DJ Duplicate Guard",
    lead: "With Expert, use saved filters in the extension when signed in to your account.",
    priceTerms: "One payment for a 364-day pass, not a subscription. It doesn't renew, and nothing is charged automatically.",
    period: "Term: 364 days (364 × 24 hours) from the payment's approval. The exact start and end show after payment.",
    includes: [
      "Saved filters in your library.",
      "The free features stay as they are, without an account.",
      "A full refund within 7 days of payment, even after use; after that, cancel at any time for a refund of the unused time, with no fee.",
    ],
    testMode: "Test checkout: payments go to Toss Payments' test environment, and nothing is charged.",
    // t1g, 2026-11-10 (DJ's updated drafts; owner's review rule), word for word.
    testKeys:
      "Test payment: checkout runs in Toss Payments' test environment for now, and nothing is charged. Any access it gives is temporary and ends when paid sales open (no date is set yet).",
    testPassTerm:
      "Test payment complete: nothing was charged and no paid pass was created. Any access it gives ends when paid sales open (no date is set yet).",
    currencyNotes: { KRW: "Pay with a Korean card. VAT included.", USD: "Pay with PayPal." },
    salesClosed: "Expert isn't on sale yet. Nothing can be bought here, and nothing is charged.",
    already: "This account already has an active Expert pass.",
    accountDeleted: "This account is being deleted, so it cannot buy Expert.",
    emailNotConfirmed: "Confirm the email of your DJ Duplicate Guard account before paying.",
    accountUnavailable: "This DJ Duplicate Guard account is not available.",
    noCheckout: "Start your purchase on the DJ Duplicate Guard page of your Culture & Tech account: sign in there, then continue to the checkout.",
    ended: "This checkout has ended, or was opened in another tab. Start again from the DJ Duplicate Guard page of your Culture & Tech account.",
    backToProduct: "Back to DJ Duplicate Guard",
    successBody: "Expert is now on your account. The pass doesn't renew.",
    passTerm: "Expert pass: from {start} to {end}",
    alreadyOwned: "This account already has an active Expert pass, so this payment was not made. Nothing was charged.",
    accountDeletedResult:
      "The account was deleted while the payment was being confirmed, so Expert could not be added to it.",
    finishOnProduct:
      "This tab no longer holds the checkout. To finish the payment, sign in on the DJ Duplicate Guard page of your Culture & Tech account with the account you paid with.",
    finishButton: "Finish on your Culture & Tech account",
  },
  ko: {
    pageTitle: "결제: DJ Duplicate Guard Expert | 컬처앤테크",
    productName: "DJ Duplicate Guard — Expert 364일 이용권",
    seller:
      "DJ Duplicate Guard를 운영하는 컬처앤테크가 판매합니다. 결제는 이곳, 컬처앤테크의 결제 페이지(cultureand.tech)에서 진행되며, Expert는 DJ Duplicate Guard 계정에 적용됩니다.",
    account: "영수증 및 계정 복구 이메일이 {email}인 DJ Duplicate Guard 계정에 적용됩니다.",
    notYou: "내 계정이 아닌가요? DJ Duplicate Guard로 돌아가기",
    lead: "Expert를 구매하면 해당 계정으로 로그인한 확장 프로그램에서 저장된 필터를 사용할 수 있습니다.",
    priceTerms: "한 번의 결제로 구매하는 364일 이용권이며, 구독이 아닙니다. 자동으로 갱신되거나 결제되지 않습니다.",
    period: "이용 기간: 결제가 승인된 때부터 364일(364×24시간). 정확한 시작·종료 일시는 결제 후 표시됩니다.",
    includes: [
      "라이브러리의 저장된 필터",
      "무료 기능은 계정 없이도 지금처럼 쓸 수 있습니다.",
      "결제 후 7일 이내에는 사용했더라도 전액 환불되며, 그 뒤에는 언제든 해지하고 남은 기간만큼 수수료 없이 환불받을 수 있습니다.",
    ],
    testMode: "테스트 결제: 토스페이먼츠의 테스트 환경으로 처리되며 실제로 청구되지 않습니다.",
    testKeys:
      "테스트 결제: 지금은 토스페이먼츠 테스트 환경에서 결제가 진행되며 아무것도 결제되지 않습니다. 이로 주어지는 이용은 임시이며, 아직 날짜가 정해지지 않은 유료 판매 개시 때 끝납니다.",
    testPassTerm:
      "테스트 결제 완료: 아무것도 결제되지 않았으며 유료 이용권이 만들어지지 않았습니다. 이로 주어지는 이용은 아직 날짜가 정해지지 않은 유료 판매 개시 때 끝납니다.",
    currencyNotes: { KRW: "국내 카드로 결제, 부가세 포함", USD: "PayPal로 결제" },
    salesClosed: "Expert는 아직 판매하지 않습니다. 여기서는 아무것도 구매되거나 청구되지 않습니다.",
    already: "이 계정에는 이미 유효한 Expert 이용권이 있습니다.",
    accountDeleted: "삭제 중인 계정이라 Expert를 구매할 수 없습니다.",
    emailNotConfirmed: "결제하기 전에 DJ Duplicate Guard 계정의 이메일을 확인해 주세요.",
    accountUnavailable: "이 DJ Duplicate Guard 계정은 사용할 수 없습니다.",
    noCheckout: "컬처앤테크 계정의 DJ Duplicate Guard 페이지에서 로그인한 뒤 결제 페이지로 이동해 주세요.",
    ended: "이 결제 페이지는 끝났거나 다른 탭에서 열렸습니다. 컬처앤테크 계정의 DJ Duplicate Guard 페이지에서 다시 시작해 주세요.",
    backToProduct: "DJ Duplicate Guard로 돌아가기",
    successBody: "Expert가 계정에 적용되었습니다. 이용권은 자동으로 갱신되지 않습니다.",
    passTerm: "Expert 이용권: {start}부터 {end}까지",
    alreadyOwned: "이 계정에는 이미 유효한 Expert 이용권이 있어 이번 결제는 진행하지 않았습니다. 청구된 금액은 없습니다.",
    accountDeletedResult: "결제를 확인하는 동안 계정이 삭제되어 Expert를 적용하지 못했습니다.",
    finishOnProduct:
      "이 탭에는 결제 정보가 남아 있지 않습니다. 컬처앤테크 계정의 DJ Duplicate Guard 페이지에서 결제한 계정으로 로그인하면 결제가 마무리됩니다.",
    finishButton: "컬처앤테크 계정에서 마무리하기",
  },
};

/** While its currencies are on Toss's test keys (before the launch, for Toss's review): what the checkout says. */
const CLEAN_SPACE_TEST_PAYMENTS = {
  en: "Test payment: payments run in Toss Payments' test environment for now, and nothing is actually charged. An access period received through a test payment ends when sales start for real.",
  ko: "테스트 결제: 지금은 토스페이먼츠의 테스트 환경에서 결제가 진행되어 실제로 청구되지 않습니다. 테스트 결제로 받은 이용 기간은 정식 판매가 시작되면 끝납니다.",
};

/**
 * Clean Space's account email is its contact email: Toss Payments' receipts, support and notices, never a way to sign
 * in or recover the account (mac-get-space docs/13). Its words: "364 days Unlock" / "364일 잠금 해제", "access period" /
 * "이용 기간", "basic features" / "기본 기능", "contact email" / "연락용 이메일".
 */
export const CLEAN_SPACE_COPY: Record<Lang, ProductCopy> = {
  en: {
    pageTitle: "Checkout: Clean Space 364 days Unlock | Culture & Tech",
    productName: "Clean Space — 364 days Unlock",
    seller:
      "Sold by Culture & Tech, which makes Clean Space. You pay here, on cultureand.tech, Culture & Tech's checkout; the 364 days Unlock applies to your Clean Space account.",
    account: "For the Clean Space account whose contact email is {email}.",
    receiptEmail: "Receipt and contact email: {email}",
    notYou: "Not your account? Back to your Clean Space account",
    lead: "One payment unlocks every feature of the Clean Space Mac app's website edition for 364 days, in the app signed in to your account.",
    priceTerms: "It doesn't renew, and nothing is charged again.",
    period:
      "Access period: 364 days from the moment the payment is approved (shorter than 12 months), ending at the same time of day. Your account page shows the exact start and end.",
    renewal:
      "After it ends, you can buy another 364 days yourself, at the price shown then. Signing in on another Mac or installing the app again never restarts or extends an access period.",
    includes: [
      "Every feature of the website edition for 364 days, including Plugin Cleaner, Docker and simulator management, the administrator helper and Spotlight maintenance.",
      "For the website edition downloaded from cultureand.tech, on every Mac signed in to this account. It doesn't unlock the Mac App Store app.",
      "When the access period ends, the basic features stay, and so do your settings, history, reports and Put Back.",
      "Full refund on request within 7 days of payment.",
    ],
    testMode: CLEAN_SPACE_TEST_PAYMENTS.en,
    testKeys: CLEAN_SPACE_TEST_PAYMENTS.en,
    currencyNotes: { KRW: "For Korean cards and easy-pay services. VAT included.", USD: "Pay with PayPal." },
    salesClosed: "The 364 days Unlock isn't on sale now. Nothing was charged.",
    already: "This account has the 364 days Unlock until its access period ends. Another can be bought after that.",
    accountDeleted: "This account is being deleted, so it cannot buy the 364 days Unlock.",
    emailNotConfirmed: "Confirm the contact email of your Clean Space account before paying.",
    accountUnavailable: "This Clean Space account is not available.",
    noCheckout: "Start your purchase on your Clean Space account page: sign in there, then continue to the checkout.",
    ended: "This checkout has ended, or was opened in another tab. Start again from your Clean Space account page.",
    backToProduct: "Back to Clean Space",
    successBody:
      "The 364 days Unlock is on your account for 364 days. Sign in to Clean Space on your Mac with this account to use it.",
    passTerm: "364 days Unlock: from {start} to {end}. It doesn't renew.",
    alreadyOwned:
      "This account already has an access period of the 364 days Unlock that hasn't ended, so this payment was not made. Nothing was charged.",
    accountDeletedResult:
      "The account was deleted while the payment was being confirmed, so the 364 days Unlock could not be added to it.",
    finishOnProduct:
      "This tab no longer holds the checkout. To finish the payment, sign in on your Clean Space account page to the account you paid with.",
    finishButton: "Finish on your Clean Space account",
  },
  ko: {
    pageTitle: "결제: Clean Space 364일 잠금 해제 | 컬처앤테크",
    productName: "Clean Space — 364일 잠금 해제",
    seller:
      "Clean Space를 만드는 컬처앤테크가 판매합니다. 결제는 이곳, 컬처앤테크의 결제 페이지(cultureand.tech)에서 진행되며, 364일 잠금 해제는 Clean Space 계정에 적용됩니다.",
    account: "연락용 이메일이 {email}인 Clean Space 계정에 적용됩니다.",
    receiptEmail: "영수증 및 연락용 이메일: {email}",
    notYou: "내 계정이 아닌가요? Clean Space 계정으로 돌아가기",
    lead: "한 번 결제하면 364일 동안, 이 계정으로 로그인한 Clean Space Mac 앱(웹사이트 버전)의 모든 기능을 쓸 수 있습니다.",
    priceTerms: "자동으로 갱신되거나 다시 결제되지 않습니다.",
    period:
      "이용 기간: 결제가 승인된 때부터 364일(12개월보다 짧음)이며, 같은 시각에 끝납니다. 정확한 시작과 만료 일시는 계정 페이지에 표시됩니다.",
    renewal:
      "이용 기간이 끝난 뒤에는 그때 표시되는 가격으로 직접 다시 구매할 수 있습니다. 다른 Mac에서 로그인하거나 앱을 다시 설치해도 이용 기간은 다시 시작되거나 늘어나지 않습니다.",
    includes: [
      "364일 동안 웹사이트 버전의 모든 기능을 쓸 수 있으며, 플러그인 클리너, Docker와 시뮬레이터 관리, 관리자 도우미, Spotlight 유지 관리도 포함됩니다.",
      "cultureand.tech에서 내려받은 웹사이트 버전에 적용되며, 이 계정으로 로그인한 모든 Mac에서 쓸 수 있습니다. Mac App Store 버전에는 적용되지 않습니다.",
      "이용 기간이 끝나도 기본 기능은 그대로 쓸 수 있고, 설정, 기록, 보고서, 복구하기도 그대로 남습니다.",
      "결제 후 7일 이내에 요청하면 전액 환불됩니다.",
    ],
    testMode: CLEAN_SPACE_TEST_PAYMENTS.ko,
    testKeys: CLEAN_SPACE_TEST_PAYMENTS.ko,
    currencyNotes: { KRW: "국내 카드·간편결제로 결제, 부가세 포함", USD: "PayPal로 결제" },
    salesClosed: "지금은 364일 잠금 해제를 판매하지 않습니다. 청구된 금액은 없습니다.",
    already: "이 계정에는 이용 기간이 남은 364일 잠금 해제가 있습니다. 다음 이용 기간은 지금 기간이 끝난 뒤에 구매할 수 있습니다.",
    accountDeleted: "삭제 중인 계정이라 364일 잠금 해제를 구매할 수 없습니다.",
    emailNotConfirmed: "결제하기 전에 Clean Space 계정의 연락용 이메일을 확인해 주세요.",
    accountUnavailable: "이 Clean Space 계정은 사용할 수 없습니다.",
    noCheckout: "Clean Space 계정 페이지에서 로그인한 뒤 결제 페이지로 이동해 주세요.",
    ended: "이 결제 페이지는 끝났거나 다른 탭에서 열렸습니다. Clean Space 계정 페이지에서 다시 시작해 주세요.",
    backToProduct: "Clean Space로 돌아가기",
    successBody: "364일 잠금 해제가 364일 동안 계정에 적용됩니다. Mac의 Clean Space에서 이 계정으로 로그인하면 쓸 수 있습니다.",
    passTerm: "364일 잠금 해제: {start}부터 {end}까지. 자동으로 갱신되지 않습니다.",
    alreadyOwned:
      "이 계정에는 아직 끝나지 않은 364일 잠금 해제 이용 기간이 있어 이번 결제는 진행하지 않았습니다. 청구된 금액은 없습니다.",
    accountDeletedResult: "결제를 확인하는 동안 계정이 삭제되어 364일 잠금 해제를 적용하지 못했습니다.",
    finishOnProduct:
      "이 탭에는 결제 정보가 남아 있지 않습니다. Clean Space 계정 페이지에서 결제한 계정으로 로그인하면 결제가 마무리됩니다.",
    finishButton: "Clean Space 계정에서 마무리하기",
  },
};


/** While All-in-one's currencies are on Toss's test keys (before the launch, for Toss's review). */
const ALL_IN_ONE_TEST_PAYMENTS = {
  en: "Test payment: payments run in Toss Payments' test environment for now, and nothing is actually charged. Access received through a test payment ends when sales start for real.",
  ko: "테스트 결제: 지금은 토스페이먼츠의 테스트 환경에서 결제가 진행되어 실제로 청구되지 않습니다. 테스트 결제로 받은 이용 권한은 정식 판매가 시작되면 끝납니다.",
};

/**
 * All-in-one — 364 Days: the owner's confirmed terms (2026-11-09): one payment, no renewal, 364 days from approval;
 * every current service and every service launched while it is active, with its end unchanged; individual passes keep
 * their own dates, access while either is active, nothing deducted or converted; a refund ends All-in-one only; full
 * refund within 7 days. The name stays in English in both languages. Period and price-terms wording follows Chord to
 * MIDI's Toss-reviewed text. Which services it covers, and what it gives in each, is shown on the portal (terms
 * article 2), not claimed here. A build carries it only when it opens that checkout (products.ts).
 */
export const ALL_IN_ONE_COPY: Record<Lang, ProductCopy> = {
  en: {
    pageTitle: "Checkout: All-in-one — 364 Days | Culture & Tech",
    productName: "All-in-one — 364 Days",
    seller:
      "Sold by Culture & Tech, which runs every Culture & Tech service. You pay here, on cultureand.tech, Culture & Tech's checkout; All-in-one applies to your Culture & Tech account.",
    account: "For the Culture & Tech account whose contact email is {email}.",
    receiptEmail: "Receipt and contact email: {email}",
    notYou: "Not your account? Back to your Culture & Tech account",
    lead: "One payment gives your Culture & Tech account connected services, including new services connected while it is active, for 364 days. Chord to MIDI joins when its portal integration opens; the switch is scheduled for 12 December 2026 at 23:00 KST.",
    priceTerms: "It doesn't renew, and nothing is charged again.",
    period:
      "Access period: 364 days from the moment the payment is approved (shorter than 12 months), ending at the same time of day. Your account page shows the exact start and end.",
    renewal:
      "After it ends, you can buy another 364 days yourself, at the price shown then. Its end never moves: a service added while it is active is included until the same end.",
    includes: [
      "Every service included now, as your account page lists it with what All-in-one gives in each, for 364 days.",
      "Passes you already bought for single services keep their original end dates, and you have access while either is active. What you paid for them isn't deducted, and they aren't converted into All-in-one.",
      "If All-in-one is refunded, only All-in-one ends. Valid individual passes continue.",
      "Full refund on request within 7 days of payment.",
    ],
    testMode: ALL_IN_ONE_TEST_PAYMENTS.en,
    testKeys: ALL_IN_ONE_TEST_PAYMENTS.en,
    currencyNotes: { KRW: "For Korean cards and easy-pay services. VAT included.", USD: "Pay with PayPal." },
    salesClosed: "All-in-one isn't on sale now. Nothing was charged.",
    already: "This account has All-in-one until its access period ends. Another can be bought after that.",
    accountDeleted: "This account is being deleted, so it cannot buy All-in-one.",
    emailNotConfirmed: "Confirm the contact email of your Culture & Tech account before paying.",
    accountUnavailable: "This Culture & Tech account is not available.",
    noCheckout: "Start your purchase on the All-in-one page of your Culture & Tech account: sign in there, then continue to the checkout.",
    ended: "This checkout has ended, or was opened in another tab. Start again from the All-in-one page of your Culture & Tech account.",
    backToProduct: "Back to your Culture & Tech account",
    successBody: "All-in-one is on your Culture & Tech account for 364 days. Sign in to each service with this account to use it.",
    passTerm: "All-in-one — 364 Days: from {start} to {end}. It doesn't renew.",
    alreadyOwned:
      "This account already has an All-in-one access period that hasn't ended, so this payment was not made. Nothing was charged.",
    accountDeletedResult:
      "The account was deleted while the payment was being confirmed, so All-in-one could not be added to it.",
    finishOnProduct:
      "This tab no longer holds the checkout. To finish the payment, sign in on the All-in-one page of your Culture & Tech account with the account you paid with.",
    finishButton: "Finish on your Culture & Tech account",
  },
  ko: {
    pageTitle: "결제: All-in-one — 364 Days | 컬처앤테크",
    productName: "All-in-one — 364 Days",
    seller:
      "컬처앤테크의 모든 서비스를 운영하는 컬처앤테크가 판매합니다. 결제는 이곳, 컬처앤테크의 결제 페이지(cultureand.tech)에서 진행되며, All-in-one은 컬처앤테크 계정에 적용됩니다.",
    account: "연락용 이메일이 {email}인 컬처앤테크 계정에 적용됩니다.",
    receiptEmail: "영수증 및 연락용 이메일: {email}",
    notYou: "내 계정이 아닌가요? 컬처앤테크 계정으로 돌아가기",
    lead: "한 번 결제하면 364일 동안 컬처앤테크 계정으로 연결된 서비스와 이용 기간 중 새로 연결되는 서비스를 이용할 수 있습니다. Chord to MIDI는 포털 연동이 열리면 포함되며, 전환 예정 시각은 2026년 12월 12일 23:00(한국 시간)입니다.",
    priceTerms: "자동으로 갱신되거나 다시 결제되지 않습니다.",
    period:
      "이용 기간: 결제가 승인된 때부터 364일(12개월보다 짧음)이며, 같은 시각에 끝납니다. 정확한 시작과 만료 일시는 계정 페이지에 표시됩니다.",
    renewal:
      "이용 기간이 끝난 뒤에는 그때 표시되는 가격으로 직접 다시 구매할 수 있습니다. 종료일은 바뀌지 않으며, 이용 기간 중 추가된 서비스도 같은 종료일까지 포함됩니다.",
    includes: [
      "현재 포함된 모든 서비스를 364일 동안 이용할 수 있습니다. 포함된 서비스와 각 서비스에서 All-in-one으로 받는 혜택은 계정 페이지에 표시됩니다.",
      "이미 구매한 개별 서비스 이용권은 원래 종료일을 그대로 유지하며, 둘 중 하나라도 유효하면 이용할 수 있습니다. 기존 구매 금액은 자동으로 차감되지 않으며, 개별 이용권이 All-in-one으로 전환되지 않습니다.",
      "All-in-one을 환불하면 All-in-one만 종료되며, 유효한 개별 이용권은 계속 이용할 수 있습니다.",
      "결제 후 7일 이내에 요청하면 전액 환불됩니다.",
    ],
    testMode: ALL_IN_ONE_TEST_PAYMENTS.ko,
    testKeys: ALL_IN_ONE_TEST_PAYMENTS.ko,
    currencyNotes: { KRW: "국내 카드·간편결제로 결제, 부가세 포함", USD: "PayPal로 결제" },
    salesClosed: "지금은 All-in-one을 판매하지 않습니다. 청구된 금액은 없습니다.",
    already: "이 계정에는 이용 기간이 남은 All-in-one이 있습니다. 다음 이용 기간은 지금 기간이 끝난 뒤에 구매할 수 있습니다.",
    accountDeleted: "삭제 중인 계정이라 All-in-one을 구매할 수 없습니다.",
    emailNotConfirmed: "결제하기 전에 컬처앤테크 계정의 연락용 이메일을 확인해 주세요.",
    accountUnavailable: "이 컬처앤테크 계정은 사용할 수 없습니다.",
    noCheckout: "컬처앤테크 계정의 All-in-one 페이지에서 로그인한 뒤 결제 페이지로 이동해 주세요.",
    ended: "이 결제 페이지는 끝났거나 다른 탭에서 열렸습니다. 컬처앤테크 계정의 All-in-one 페이지에서 다시 시작해 주세요.",
    backToProduct: "컬처앤테크 계정으로 돌아가기",
    successBody: "All-in-one이 364일 동안 컬처앤테크 계정에 적용됩니다. 각 서비스에서 이 계정으로 로그인하면 이용할 수 있습니다.",
    passTerm: "All-in-one — 364 Days: {start}부터 {end}까지. 자동으로 갱신되지 않습니다.",
    alreadyOwned:
      "이 계정에는 아직 끝나지 않은 All-in-one 이용 기간이 있어 이번 결제는 진행하지 않았습니다. 청구된 금액은 없습니다.",
    accountDeletedResult: "결제를 확인하는 동안 계정이 삭제되어 All-in-one을 적용하지 못했습니다.",
    finishOnProduct:
      "이 탭에는 결제 정보가 남아 있지 않습니다. 컬처앤테크 계정의 All-in-one 페이지에서 결제한 계정으로 로그인하면 결제가 마무리됩니다.",
    finishButton: "컬처앤테크 계정에서 마무리하기",
  },
};
