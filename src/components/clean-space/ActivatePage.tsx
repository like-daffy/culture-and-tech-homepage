import { useEffect, useState } from "react";
import Router from "next/router";
import { Button } from "@/components/ui/button";
import { describeError } from "@/lib/clean-space/api";
import { activationView, forgetRequest, recallRequest, rememberRequest } from "@/lib/clean-space/activation";
import { signOutCleanSpace } from "@/lib/clean-space/auth";
import { CLEAN_SPACE } from "@/lib/clean-space/config";
import { COPY } from "@/lib/clean-space/copy";
import type { PageLang } from "@/lib/clean-space/contract.generated";
import { formatCountdown, formatInstant, secondsLeft } from "@/lib/clean-space/display";
import { cleanSpaceApi } from "@/lib/clean-space/firebase";
import { sessionStore } from "@/lib/clean-space/storage";
import { parseActivationFragment, takeFragmentOnce } from "@/lib/clean-space/url";
import { useCleanSpaceUser, useLoad, useServerOffset, useSessionGuard, useTicker } from "./hooks";
import { Notice, PageTitle, Section, SensitiveLayout } from "./SensitiveLayout";
import { SignInPanel } from "./SignInPanel";

/**
 * /apps/clean-space/activate/: approve Clean Space on a Mac (plan §8.1). The app opens this page with only an opaque
 * request id in the fragment; the page shows the request's confirmation code with the signed-in account and approves
 * nothing until the person compares the code with the one on their Mac and clicks Approve, which sends that code.
 */
export function ActivatePage({ lang }: { lang: PageLang }) {
  const copy = COPY[lang];
  const userState = useCleanSpaceUser();
  const user = userState.status === "signed-in" ? userState.user : null;
  const currentSession = useSessionGuard(user);
  const [requestID, setRequestID] = useState<string | null | undefined>(undefined);
  const [decided, setDecided] = useState<"approved" | "denied" | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  // The fragment leaves the address bar at once; the id stays in this tab only (it survives a Kakao or Naver sign-in).
  useEffect(() => {
    const hash = takeFragmentOnce(window.location, window.history, (clean) => {
      void Router.replace(clean, undefined, { shallow: true, scroll: false }).catch(() => undefined);
    });
    const fromAddress = parseActivationFragment(hash);
    const store = sessionStore();
    if (fromAddress) rememberRequest(store, fromAddress, Date.now());
    setRequestID(fromAddress ?? recallRequest(store, Date.now()));
  }, []);

  const [inspection, reload] = useLoad(user && requestID ? `${user.sessionKey}|${requestID}` : null, () =>
    cleanSpaceApi.inspectActivation({ requestID: requestID as string }),
  );
  const [account] = useLoad(user ? user.sessionKey : null, () => cleanSpaceApi.getAccount());
  const offset = useServerOffset(inspection?.status === "ready" ? inspection.value.serverTime : null);
  const pending = inspection?.status === "ready" && inspection.value.status === "pending";
  useTicker(pending && decided === null);
  const serverNow = Date.now() / 1000 + offset;

  const view = activationView({
    configured: CLEAN_SPACE.configured,
    requestID: requestID === undefined ? null : requestID,
    auth: requestID === undefined ? "loading" : userState.status,
    inspection,
    decided,
    serverNow,
  });

  useEffect(() => {
    if (view.kind === "approved" || view.kind === "denied" || view.kind === "expired" || view.kind === "consumed" || view.kind === "not-found") {
      forgetRequest(sessionStore());
    }
  }, [view.kind]);

  const decide = async (approve: boolean) => {
    if (busy || view.kind !== "pending" || !user || !requestID) return;
    const session = user.sessionKey;
    setBusy(true);
    setProblem(null);
    try {
      if (approve) await cleanSpaceApi.approveActivation({ requestID, confirmationCode: view.request.confirmationCode });
      else await cleanSpaceApi.denyActivation({ requestID });
      if (currentSession() !== session) return setProblem(copy.accountChanged);
      setDecided(approve ? "approved" : "denied");
    } catch (error) {
      const info = describeError(error);
      if (info.code === "ACTIVATION_CODE_MISMATCH" || info.code === "ACTIVATION_ALREADY_DECIDED" || info.code === "ACTIVATION_EXPIRED") reload();
      setProblem(info.message);
    } finally {
      setBusy(false);
    }
  };

  const accountLabel = account?.status === "ready" ? (account.value.account.displayLabel ?? user?.email ?? copy.thisAccount) : (user?.email ?? copy.thisAccount);

  return (
    <SensitiveLayout lang={lang} title={copy.activateTitle} languageRoute="activate">
      <PageTitle title={copy.activateTitle} />
      {view.kind === "loading" && <p className="text-muted-foreground">{copy.loading}</p>}
      {view.kind === "unavailable" && <Notice>{copy.notConfigured}</Notice>}
      {view.kind === "no-request" && <Notice>{copy.noRequestText}</Notice>}
      {view.kind === "signed-out" && <SignInPanel lang={lang} returnTo={{ route: "activate", lang }} />}
      {view.kind === "error" && (
        <div className="space-y-4">
          <Notice tone="error">{view.error.message}</Notice>
          <Button variant="outline" onClick={reload}>
            {copy.tryAgain}
          </Button>
        </div>
      )}
      {view.kind === "not-found" && <Notice tone="error">{copy.notFoundText}</Notice>}
      {view.kind === "expired" && <Notice>{copy.expiredText}</Notice>}
      {view.kind === "consumed" && <Notice>{copy.consumedText}</Notice>}
      {view.kind === "approved" && <Notice tone="success">{copy.approvedText}</Notice>}
      {view.kind === "denied" && <Notice>{copy.deniedText}</Notice>}
      {view.kind === "pending" && (
        <div className="space-y-6">
          <p className="text-base leading-relaxed">{copy.activateIntro}</p>
          <Section>
            <p className="text-sm font-medium text-muted-foreground">{copy.codeLabel}</p>
            <p className="mt-2 font-mono text-4xl font-bold tracking-widest text-primary" aria-live="polite">
              {view.request.confirmationCode}
            </p>
            <p className="mt-4 text-sm">{copy.appVersion(view.request.appVersion)}</p>
            <p className="text-sm">{copy.signedInAs(accountLabel)}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {copy.expiresIn(formatCountdown(secondsLeft(view.request.expiresAt, offset)))} ({formatInstant(view.request.expiresAt, lang)})
            </p>
          </Section>
          <Notice tone="error">{copy.compareWarning}</Notice>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => decide(true)} disabled={busy}>
              {copy.approve}
            </Button>
            <Button size="lg" variant="outline" onClick={() => decide(false)} disabled={busy}>
              {copy.deny}
            </Button>
          </div>
        </div>
      )}
      {problem && (
        <Notice tone="error" className="mt-6">
          {problem}
        </Notice>
      )}
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
