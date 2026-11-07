import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { describeError, type CleanSpaceApi } from "@/lib/clean-space/api";
import { COPY } from "@/lib/clean-space/copy";
import { isEmailAddress, type AccountSummary, type PageLang } from "@/lib/clean-space/contract.generated";
import { Notice, Section } from "./SensitiveLayout";

interface ContactVerificationProps {
  lang: PageLang;
  api: Pick<CleanSpaceApi, "beginContactVerification" | "confirmContactVerification">;
  /** The session the verification belongs to; an answer for another one is dropped. */
  sessionKey: string;
  currentSession: () => string | null;
  onVerified: (account: AccountSummary) => void;
  title?: string;
}

/**
 * Confirms a receipt and support address on the signed-in account with a 6-digit code (plan §6.2). It is contact
 * verification only: the address never becomes a way to sign in, and nothing is merged by email.
 */
export function ContactVerification({ lang, api, sessionKey, currentSession, onVerified, title }: ContactVerificationProps) {
  const copy = COPY[lang];
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<{ pendingID: string; email: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const address = email.trim();
    if (!isEmailAddress(address)) {
      setProblem(copy.contactInvalidEmail);
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      const result = await api.beginContactVerification({ email: address, lang });
      if (currentSession() !== sessionKey) return setProblem(copy.accountChanged);
      setPending({ pendingID: result.pendingID, email: address });
      setCode("");
    } catch (error) {
      setProblem(describeError(error).message);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !pending) return;
    if (!/^\d{6}$/.test(code)) {
      setProblem(copy.contactInvalidCode);
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      const result = await api.confirmContactVerification({ pendingID: pending.pendingID, code });
      if (currentSession() !== sessionKey) return setProblem(copy.accountChanged);
      onVerified(result.account);
    } catch (error) {
      const info = describeError(error);
      if (info.code === "CONTACT_CODE_EXPIRED") setPending(null);
      setProblem(info.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title={title ?? copy.contactHeading}>
      <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{copy.contactIntro}</p>
      {!pending ? (
        <form onSubmit={send} className="flex flex-col gap-3 sm:max-w-md">
          <Label htmlFor="clean-space-contact-email">{copy.contactEmailLabel}</Label>
          <Input
            id="clean-space-contact-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" disabled={busy} className="self-start">
            {copy.contactSend}
          </Button>
        </form>
      ) : (
        <form onSubmit={confirm} className="flex flex-col gap-3 sm:max-w-md">
          <p className="text-sm">{copy.contactCodeSent(pending.email)}</p>
          <Label htmlFor="clean-space-contact-code">{copy.contactCodeLabel}</Label>
          <Input
            id="clean-space-contact-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            required
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={busy}>
              {copy.contactConfirm}
            </Button>
            <Button type="button" variant="ghost" disabled={busy} onClick={() => setPending(null)}>
              {copy.contactResend}
            </Button>
          </div>
        </form>
      )}
      {problem && (
        <Notice tone="error" className="mt-4">
          {problem}
        </Notice>
      )}
    </Section>
  );
}
