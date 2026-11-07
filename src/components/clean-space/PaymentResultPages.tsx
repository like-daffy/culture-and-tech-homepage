import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Router from "next/router";
import { Button } from "@/components/ui/button";
import { describeError } from "@/lib/clean-space/api";
import { isBuyerCancel, parseFailParams, parseSuccessParams, saveResume } from "@/lib/clean-space/checkout-machine";
import { COPY } from "@/lib/clean-space/copy";
import { PAGE_PATH, type ConfirmPaymentResponse, type PageLang } from "@/lib/clean-space/contract.generated";
import { cleanSpaceApi } from "@/lib/clean-space/firebase";
import { sessionStore } from "@/lib/clean-space/storage";
import { takeQueryOnce } from "@/lib/clean-space/url";
import { useCleanSpaceUser } from "./hooks";
import { PaidResult, PendingResult } from "./PaymentResult";
import { Notice, PageTitle, SensitiveLayout } from "./SensitiveLayout";
import { SignInPanel } from "./SignInPanel";

/** Reads this page load's query once and takes it out of the address bar and Next.js's copy of it (plan §5.1). */
function takeQuery(): URLSearchParams {
  return takeQueryOnce(window.location, window.history, (clean) => {
    void Router.replace(clean, undefined, { shallow: true, scroll: false }).catch(() => undefined);
  });
}

type SuccessParams = NonNullable<ReturnType<typeof parseSuccessParams>>;

let confirming: Promise<ConfirmPaymentResponse> | null = null;
/** One confirmation per page load: React StrictMode's second effect, or a re-render, joins the first. */
function confirmOnce(params: SuccessParams): Promise<ConfirmPaymentResponse> {
  confirming ??= cleanSpaceApi.confirmPayment(params);
  return confirming;
}

type SuccessState =
  | { kind: "reading" }
  | { kind: "no-payment" }
  | { kind: "confirming" }
  | { kind: "paid"; result: ConfirmPaymentResponse }
  | { kind: "pending"; orderID: string }
  | { kind: "held" }
  | { kind: "wrong-account" }
  | { kind: "problem"; message: string };

/**
 * /checkout/clean-space/success/: Toss's parameters say a payment may have been approved; they prove nothing (plan
 * §7.2.4). Only the service's confirmation shows success. Signed out, the parameters are kept on the service under a
 * resume handle that only the order's buyer can redeem, and the checkout page finishes it after the sign-in.
 */
export function PaymentSuccessPage({ lang }: { lang: PageLang }) {
  const copy = COPY[lang];
  const userState = useCleanSpaceUser();
  const [params, setParams] = useState<SuccessParams | null | undefined>(undefined);
  const [state, setState] = useState<SuccessState>({ kind: "reading" });
  const started = useRef(false);

  useEffect(() => {
    const parsed = parseSuccessParams(takeQuery());
    setParams(parsed);
    if (!parsed) setState({ kind: "no-payment" });
  }, []);

  useEffect(() => {
    if (!params || started.current || userState.status === "loading") return;
    if (userState.status === "unconfigured") return setState({ kind: "problem", message: copy.notConfigured });
    started.current = true;
    const hold = () =>
      cleanSpaceApi.preparePaymentResume(params).then(
        (resume) => (saveResume(sessionStore(), resume) ? undefined : Promise.reject(new Error("storage"))),
      );
    if (userState.status === "signed-out") {
      setState({ kind: "confirming" });
      hold().then(
        () => setState({ kind: "held" }),
        (error: unknown) => setState({ kind: "problem", message: describeError(error).message }),
      );
      return;
    }
    setState({ kind: "confirming" });
    confirmOnce(params).then(
      (result) => setState({ kind: "paid", result }),
      (error: unknown) => {
        const info = describeError(error);
        if (info.code === "PAYMENT_PENDING") return setState({ kind: "pending", orderID: params.orderID });
        if (info.code === "NOT_ORDER_OWNER") {
          // The buyer finishes it once signed in to the right account (the checkout page redeems the handle).
          hold().then(
            () => setState({ kind: "wrong-account" }),
            () => setState({ kind: "wrong-account" }),
          );
          return;
        }
        setState({ kind: "problem", message: info.message });
      },
    );
  }, [params, userState.status, copy]);

  // Signed in on this page (Google's popup) while the payment is held: the checkout page finishes it.
  useEffect(() => {
    if (state.kind === "held" && userState.status === "signed-in") window.location.replace(PAGE_PATH.checkout[lang]);
  }, [state.kind, userState.status, lang]);

  return (
    <SensitiveLayout lang={lang} title={copy.resultTitle} seller>
      <PageTitle title={copy.resultTitle} />
      {(state.kind === "reading" || state.kind === "confirming") && <Notice>{copy.confirming}</Notice>}
      {state.kind === "no-payment" && <Notice>{copy.noPayment}</Notice>}
      {state.kind === "paid" && <PaidResult lang={lang} result={state.result} />}
      {state.kind === "pending" && <PendingResult lang={lang} orderID={state.orderID} />}
      {state.kind === "held" && (
        <div className="space-y-6">
          <Notice>{copy.signInToFinish}</Notice>
          <SignInPanel lang={lang} returnTo={{ route: "checkout", lang }} />
        </div>
      )}
      {state.kind === "wrong-account" && <Notice tone="error">{copy.wrongAccount}</Notice>}
      {state.kind === "problem" && (
        <div className="space-y-4">
          <Notice tone="error">{state.message}</Notice>
          <p className="text-sm text-muted-foreground">{copy.ifCharged}</p>
          {params && (
            <p className="text-sm">
              <span className="font-medium">{copy.orderNumber}:</span> <span className="font-mono">{params.orderID}</span>
            </p>
          )}
        </div>
      )}
    </SensitiveLayout>
  );
}

/** /checkout/clean-space/fail/: the payment didn't go through; nothing was charged. The order is closed when signed in. */
export function PaymentFailPage({ lang }: { lang: PageLang }) {
  const copy = COPY[lang];
  const userState = useCleanSpaceUser();
  const [fail, setFail] = useState<ReturnType<typeof parseFailParams> | null>(null);
  const reported = useRef(false);

  useEffect(() => {
    setFail(parseFailParams(takeQuery()));
  }, []);

  useEffect(() => {
    if (!fail?.orderID || reported.current || userState.status !== "signed-in") return;
    reported.current = true;
    void cleanSpaceApi.failOrder({ orderID: fail.orderID, code: fail.code, message: fail.message }).catch(() => undefined);
  }, [fail, userState.status]);

  return (
    <SensitiveLayout lang={lang} title={copy.failTitle} seller>
      <PageTitle title={copy.failTitle} />
      {fail && (
        <div className="space-y-6">
          <Notice tone={isBuyerCancel(fail.code) ? "info" : "error"}>{isBuyerCancel(fail.code) ? copy.failCancelled : copy.failOther}</Notice>
          {fail.message && !isBuyerCancel(fail.code) && <p className="text-sm text-muted-foreground">{copy.tossSaid(fail.message)}</p>}
          <Button asChild>
            <Link href={PAGE_PATH.checkout[lang]}>{copy.backToCheckout}</Link>
          </Button>
        </div>
      )}
    </SensitiveLayout>
  );
}
