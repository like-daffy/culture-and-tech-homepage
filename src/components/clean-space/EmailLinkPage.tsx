import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentUid, signInWithToken } from "@/lib/clean-space/auth";
import { CLEAN_SPACE } from "@/lib/clean-space/config";
import { ACCOUNT_LANG, COPY, type Copy } from "@/lib/clean-space/copy";
import { PAGE_PATH, type PageLang } from "@/lib/clean-space/contract.generated";
import {
  completeEmailLink,
  keepPendingLink,
  parseEmailLink,
  recallPendingLink,
  type EmailLink,
  type EmailLinkFailure,
  type EmailLinkOutcome,
} from "@/lib/clean-space/email-link";
import { cleanSpaceApi } from "@/lib/clean-space/firebase";
import { returnTargetPath } from "@/lib/clean-space/return-target";
import { localStore, sessionStore } from "@/lib/clean-space/storage";
import { useQueryOnce } from "./hooks";
import { Notice, PageTitle, SensitiveLayout } from "./SensitiveLayout";

function failureMessage(reason: EmailLinkFailure, copy: Copy, email?: string, message?: string): string {
  switch (reason) {
    case "invalid":
      return copy.emailLinkInvalid;
    case "expired":
      return copy.emailLinkExpired;
    case "conflict":
      return copy.emailLinkConflict(email ?? "");
    case "already-linked":
      return copy.emailLinkAlreadyLinked;
    case "wrong-account":
      return copy.emailLinkWrongAccount;
    case "changed":
      return copy.emailLinkChanged;
    case "busy":
      return copy.emailLinkBusy;
    case "deleted":
      return copy.emailLinkDeleted;
    case "unavailable":
      return copy.emailNotAllowed;
    default:
      return message ?? copy.signInFailures.refused;
  }
}

type View = { kind: "working" } | { kind: "invalid" } | EmailLinkOutcome;

/**
 * /apps/clean-space/auth/email/: where an email sign-in link lands. Its query (Firebase's one-time code with it) leaves
 * the address bar at once and stays in this tab only (email-link.ts), so a reload or a sign-in in between finds it, and
 * the service redeems the code. A sign-in never replaces an account signed in here without the person's word; adding
 * the email method needs the account that asked, signed in here.
 */
export function EmailLinkPage({ lang }: { lang: PageLang }) {
  const copy = COPY[lang];
  const params = useQueryOnce();
  const [link, setLink] = useState<EmailLink | null>(null);
  const [view, setView] = useState<View>({ kind: "working" });
  const [email, setEmail] = useState("");
  const running = useRef(false);
  const started = useRef(false);

  const run = useCallback(async (target: EmailLink, options: { email?: string; switchAccount?: boolean } = {}) => {
    if (running.current) return;
    running.current = true;
    setView({ kind: "working" });
    const outcome = await completeEmailLink(target, options, {
      api: cleanSpaceApi,
      currentUid,
      signInWithCustomToken: signInWithToken,
      session: sessionStore(),
      local: localStore(),
      now: Date.now,
    });
    running.current = false;
    if (outcome.kind === "done" && !outcome.linked && outcome.returnTo.route !== "activate") {
      window.location.replace(returnTargetPath(outcome.returnTo));
      return;
    }
    setView(outcome);
  }, []);

  useEffect(() => {
    if (!params || started.current) return;
    started.current = true;
    if (!CLEAN_SPACE.configured) {
      setView({ kind: "failed", reason: "unavailable" });
      return;
    }
    const session = sessionStore();
    let query: string | null = null;
    if (params.has("oobCode") || params.has("link")) {
      query = params.toString();
      keepPendingLink(session, query, Date.now());
    } else {
      query = recallPendingLink(session, Date.now());
    }
    const parsed = query ? parseEmailLink(query, lang) : null;
    if (!parsed) {
      setView({ kind: "invalid" });
      return;
    }
    setLink(parsed);
    void run(parsed);
  }, [params, lang, run]);

  const submitEmail = (event: FormEvent) => {
    event.preventDefault();
    if (link) void run(link, { email: email.trim() });
  };

  const again = link ? returnTargetPath(link.returnTo) : PAGE_PATH.account[lang];

  return (
    <SensitiveLayout lang={lang} title={copy.emailLinkTitle} contentLang={ACCOUNT_LANG[lang]}>
      <PageTitle title={copy.emailLinkTitle} />
      {view.kind === "working" && <p className="text-muted-foreground">{copy.emailLinkWorking}</p>}
      {view.kind === "invalid" && (
        <div className="space-y-6">
          <Notice tone="error">{copy.emailLinkInvalid}</Notice>
          <Button asChild variant="outline">
            <a href={again}>{copy.emailLinkRequestAgain}</a>
          </Button>
        </div>
      )}
      {view.kind === "need-email" && link && (
        <form onSubmit={submitEmail} className="space-y-4 sm:max-w-sm">
          <p className="text-sm">{view.mismatch ? copy.emailLinkNeedEmailMismatch : copy.emailLinkNeedEmail}</p>
          <div className="space-y-1">
            <Label htmlFor="clean-space-link-email">{copy.emailLabel}</Label>
            <Input id="clean-space-link-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} />
          </div>
          <Button type="submit">{copy.emailLinkContinue}</Button>
        </form>
      )}
      {view.kind === "switch" && link && (
        <div className="space-y-4">
          <p className="text-sm">{copy.emailLinkSwitch(view.email)}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void run(link, { email: view.email, switchAccount: true })}>{copy.emailLinkSwitchConfirm(view.email)}</Button>
            <Button asChild variant="outline">
              <a href={again}>{copy.emailLinkStay}</a>
            </Button>
          </div>
        </div>
      )}
      {view.kind === "need-account" && (
        <div className="space-y-6">
          <Notice>{copy.emailLinkNeedAccount}</Notice>
          <Button asChild variant="outline">
            <a href={PAGE_PATH.account[lang]}>{copy.accountTitle}</a>
          </Button>
        </div>
      )}
      {view.kind === "done" && (
        <div className="space-y-6">
          <Notice tone="success">{view.linked ? copy.emailLinkLinked : copy.emailLinkDoneElsewhere}</Notice>
          {view.linked && (
            <Button asChild>
              <a href={returnTargetPath(view.returnTo)}>{copy.emailLinkContinue}</a>
            </Button>
          )}
        </div>
      )}
      {view.kind === "failed" && (
        <div className="space-y-6">
          <Notice tone="error">{failureMessage(view.reason, copy, view.email, view.message)}</Notice>
          {view.reason === "error" || view.reason === "busy" ? (
            link && <Button onClick={() => void run(link)}>{copy.tryAgain}</Button>
          ) : (
            <Button asChild variant="outline">
              <a href={again}>{copy.emailLinkRequestAgain}</a>
            </Button>
          )}
        </div>
      )}
    </SensitiveLayout>
  );
}
