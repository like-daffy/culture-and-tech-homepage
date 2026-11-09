import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CHECKOUT_COPY, fill } from "@/lib/checkout/copy";
import { describeError } from "@/lib/clean-space/api";
import {
  brokeredProvidersHere,
  firebaseErrorCode,
  linkGoogle,
  POPUP_DISMISSED,
  reauthenticateWithGoogle,
  signedInRecently,
  signOutCleanSpace,
  startBrokeredSignIn,
  unlinkGoogleHere,
  type CleanSpaceUser,
} from "@/lib/clean-space/auth";
import {
  checkoutAddress,
  forgetResume,
  keepsResume,
  mailtoLink,
  parseResumeId,
  purchaseRefusal,
  recallResume,
  rememberResume,
  resumeRefusal,
  testCurrencies,
  type ResumeRefusal,
} from "@/lib/clean-space/checkout-handoff";
import { CLEAN_SPACE, SUPPORT_EMAIL } from "@/lib/clean-space/config";
import { ACCOUNT_LANG, COPY, PURCHASE_COPY, PURCHASE_LANG } from "@/lib/clean-space/copy";
import type {
  ConfirmPaymentResponse,
  GetAccountResponse,
  GetOfferResponse,
  PageLang,
  Provider,
  PurchaseRecord,
} from "@/lib/clean-space/contract.generated";
import { formatInstant, formatPrice, paymentMethodLabel } from "@/lib/clean-space/display";
import { cleanSpaceApi } from "@/lib/clean-space/firebase";
import { ProviderSignInError } from "@/lib/clean-space/oauth";
import { DIRECT_SALE_POLICY_PATHS } from "@/lib/clean-space/site";
import { sessionStore } from "@/lib/clean-space/storage";
import { ContactVerification } from "./ContactVerification";
import { useCleanSpaceUser, useLoad, useQueryOnce, useSessionGuard } from "./hooks";
import { Notice, PageTitle, Section, SensitiveLayout } from "./SensitiveLayout";
import { SignInPanel } from "./SignInPanel";
import { signInFailureMessage } from "./AuthCallbackPage";

const ALL_PROVIDERS: Provider[] = ["google", "kakao", "naver"];

/** Only an https page (Toss's receipt) is linked; an emulator build's fake Toss serves its receipts over http. */
const safeReceipt = (url: string | null): string | null =>
  url && (/^https:\/\//.test(url) || (CLEAN_SPACE.environment === "emulator" && /^http:\/\//.test(url))) ? url : null;

/**
 * /apps/clean-space/account/: the account, the 364 days Unlock (its access period, and the purchase, which continues on
 * the central checkout), its purchases and their refund requests, sign-in methods and contact email, the Macs signed in,
 * sign-out and deletion (plan §6, §9). Every change needs the signed-in session, and changing sign-in methods or
 * deleting needs a recent sign-in. A payment the checkout kept for its buyer comes back here as `?resume=<id>` and is
 * finished once that buyer is signed in.
 */
export function AccountPage({ lang }: { lang: PageLang }) {
  const copy = COPY[lang];
  const purchaseCopy = PURCHASE_COPY[lang];
  const userState = useCleanSpaceUser();
  const user = userState.status === "signed-in" ? userState.user : null;
  const currentSession = useSessionGuard(user);
  const [account, reloadAccount] = useLoad(user ? user.sessionKey : null, () => cleanSpaceApi.getAccount());
  const [purchases, reloadPurchases] = useLoad(user ? user.sessionKey : null, () => cleanSpaceApi.getAccountPurchases());
  const onPaid = useCallback(() => {
    reloadAccount();
    reloadPurchases();
  }, [reloadAccount, reloadPurchases]);
  const { resume, retryResume } = useResumedPayment(user, currentSession, onPaid);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "info" | "error" | "success"; text: string } | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [changingContact, setChangingContact] = useState(false);

  /** Runs an account change under this session; an answer for another session is dropped. */
  const run = async (name: string, action: () => Promise<string | null>) => {
    if (busy || !user) return;
    const session = user.sessionKey;
    setBusy(name);
    setMessage(null);
    try {
      const done = await action();
      if (currentSession() !== session) return setMessage({ tone: "error", text: copy.accountChanged });
      if (done) setMessage({ tone: "success", text: done });
      reloadAccount();
    } catch (error) {
      const code = firebaseErrorCode(error);
      if (POPUP_DISMISSED.has(code ?? "")) return;
      const info = describeError(error);
      if (info.code === "RECENT_SIGN_IN_REQUIRED" || code === "auth/requires-recent-login") {
        setNeedsReauth(true);
        return setMessage({ tone: "info", text: copy.recentSignInNeeded });
      }
      setMessage({ tone: "error", text: error instanceof ProviderSignInError ? signInFailureMessage(error, copy) : info.message });
    } finally {
      setBusy(null);
    }
  };

  const ensureRecent = (): boolean => {
    if (user && signedInRecently(user) && !needsReauth) return true;
    setNeedsReauth(true);
    setMessage({ tone: "info", text: copy.recentSignInNeeded });
    return false;
  };

  const reauth = (summary: GetAccountResponse) =>
    run("reauth", async () => {
      const linked = summary.account.providers;
      if (linked.includes("google") && user?.googleLinked) {
        await reauthenticateWithGoogle();
        setNeedsReauth(false);
        return null;
      }
      const brokered = brokeredProvidersHere().find((provider) => linked.includes(provider));
      if (!brokered) throw new ProviderSignInError("unavailable");
      await startBrokeredSignIn(brokered, { returnTo: { route: "account", lang }, intent: "reauth" });
      return null;
    });

  const link = (provider: Provider) => {
    if (!ensureRecent()) return;
    void run(`link-${provider}`, async () => {
      if (provider === "google") {
        await linkGoogle(cleanSpaceApi);
        return null;
      }
      await startBrokeredSignIn(provider, { returnTo: { route: "account", lang }, intent: "link" });
      return null;
    });
  };

  const unlink = (provider: Provider) => {
    if (!ensureRecent()) return;
    void run(`unlink-${provider}`, async () => {
      await cleanSpaceApi.unlinkProvider({ provider });
      if (provider === "google") await unlinkGoogleHere();
      return null;
    });
  };

  const deleteAccount = () => {
    if (!ensureRecent()) return;
    void run("delete", async () => {
      const result = await cleanSpaceApi.requestAccountDeletion({ confirm: true });
      await signOutCleanSpace();
      return copy.deleteRequested(formatInstant(result.deletionRequestedAt, lang));
    });
  };

  const resumeNotice = <ResumeNotice lang={lang} resume={resume} signedIn={user !== null} onRetry={retryResume} />;

  const body = (() => {
    if (userState.status === "unconfigured") return <Notice>{copy.notConfigured}</Notice>;
    if (userState.status === "loading") return <p className="text-muted-foreground">{copy.loading}</p>;
    if (!user)
      return (
        <div className="space-y-6">
          {resumeNotice}
          <SignInPanel lang={lang} returnTo={{ route: "account", lang }} />
        </div>
      );
    if (!account || account.status === "loading") return <p className="text-muted-foreground">{copy.loading}</p>;
    if (account.status === "error")
      return (
        <div className="space-y-4">
          <Notice tone="error">{account.error.message}</Notice>
          <Button variant="outline" onClick={reloadAccount}>
            {copy.tryAgain}
          </Button>
        </div>
      );
    const summary = account.value;
    const linked = summary.account.providers;
    const offered = (provider: Provider) => provider === "google" || brokeredProvidersHere().includes(provider);
    const deleting = summary.deletionRequestedAt !== null;
    return (
      <div className="space-y-6">
        <p className="text-sm">{copy.signedInAs(summary.account.displayLabel ?? user.email ?? copy.thisAccount)}</p>
        {deleting && <Notice>{copy.deleteRequested(formatInstant(summary.deletionRequestedAt as number, lang))}</Notice>}

        {resumeNotice}

        <PurchaseSection
          lang={lang}
          summary={summary}
          user={user}
          currentSession={currentSession}
          onRefused={reloadAccount}
        />

        <Section title={copy.methodsHeading}>
          {needsReauth && (
            <div className="mb-4 space-y-3">
              <Notice>{copy.recentSignInNeeded}</Notice>
              <Button variant="outline" onClick={() => void reauth(summary)} disabled={busy !== null}>
                {copy.signInAgain}
              </Button>
            </div>
          )}
          <ul className="divide-y divide-border">
            {ALL_PROVIDERS.filter((provider) => linked.includes(provider) || offered(provider)).map((provider) => {
              const isLinked = linked.includes(provider);
              const last = isLinked && linked.length <= 1;
              return (
                <li key={provider} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span className="font-medium">
                    {copy.providerNames[provider]}
                    {isLinked && <span className="ml-2 text-xs text-muted-foreground">{copy.linkedLabel}</span>}
                  </span>
                  {isLinked ? (
                    <span className="flex flex-col items-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => unlink(provider)} disabled={busy !== null || last || deleting}>
                        {copy.removeMethod}
                      </Button>
                      {last && <span className="text-xs text-muted-foreground">{copy.lastMethod}</span>}
                    </span>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => link(provider)} disabled={busy !== null || deleting}>
                      {copy.linkMethod(copy.providerNames[provider])}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>

        {summary.account.contact && !changingContact ? (
          <Section title={copy.contactHeading}>
            <p className="text-sm">{copy.contactConfirmed(summary.account.contact.email)}</p>
            <Button size="sm" variant="ghost" className="mt-2" onClick={() => setChangingContact(true)} disabled={deleting}>
              {copy.contactChange}
            </Button>
          </Section>
        ) : (
          !deleting && (
            <ContactVerification
              lang={lang}
              api={cleanSpaceApi}
              sessionKey={user.sessionKey}
              currentSession={currentSession}
              onVerified={() => {
                setChangingContact(false);
                reloadAccount();
              }}
            />
          )
        )}

        <div lang={PURCHASE_LANG[lang]}>
          <Section title={purchaseCopy.purchasesHeading}>
            {!purchases || purchases.status === "loading" ? (
              <p className="text-sm text-muted-foreground">{CHECKOUT_COPY[lang].loading}</p>
            ) : purchases.status === "error" ? (
              <div className="space-y-3">
                <Notice tone="error">{purchases.error.message}</Notice>
                <Button size="sm" variant="outline" onClick={reloadPurchases}>
                  {purchaseCopy.tryAgain}
                </Button>
              </div>
            ) : purchases.value.purchases.length === 0 ? (
              <p className="text-sm">{purchaseCopy.purchasesNone}</p>
            ) : (
              <>
                <ul className="space-y-4">
                  {purchases.value.purchases.map((purchase) => (
                    <PurchaseRow
                      key={purchase.orderID}
                      lang={lang}
                      purchase={purchase}
                      contactEmail={summary.account.contact?.email ?? null}
                    />
                  ))}
                </ul>
                <RefundNote lang={lang} />
              </>
            )}
          </Section>
        </div>

        {/* Still English on the Korean page until its Korean is approved. */}
        <div lang="en">
        <Section title={copy.appsHeading}>
          {summary.nativeSessions.length === 0 ? (
            <p className="text-sm">{copy.appsNone}</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {summary.nativeSessions.map((session) => (
                <li key={session.nativeSessionID}>{copy.appRow(session.appVersion, formatInstant(session.approvedAt, lang))}</li>
              ))}
            </ul>
          )}
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            disabled={busy !== null || summary.nativeSessions.length === 0}
            onClick={() =>
              void run("end-sessions", async () => {
                const result = await cleanSpaceApi.endNativeSessions();
                return copy.endSessionsDone(result.ended);
              })
            }
          >
            {copy.endSessions}
          </Button>
        </Section>
        </div>

        {!deleting && <DeleteAccount lang={lang} busy={busy !== null} onDelete={deleteAccount} />}
      </div>
    );
  })();

  return (
    <SensitiveLayout lang={lang} title={copy.accountTitle} languageRoute="account" seller contentLang={ACCOUNT_LANG[lang]}>
      <PageTitle title={copy.accountTitle} />
      {message && (
        <Notice tone={message.tone} className="mb-6">
          {message.text}
        </Notice>
      )}
      {body}
      {user && (
        <p className="mt-10 text-sm">
          <button type="button" className="underline underline-offset-4 hover:text-accent" onClick={() => void signOutCleanSpace()}>
            {copy.signOutHere}
          </button>
        </p>
      )}
    </SensitiveLayout>
  );
}

// ---- A payment the checkout kept for its buyer (`?resume=`) ----

type Resume =
  | { kind: "none" }
  /** `?resume=` with something that isn't a resume id. */
  | { kind: "invalid" }
  /** Held in this tab until its buyer is signed in. */
  | { kind: "waiting"; resumeID: string }
  | { kind: "confirming"; resumeID: string }
  | { kind: "paid"; result: ConfirmPaymentResponse }
  /** Another account signed in while it was being finished: its answer was not used. */
  | { kind: "changed"; resumeID: string }
  /** The service refused; `resumeID` when this tab keeps it to try again. */
  | { kind: "refused"; refusal: ResumeRefusal | null; message: string; resumeID: string | null };

/**
 * The checkout's success page keeps a payment for its buyer when its tab no longer holds the checkout, and links here
 * with `?resume=<id>`. The id leaves the address at once (useQueryOnce) and stays in this tab only, so that it
 * survives a Kakao or Naver sign-in; once its buyer is signed in it is redeemed with confirmPayment({ resumeID }), at
 * most once per sign-in. A refusal for another account waits for the right one to sign in.
 */
function useResumedPayment(user: CleanSpaceUser | null, currentSession: () => string | null, onPaid: () => void) {
  const params = useQueryOnce();
  const [resume, setResume] = useState<Resume>({ kind: "none" });
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  useEffect(() => {
    if (!params) return;
    const store = sessionStore();
    const fromAddress = params.get("resume");
    if (fromAddress !== null) {
      const resumeID = parseResumeId(fromAddress);
      if (!resumeID) {
        setResume({ kind: "invalid" });
        return;
      }
      // Kept for a Kakao or Naver sign-in; where storage is blocked, it lasts as long as this page.
      rememberResume(store, resumeID, Date.now());
      setResume({ kind: "waiting", resumeID });
      return;
    }
    const held = recallResume(store, Date.now());
    if (held) setResume({ kind: "waiting", resumeID: held });
  }, [params]);

  const confirm = useCallback(
    (resumeID: string, session: string) => {
      setResume({ kind: "confirming", resumeID });
      cleanSpaceApi.confirmPayment({ resumeID }).then(
        (result) => {
          if (currentSession() !== session) {
            setResume({ kind: "changed", resumeID });
            return;
          }
          forgetResume(sessionStore());
          setResume({ kind: "paid", result });
          onPaidRef.current();
        },
        (error: unknown) => {
          const info = describeError(error);
          const refusal = resumeRefusal(info.code);
          const kept = keepsResume(refusal);
          if (!kept) forgetResume(sessionStore());
          setResume({ kind: "refused", refusal, message: info.message, resumeID: kept ? resumeID : null });
        },
      );
    },
    [currentSession],
  );

  // Its buyer is signed in: finish it, once for this sign-in.
  const started = useRef<string | null>(null);
  useEffect(() => {
    if (resume.kind !== "waiting" || !user) return;
    const key = `${user.sessionKey}|${resume.resumeID}`;
    if (started.current === key) return;
    started.current = key;
    confirm(resume.resumeID, user.sessionKey);
  }, [resume, user, confirm]);

  // After "this payment belongs to another account", a new sign-in tries again for that account.
  const sessionKey = user?.sessionKey ?? null;
  useEffect(() => {
    setResume((current) =>
      current.kind === "refused" && current.refusal === "wrongAccount" && current.resumeID !== null
        ? { kind: "waiting", resumeID: current.resumeID }
        : current,
    );
  }, [sessionKey]);

  const retryResume = () => {
    if (!user) return;
    if (resume.kind === "changed" || (resume.kind === "refused" && resume.resumeID !== null)) {
      confirm(resume.resumeID as string, user.sessionKey);
    }
  };

  return { resume, retryResume };
}

function ResumeNotice({ lang, resume, signedIn, onRetry }: { lang: PageLang; resume: Resume; signedIn: boolean; onRetry: () => void }) {
  const purchaseCopy = PURCHASE_COPY[lang];
  if (resume.kind === "none") return null;
  let content: ReactNode;
  switch (resume.kind) {
    case "invalid":
      content = <Notice>{purchaseCopy.badResume}</Notice>;
      break;
    case "waiting":
      content = signedIn ? <Notice>{purchaseCopy.resumeConfirming}</Notice> : <Notice>{purchaseCopy.resumeSignIn}</Notice>;
      break;
    case "confirming":
      content = <Notice>{purchaseCopy.resumeConfirming}</Notice>;
      break;
    case "paid": {
      const startsAt = resume.result.license?.startsAt ?? null;
      const expiresAt = resume.result.license?.expiresAt ?? null;
      const receipt = safeReceipt(resume.result.receiptURL ?? null);
      content = (
        <Notice tone="success">
          <strong>{purchaseCopy.paidHeading}</strong>
          {startsAt !== null && expiresAt !== null && (
            <>
              <br />
              {fill(purchaseCopy.paidBody, { start: formatInstant(startsAt, lang), end: formatInstant(expiresAt, lang) })}
            </>
          )}
          {receipt && (
            <>
              <br />
              <a href={receipt} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">
                {purchaseCopy.receipt}
              </a>
            </>
          )}
        </Notice>
      );
      break;
    }
    case "changed":
      content = (
        <div className="space-y-3">
          <Notice tone="error">{purchaseCopy.accountChanged}</Notice>
          <Button size="sm" variant="outline" onClick={onRetry}>
            {purchaseCopy.tryAgain}
          </Button>
        </div>
      );
      break;
    case "refused": {
      const text = resume.refusal ? purchaseCopy.resumeRefusals[resume.refusal] : fill(purchaseCopy.resumeFailed, { message: resume.message });
      const settled = resume.refusal === "alreadyOwned";
      content = (
        <div className="space-y-3">
          <Notice tone={resume.refusal === "pending" ? "info" : "error"}>{text}</Notice>
          {!settled && resume.refusal !== "wrongAccount" && (
            <p className="text-sm text-muted-foreground">{fill(purchaseCopy.ifCharged, { email: SUPPORT_EMAIL })}</p>
          )}
          {resume.resumeID !== null && resume.refusal !== "wrongAccount" && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              {purchaseCopy.tryAgain}
            </Button>
          )}
        </div>
      );
      break;
    }
  }
  return <div lang={PURCHASE_LANG[lang]}>{content}</div>;
}

// ---- The 364 days Unlock: its access period, and the purchase ----

type Handoff = { kind: "ready" } | { kind: "opening" } | { kind: "error"; message: string };

/**
 * The account's access period, and the purchase while it has none in force: the offer as the service states it (its
 * prices, whether it is on sale and on Toss's test keys), then beginCheckout, whose address (the central checkout's
 * Clean Space page with a one-time handoff code) this tab opens only once checkoutAddress has checked it. Offered
 * only when this build opens Clean Space's checkout (NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT), and to an account with a
 * confirmed contact email.
 */
function PurchaseSection({
  lang,
  summary,
  user,
  currentSession,
  onRefused,
}: {
  lang: PageLang;
  summary: GetAccountResponse;
  user: CleanSpaceUser;
  currentSession: () => string | null;
  onRefused: () => void;
}) {
  const purchaseCopy = PURCHASE_COPY[lang];
  const license = summary.license;
  const deleting = summary.deletionRequestedAt !== null;
  // The offer (public) only when there is something to buy: this build sells it, and no access period is in force.
  const [offer, reloadOffer] = useLoad(CLEAN_SPACE.checkoutOpen && license.status !== "active" && !deleting ? "offer" : null, () =>
    cleanSpaceApi.getOffer(),
  );
  const [handoff, setHandoff] = useState<Handoff>({ kind: "ready" });

  // Back from the checkout with the browser's back button: this page may come from its cache, still "opening".
  useEffect(() => {
    const shown = (event: PageTransitionEvent) => {
      if (event.persisted) setHandoff({ kind: "ready" });
    };
    window.addEventListener("pageshow", shown);
    return () => window.removeEventListener("pageshow", shown);
  }, []);

  const startCheckout = () => {
    if (handoff.kind === "opening") return;
    const session = user.sessionKey;
    setHandoff({ kind: "opening" });
    cleanSpaceApi.beginCheckout({ lang }).then(
      ({ checkoutUrl }) => {
        if (currentSession() !== session) {
          setHandoff({ kind: "error", message: purchaseCopy.accountChanged });
          return;
        }
        const address = checkoutAddress(checkoutUrl, CLEAN_SPACE.siteOrigin);
        if (!address) {
          setHandoff({ kind: "error", message: purchaseCopy.badAddress });
          return;
        }
        window.location.assign(address);
      },
      (error: unknown) => {
        const info = describeError(error);
        const refusal = purchaseRefusal(info.code);
        // The account changed on the service (a term in force, no contact email, deletion): show it as it is now.
        if (refusal === "alreadyOwned" || refusal === "contactRequired" || refusal === "accountDeleted") onRefused();
        setHandoff({
          kind: "error",
          message: refusal ? purchaseCopy.refusals[refusal] : fill(purchaseCopy.failed, { message: info.message }),
        });
      },
    );
  };

  const status = (() => {
    if (license.status === "active" && license.startsAt !== null && license.expiresAt !== null) {
      return fill(purchaseCopy.active, { start: formatInstant(license.startsAt, lang), end: formatInstant(license.expiresAt, lang) });
    }
    if (license.status === "expired" && license.expiresAt !== null) {
      return fill(purchaseCopy.expired, { end: formatInstant(license.expiresAt, lang) });
    }
    if (license.status === "revoked") return purchaseCopy.revoked;
    return purchaseCopy.none;
  })();

  const purchase = (() => {
    if (license.status === "active") return null;
    if (deleting) return <Notice>{purchaseCopy.deleting}</Notice>;
    if (!CLEAN_SPACE.checkoutOpen) return <Notice>{purchaseCopy.notOnSale}</Notice>;
    if (!offer || offer.status === "loading") return <p className="text-sm text-muted-foreground">{CHECKOUT_COPY[lang].loading}</p>;
    if (offer.status === "error") {
      return (
        <div className="space-y-3">
          <Notice tone="error">{purchaseCopy.offerFailed}</Notice>
          <Button size="sm" variant="outline" onClick={reloadOffer}>
            {purchaseCopy.tryAgain}
          </Button>
        </div>
      );
    }
    const sold = soldHere(offer.value, lang);
    if (!offer.value.salesOpen || sold.length === 0) return <Notice>{purchaseCopy.salesPaused}</Notice>;
    const onTestKeys = testCurrencies(offer.value, CLEAN_SPACE.environment).some((currency) =>
      sold.some((price) => price.currency === currency),
    );
    const contact = summary.account.contact;
    return (
      <div className="space-y-4">
        {onTestKeys && <Notice>{purchaseCopy.testPayments}</Notice>}
        <div className="space-y-2 text-sm leading-relaxed">
          <p>{purchaseCopy.what}</p>
          <p className="text-base font-semibold">
            {sold
              .map((price) => fill(price.currency === "KRW" ? purchaseCopy.priceKRW : purchaseCopy.priceUSD, { price: formatPrice(price) }))
              .join(" · ")}
          </p>
          <p className="text-muted-foreground">{purchaseCopy.period}</p>
          <p className="text-muted-foreground">{purchaseCopy.renewal}</p>
          <p className="text-muted-foreground">{purchaseCopy.refund}</p>
        </div>
        {!contact && <Notice>{purchaseCopy.contactFirst}</Notice>}
        {handoff.kind === "error" && <Notice tone="error">{handoff.message}</Notice>}
        <div className="space-y-2">
          <Button onClick={startCheckout} disabled={handoff.kind === "opening" || !contact}>
            {handoff.kind === "opening" ? purchaseCopy.opening : license.status === "none" ? purchaseCopy.buy : purchaseCopy.buyAgain}
          </Button>
          <p className="text-xs text-muted-foreground">{purchaseCopy.checkoutNote}</p>
        </div>
      </div>
    );
  })();

  return (
    <div lang={PURCHASE_LANG[lang]}>
      <Section title={purchaseCopy.heading}>
        <p className="text-sm">{status}</p>
        {purchase && <div className="mt-4">{purchase}</div>}
      </Section>
    </div>
  );
}

/** The prices a page in this language sells: won wherever it is available, dollars (PayPal) on English pages only. */
function soldHere(offer: GetOfferResponse, lang: PageLang) {
  return offer.prices.filter((price) => price.available && (lang === "en" || price.currency === "KRW"));
}

// ---- Purchases and refund requests ----

/** One purchase, and a refund request for a paid one: an email to support with the order number (as Chord to MIDI's). */
function PurchaseRow({ lang, purchase, contactEmail }: { lang: PageLang; purchase: PurchaseRecord; contactEmail: string | null }) {
  const purchaseCopy = PURCHASE_COPY[lang];
  const refundable = purchase.status === "paid" || purchase.status === "partially_refunded";
  const receipt = safeReceipt(purchase.receiptURL);
  const refund = mailtoLink(
    SUPPORT_EMAIL,
    fill(purchaseCopy.refundSubject, { orderId: purchase.orderID }),
    fill(purchaseCopy.refundBody, { orderId: purchase.orderID, email: contactEmail ?? "" }),
  );
  return (
    <li className="rounded-md border border-border p-4 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">
          {formatPrice(purchase.money)} · {purchaseCopy.purchaseStatus[purchase.status]}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{purchase.orderID}</span>
      </div>
      {purchase.approvedAt !== null && <p className="mt-1">{formatInstant(purchase.approvedAt, lang)}</p>}
      {purchase.startsAt !== null && purchase.expiresAt !== null && (
        <p className="mt-1 text-muted-foreground">
          {fill(purchaseCopy.purchasePeriod, { start: formatInstant(purchase.startsAt, lang), end: formatInstant(purchase.expiresAt, lang) })}
        </p>
      )}
      {purchase.method && (
        <p className="mt-1 text-muted-foreground">{fill(purchaseCopy.purchaseMethod, { method: paymentMethodLabel(purchase.method) })}</p>
      )}
      {(receipt || refundable) && (
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {receipt && (
            <a href={receipt} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              {purchaseCopy.receiptLink}
            </a>
          )}
          {refundable && (
            <a href={refund} className="underline underline-offset-4">
              {purchaseCopy.refundRequest}
            </a>
          )}
        </p>
      )}
    </li>
  );
}

/** "Payments are refunded in full on request within 7 days; see the Refund Policy." */
function RefundNote({ lang }: { lang: PageLang }) {
  const [before, after] = PURCHASE_COPY[lang].refundNote.split("{refund}");
  return (
    <p className="mt-4 text-sm text-muted-foreground">
      {before}
      <a href={DIRECT_SALE_POLICY_PATHS.refund} className="underline underline-offset-4">
        {CHECKOUT_COPY[lang].refundLink}
      </a>
      {after}
    </p>
  );
}

/** Deletion is not a refund, and the page says so before it asks (plan §6.3). */
function DeleteAccount({ lang, busy, onDelete }: { lang: PageLang; busy: boolean; onDelete: () => void }) {
  const copy = COPY[lang];
  const [understood, setUnderstood] = useState(false);
  return (
    <Section title={copy.deleteHeading}>
      <p className="text-sm leading-relaxed">{copy.deleteText}</p>
      <div className="mt-4 flex items-start gap-3">
        <Checkbox id="clean-space-delete-confirm" checked={understood} onCheckedChange={(on) => setUnderstood(on === true)} className="mt-0.5" />
        <Label htmlFor="clean-space-delete-confirm" className="font-normal leading-relaxed">
          {copy.deleteConfirm}
        </Label>
      </div>
      <Button variant="destructive" className="mt-4" disabled={!understood || busy} onClick={onDelete}>
        {copy.deleteButton}
      </Button>
    </Section>
  );
}
