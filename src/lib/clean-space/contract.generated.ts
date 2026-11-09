// GENERATED FILE: a pinned copy of the Clean Space licensing contract. Do not edit.
// Source: mac-get-space services/licensing/contract/src/index.ts (node scripts/export.mjs <this file>).
// contract-version: 1
// sha256: 62be7dc32b9b9791056511da091f90a252d6cbcf5fe41ce74a2345f1445d320f
// Clean Space licensing contract, version 1 (docs/plans/364-days-option.md §5.2, §7, §8).
//
// The one description of what the Clean Space licensing service, the cultureand.tech pages and the website build of the
// app say to each other. It is dependency-free on purpose: types, `as const` values and pure functions only, no imports,
// no Node or browser APIs, so the Cloud Functions compile it as is, the homepage keeps a pinned copy of it
// (scripts/export.mjs writes the copy with this file's SHA-256; the homepage never imports a sibling checkout), and the
// Swift DTOs are checked against the JSON fixtures in ../fixtures.
//
// Changes are additive within a contract version. A change to an existing shape, value or rule is a new
// CONTRACT_VERSION, and the service keeps answering the older version for installed apps (plan §12, rollback).
// The version guards what installed apps call: the native routes and the lease. The browser callables and the shared
// checkout's callables are called only by the cultureand.tech pages, which are released with the service; a change
// to them is recorded in ../README.md ("Changes"), as when the shared checkout replaced the service's own checkout
// callables (2026-11-09, before anything was deployed).

// ---- Versions and environments ----

/** Every request and response of the native routes carries this number; the service refuses one it doesn't know. */
export const CONTRACT_VERSION = 1 as const;
export type ContractVersion = typeof CONTRACT_VERSION;

/**
 * Where a service answers. `emulator` is the local Firebase emulator suite on `demo-clean-space-*` projects (never a
 * real project), `staging` and `production` are the dedicated Clean Space Firebase projects (proposed roles, not
 * provisioned ids: plan §5). A lease names its environment, and an app accepts only its own build's.
 */
export const ENVIRONMENTS = ['emulator', 'staging', 'production'] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

/** Proposed region of the functions and Firestore (Seoul, as the reference service). Chosen at setup, not here. */
export const DEFAULT_FUNCTIONS_REGION = 'asia-northeast3' as const;

/** The exact origin of the pages that sell, sign in and approve (plan §2.1). */
export const SITE_ORIGIN = 'https://cultureand.tech' as const;

// ---- The one product (plan §2, §7.1) ----

/** The product. Not interchangeable with the App Store's StoreKit product or Chord to MIDI's `remove_ads`. */
export const PRODUCT_ID = 'clean_space_unlock_364d' as const;
export type ProductId = typeof PRODUCT_ID;
/** The offer a purchase freezes. A new price, term or rule is a new offer version, never a change to this one. */
export const OFFER_VERSION = 'clean_space_unlock_364d_v1' as const;
/** The display name of the paid option, in every language until the owner reviews a translation. */
export const PRODUCT_DISPLAY_NAME = '364 days Unlock' as const;
/** The order name sent to Toss Payments (what the buyer's receipt shows). */
export const ORDER_NAME = 'Clean Space 364 days Unlock' as const;

export const DURATION_DAYS = 364 as const;
/** 364 × 86,400 seconds. A term is exactly this long: never a calendar year or twelve months. */
export const DURATION_SECONDS = 31_449_600 as const;

/** How long a lease lets the app work without the service, at most, after a successful check (plan §2.2, §8.2). */
export const OFFLINE_ALLOWANCE_SECONDS = 604_800 as const;

export const CURRENCIES = ['KRW', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Money in integer minor units: won, or US cents. Only the Toss adapter turns cents into the `2.49` Toss takes. */
export interface Money {
  currency: Currency;
  amountMinor: number;
}

/** Digits after the decimal point in Toss's amounts. */
export const CURRENCY_EXPONENT: Readonly<Record<Currency, number>> = { KRW: 0, USD: 2 };

/** The prices of offer v1: the complete amounts sent for payment, nothing added and nothing converted. */
export const OFFER_PRICES: Readonly<Record<Currency, Money>> = {
  KRW: { currency: 'KRW', amountMinor: 3300 },
  USD: { currency: 'USD', amountMinor: 249 },
};

/** Sign-in providers. All three are required and each works as an account's only sign-in method (plan §6). */
export const PROVIDERS = ['google', 'kakao', 'naver'] as const;
export type Provider = (typeof PROVIDERS)[number];
/** Providers whose OAuth code the service exchanges itself (the broker); Google signs in through Firebase Auth. */
export const BROKERED_PROVIDERS = ['kakao', 'naver'] as const;
export type BrokeredProvider = (typeof BROKERED_PROVIDERS)[number];

export type PageLang = 'en' | 'ko';
export const PAGE_LANGS: readonly PageLang[] = ['en', 'ko'];

// ---- Shared pure checks ----

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** An unpadded base64url string of exactly `length` characters. */
export function isBase64Url(value: unknown, length: number): value is string {
  return typeof value === 'string' && value.length === length && /^[A-Za-z0-9_-]+$/.test(value);
}

/** 16 random bytes, base64url (installation ids, session ids, order ids' random part). */
export const isId22 = (value: unknown): value is string => isBase64Url(value, 22);
/** 32 bytes, base64url: redemption secrets, their SHA-256 challenges, activation request ids. */
export const isId43 = (value: unknown): value is string => isBase64Url(value, 43);

/** Whole seconds since 1970 (UTC), as the service and the lease count time. */
export function isUnixSeconds(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 1_500_000_000 && value < 4_102_444_800;
}

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value);
}

export function isProvider(value: unknown): value is Provider {
  return typeof value === 'string' && (PROVIDERS as readonly string[]).includes(value);
}

export function isEnvironment(value: unknown): value is Environment {
  return typeof value === 'string' && (ENVIRONMENTS as readonly string[]).includes(value);
}

/** A currency and an amount that belong together: a positive safe integer of minor units. */
export function isMoney(value: unknown): value is Money {
  return isRecord(value) && isCurrency(value.currency) && typeof value.amountMinor === 'number'
    && Number.isSafeInteger(value.amountMinor) && value.amountMinor > 0;
}

export function sameMoney(a: Money, b: Money): boolean {
  return a.currency === b.currency && a.amountMinor === b.amountMinor;
}

/** The amount as Toss writes it: "3300" for won, "2.49" for dollars. Exact decimal text, never float arithmetic. */
export function tossAmountText(money: Money): string {
  if (!isMoney(money)) throw new RangeError('Not an amount');
  const exponent = CURRENCY_EXPONENT[money.currency];
  if (exponent === 0) return String(money.amountMinor);
  const digits = String(money.amountMinor).padStart(exponent + 1, '0');
  return `${digits.slice(0, -exponent)}.${digits.slice(-exponent)}`;
}

/** The amount as the Toss SDK and API take it (a JSON number): 3300 or 2.49. */
export function tossAmountNumber(money: Money): number {
  return Number(tossAmountText(money));
}

/**
 * Minor units of an amount Toss reported, or null when it isn't exactly representable in the currency (a fraction of a
 * won, a third decimal, NaN, Infinity, a negative or a non-number).
 */
export function minorFromTossAmount(currency: Currency, amount: unknown): number | null {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) return null;
  const exponent = CURRENCY_EXPONENT[currency];
  if (exponent === 0) return Number.isSafeInteger(amount) ? amount : null;
  // 2.49 × 100 is 249.00000000000003 in binary floating point: allow that much, refuse 2.495 or 2.4900001.
  const scaled = amount * 10 ** exponent;
  const minor = Math.round(scaled);
  return Math.abs(scaled - minor) <= 1e-6 && Number.isSafeInteger(minor) && minor > 0 ? minor : null;
}

// ---- Terms (plan §2.2) ----

/** The exclusive end of a term that starts at `startsAt` (Toss's verified approvedAt, in seconds). */
export function termEnd(startsAt: number): number {
  return startsAt + DURATION_SECONDS;
}

/** The one test of a term: `startsAt <= now < expiresAt`, in seconds. At `expiresAt` exactly it has ended. */
export function withinTerm(startsAt: number, expiresAt: number, now: number): boolean {
  return startsAt <= now && now < expiresAt;
}

/**
 * Toss's `approvedAt` ("2024-02-13T12:18:14+09:00", optionally with milliseconds) as whole seconds since 1970, or null
 * for anything else. Missing or malformed values go to reconciliation; nothing substitutes "now" (plan §7.2.6).
 */
export function parseTossApprovedAt(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m.map(Number) as number[];
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 59) return null;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return null;
  // Date.parse rolls 2026-02-30 over to March: compare the calendar date in the stated offset.
  const offset = m[8] === 'Z' ? 0 : (m[8].startsWith('-') ? -1 : 1) * (Number(m[8].slice(1, 3)) * 60 + Number(m[8].slice(4, 6)));
  const local = new Date(ms + offset * 60_000);
  if (local.getUTCFullYear() !== y || local.getUTCMonth() + 1 !== mo || local.getUTCDate() !== d) return null;
  const seconds = Math.floor(ms / 1000);
  return isUnixSeconds(seconds) ? seconds : null;
}

// ---- Errors ----

/**
 * Codes the service answers with. Callables put them in `HttpsError.details.code`; native routes in the error body
 * (`NativeErrorBody`). A Toss Payments error code may appear in `details.tossCode` with Toss's own message.
 */
export const ERROR_CODE = {
  invalidRequest: 'INVALID_REQUEST',
  unsupportedContract: 'UNSUPPORTED_CONTRACT',
  unauthenticated: 'UNAUTHENTICATED',
  /** The ID token expired: refresh it and try once more. Not a loss of access. */
  idTokenExpired: 'ID_TOKEN_EXPIRED',
  /** The service no longer accepts this session (revoked, older generation, unlinked provider): sign in again. */
  sessionInvalid: 'SESSION_INVALID',
  /** The account is being deleted or was deleted. */
  accountDeleted: 'ACCOUNT_DELETED',
  accountDisabled: 'ACCOUNT_DISABLED',
  recentSignInRequired: 'RECENT_SIGN_IN_REQUIRED',
  contactNotVerified: 'CONTACT_NOT_VERIFIED',
  contactCodeInvalid: 'CONTACT_CODE_INVALID',
  contactCodeExpired: 'CONTACT_CODE_EXPIRED',
  policiesNotAccepted: 'POLICIES_NOT_ACCEPTED',
  offerChanged: 'OFFER_CHANGED',
  salesClosed: 'SALES_CLOSED',
  currencyUnavailable: 'CURRENCY_UNAVAILABLE',
  buyerCountryRequired: 'BUYER_COUNTRY_REQUIRED',
  /** A term of this product is active now: another purchase opens after it ends (no stacking, plan §2.2). */
  alreadyActive: 'ALREADY_ACTIVE',
  /** Another order of this account is outstanding or being confirmed, in either currency. */
  checkoutInProgress: 'CHECKOUT_IN_PROGRESS',
  checkoutExpired: 'CHECKOUT_EXPIRED',
  orderNotFound: 'ORDER_NOT_FOUND',
  notOrderOwner: 'NOT_ORDER_OWNER',
  amountMismatch: 'AMOUNT_MISMATCH',
  orderNotPayable: 'ORDER_NOT_PAYABLE',
  /** Toss approved, but recording it is not finished: the page waits; reconciliation records it. */
  paymentPending: 'PAYMENT_PENDING',
  paymentNotApproved: 'PAYMENT_NOT_APPROVED',
  paymentProviderUnavailable: 'PAYMENT_PROVIDER_UNAVAILABLE',
  paymentResumeExpired: 'PAYMENT_RESUME_EXPIRED',
  /** The shared checkout's codes (its APP_ERROR) for cases its pages tell apart; see CHECKOUT_ERROR. */
  termsNotAccepted: 'TERMS_NOT_ACCEPTED',
  ageNotConfirmed: 'AGE_NOT_CONFIRMED',
  /** A checkout's account has no verified contact (the receipt address). Clean Space's own pages get CONTACT_NOT_VERIFIED. */
  emailNotConfirmed: 'EMAIL_NOT_CONFIRMED',
  /** A checkout's account can't be used: its Firebase user is gone or disabled. */
  accountUnavailable: 'ACCOUNT_UNAVAILABLE',
  providerUnavailable: 'PROVIDER_UNAVAILABLE',
  providerDenied: 'PROVIDER_DENIED',
  providerUnreachable: 'PROVIDER_UNREACHABLE',
  oauthStateInvalid: 'OAUTH_STATE_INVALID',
  identityInUse: 'IDENTITY_IN_USE',
  providerAlreadyLinked: 'PROVIDER_ALREADY_LINKED',
  lastSignInMethod: 'LAST_SIGN_IN_METHOD',
  accountMismatch: 'ACCOUNT_MISMATCH',
  activationNotFound: 'ACTIVATION_NOT_FOUND',
  activationExpired: 'ACTIVATION_EXPIRED',
  activationCodeMismatch: 'ACTIVATION_CODE_MISMATCH',
  activationAlreadyDecided: 'ACTIVATION_ALREADY_DECIDED',
  installationMismatch: 'INSTALLATION_MISMATCH',
  /** Polling faster than `pollIntervalSeconds`: wait longer (RFC 8628 slow_down). */
  slowDown: 'SLOW_DOWN',
  tooManyRequests: 'TOO_MANY_REQUESTS',
  notFound: 'NOT_FOUND',
  internal: 'INTERNAL',
} as const;
export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

/** `details` of an HttpsError from a callable. `message` is English and safe to show; it never carries a secret. */
export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  /** A Toss Payments error code, when Toss refused; with Toss's own message. */
  tossCode?: string;
  tossMessage?: string;
  /** For SLOW_DOWN and TOO_MANY_REQUESTS. */
  retryAfterSeconds?: number;
}

// ---- Licenses and leases (plan §7.1, §8.2) ----

/** What the service says about an account's access now, by the server's clock. */
export const LICENSE_STATUSES = ['none', 'active', 'expired', 'revoked'] as const;
export type LicenseStatus = (typeof LICENSE_STATUSES)[number];

/** The account's access period as the service projects it from verified payments. Times in whole seconds. */
export interface LicenseSummary {
  productID: ProductId;
  status: LicenseStatus;
  /** Present for active, expired and revoked. */
  startsAt: number | null;
  /** Exclusive end. */
  expiresAt: number | null;
  /** Increases with every change to the projection (grant, refund, revocation). 0 when there never was one. */
  revision: number;
}

/**
 * A lease is a compact JWS (`header.payload.signature`, base64url) signed with ES256 by the service's lease key:
 * local evidence of a bounded access period for one installation, never a credential the service accepts.
 */
export const LEASE = {
  schemaVersion: 1,
  algorithm: 'ES256',
  type: 'clean-space-lease+jws',
  issuer: 'https://cultureand.tech/apps/clean-space/licensing',
  /** The website build's bundle identifier family: the lease is for that app, never the App Store build. */
  audience: 'tech.cultureand.MacGetSpace',
  /** Leases are short: a token larger than this is refused before it is parsed. */
  maxTokenBytes: 4096,
} as const;

/** The protected header. Exactly these three members; `jku`, `jwk`, `x5u`, `x5c`, `crit` and anything else are refused. */
export interface LeaseHeader {
  alg: 'ES256';
  kid: string;
  typ: typeof LEASE.type;
}

/** The payload. Exactly these members, all required. Times are whole seconds since 1970 (UTC). */
export interface LeasePayload {
  schemaVersion: typeof LEASE.schemaVersion;
  issuer: string;
  audience: string;
  environment: Environment;
  /** The same key id as the header's (both are checked). */
  keyID: string;
  /** The Firebase Auth uid. */
  accountID: string;
  installationID: string;
  productID: ProductId;
  entitlementRevision: number;
  sessionGeneration: number;
  startsAt: number;
  /** Exclusive. */
  expiresAt: number;
  issuedAt: number;
  /** min(expiresAt, issuedAt + OFFLINE_ALLOWANCE_SECONDS). */
  offlineUntil: number;
}

export const LEASE_PAYLOAD_KEYS = [
  'schemaVersion', 'issuer', 'audience', 'environment', 'keyID', 'accountID', 'installationID', 'productID',
  'entitlementRevision', 'sessionGeneration', 'startsAt', 'expiresAt', 'issuedAt', 'offlineUntil',
] as const;

/** When the offline allowance of a lease issued at `issuedAt` ends: never after the paid term. */
export function offlineUntilFor(issuedAt: number, expiresAt: number): number {
  return Math.min(expiresAt, issuedAt + OFFLINE_ALLOWANCE_SECONDS);
}

/** Lease key ids: letters, digits, dot, dash, underscore; 3–64 characters. Test keys start with `test-`. */
export function isLeaseKeyID(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9._-]{3,64}$/.test(value);
}

export const LEASE_REFUSAL = {
  shape: 'shape',
  schema: 'schema',
  issuer: 'issuer',
  audience: 'audience',
  environment: 'environment',
  keyID: 'keyID',
  account: 'account',
  installation: 'installation',
  product: 'product',
  interval: 'interval',
  offline: 'offline',
  revision: 'revision',
  generation: 'generation',
  notYetValid: 'notYetValid',
  expired: 'expired',
  offlineEnded: 'offlineEnded',
} as const;
export type LeaseRefusal = (typeof LEASE_REFUSAL)[keyof typeof LEASE_REFUSAL];

export interface LeaseExpectations {
  environment: Environment;
  installationID: string;
  /** The account the app is signed in to; omitted only when the service checks a lease it just made. */
  accountID?: string;
  /** The highest revision and generation the app has seen from the service; an older lease is stale. */
  minimumRevision?: number;
  minimumGeneration?: number;
  /** Trusted time in seconds; omitted to check the shape and bindings only. */
  now?: number;
}

/**
 * Checks a decoded payload (after the signature was verified with a pinned key whose id is `headerKeyID`). Returns
 * null when it may be used, otherwise the first refusal. The Swift `LeaseVerifier` applies the same rules in the same
 * order; ../fixtures/lease-vectors.json holds cases both run.
 */
export function leasePayloadRefusal(payload: unknown, headerKeyID: string, expect: LeaseExpectations): LeaseRefusal | null {
  if (!isRecord(payload)) return LEASE_REFUSAL.shape;
  const keys = Object.keys(payload);
  if (keys.length !== LEASE_PAYLOAD_KEYS.length || !LEASE_PAYLOAD_KEYS.every((k) => keys.includes(k))) return LEASE_REFUSAL.shape;
  const p = payload as Record<keyof LeasePayload, unknown>;
  if (p.schemaVersion !== LEASE.schemaVersion) return LEASE_REFUSAL.schema;
  if (p.issuer !== LEASE.issuer) return LEASE_REFUSAL.issuer;
  if (p.audience !== LEASE.audience) return LEASE_REFUSAL.audience;
  if (!isEnvironment(p.environment) || p.environment !== expect.environment) return LEASE_REFUSAL.environment;
  if (!isLeaseKeyID(p.keyID) || p.keyID !== headerKeyID) return LEASE_REFUSAL.keyID;
  if (typeof p.accountID !== 'string' || p.accountID.length < 1 || p.accountID.length > 128) return LEASE_REFUSAL.account;
  if (expect.accountID !== undefined && p.accountID !== expect.accountID) return LEASE_REFUSAL.account;
  if (!isId22(p.installationID) || p.installationID !== expect.installationID) return LEASE_REFUSAL.installation;
  if (p.productID !== PRODUCT_ID) return LEASE_REFUSAL.product;
  if (typeof p.entitlementRevision !== 'number' || !Number.isSafeInteger(p.entitlementRevision) || p.entitlementRevision < 1) return LEASE_REFUSAL.revision;
  if (typeof p.sessionGeneration !== 'number' || !Number.isSafeInteger(p.sessionGeneration) || p.sessionGeneration < 0) return LEASE_REFUSAL.generation;
  if (!isUnixSeconds(p.startsAt) || !isUnixSeconds(p.expiresAt) || !isUnixSeconds(p.issuedAt) || !isUnixSeconds(p.offlineUntil)) return LEASE_REFUSAL.interval;
  if (p.startsAt >= p.expiresAt || p.expiresAt - p.startsAt !== DURATION_SECONDS) return LEASE_REFUSAL.interval;
  if (p.issuedAt < p.startsAt || p.issuedAt >= p.expiresAt) return LEASE_REFUSAL.interval;
  if (p.offlineUntil !== offlineUntilFor(p.issuedAt, p.expiresAt)) return LEASE_REFUSAL.offline;
  if (expect.minimumRevision !== undefined && p.entitlementRevision < expect.minimumRevision) return LEASE_REFUSAL.revision;
  if (expect.minimumGeneration !== undefined && p.sessionGeneration < expect.minimumGeneration) return LEASE_REFUSAL.generation;
  if (expect.now !== undefined) {
    if (expect.now < p.startsAt) return LEASE_REFUSAL.notYetValid;
    if (expect.now >= p.expiresAt) return LEASE_REFUSAL.expired;
    if (expect.now >= p.offlineUntil) return LEASE_REFUSAL.offlineEnded;
  }
  return null;
}

// ---- Accounts ----

export interface ContactSummary {
  /** The verified receipt and support address on this account (contact only: never a sign-in method, plan §6.2). */
  email: string;
  verifiedAt: number;
}

/** What the account owner is shown about their own account. */
export interface AccountSummary {
  accountID: string;
  /** Linked sign-in methods. Never empty for a usable account. */
  providers: Provider[];
  /** A short name to tell accounts apart: the verified contact, else the provider's nickname or email, else null. */
  displayLabel: string | null;
  contact: ContactSummary | null;
}

// ---- Native routes (the website build of the app; HTTPS POST, JSON in and out) ----

/**
 * Paths under the native API function's base URL (an exact HTTPS URL pinned in the app per environment). Every body
 * carries `contractVersion`. Errors answer with a non-2xx status and `NativeErrorBody`.
 */
export const NATIVE_ROUTE = {
  offer: '/v1/offer',
  beginActivation: '/v1/activation/begin',
  redeemActivation: '/v1/activation/redeem',
  license: '/v1/license',
  endSession: '/v1/session/end',
} as const;
export type NativeRoute = (typeof NATIVE_ROUTE)[keyof typeof NATIVE_ROUTE];

/** Responses of the native routes are small; the app reads at most this many bytes. */
export const NATIVE_MAX_RESPONSE_BYTES = 65_536 as const;

export interface NativeErrorBody {
  contractVersion: ContractVersion;
  error: { code: ErrorCode; message: string; retryAfterSeconds?: number };
  serverTime: number;
}

/** Public: the current offer, as the app shows it before sending the person to the checkout page. */
export interface OfferRequest {
  contractVersion: ContractVersion;
}
export interface OfferPrice extends Money {
  /** This currency can be bought now (its merchant configuration is set and sales are open). */
  available: boolean;
  /**
   * It is bought now on Toss's test keys: a test payment, nothing is charged (Toss's review before the launch, LAUNCH_AT).
   * Pages say so; the period it grants ends at the launch. False when the currency is not available.
   */
  test: boolean;
}
export interface PolicyVersions {
  terms: string;
  privacy: string;
  refunds: string;
}
export interface OfferResponse {
  contractVersion: ContractVersion;
  productID: ProductId;
  offerVersion: string;
  displayName: string;
  durationDays: number;
  durationSeconds: number;
  prices: OfferPrice[];
  salesOpen: boolean;
  policyVersions: PolicyVersions;
  serverTime: number;
}

/** Activation requests live this long (plan §8.1: a short TTL). */
export const ACTIVATION_TTL_SECONDS = 600 as const;
/** The app polls redemption at this interval at first, and backs off (×1.5, at most 30 s) after each pending answer. */
export const ACTIVATION_POLL_INTERVAL_SECONDS = 5 as const;
/** Confirmation codes: 8 characters from this alphabet (no 0/O, 1/I/L, U), shown as XXXX-XXXX. */
export const CONFIRMATION_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789' as const;

export function isConfirmationCode(value: unknown): value is string {
  return typeof value === 'string' && /^[ABCDEFGHJKMNPQRSTVWXYZ2-9]{4}-[ABCDEFGHJKMNPQRSTVWXYZ2-9]{4}$/.test(value);
}

/**
 * Starts a pairing (plan §8.1 step 1). Public and rate-limited. `challenge` is base64url(SHA-256(secret)) of a 32-byte
 * secret the app keeps; the secret itself is sent only to redeem.
 */
export interface BeginActivationRequest {
  contractVersion: ContractVersion;
  installationID: string;
  challenge: string;
  /** CFBundleShortVersionString (build), at most 32 characters, shown to the person approving. */
  appVersion: string;
  /** The page language the app opens. */
  lang: PageLang;
}
export interface BeginActivationResponse {
  contractVersion: ContractVersion;
  requestID: string;
  confirmationCode: string;
  /** The fixed activation page with only the request id, in the fragment: https://cultureand.tech/[ko/]apps/clean-space/activate/#request=… */
  activationURL: string;
  expiresAt: number;
  pollIntervalSeconds: number;
  serverTime: number;
}

/** The app redeems with the secret (step 4). Until the browser approves, the answer is `pending`. */
export interface RedeemActivationRequest {
  contractVersion: ContractVersion;
  requestID: string;
  installationID: string;
  secret: string;
}
export type RedeemActivationResponse =
  | { contractVersion: ContractVersion; status: 'pending'; pollIntervalSeconds: number; expiresAt: number; serverTime: number }
  | {
      contractVersion: ContractVersion;
      status: 'approved';
      /** A Firebase custom token, in this body only: the app exchanges it with Firebase Auth at once. */
      customToken: string;
      nativeSessionID: string;
      account: AccountSummary;
      serverTime: number;
    }
  | { contractVersion: ContractVersion; status: 'denied' | 'expired' | 'consumed'; serverTime: number };

/**
 * The installation's license (plan §8.2). Authorization: `Bearer <Firebase ID token>` minted from the custom token of
 * an approved activation (claims `cs: "native"`, `nsid`, `sgen`).
 */
export interface LicenseRequest {
  contractVersion: ContractVersion;
  installationID: string;
}
export interface LicenseResponse {
  contractVersion: ContractVersion;
  serverTime: number;
  account: AccountSummary;
  license: LicenseSummary;
  /** The account's current session generation; a lease with a lower one is stale. */
  sessionGeneration: number;
  /** A signed lease, only when `license.status` is `active`. */
  lease: string | null;
}

/** Signs this installation out at the service (its native session ends; nothing is refunded or deleted). */
export interface EndSessionRequest {
  contractVersion: ContractVersion;
  installationID: string;
}
export interface EndSessionResponse {
  contractVersion: ContractVersion;
  ended: true;
  serverTime: number;
}

/** The custom-token claims of a native session (Firebase copies them into its ID tokens). */
export const NATIVE_CLAIM = { channel: 'cs', channelValue: 'native', nativeSessionID: 'nsid', sessionGeneration: 'sgen' } as const;

// ---- Browser callables (Firebase callable functions of the Clean Space project; App Check where supported) ----

/**
 * The callables Clean Space's own pages call (account, sign-in, activation). The shared checkout's pages call
 * CHECKOUT_CALLABLE (below). createOrder and failOrder are no longer callables since the shared checkout took the
 * payment over (2026-11-09): they stay the service's own handlers, whose rules the checkout's callables share. A
 * refund is asked for by email (the account page opens a message with the order number): there is no refund callable.
 */
export const CALLABLE = {
  getOffer: 'getOffer',
  signInWithProvider: 'signInWithProvider',
  getAccount: 'getAccount',
  beginContactVerification: 'beginContactVerification',
  confirmContactVerification: 'confirmContactVerification',
  linkProvider: 'linkProvider',
  unlinkProvider: 'unlinkProvider',
  requestAccountDeletion: 'requestAccountDeletion',
  /** Begins a checkout on the shared checkout for the signed-in account (BeginCheckoutRequest). */
  beginCheckout: 'beginCheckout',
  /** Finishes a payment the shared checkout kept for its buyer (`{ resumeID }`, from preparePaymentResume's resumeId). */
  confirmPayment: 'confirmPayment',
  getAccountPurchases: 'getAccountPurchases',
  inspectActivation: 'inspectActivation',
  approveActivation: 'approveActivation',
  denyActivation: 'denyActivation',
  endNativeSessions: 'endNativeSessions',
} as const;
export type CallableName = (typeof CALLABLE)[keyof typeof CALLABLE];

/** Operator-only callables (custom claim `cleanSpaceOperator: true`, recent sign-in, audited; plan §7.3). */
export const OPERATOR_CALLABLE = {
  lookupOrder: 'operatorLookupOrder',
  refundOrder: 'operatorRefundOrder',
  reconcileOrder: 'operatorReconcileOrder',
} as const;

export type GetOfferRequest = Record<string, never>;
export type GetOfferResponse = Omit<OfferResponse, 'contractVersion'> & { contractVersion: ContractVersion };

/**
 * Where a page goes after a sign-in or a payment: an allow-listed page in one language, never an arbitrary URL
 * (plan §5.1). The activation page keeps its request id in the tab's sessionStorage, not in a return target.
 */
export const RETURN_ROUTES = ['checkout', 'account', 'activate'] as const;
export type ReturnRoute = (typeof RETURN_ROUTES)[number];
export interface ReturnTarget {
  route: ReturnRoute;
  lang: PageLang;
}

/** The exact path of each page (trailing slash included), English and Korean. */
export const PAGE_PATH: Readonly<Record<ReturnRoute | 'callback' | 'success' | 'fail' | 'product', Readonly<Record<PageLang, string>>>> = {
  product: { en: '/apps/clean-space/', ko: '/ko/apps/clean-space/' },
  checkout: { en: '/checkout/clean-space/', ko: '/ko/checkout/clean-space/' },
  success: { en: '/checkout/clean-space/success/', ko: '/ko/checkout/clean-space/success/' },
  fail: { en: '/checkout/clean-space/fail/', ko: '/ko/checkout/clean-space/fail/' },
  account: { en: '/apps/clean-space/account/', ko: '/ko/apps/clean-space/account/' },
  callback: { en: '/apps/clean-space/auth/callback/', ko: '/ko/apps/clean-space/auth/callback/' },
  activate: { en: '/apps/clean-space/activate/', ko: '/ko/apps/clean-space/activate/' },
};

/** sign in (or sign up), add a provider to the signed-in account, or prove the account again. */
export type SignInIntent = 'signin' | 'link' | 'reauth';

/**
 * Kakao or Naver: the browser sends the code it got back with the state it made; the service exchanges the code with
 * the provider and returns a custom token for the verified identity, never a license (plan §5.2).
 */
export interface SignInWithProviderRequest {
  provider: BrokeredProvider;
  code: string;
  /** The exact redirect URI the browser used (one of the registered callback pages). */
  redirectUri: string;
  /** The state the browser made and checked (Naver requires it in the token request). */
  state: string;
  intent: SignInIntent;
}
export interface SignInWithProviderResponse {
  /** For `signin` and `reauth`: sign the browser in with it. Absent for `link` (the provider was added server-side). */
  customToken?: string;
  account: AccountSummary;
  /** True when this sign-in made a new account. */
  created: boolean;
}

/** Google: link the Google account the browser just proved (a fresh Google ID token from Firebase Auth's popup). */
export interface LinkProviderRequest {
  provider: 'google';
  googleIdToken: string;
}
export interface LinkProviderResponse {
  account: AccountSummary;
}

export interface UnlinkProviderRequest {
  provider: Provider;
}
export interface UnlinkProviderResponse {
  account: AccountSummary;
}

export type GetAccountRequest = Record<string, never>;
export interface GetAccountResponse {
  account: AccountSummary;
  license: LicenseSummary;
  /** Present while the account is being deleted. */
  deletionRequestedAt: number | null;
  /** The policy versions this account last accepted at checkout, if any. */
  acceptedPolicies: PolicyVersions | null;
  /** Installations signed in with this account (no hardware details; the app version and when it was approved). */
  nativeSessions: Array<{ nativeSessionID: string; appVersion: string; approvedAt: number; lastSeenAt: number | null }>;
  serverTime: number;
}

/** Contact verification codes: 6 digits, 15 minutes, 5 attempts, one at a time per account. */
export const CONTACT_CODE_TTL_SECONDS = 900 as const;
export const CONTACT_CODE_MAX_ATTEMPTS = 5 as const;
export interface BeginContactVerificationRequest {
  email: string;
  lang: PageLang;
}
export interface BeginContactVerificationResponse {
  pendingID: string;
  expiresAt: number;
}
export interface ConfirmContactVerificationRequest {
  pendingID: string;
  code: string;
}
export interface ConfirmContactVerificationResponse {
  account: AccountSummary;
}

/** Deletion is not a refund; the page says so before it asks (plan §6.3). */
export interface RequestAccountDeletionRequest {
  confirm: true;
}
export interface RequestAccountDeletionResponse {
  deletionRequestedAt: number;
}

/** Ends every native session of the account (each app returns to Free at its next check; nothing is refunded). */
export type EndNativeSessionsRequest = Record<string, never>;
export interface EndNativeSessionsResponse {
  ended: number;
}

/**
 * The service's own order handlers (createOrder, failOrder): not callables since the shared checkout (see CALLABLE);
 * createCheckoutOrder and failCheckoutOrder act with their rules for a checkout's account.
 */
export interface CreateOrderRequest {
  productID: ProductId;
  offerVersion: string;
  currency: Currency;
  /** The versions the page showed and the buyer accepted. Anything but the current ones is OFFER_CHANGED. */
  acceptedPolicies: PolicyVersions;
  /** ISO 3166-1 alpha-2, which PayPal requires for USD; the buyer chooses it (language says nothing about residence). */
  buyerCountry: string | null;
  lang: PageLang;
}
export interface CreateOrderResponse {
  orderID: string;
  money: Money;
  orderName: string;
  /** Random, opaque Toss customerKey of this account (never its email or uid). */
  customerKey: string;
  /** The verified contact frozen on the order (the receipt address). */
  receiptEmail: string;
  /** The order can be paid until then (seconds). */
  payableUntil: number;
  /** What the page renders: the currency's own client key and widget variant from the service, so test and live never mix. */
  toss: { clientKey: string; variantKey: string | null; environment: 'test' | 'live' };
  durationDays: number;
  serverTime: number;
}

/**
 * Toss's success redirect parameters (`amount` as Toss wrote it), or the handle preparePaymentResume gave for them
 * (its `resumeId`, sent here as `resumeID`): the account page finishes a payment the shared checkout kept.
 */
export type ConfirmPaymentRequest =
  | { orderID: string; paymentKey: string; amount: number }
  | { resumeID: string };
export interface ConfirmPaymentResponse {
  orderID: string;
  status: 'paid';
  money: Money;
  approvedAt: number;
  license: LicenseSummary;
  /** Toss's receipt page; null is a normal outcome (PayPal often has none). Never made up. */
  receiptURL: string | null;
  serverTime: number;
}

export interface FailOrderRequest {
  orderID: string;
  code: string;
  message: string;
}
export interface FailOrderResponse {
  orderID: string;
  status: 'failed';
}

export const PURCHASE_STATUSES = ['paid', 'partially_refunded', 'refunded', 'pending', 'failed', 'canceled'] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export interface PurchaseRecord {
  orderID: string;
  productID: ProductId;
  offerVersion: string;
  money: Money;
  status: PurchaseStatus;
  createdAt: number;
  approvedAt: number | null;
  startsAt: number | null;
  expiresAt: number | null;
  refundedAmountMinor: number;
  receiptURL: string | null;
  /** Toss's method label as reported ("카드", "해외간편결제"…), or null. */
  method: string | null;
}
export type GetAccountPurchasesRequest = Record<string, never>;
export interface GetAccountPurchasesResponse {
  purchases: PurchaseRecord[];
  serverTime: number;
}

export interface InspectActivationRequest {
  requestID: string;
}
export interface InspectActivationResponse {
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'consumed';
  confirmationCode: string;
  appVersion: string;
  createdAt: number;
  expiresAt: number;
  serverTime: number;
}

/** The browser approves with the code it displayed, so an approval names exactly the request the person compared. */
export interface ApproveActivationRequest {
  requestID: string;
  confirmationCode: string;
}
export interface ApproveActivationResponse {
  status: 'approved';
  account: AccountSummary;
  expiresAt: number;
}
export interface DenyActivationRequest {
  requestID: string;
}
export interface DenyActivationResponse {
  status: 'denied';
}

// ---- Request parsers shared by the native routes and the callables (plan §5.2: one validation) ----

export type Parsed<T> = { ok: true; value: T } | { ok: false; code: ErrorCode; message: string };

const invalid = (message: string): { ok: false; code: ErrorCode; message: string } => ({ ok: false, code: ERROR_CODE.invalidRequest, message });

function exactKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((k) => allowed.includes(k));
}

function contractOk(value: Record<string, unknown>): Parsed<null> {
  if (value.contractVersion !== CONTRACT_VERSION) return { ok: false, code: ERROR_CODE.unsupportedContract, message: 'This version of Clean Space is not supported. Download the current version.' };
  return { ok: true, value: null };
}

export function parseBeginActivation(value: unknown): Parsed<BeginActivationRequest> {
  if (!isRecord(value) || !exactKeys(value, ['contractVersion', 'installationID', 'challenge', 'appVersion', 'lang'])) return invalid('Unexpected request.');
  const c = contractOk(value);
  if (!c.ok) return c;
  if (!isId22(value.installationID)) return invalid('Bad installation id.');
  if (!isId43(value.challenge)) return invalid('Bad challenge.');
  if (typeof value.appVersion !== 'string' || !/^[0-9A-Za-z .()_-]{1,32}$/.test(value.appVersion)) return invalid('Bad app version.');
  if (value.lang !== 'en' && value.lang !== 'ko') return invalid('Bad language.');
  return { ok: true, value: { contractVersion: CONTRACT_VERSION, installationID: value.installationID, challenge: value.challenge, appVersion: value.appVersion, lang: value.lang } };
}

export function parseRedeemActivation(value: unknown): Parsed<RedeemActivationRequest> {
  if (!isRecord(value) || !exactKeys(value, ['contractVersion', 'requestID', 'installationID', 'secret'])) return invalid('Unexpected request.');
  const c = contractOk(value);
  if (!c.ok) return c;
  if (!isId43(value.requestID)) return invalid('Bad request id.');
  if (!isId22(value.installationID)) return invalid('Bad installation id.');
  if (!isId43(value.secret)) return invalid('Bad secret.');
  return { ok: true, value: { contractVersion: CONTRACT_VERSION, requestID: value.requestID, installationID: value.installationID, secret: value.secret } };
}

export function parseInstallationRequest(value: unknown): Parsed<LicenseRequest> {
  if (!isRecord(value) || !exactKeys(value, ['contractVersion', 'installationID'])) return invalid('Unexpected request.');
  const c = contractOk(value);
  if (!c.ok) return c;
  if (!isId22(value.installationID)) return invalid('Bad installation id.');
  return { ok: true, value: { contractVersion: CONTRACT_VERSION, installationID: value.installationID } };
}

export function parseOfferRequest(value: unknown): Parsed<OfferRequest> {
  if (!isRecord(value) || !exactKeys(value, ['contractVersion'])) return invalid('Unexpected request.');
  const c = contractOk(value);
  if (!c.ok) return c;
  return { ok: true, value: { contractVersion: CONTRACT_VERSION } };
}

function isPolicyVersions(value: unknown): value is PolicyVersions {
  return isRecord(value) && exactKeys(value, ['terms', 'privacy', 'refunds'])
    && [value.terms, value.privacy, value.refunds].every((v) => typeof v === 'string' && /^[0-9A-Za-z._-]{1,40}$/.test(v));
}

export function parseCreateOrder(value: unknown): Parsed<CreateOrderRequest> {
  if (!isRecord(value) || !exactKeys(value, ['productID', 'offerVersion', 'currency', 'acceptedPolicies', 'buyerCountry', 'lang'])) return invalid('Unexpected request.');
  if (value.productID !== PRODUCT_ID) return invalid('Unknown product.');
  if (typeof value.offerVersion !== 'string' || value.offerVersion.length > 64) return invalid('Bad offer version.');
  if (!isCurrency(value.currency)) return invalid('Unknown currency.');
  if (!isPolicyVersions(value.acceptedPolicies)) return { ok: false, code: ERROR_CODE.policiesNotAccepted, message: 'Accept the terms, privacy policy and refund policy first.' };
  const country = value.buyerCountry;
  if (country !== null && (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country))) return invalid('Bad country.');
  if (value.currency === 'USD' && country === null) return { ok: false, code: ERROR_CODE.buyerCountryRequired, message: 'Choose your country to pay in US dollars.' };
  if (value.lang !== 'en' && value.lang !== 'ko') return invalid('Bad language.');
  return { ok: true, value: { productID: PRODUCT_ID, offerVersion: value.offerVersion, currency: value.currency, acceptedPolicies: value.acceptedPolicies, buyerCountry: country as string | null, lang: value.lang } };
}

/** Toss payment keys are opaque; bounded and printable. */
export function isPaymentKey(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{8,200}$/.test(value);
}

/** Order ids: `cs_` and 22 base64url characters (Toss allows 6–64 of [A-Za-z0-9_-]). */
export function isOrderID(value: unknown): value is string {
  return typeof value === 'string' && /^cs_[A-Za-z0-9_-]{22}$/.test(value);
}

export function parseConfirmPayment(value: unknown): Parsed<ConfirmPaymentRequest> {
  if (!isRecord(value)) return invalid('Unexpected request.');
  if ('resumeID' in value) {
    if (!exactKeys(value, ['resumeID']) || !isId43(value.resumeID)) return invalid('Bad resume id.');
    return { ok: true, value: { resumeID: value.resumeID } };
  }
  if (!exactKeys(value, ['orderID', 'paymentKey', 'amount'])) return invalid('Unexpected request.');
  if (!isOrderID(value.orderID)) return invalid('Bad order id.');
  if (!isPaymentKey(value.paymentKey)) return invalid('Bad payment key.');
  if (typeof value.amount !== 'number' || !Number.isFinite(value.amount) || value.amount <= 0) return invalid('Bad amount.');
  return { ok: true, value: { orderID: value.orderID, paymentKey: value.paymentKey, amount: value.amount } };
}

export function parseFailOrder(value: unknown): Parsed<FailOrderRequest> {
  if (!isRecord(value) || !exactKeys(value, ['orderID', 'code', 'message'])) return invalid('Unexpected request.');
  if (!isOrderID(value.orderID)) return invalid('Bad order id.');
  if (typeof value.code !== 'string' || !/^[A-Z0-9_]{1,64}$/.test(value.code)) return invalid('Bad code.');
  if (typeof value.message !== 'string' || value.message.length > 500) return invalid('Bad message.');
  return { ok: true, value: { orderID: value.orderID, code: value.code, message: value.message } };
}

export function parseActivationLookup(value: unknown): Parsed<InspectActivationRequest> {
  if (!isRecord(value) || !exactKeys(value, ['requestID']) || !isId43(value.requestID)) return invalid('Bad request id.');
  return { ok: true, value: { requestID: value.requestID } };
}

export function parseApproveActivation(value: unknown): Parsed<ApproveActivationRequest> {
  if (!isRecord(value) || !exactKeys(value, ['requestID', 'confirmationCode'])) return invalid('Unexpected request.');
  if (!isId43(value.requestID)) return invalid('Bad request id.');
  if (!isConfirmationCode(value.confirmationCode)) return invalid('Bad confirmation code.');
  return { ok: true, value: { requestID: value.requestID, confirmationCode: value.confirmationCode } };
}

/** A pragmatic address check (one @, a dot in the domain, no spaces, at most 254 characters); delivery proves it. */
export function isEmailAddress(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function parseBeginContactVerification(value: unknown): Parsed<BeginContactVerificationRequest> {
  if (!isRecord(value) || !exactKeys(value, ['email', 'lang'])) return invalid('Unexpected request.');
  if (!isEmailAddress(value.email)) return invalid('Enter a valid email address.');
  if (value.lang !== 'en' && value.lang !== 'ko') return invalid('Bad language.');
  return { ok: true, value: { email: value.email.trim(), lang: value.lang } };
}

export function parseConfirmContactVerification(value: unknown): Parsed<ConfirmContactVerificationRequest> {
  if (!isRecord(value) || !exactKeys(value, ['pendingID', 'code'])) return invalid('Unexpected request.');
  if (!isId22(value.pendingID)) return invalid('Bad pending id.');
  if (typeof value.code !== 'string' || !/^\d{6}$/.test(value.code)) return { ok: false, code: ERROR_CODE.contactCodeInvalid, message: 'Enter the 6-digit code from the email.' };
  return { ok: true, value: { pendingID: value.pendingID, code: value.code } };
}

// ---- Shared checkout (cultureand.tech) ----
//
// Culture & Tech's shared checkout sells every product with one implementation of the pages (culture-and-tech-homepage:
// src/components/checkout/, src/lib/checkout/; its README, "The central checkout"): /checkout/clean-space/ (Korean
// /ko/checkout/clean-space/) with success/ and fail/. The pages call the callables below with that site's fixed
// contract, its src/lib/checkout/contract.ts: the names, shapes and APP_ERROR codes there are the authority. This
// section mirrors them (narrower where this service always gives a value); change the two together.
//
// The pages carry no Firebase sign-in. Clean Space's account page, signed in, begins a checkout (beginCheckout, a
// CALLABLE) and sends the tab to the checkout page with a one-time handoff code after `#`; the page binds a random key
// of its own to the checkout with it (openCheckout), and from then on the checkout's id and key stand for the account.
// A payment that comes back to a tab without its checkout is kept for its buyer (preparePaymentResume), who finishes
// it signed in on the account page (confirmPayment with `resumeID`).

/** The callables the shared checkout's pages call. */
export const CHECKOUT_CALLABLE = {
  openCheckout: 'openCheckout',
  createCheckoutOrder: 'createCheckoutOrder',
  confirmCheckoutPayment: 'confirmCheckoutPayment',
  failCheckoutOrder: 'failCheckoutOrder',
  preparePaymentResume: 'preparePaymentResume',
} as const;
export type CheckoutCallableName = (typeof CHECKOUT_CALLABLE)[keyof typeof CHECKOUT_CALLABLE];

/**
 * The shared checkout's APP_ERROR codes this service answers its pages with, for the same cases. `alreadyOwned` is the
 * code the pages' product entry for Clean Space names as `alreadyOwnedCode`: a term of the 364 days Unlock hasn't
 * ended (no stacking). Other cases come with a code of ERROR_CODE and a message the pages show; a refusal by Toss
 * Payments comes with Toss's own code and message, as that contract has it.
 */
export const CHECKOUT_ERROR = {
  termsNotAccepted: ERROR_CODE.termsNotAccepted,
  ageNotConfirmed: ERROR_CODE.ageNotConfirmed,
  alreadyOwned: ERROR_CODE.alreadyActive,
  salesClosed: ERROR_CODE.salesClosed,
  offerChanged: ERROR_CODE.offerChanged,
  currencyUnavailable: ERROR_CODE.currencyUnavailable,
  amountMismatch: ERROR_CODE.amountMismatch,
  notOrderOwner: ERROR_CODE.notOrderOwner,
  orderNotPayable: ERROR_CODE.orderNotPayable,
  checkoutInProgress: ERROR_CODE.checkoutInProgress,
  accountDeleted: ERROR_CODE.accountDeleted,
  accountUnavailable: ERROR_CODE.accountUnavailable,
  emailNotConfirmed: ERROR_CODE.emailNotConfirmed,
  tooManyRequests: ERROR_CODE.tooManyRequests,
  paymentResumeExpired: ERROR_CODE.paymentResumeExpired,
  checkoutExpired: ERROR_CODE.checkoutExpired,
} as const;

/** The handoff binds a key within this time: the checkout page opens it as soon as it loads. */
export const CHECKOUT_CODE_TTL_SECONDS = 180 as const;
/** A checkout ends this long after it began: time to read, agree, pay at Toss (PayPal's pages too) and come back. */
export const CHECKOUT_SESSION_TTL_SECONDS = 3600 as const;
/** Usable checkouts one account may hold at once (each press of the account page's button begins one). */
export const CHECKOUTS_PER_ACCOUNT = 10 as const;

/** Clean Space's account page, signed in with one of the service's session kinds: a checkout in the page's language. */
export interface BeginCheckoutRequest {
  lang: PageLang;
}
export interface BeginCheckoutResponse {
  /** https://cultureand.tech[/ko]/checkout/clean-space/#handoff=<checkoutId>.<code>: browsers send no `#…` to servers. */
  checkoutUrl: string;
  /** ISO 8601: the handoff must be opened before this. */
  openBefore: string;
}

/** How the checkout page holds its checkout: the id from the handoff (16 random bytes) and the key it made (32). */
export interface CheckoutCredential {
  checkoutId: string;
  checkoutKey: string;
}

/** The first open brings the handoff code, which binds the key to the checkout; later opens (a reload) the key alone. */
export interface OpenCheckoutRequest extends CheckoutCredential {
  handoffCode?: string;
}

/** A currency the checkout takes, and the Toss 결제위젯 of the MID that charges it. */
export interface CheckoutOption {
  currency: Currency;
  /** The server's price in Toss's units (3300, 2.49), which an order charges. */
  price: number;
  clientKey: string;
  variantKey: string;
  agreementVariantKey: string;
  /** The PayPal TEST checkout: US dollars on Toss's test keys, PayPal Sandbox accounts. */
  test: boolean;
}

/** What the page sends back with its order: exactly what openCheckout gave it (anything else is OFFER_CHANGED). */
export interface OfferVersions {
  productVersion?: string;
  termsVersion?: string;
  refundPolicyVersion?: string;
}

export interface OpenCheckoutResponse extends OfferVersions {
  product: ProductId;
  lang: PageLang;
  orderName: string;
  /** The account's verified contact: the receipt address of an order made now. */
  receiptEmail: string;
  /** The currencies of the checkout's language on sale now, won first (Korean: won only). */
  options: CheckoutOption[];
  /** DURATION_DAYS: the page states the period in fixed words and takes no payment when this says otherwise. */
  passDays: number;
  /** OFFER_VERSION and the terms and refund policy in force: this service always gives them. */
  productVersion: string;
  termsVersion: string;
  refundPolicyVersion: string;
  /** ISO 8601: the checkout ends. */
  expiresAt: string;
}

export interface CreateCheckoutOrderRequest extends CheckoutCredential, OfferVersions {
  /** The terms and the refund policy of the versions sent (one tick on the page). */
  termsAccepted: true;
  ageConfirmed: true;
  currency: Currency;
}
export interface CreateCheckoutOrderResponse {
  orderId: string;
  /** In `currency`, Toss's units; always the server's price. */
  amount: number;
  currency: Currency;
  orderName: string;
  /** Random, opaque Toss customerKey of the account. */
  customerKey: string;
  /** The verified contact frozen on the order: Toss sends the receipt there. */
  receiptEmail: string;
}

/** The query parameters Toss appends to the successUrl (`amount` as a number). */
export interface PaymentDetails {
  paymentKey: string;
  orderId: string;
  amount: number;
}
export type ConfirmCheckoutPaymentRequest = CheckoutCredential & PaymentDetails;
export interface ConfirmCheckoutPaymentResponse {
  orderId: string;
  status: 'PAID';
  /** Toss's method label as recorded ("카드", "해외간편결제"), or null. */
  method: string | null;
  /** Not recorded by this service, so never given. */
  provider?: string | null;
  currency?: Currency;
  /** ISO 8601: Toss's verified approval, where the term starts. */
  approvedAt: string;
  /** Toss's receipt page; null is normal (PayPal often has none). */
  receiptUrl: string | null;
  receiptEmail: string | null;
  /** The term: its start and exclusive end, ISO 8601 instants. */
  pass?: { start: string; end: string };
}

export interface FailCheckoutOrderRequest extends CheckoutCredential {
  orderId: string;
  code: string;
  message: string;
}
export interface FailCheckoutOrderResponse {
  orderId: string;
  status: 'FAILED';
}

/**
 * The success page no longer holds its checkout: it keeps Toss's parameters on the service under an opaque handle that
 * only the order's buyer can redeem (confirmPayment with `resumeID`, signed in), and learns nothing about the payment or
 * its owner. Needs no checkout and no sign-in.
 */
export type PreparePaymentResumeRequest = PaymentDetails;
export interface PreparePaymentResumeResponse {
  resumeId: string;
}

const isOfferVersion = (value: unknown): boolean => value === undefined || (typeof value === 'string' && /^[0-9A-Za-z._-]{1,64}$/.test(value));

function parseCredential(value: Record<string, unknown>): Parsed<CheckoutCredential> {
  if (!isId22(value.checkoutId)) return invalid('Bad checkout id.');
  if (!isId43(value.checkoutKey)) return invalid('Bad checkout key.');
  return { ok: true, value: { checkoutId: value.checkoutId, checkoutKey: value.checkoutKey } };
}

function parsePaymentDetails(value: Record<string, unknown>): Parsed<PaymentDetails> {
  if (!isOrderID(value.orderId)) return invalid('Bad order id.');
  if (!isPaymentKey(value.paymentKey)) return invalid('Bad payment key.');
  if (typeof value.amount !== 'number' || !Number.isFinite(value.amount) || value.amount <= 0) return invalid('Bad amount.');
  return { ok: true, value: { paymentKey: value.paymentKey, orderId: value.orderId, amount: value.amount } };
}

export function parseBeginCheckout(value: unknown): Parsed<BeginCheckoutRequest> {
  if (!isRecord(value) || !exactKeys(value, ['lang'])) return invalid('Unexpected request.');
  if (value.lang !== 'en' && value.lang !== 'ko') return invalid('Bad language.');
  return { ok: true, value: { lang: value.lang } };
}

export function parseOpenCheckout(value: unknown): Parsed<OpenCheckoutRequest> {
  if (!isRecord(value) || !exactKeys(value, ['checkoutId', 'checkoutKey', 'handoffCode'])) return invalid('Unexpected request.');
  const credential = parseCredential(value);
  if (credential.ok === false) return credential;
  if (value.handoffCode === undefined) return credential;
  if (!isId43(value.handoffCode)) return invalid('Bad handoff code.');
  return { ok: true, value: { ...credential.value, handoffCode: value.handoffCode } };
}

export function parseCreateCheckoutOrder(value: unknown): Parsed<CreateCheckoutOrderRequest> {
  const keys = ['checkoutId', 'checkoutKey', 'termsAccepted', 'ageConfirmed', 'currency', 'productVersion', 'termsVersion', 'refundPolicyVersion'];
  if (!isRecord(value) || !exactKeys(value, keys)) return invalid('Unexpected request.');
  const credential = parseCredential(value);
  if (credential.ok === false) return credential;
  if (value.termsAccepted !== true) return { ok: false, code: ERROR_CODE.termsNotAccepted, message: 'Agree to the terms and the refund policy first.' };
  if (value.ageConfirmed !== true) return { ok: false, code: ERROR_CODE.ageNotConfirmed, message: 'Confirm your age first.' };
  if (!isCurrency(value.currency)) return invalid('Unknown currency.');
  if (!isOfferVersion(value.productVersion) || !isOfferVersion(value.termsVersion) || !isOfferVersion(value.refundPolicyVersion)) return invalid('Bad version.');
  const versions: OfferVersions = {};
  if (typeof value.productVersion === 'string') versions.productVersion = value.productVersion;
  if (typeof value.termsVersion === 'string') versions.termsVersion = value.termsVersion;
  if (typeof value.refundPolicyVersion === 'string') versions.refundPolicyVersion = value.refundPolicyVersion;
  return { ok: true, value: { ...credential.value, ...versions, termsAccepted: true, ageConfirmed: true, currency: value.currency } };
}

export function parseConfirmCheckoutPayment(value: unknown): Parsed<ConfirmCheckoutPaymentRequest> {
  if (!isRecord(value) || !exactKeys(value, ['checkoutId', 'checkoutKey', 'paymentKey', 'orderId', 'amount'])) return invalid('Unexpected request.');
  const credential = parseCredential(value);
  if (credential.ok === false) return credential;
  const details = parsePaymentDetails(value);
  if (details.ok === false) return details;
  return { ok: true, value: { ...credential.value, ...details.value } };
}

export function parseFailCheckoutOrder(value: unknown): Parsed<FailCheckoutOrderRequest> {
  if (!isRecord(value) || !exactKeys(value, ['checkoutId', 'checkoutKey', 'orderId', 'code', 'message'])) return invalid('Unexpected request.');
  const credential = parseCredential(value);
  if (credential.ok === false) return credential;
  if (!isOrderID(value.orderId)) return invalid('Bad order id.');
  if (typeof value.code !== 'string' || !/^[A-Z0-9_]{1,64}$/.test(value.code)) return invalid('Bad code.');
  if (typeof value.message !== 'string' || value.message.length > 500) return invalid('Bad message.');
  return { ok: true, value: { ...credential.value, orderId: value.orderId, code: value.code, message: value.message } };
}

export function parsePreparePaymentResume(value: unknown): Parsed<PreparePaymentResumeRequest> {
  if (!isRecord(value) || !exactKeys(value, ['paymentKey', 'orderId', 'amount'])) return invalid('Unexpected request.');
  return parsePaymentDetails(value);
}
