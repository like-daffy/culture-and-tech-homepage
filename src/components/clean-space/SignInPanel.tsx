import { useState } from "react";
import { Button } from "@/components/ui/button";
import { brokeredProvidersHere, firebaseErrorCode, POPUP_DISMISSED, signInWithGoogle, startBrokeredSignIn } from "@/lib/clean-space/auth";
import { CLEAN_SPACE } from "@/lib/clean-space/config";
import { COPY } from "@/lib/clean-space/copy";
import type { BrokeredProvider, PageLang, ReturnTarget } from "@/lib/clean-space/contract.generated";
import { ProviderSignInError } from "@/lib/clean-space/oauth";
import { Notice, Section } from "./SensitiveLayout";

interface SignInPanelProps {
  lang: PageLang;
  /** Where Kakao and Naver come back to (an allow-listed page): the page this panel is on. */
  returnTo: ReturnTarget;
  title?: string;
  intro?: string;
}

/**
 * Google, Kakao and Naver, each as an account's only sign-in method (plan §6). Google signs in in a popup on this
 * page; Kakao and Naver leave for the provider and come back through the callback page to `returnTo`. What the person
 * chose before signing in (the unpaid checkout, an activation request) stays in this tab.
 */
export function SignInPanel({ lang, returnTo, title, intro }: SignInPanelProps) {
  const copy = COPY[lang];
  const [busy, setBusy] = useState<"google" | BrokeredProvider | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const brokered = brokeredProvidersHere();

  const google = async () => {
    setProblem(null);
    setBusy("google");
    try {
      await signInWithGoogle();
    } catch (error) {
      const code = firebaseErrorCode(error);
      if (!POPUP_DISMISSED.has(code ?? "")) setProblem(code === "auth/popup-blocked" ? copy.popupFailed : copy.signInFailures.refused);
    } finally {
      setBusy(null);
    }
  };

  const viaBroker = async (provider: BrokeredProvider) => {
    setProblem(null);
    setBusy(provider);
    try {
      await startBrokeredSignIn(provider, { returnTo, intent: "signin" });
      // The browser is leaving for the provider.
    } catch (error) {
      setBusy(null);
      setProblem(error instanceof ProviderSignInError ? copy.signInFailures[error.reason] : copy.signInFailures.refused);
    }
  };

  return (
    <Section title={title ?? copy.signInTitle}>
      <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{intro ?? copy.signInIntro}</p>
      <div className="flex flex-col gap-3 sm:max-w-sm">
        {CLEAN_SPACE.configured && (
          <Button type="button" variant="outline" onClick={google} disabled={busy !== null}>
            {busy === "google" ? copy.signInBusy : copy.continueWith(copy.providerNames.google)}
          </Button>
        )}
        {brokered.map((provider) => (
          <Button key={provider} type="button" variant="outline" onClick={() => viaBroker(provider)} disabled={busy !== null}>
            {busy === provider ? copy.signInBusy : copy.continueWith(copy.providerNames[provider])}
          </Button>
        ))}
      </div>
      {problem && (
        <Notice tone="error" className="mt-4">
          {problem}
        </Notice>
      )}
    </Section>
  );
}
