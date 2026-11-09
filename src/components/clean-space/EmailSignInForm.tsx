import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { describeError } from "@/lib/clean-space/api";
import { firebaseErrorCode, sendEmailLinkForAccount, sendEmailSignInLink } from "@/lib/clean-space/auth";
import { COPY } from "@/lib/clean-space/copy";
import { isEmailAddress, type PageLang, type ReturnTarget } from "@/lib/clean-space/contract.generated";
import { cleanSpaceApi } from "@/lib/clean-space/firebase";
import { Notice } from "./SensitiveLayout";

interface EmailSignInFormProps {
  lang: PageLang;
  /** signin: "Continue with email"; reauth: the signed-in account's own address again; link: add the email method. */
  intent: "signin" | "reauth" | "link";
  /** Where the link's landing page goes afterwards. */
  returnTo: ReturnTarget;
  initialEmail?: string;
  /** The address can't be changed (reauth with the account's own address). */
  fixedEmail?: boolean;
  /** Called with a callable error the form doesn't explain itself (a recent sign-in needed for `link`). */
  onRefused?: (error: unknown) => boolean;
}

/** Firebase's refusals of sending a link, in the page's words. */
function sendFailure(error: unknown, copy: (typeof COPY)["en"]): string {
  const code = firebaseErrorCode(error);
  if (code === "auth/invalid-email" || (error instanceof Error && error.message === "invalid-email")) return copy.contactInvalidEmail;
  if (code === "auth/too-many-requests" || code === "auth/quota-exceeded") return copy.emailTooMany;
  if (code === "auth/operation-not-allowed" || code === "auth/unauthorized-continue-uri" || code === "auth/invalid-continue-uri") return copy.emailNotAllowed;
  if (code?.startsWith("auth/")) return copy.signInFailures.refused;
  return describeError(error).message;
}

/**
 * The email-entry and "check your inbox" states of an email link (Chord to MIDI's "이메일로 계속하기"). Firebase sends the
 * link; nothing is signed in or changed here. One send a minute.
 */
export function EmailSignInForm({ lang, intent, returnTo, initialEmail = "", fixedEmail = false, onRefused }: EmailSignInFormProps) {
  const copy = COPY[lang];
  const [email, setEmail] = useState(initialEmail);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sentAt, setSentAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!sentTo) return;
    const id = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(id);
  }, [sentTo]);

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    if (busy) return;
    const address = email.trim();
    if (!isEmailAddress(address)) return setProblem(copy.contactInvalidEmail);
    setBusy(true);
    setProblem(null);
    try {
      const sent =
        intent === "link" ? await sendEmailLinkForAccount(cleanSpaceApi, address, returnTo) : await sendEmailSignInLink(address, intent, returnTo);
      setSentTo(sent);
      setSentAt(Date.now());
      setNow(Date.now());
    } catch (error) {
      if (onRefused?.(error)) return;
      setProblem(sendFailure(error, copy));
    } finally {
      setBusy(false);
    }
  };

  const canResend = now - sentAt >= 60_000;

  if (sentTo) {
    return (
      <div className="space-y-3">
        <Notice tone="success">{intent === "signin" && returnTo.route !== "activate" ? copy.emailSent(sentTo) : copy.emailSentHere(sentTo)}</Notice>
        <div className="flex flex-wrap gap-3">
          <Button type="button" size="sm" variant="outline" onClick={() => void send()} disabled={busy || !canResend}>
            {busy ? copy.emailSending : copy.emailResend}
          </Button>
          {!fixedEmail && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setSentTo(null)} disabled={busy}>
              {copy.emailOtherAddress}
            </Button>
          )}
        </div>
        {!canResend && <p className="text-xs text-muted-foreground">{copy.emailWait}</p>}
        {problem && <Notice tone="error">{problem}</Notice>}
      </div>
    );
  }

  return (
    <form onSubmit={send} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={`clean-space-email-${intent}`}>{copy.emailLabel}</Label>
        <Input
          id={`clean-space-email-${intent}`}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          readOnly={fixedEmail}
          onChange={(event) => setEmail(event.target.value)}
          maxLength={254}
        />
      </div>
      <Button type="submit" variant="outline" disabled={busy}>
        {busy ? copy.emailSending : copy.emailSend}
      </Button>
      {intent === "signin" && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {copy.emailNote} {copy.emailSeparate}
        </p>
      )}
      {problem && <Notice tone="error">{problem}</Notice>}
    </form>
  );
}
