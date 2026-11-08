/**
 * What each product's checkout says about the product, in English and Korean, in the product's own words:
 * - Chord to MIDI: chord-to-midi-web's src/i18n/{en,ko}.json (`purchase`, `purchaseResult`), word for word.
 * - DJ Duplicate Guard: its decisions D38 and DL-50 and its terms (Articles 2(7), 9, 11 and 15-2) in
 *   dj-duplicate-guard's apps/web/content/. A build carries it only when it opens that checkout (products.ts): until
 *   its owner opens the sales (DL-52), none of it is published.
 * Change them with their sources.
 */
import type { Currency, Lang } from "./contract";

export interface ProductCopy {
  pageTitle: string;
  productName: string;
  seller: string;
  account: string;
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
    pageTitle: "Checkout: Chord to MIDI Remove Ads | Culture & Tech",
    productName: "Chord to MIDI — Remove Ads, 364 days",
    seller:
      "Sold by Culture & Tech, which runs Chord to MIDI. You pay here, on cultureand.tech, Culture & Tech's checkout; Remove Ads applies to your Chord to MIDI account.",
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
    currencyNotes: { KRW: "For Korean cards and easy-pay services. VAT included.", USD: "Pay with PayPal." },
    salesClosed: "Remove Ads isn't on sale now. Nothing was charged.",
    already: "This account has Remove Ads until its period ends. Another period can be bought after that.",
    accountDeleted: "This account is being deleted, so it cannot buy Remove Ads.",
    emailNotConfirmed: "Confirm the email of your Chord to MIDI account before paying.",
    accountUnavailable: "This Chord to MIDI account is not available.",
    noCheckout: "Start your purchase on Chord to MIDI: sign in there, then continue to the checkout.",
    ended: "This checkout has ended, or was opened in another tab. Start again from Chord to MIDI.",
    backToProduct: "Back to Chord to MIDI",
    successBody: "Remove Ads is on your account for 364 days and applies wherever you sign in to it.",
    passTerm: "Remove Ads — 364 days: from {start} to {end}. It doesn't renew.",
    alreadyOwned:
      "This account already has a period of Remove Ads that hasn’t ended, so this payment was not made. Nothing was charged.",
    accountDeletedResult:
      "The account was deleted while the payment was being confirmed, so Remove Ads could not be added to it.",
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
    lead: "With Expert, the extension signed in to your account adds library sync through your own Google Drive, a duplicate review of your whole imported purchase history, and saved filters.",
    priceTerms: "One payment for a 364-day pass, not a subscription. It doesn't renew, and nothing is charged automatically.",
    period: "Term: 364 days (364 × 24 hours) from the payment's approval. The exact start and end show after payment.",
    includes: [
      "Library sync through your own Google Drive.",
      "A duplicate review of your whole imported purchase history.",
      "Saved filters in your library.",
      "The free features stay as they are, without an account.",
      "A full refund within 7 days of payment, even after use; after that, cancel at any time for a refund of the unused time, with no fee.",
    ],
    testMode: "Test checkout: payments go to Toss Payments' test environment, and nothing is charged.",
    currencyNotes: { KRW: "Pay with a Korean card. VAT included.", USD: "Pay with PayPal." },
    salesClosed: "Expert isn't on sale yet. Nothing can be bought here, and nothing is charged.",
    already: "This account already has an active Expert pass.",
    accountDeleted: "This account is being deleted, so it cannot buy Expert.",
    emailNotConfirmed: "Confirm the email of your DJ Duplicate Guard account before paying.",
    accountUnavailable: "This DJ Duplicate Guard account is not available.",
    noCheckout: "Start your purchase on DJ Duplicate Guard: sign in on its account page, then continue to the checkout.",
    ended: "This checkout has ended, or was opened in another tab. Start again from DJ Duplicate Guard.",
    backToProduct: "Back to DJ Duplicate Guard",
    successBody: "Expert is now on your account. The pass doesn't renew.",
    passTerm: "Expert pass: from {start} to {end}",
    alreadyOwned: "This account already has an active Expert pass, so this payment was not made. Nothing was charged.",
    accountDeletedResult:
      "The account was deleted while the payment was being confirmed, so Expert could not be added to it.",
    finishOnProduct:
      "This tab no longer holds the checkout. To finish the payment, sign in on DJ Duplicate Guard to the account you paid with.",
    finishButton: "Finish on DJ Duplicate Guard",
  },
  ko: {
    pageTitle: "결제: DJ Duplicate Guard Expert | 컬처앤테크",
    productName: "DJ Duplicate Guard — Expert 364일 이용권",
    seller:
      "DJ Duplicate Guard를 운영하는 컬처앤테크가 판매합니다. 결제는 이곳, 컬처앤테크의 결제 페이지(cultureand.tech)에서 진행되며, Expert는 DJ Duplicate Guard 계정에 적용됩니다.",
    account: "영수증 및 계정 복구 이메일이 {email}인 DJ Duplicate Guard 계정에 적용됩니다.",
    notYou: "내 계정이 아닌가요? DJ Duplicate Guard로 돌아가기",
    lead: "Expert를 구매하면 그 계정으로 로그인한 확장 프로그램에서 본인의 Google Drive를 통한 라이브러리 동기화, 가져온 구매 기록 전체에 대한 중복 검토, 라이브러리의 저장된 필터를 쓸 수 있습니다.",
    priceTerms: "한 번의 결제로 구매하는 364일 이용권이며, 구독이 아닙니다. 자동으로 갱신되거나 결제되지 않습니다.",
    period: "이용 기간: 결제가 승인된 때부터 364일(364×24시간). 정확한 시작·종료 일시는 결제 후 표시됩니다.",
    includes: [
      "본인의 Google Drive를 통한 라이브러리 동기화",
      "가져온 구매 기록 전체에 대한 중복 검토",
      "라이브러리의 저장된 필터",
      "무료 기능은 계정 없이도 지금처럼 쓸 수 있습니다.",
      "결제 후 7일 이내에는 사용했더라도 전액 환불되며, 그 뒤에는 언제든 해지하고 남은 기간만큼 수수료 없이 환불받을 수 있습니다.",
    ],
    testMode: "테스트 결제: 토스페이먼츠의 테스트 환경으로 처리되며 실제로 청구되지 않습니다.",
    currencyNotes: { KRW: "국내 카드로 결제, 부가세 포함", USD: "PayPal로 결제" },
    salesClosed: "Expert는 아직 판매하지 않습니다. 여기서는 아무것도 구매되거나 청구되지 않습니다.",
    already: "이 계정에는 이미 유효한 Expert 이용권이 있습니다.",
    accountDeleted: "삭제 중인 계정이라 Expert를 구매할 수 없습니다.",
    emailNotConfirmed: "결제하기 전에 DJ Duplicate Guard 계정의 이메일을 확인해 주세요.",
    accountUnavailable: "이 DJ Duplicate Guard 계정은 사용할 수 없습니다.",
    noCheckout: "DJ Duplicate Guard의 계정 페이지에서 로그인한 뒤 결제 페이지로 이동해 주세요.",
    ended: "이 결제 페이지는 끝났거나 다른 탭에서 열렸습니다. DJ Duplicate Guard에서 다시 시작해 주세요.",
    backToProduct: "DJ Duplicate Guard로 돌아가기",
    successBody: "Expert가 계정에 적용되었습니다. 이용권은 자동으로 갱신되지 않습니다.",
    passTerm: "Expert 이용권: {start}부터 {end}까지",
    alreadyOwned: "이 계정에는 이미 유효한 Expert 이용권이 있어 이번 결제는 진행하지 않았습니다. 청구된 금액은 없습니다.",
    accountDeletedResult: "결제를 확인하는 동안 계정이 삭제되어 Expert를 적용하지 못했습니다.",
    finishOnProduct:
      "이 탭에는 결제 정보가 남아 있지 않습니다. DJ Duplicate Guard에서 결제한 계정으로 로그인하면 결제가 마무리됩니다.",
    finishButton: "DJ Duplicate Guard에서 마무리하기",
  },
};

