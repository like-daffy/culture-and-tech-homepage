/**
 * The text of Clean Space's account, sign-in, activation and checkout pages.
 *
 * English only for now. The Korean pages (/ko/…) show this English text, marked `lang="en"` (CONTENT_LANG), until the
 * owner reviews a Korean translation: no Korean is written here unless the site's published copy already has that
 * meaning (docs/clean-space-direct-sale.md lists every string that needs review). The seller block uses the footer's
 * published Korean (SELLER in config.ts).
 */
import type { PageLang, Provider, PurchaseStatus } from "./contract.generated";
import type { ProviderSignInFailure } from "./oauth";
import type { UnavailableReason } from "./checkout-machine";

/** The language the main text of a page is written in: English on both until Korean is reviewed. */
export const CONTENT_LANG: Record<PageLang, "en" | "ko"> = { en: "en", ko: "en" };

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export const EN = {
  brand: "Culture & Tech",
  product: "Clean Space",
  languageLink: "한국어",
  loading: "Loading…",
  tryAgain: "Try again",
  back: "Back",
  notConfigured: "Clean Space accounts and purchases are not available on this site yet.",
  accountChanged: "You signed in to another account while this was in progress, so its answer was not used. Try again.",
  signedInAs: (label: string) => `Signed in as ${label}`,
  thisAccount: "this account",
  signOutHere: "Sign out of this browser",

  // Seller and policies (the labels; the facts are SELLER in config.ts)
  sellerHeading: "Seller",
  sellerLabels: {
    representative: "Representative",
    registrationNumber: "Business registration",
    mailOrderNumber: "Mail-order business registration",
    address: "Address",
    phone: "Phone",
    email: "Email",
    hostingProvider: "Hosting",
  },
  policyLinks: { terms: "Terms of Sale", privacy: "Privacy Policy", refunds: "Refund Policy" },
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

  // Offer
  checkoutTitle: "364 days Unlock",
  offerName: "Clean Space 364 days Unlock",
  offerWhat:
    "Every feature of the Clean Space download from cultureand.tech for 364 days, including Docker and simulator cleanup, the administrator helper and Spotlight maintenance. The safety checks, and your review and approval of every removal, are the same as without it.",
  offerNotAppStore:
    "For the website download of Clean Space only. It does not unlock the Mac App Store app, and Expert bought in the App Store does not unlock the website download.",
  offerTerm:
    "Access starts when the payment is approved and ends exactly 364 days later (31,449,600 seconds). It is not a calendar year: the exact end, to the second and with its time zone, is shown once the payment is approved.",
  offerNoRenewal: "One payment. It never renews and nothing is charged again. You can buy it again after it ends.",
  offerAfter: "When it ends, the free features stay, and so do your settings, history, reports and Put Back.",
  offerCompatibility:
    "Needs a Mac with macOS 14 or later and the Clean Space download from this site. Sign in to the app with the same account; it confirms the access online at least every 7 days.",
  priceLabel: "Price",
  currencyHeading: "Pay in",
  currencyNames: { KRW: "Korean won (KRW)", USD: "US dollars (USD), with PayPal" },
  countryLabel: "The country you are in (PayPal asks for it)",
  countryPlaceholder: "Choose a country",
  policiesHeading: "Before you pay",
  acceptTerms: "I have read and accept the Terms of Sale.",
  acceptPrivacy: "I have read the Privacy Policy and agree to the processing it describes.",
  acceptRefunds: "I have read the Refund Policy.",
  policyVersions: (terms: string, privacy: string, refunds: string) => `Versions: Terms ${terms}, Privacy Policy ${privacy}, Refund Policy ${refunds}.`,
  continueToPayment: "Continue to payment",
  changeChoice: "Change",
  preparing: "Preparing the payment…",
  payButton: (price: string) => `Pay ${price}`,
  paying: "Opening the payment window…",
  agreeTossTerms: "Agree to the payment terms above to continue.",
  declined: "The payment was not completed. Nothing was charged.",
  alreadyActive: (end: string) => `This account already has the 364 days Unlock until ${end}. You can buy it again after it ends.`,
  previousEnded: (end: string) => `Your previous 364 days Unlock ended on ${end}.`,
  signInToBuy: "Sign in to buy",
  deleting: "This account is being deleted, so it can't buy anything.",
  unavailable: {
    "not-configured": "Clean Space accounts and purchases are not available on this site yet.",
    "sales-disabled": "The 364 days Unlock is not on sale yet.",
    "policies-unpublished": "The 364 days Unlock is not on sale yet.",
    "sales-closed": "Sales are paused right now. Nothing can be charged.",
    "no-currency": "No way to pay is available right now.",
    "offer-error": "The offer could not be loaded.",
  } satisfies Record<UnavailableReason, string>,
  checkoutInProgress: "Another checkout of this account is still open. Finish it in its tab, or wait a few minutes and try again.",
  offerChanged: "The offer or a policy changed. Review them again before paying.",
  finishingPayment: "Finishing your payment…",
  accountLink: "Your account",

  // Contact verification
  contactHeading: "Receipt email",
  contactIntro: "Confirm an email address for receipts and support before you pay. It only receives email: it is not a way to sign in.",
  contactEmailLabel: "Email address",
  contactSend: "Send code",
  contactCodeLabel: "6-digit code",
  contactCodeSent: (email: string) => `We sent a code to ${email}. Enter it within 15 minutes.`,
  contactConfirm: "Confirm",
  contactResend: "Use another address",
  contactConfirmed: (email: string) => `Receipt email: ${email}`,
  contactInvalidEmail: "Enter a valid email address.",
  contactInvalidCode: "Enter the 6-digit code from the email.",

  // Result pages
  resultTitle: "Payment",
  confirming: "Confirming your payment with Toss Payments…",
  paidHeading: "Thank you. Your 364 days Unlock is active.",
  paidPeriod: (start: string, end: string) => `From ${start} until ${end}.`,
  paidNext:
    "Open Clean Space on your Mac and choose Check Access, or Sign In with this account. The app confirms the access itself; this page does not unlock it.",
  receiptLink: "Toss Payments receipt",
  receiptNone: "Toss Payments did not provide a receipt page for this payment. The receipt email goes to your receipt address.",
  pendingHeading: "Your payment is being recorded",
  pendingText:
    "Toss Payments approved the payment and recording it is not finished yet. Do not pay again: it appears on your account page as soon as it is recorded. If it hasn't within an hour, contact support with the order number below.",
  orderNumber: "Order number",
  signInToFinish: "Sign in with the account you paid with to finish.",
  wrongAccount: "This payment belongs to another account. Sign out, then sign in with the account you paid with.",
  noPayment: "This page was opened without a payment to confirm.",
  ifCharged: "If you were charged, the payment is recorded by itself and shows on your account page. If it doesn't within an hour, contact support with the order number below. Do not pay again.",
  resumeExpired: "Finishing this payment took too long here. If you were charged, it is recorded by itself and shows on your account page.",
  failTitle: "Payment not completed",
  failCancelled: "You cancelled the payment. Nothing was charged.",
  failOther: "The payment did not go through. Nothing was charged.",
  tossSaid: (message: string) => `Toss Payments: ${message}`,
  backToCheckout: "Back to checkout",

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
  contactNone: "No receipt email confirmed yet.",
  contactChange: "Change receipt email",
  accessHeading: "364 days Unlock",
  accessNone: "This account has no 364 days Unlock.",
  accessActive: (start: string, end: string) => `Active from ${start} until ${end}.`,
  accessExpired: (end: string) => `Ended on ${end}.`,
  accessRevoked: "Ended early: refunded or cancelled.",
  buy: "Get the 364 days Unlock",
  buyAgain: "Buy again",
  purchasesHeading: "Purchases",
  purchasesNone: "No purchases yet.",
  purchaseStatus: {
    paid: "Paid",
    partially_refunded: "Partly refunded",
    refunded: "Refunded",
    pending: "Being recorded",
    failed: "Failed",
    canceled: "Cancelled",
  } satisfies Record<PurchaseStatus, string>,
  purchaseMethod: (method: string) => `Paid with ${method}`,
  refundRequest: "Request a refund",
  refundReason: "What happened? (helps support)",
  refundSend: "Send request",
  refundNote: "A refund request goes to support, who reply by email. It does not delete your account, and access continues until a refund is made.",
  refundSent: (reference: string) => `Request sent (reference ${reference}). Support will reply by email.`,
  appsHeading: "Clean Space on your Macs",
  appsNone: "No Mac is signed in with this account.",
  appRow: (version: string, approved: string) => `Clean Space ${version}, signed in on ${approved}`,
  endSessions: "Sign out of Clean Space on all Macs",
  endSessionsDone: (count: number) => `${plural(count, "app session", "app sessions")} ended. Each Mac returns to the free features at its next check.`,
  deleteHeading: "Delete account",
  deleteText:
    "Deleting your account is not a refund. Any remaining access ends, Clean Space on your Macs returns to the free features, and payment records are kept as the law requires. To ask for a refund, use Request a refund first.",
  deleteConfirm: "I understand that deleting my account is not a refund.",
  deleteButton: "Delete account",
  deleteRequested: (date: string) => `Deletion was requested on ${date}. It finishes by itself.`,
  providerNames: { google: "Google", kakao: "Kakao", naver: "Naver" } satisfies Record<Provider, string>,
};

export type Copy = typeof EN;

/**
 * Korean pages: the English text above, except what the site has already published in Korean with the same meaning
 * (the brand "컬처앤테크" of the Korean navigation, the app pages' "문의" for Support) and the language link's own name. Everything else waits for the owner's review;
 * the policy names stay English until the direct-sale policies themselves are published in Korean.
 */
export const KO: Copy = {
  ...EN,
  brand: "컬처앤테크",
  languageLink: "English",
  support: "문의",
};

export const COPY: Record<PageLang, Copy> = { en: EN, ko: KO };
