import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/lib/clean-space/auth";
import { CLEAN_SPACE } from "@/lib/clean-space/config";
import { COPY } from "@/lib/clean-space/copy";
import { PAGE_PATH, type GetAccountResponse, type PageLang, type Provider, type PurchaseRecord } from "@/lib/clean-space/contract.generated";
import { formatInstant, formatPrice, paymentMethodLabel } from "@/lib/clean-space/display";
import { cleanSpaceApi } from "@/lib/clean-space/firebase";
import { ProviderSignInError } from "@/lib/clean-space/oauth";
import { ContactVerification } from "./ContactVerification";
import { useCleanSpaceUser, useLoad, useSessionGuard } from "./hooks";
import { Notice, PageTitle, Section, SensitiveLayout } from "./SensitiveLayout";
import { SignInPanel } from "./SignInPanel";
import { signInFailureMessage } from "./AuthCallbackPage";

const ALL_PROVIDERS: Provider[] = ["google", "kakao", "naver"];

/**
 * /apps/clean-space/account/: the account, its sign-in methods and receipt email, the access period, purchases and
 * refund requests, the Macs signed in, sign-out and deletion (plan §6, §9). Every change needs the signed-in session,
 * and changing sign-in methods or deleting needs a recent sign-in.
 */
export function AccountPage({ lang }: { lang: PageLang }) {
  const copy = COPY[lang];
  const userState = useCleanSpaceUser();
  const user = userState.status === "signed-in" ? userState.user : null;
  const currentSession = useSessionGuard(user);
  const [account, reloadAccount] = useLoad(user ? user.sessionKey : null, () => cleanSpaceApi.getAccount());
  const [purchases, reloadPurchases] = useLoad(user ? user.sessionKey : null, () => cleanSpaceApi.getAccountPurchases());
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

  const body = (() => {
    if (userState.status === "unconfigured") return <Notice>{copy.notConfigured}</Notice>;
    if (userState.status === "loading") return <p className="text-muted-foreground">{copy.loading}</p>;
    if (!user) return <SignInPanel lang={lang} returnTo={{ route: "account", lang }} />;
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
    const license = summary.license;
    const deleting = summary.deletionRequestedAt !== null;
    return (
      <div className="space-y-6">
        <p className="text-sm">{copy.signedInAs(summary.account.displayLabel ?? user.email ?? copy.thisAccount)}</p>
        {deleting && <Notice>{copy.deleteRequested(formatInstant(summary.deletionRequestedAt as number, lang))}</Notice>}

        <Section title={copy.accessHeading}>
          {license.status === "active" && license.startsAt !== null && license.expiresAt !== null && (
            <p className="text-sm">{copy.accessActive(formatInstant(license.startsAt, lang), formatInstant(license.expiresAt, lang))}</p>
          )}
          {license.status === "expired" && license.expiresAt !== null && <p className="text-sm">{copy.accessExpired(formatInstant(license.expiresAt, lang))}</p>}
          {license.status === "revoked" && <p className="text-sm">{copy.accessRevoked}</p>}
          {license.status === "none" && <p className="text-sm">{copy.accessNone}</p>}
          {license.status !== "active" && !deleting && CLEAN_SPACE.salesEnabled && CLEAN_SPACE.policiesPublished && (
            <Button asChild className="mt-4">
              <Link href={PAGE_PATH.checkout[lang]}>{license.status === "none" ? copy.buy : copy.buyAgain}</Link>
            </Button>
          )}
        </Section>

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

        <Section title={copy.purchasesHeading}>
          {!purchases || purchases.status === "loading" ? (
            <p className="text-sm text-muted-foreground">{copy.loading}</p>
          ) : purchases.status === "error" ? (
            <div className="space-y-3">
              <Notice tone="error">{purchases.error.message}</Notice>
              <Button size="sm" variant="outline" onClick={reloadPurchases}>
                {copy.tryAgain}
              </Button>
            </div>
          ) : purchases.value.purchases.length === 0 ? (
            <p className="text-sm">{copy.purchasesNone}</p>
          ) : (
            <ul className="space-y-4">
              {purchases.value.purchases.map((purchase) => (
                <PurchaseRow key={purchase.orderID} lang={lang} purchase={purchase} currentSession={currentSession} sessionKey={user.sessionKey} />
              ))}
            </ul>
          )}
        </Section>

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

        {!deleting && <DeleteAccount lang={lang} busy={busy !== null} onDelete={deleteAccount} />}
      </div>
    );
  })();

  return (
    <SensitiveLayout lang={lang} title={copy.accountTitle} languageRoute="account">
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

/** One purchase, and a refund request for a paid one: a support request, never a money movement here (plan §7.3). */
function PurchaseRow({ lang, purchase, currentSession, sessionKey }: { lang: PageLang; purchase: PurchaseRecord; currentSession: () => string | null; sessionKey: string }) {
  const copy = COPY[lang];
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [state, setState] = useState<{ kind: "idle" } | { kind: "sending" } | { kind: "sent"; reference: string } | { kind: "error"; message: string }>({ kind: "idle" });
  const refundable = purchase.status === "paid" || purchase.status === "partially_refunded";

  const send = async () => {
    if (state.kind === "sending") return;
    setState({ kind: "sending" });
    try {
      const result = await cleanSpaceApi.requestRefund({ orderID: purchase.orderID, reason: reason.trim().slice(0, 1000) });
      if (currentSession() !== sessionKey) return setState({ kind: "error", message: copy.accountChanged });
      setState({ kind: "sent", reference: result.supportRequestID });
    } catch (error) {
      setState({ kind: "error", message: describeError(error).message });
    }
  };

  return (
    <li className="rounded-md border border-border p-4 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">
          {formatPrice(purchase.money)} · {copy.purchaseStatus[purchase.status]}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{purchase.orderID}</span>
      </div>
      {purchase.approvedAt !== null && <p className="mt-1">{formatInstant(purchase.approvedAt, lang)}</p>}
      {purchase.startsAt !== null && purchase.expiresAt !== null && (
        <p className="mt-1 text-muted-foreground">{copy.accessActive(formatInstant(purchase.startsAt, lang), formatInstant(purchase.expiresAt, lang))}</p>
      )}
      {purchase.method && <p className="mt-1 text-muted-foreground">{copy.purchaseMethod(paymentMethodLabel(purchase.method))}</p>}
      {purchase.receiptURL && (
        <p className="mt-1">
          <a href={purchase.receiptURL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            {copy.receiptLink}
          </a>
        </p>
      )}
      {refundable && state.kind !== "sent" && (
        <div className="mt-3">
          {!open ? (
            <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
              {copy.refundRequest}
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground">{copy.refundNote}</p>
              <Label htmlFor={`refund-${purchase.orderID}`}>{copy.refundReason}</Label>
              <Textarea id={`refund-${purchase.orderID}`} value={reason} maxLength={1000} onChange={(event) => setReason(event.target.value)} />
              <Button size="sm" onClick={send} disabled={state.kind === "sending"}>
                {copy.refundSend}
              </Button>
            </div>
          )}
        </div>
      )}
      {state.kind === "sent" && (
        <Notice tone="success" className="mt-3">
          {copy.refundSent(state.reference)} {copy.refundNote}
        </Notice>
      )}
      {state.kind === "error" && (
        <Notice tone="error" className="mt-3">
          {state.message}
        </Notice>
      )}
    </li>
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
