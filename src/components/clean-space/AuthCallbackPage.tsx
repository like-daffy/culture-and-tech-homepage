import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { describeError } from "@/lib/clean-space/api";
import { currentUid, signInWithToken } from "@/lib/clean-space/auth";
import { ACCOUNT_LANG, COPY, type Copy } from "@/lib/clean-space/copy";
import { PAGE_PATH, type PageLang } from "@/lib/clean-space/contract.generated";
import { cleanSpaceApi } from "@/lib/clean-space/firebase";
import { finishBrokeredSignInOnce, ProviderSignInError } from "@/lib/clean-space/oauth";
import { returnTargetPath } from "@/lib/clean-space/return-target";
import { sessionStore } from "@/lib/clean-space/storage";
import { useQueryOnce } from "./hooks";
import { Notice, PageTitle, SensitiveLayout } from "./SensitiveLayout";

/** What to say about a failed sign-in: this tab's own check, or the service's answer. */
export function signInFailureMessage(error: unknown, copy: Copy): string {
  if (!(error instanceof ProviderSignInError)) return copy.signInFailures.refused;
  if (error.reason !== "refused") return copy.signInFailures[error.reason];
  const info = describeError(error.cause);
  return info.code !== null ? info.message : copy.signInFailures.refused;
}

/**
 * /apps/clean-space/auth/callback/: Kakao and Naver send the browser back here with a code (or why there is none). The
 * code and state leave the address bar before anything else, are checked against this tab's sign-in, are exchanged
 * once, and the browser goes on to the allow-listed page the sign-in started from. A failure keeps whatever the person
 * chose there (it is in this tab's storage) and links back to it.
 */
export function AuthCallbackPage({ lang }: { lang: PageLang }) {
  const copy = COPY[lang];
  const [failure, setFailure] = useState<{ message: string; again: string } | null>(null);
  const params = useQueryOnce();

  useEffect(() => {
    if (!params) return;
    let active = true;
    finishBrokeredSignInOnce(params, {
      store: sessionStore(),
      now: Date.now,
      api: cleanSpaceApi,
      currentUid,
      signInWithCustomToken: signInWithToken,
    }).then(
      ({ returnTo }) => window.location.replace(returnTargetPath(returnTo)),
      (error: unknown) => {
        if (!active) return;
        const returnTo = error instanceof ProviderSignInError ? error.returnTo : null;
        setFailure({ message: signInFailureMessage(error, copy), again: returnTo ? returnTargetPath(returnTo) : PAGE_PATH.account[lang] });
      },
    );
    return () => {
      active = false;
    };
  }, [params, copy, lang]);

  return (
    <SensitiveLayout lang={lang} title={copy.callbackTitle} contentLang={ACCOUNT_LANG[lang]}>
      <PageTitle title={copy.callbackTitle} />
      {!failure ? (
        <p className="text-muted-foreground">{copy.callbackWorking}</p>
      ) : (
        <div className="space-y-6">
          <Notice tone="error">{failure.message}</Notice>
          <Button asChild>
            <a href={failure.again}>{copy.tryAgain}</a>
          </Button>
        </div>
      )}
    </SensitiveLayout>
  );
}
