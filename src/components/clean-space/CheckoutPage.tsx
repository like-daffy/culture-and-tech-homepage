import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { describeError } from "@/lib/clean-space/api";
import { signOutCleanSpace } from "@/lib/clean-space/auth";
import {
  checkoutView,
  clearIntent,
  clearResume,
  loadIntent,
  loadResume,
  orderBlocker,
  saveIntent,
  type CheckoutView,
} from "@/lib/clean-space/checkout-machine";
import { CLEAN_SPACE } from "@/lib/clean-space/config";
import { COPY } from "@/lib/clean-space/copy";
import {
  PAGE_PATH,
  PRODUCT_ID,
  sameMoney,
  type ConfirmPaymentResponse,
  type CreateOrderResponse,
  type Currency,
  type PageLang,
  type PolicyVersions,
} from "@/lib/clean-space/contract.generated";
import { countryOptions } from "@/lib/clean-space/countries";
import { formatInstant, formatPrice } from "@/lib/clean-space/display";
import { cleanSpaceApi } from "@/lib/clean-space/firebase";
import { sessionStore } from "@/lib/clean-space/storage";
import { paymentRequestFor, renderPaymentWidget, sdkErrorCode, type PaymentWidget } from "@/lib/clean-space/toss";
import { ContactVerification } from "./ContactVerification";
import { useCleanSpaceUser, useLoad, useSessionGuard } from "./hooks";
import { OfferSummary } from "./OfferSummary";
import { PaidResult, PendingResult } from "./PaymentResult";
import { Notice, PageTitle, Section, SensitiveLayout } from "./SensitiveLayout";
import { SignInPanel } from "./SignInPanel";

type Phase =
  | { kind: "idle" }
  | { kind: "creating" }
  | { kind: "rendering"; order: CreateOrderResponse }
  | { kind: "ready"; order: CreateOrderResponse }
  | { kind: "submitting"; order: CreateOrderResponse }
  | { kind: "error"; message: string };

type Resume =
  | { kind: "none" }
  | { kind: "confirming" }
  | { kind: "paid"; result: ConfirmPaymentResponse }
  | { kind: "pending" }
  | { kind: "problem"; message: string; keep: boolean };

interface Choice {
  currency: Currency | null;
  buyerCountry: string | null;
  accepted: PolicyVersions | null;
}

const METHODS_ID = "clean-space-payment-methods";
const AGREEMENT_ID = "clean-space-payment-agreement";

/** /checkout/clean-space/ (and /ko/…): the one offer, sign-in, receipt email, policies, then Toss Payments. */
export function CheckoutPage({ lang }: { lang: PageLang }) {
  const copy = COPY[lang];
  const userState = useCleanSpaceUser();
  const user = userState.status === "signed-in" ? userState.user : null;
  const currentSession = useSessionGuard(user);
  const gateOpen = CLEAN_SPACE.configured && CLEAN_SPACE.salesEnabled && CLEAN_SPACE.policiesPublished;

  const [offer, reloadOffer] = useLoad(gateOpen ? "offer" : null, () => cleanSpaceApi.getOffer());
  const [account, reloadAccount] = useLoad(gateOpen && user ? user.sessionKey : null, () => cleanSpaceApi.getAccount());
  const view: CheckoutView = checkoutView({
    configured: CLEAN_SPACE.configured,
    salesEnabled: CLEAN_SPACE.salesEnabled,
    policiesPublished: CLEAN_SPACE.policiesPublished,
    offer: offer ?? { status: "loading" },
    auth: userState.status,
    account,
  });

  // The buyer's unpaid choices survive a sign-in in this tab; acceptances only for the policy versions they were for.
  const [choice, setChoice] = useState<Choice>({ currency: null, buyerCountry: null, accepted: null });
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    const intent = loadIntent(sessionStore(), Date.now());
    if (intent) setChoice({ currency: intent.currency, buyerCountry: intent.buyerCountry, accepted: intent.accepted });
    setRestored(true);
  }, []);
  useEffect(() => {
    if (restored) saveIntent(sessionStore(), choice, Date.now());
  }, [choice, restored]);

  // A payment whose success page lost its sign-in is finished here, once, by its buyer (plan §7.2.4).
  const [resume, setResume] = useState<Resume>({ kind: "none" });
  const resumeStarted = useRef(false);
  useEffect(() => {
    if (!user || resumeStarted.current) return;
    const held = loadResume(sessionStore(), Math.floor(Date.now() / 1000));
    if (!held) return;
    resumeStarted.current = true;
    const session = user.sessionKey;
    setResume({ kind: "confirming" });
    cleanSpaceApi.confirmPayment({ resumeID: held.resumeID }).then(
      (result) => {
        if (currentSession() !== session) return setResume({ kind: "problem", message: copy.accountChanged, keep: true });
        clearResume(sessionStore());
        clearIntent(sessionStore());
        setResume({ kind: "paid", result });
        reloadAccount();
      },
      (error: unknown) => {
        const info = describeError(error);
        if (info.code === "PAYMENT_PENDING") return setResume({ kind: "pending" });
        if (info.code === "NOT_ORDER_OWNER") return setResume({ kind: "problem", message: copy.wrongAccount, keep: true });
        if (info.code === "PAYMENT_RESUME_EXPIRED") {
          clearResume(sessionStore());
          return setResume({ kind: "problem", message: copy.resumeExpired, keep: false });
        }
        resumeStarted.current = false;
        setResume({ kind: "problem", message: info.message, keep: true });
      },
    );
  }, [user, currentSession, copy, reloadAccount]);

  // The order and Toss's widgets.
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [agreed, setAgreed] = useState(false);
  const [declined, setDeclined] = useState(false);
  const widget = useRef<PaymentWidget | null>(null);
  useEffect(() => () => void widget.current?.destroy(), []);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    if (phase.kind !== "rendering") return;
    let cancelled = false;
    const order = phase.order;
    renderPaymentWidget(order, { environment: CLEAN_SPACE.environment, methodsSelector: `#${METHODS_ID}`, agreementSelector: `#${AGREEMENT_ID}` }).then(
      (rendered) => {
        if (cancelled) return void rendered.destroy();
        widget.current = rendered;
        setAgreed(false);
        rendered.onAgreementChange(setAgreed);
        setPhase({ kind: "ready", order });
      },
      (error: unknown) => {
        if (!cancelled) setPhase({ kind: "error", message: error instanceof Error ? error.message : copy.declined });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [phase, copy]);

  const discardOrder = async (order: CreateOrderResponse | null) => {
    const current = widget.current;
    widget.current = null;
    await current?.destroy();
    if (order) {
      // Closes the unpaid order so another one (in the other currency) may start; nothing was paid on it.
      await cleanSpaceApi.failOrder({ orderID: order.orderID, code: "CHECKOUT_CHANGED", message: "The buyer changed the order before paying." }).catch(() => undefined);
    }
  };

  // Another account signed in, or this one signed out: an order made for the previous session is never paid here.
  const sessionKey = user?.sessionKey ?? null;
  const lastSession = useRef<string | null>(sessionKey);
  useEffect(() => {
    if (lastSession.current === sessionKey) return;
    lastSession.current = sessionKey;
    const current = phaseRef.current;
    const order = current.kind === "rendering" || current.kind === "ready" || current.kind === "submitting" ? current.order : null;
    if (order || current.kind !== "idle") {
      void discardOrder(order);
      setPhase({ kind: "idle" });
    }
  }, [sessionKey]);

  const update = (change: Partial<Choice>) => {
    if (phase.kind === "creating" || phase.kind === "submitting") return;
    const order = phase.kind === "rendering" || phase.kind === "ready" ? phase.order : null;
    if (order) {
      void discardOrder(order);
      setPhase({ kind: "idle" });
    }
    setDeclined(false);
    setChoice((previous) => ({ ...previous, ...change }));
  };

  const continueToPayment = async () => {
    if (view.kind !== "ready" || orderBlocker(view, choice) !== null) return;
    if (phase.kind !== "idle" && phase.kind !== "error") return; // one order at a time, never a double submission
    const session = currentSession();
    const currency = choice.currency as Currency;
    setDeclined(false);
    setPhase({ kind: "creating" });
    try {
      const order = await cleanSpaceApi.createOrder({
        productID: PRODUCT_ID,
        offerVersion: view.offer.offerVersion,
        currency,
        acceptedPolicies: view.offer.policyVersions,
        buyerCountry: currency === "USD" ? choice.buyerCountry : null,
        lang,
      });
      if (currentSession() !== session) {
        await discardOrder(order);
        return setPhase({ kind: "error", message: copy.accountChanged });
      }
      const price = view.offer.prices.find((p) => p.currency === currency);
      if (!price || !sameMoney(order.money, price)) {
        await discardOrder(order);
        reloadOffer();
        return setPhase({ kind: "error", message: copy.offerChanged });
      }
      setPhase({ kind: "rendering", order });
    } catch (error) {
      const info = describeError(error);
      if (info.code === "OFFER_CHANGED" || info.code === "SALES_CLOSED" || info.code === "CURRENCY_UNAVAILABLE") reloadOffer();
      if (info.code === "ALREADY_ACTIVE" || info.code === "CONTACT_NOT_VERIFIED" || info.code === "ACCOUNT_DELETED") reloadAccount();
      setPhase({
        kind: "error",
        message: info.code === "CHECKOUT_IN_PROGRESS" ? copy.checkoutInProgress : info.code === "OFFER_CHANGED" ? copy.offerChanged : info.message,
      });
    }
  };

  const pay = async () => {
    if (phase.kind !== "ready" || !widget.current || !agreed) return;
    const order = phase.order;
    setPhase({ kind: "submitting", order });
    try {
      await widget.current.requestPayment(paymentRequestFor(order, { lang, origin: window.location.origin, buyerCountry: choice.buyerCountry }));
      // Toss now sends the browser to the success or fail page.
    } catch (error) {
      const code = sdkErrorCode(error);
      if (code === "USER_CANCEL" || code === "PAY_PROCESS_CANCELED") setDeclined(true);
      else if (code !== "NEED_AGREEMENT_WITH_REQUIRED_TERMS") setPhase({ kind: "error", message: error instanceof Error ? error.message : copy.declined });
      setPhase((current) => (current.kind === "submitting" ? { kind: "ready", order } : current));
    }
  };

  const countries = useMemo(() => countryOptions(lang), [lang]);
  const signedInLabel = account?.status === "ready" ? (account.value.account.displayLabel ?? user?.email ?? copy.thisAccount) : (user?.email ?? copy.thisAccount);

  const body = (() => {
    if (resume.kind === "confirming") return <Notice>{copy.finishingPayment}</Notice>;
    if (resume.kind === "paid") return <PaidResult lang={lang} result={resume.result} />;
    if (resume.kind === "pending") return <PendingResult lang={lang} orderID={null} />;
    switch (view.kind) {
      case "loading":
        return <p className="text-muted-foreground">{copy.loading}</p>;
      case "unavailable":
        return (
          <div className="space-y-6">
            <Notice tone={view.reason === "offer-error" ? "error" : "info"}>{copy.unavailable[view.reason]}</Notice>
            {view.reason === "offer-error" && (
              <Button variant="outline" onClick={reloadOffer}>
                {copy.tryAgain}
              </Button>
            )}
            <OfferSummary lang={lang} offer={null} />
          </div>
        );
      case "signed-out":
        return (
          <div className="space-y-6">
            <OfferSummary lang={lang} offer={view.offer} />
            <SignInPanel lang={lang} returnTo={{ route: "checkout", lang }} title={copy.signInToBuy} />
          </div>
        );
      case "account-error":
        return (
          <div className="space-y-4">
            <Notice tone="error">{view.error.message}</Notice>
            <Button variant="outline" onClick={reloadAccount}>
              {copy.tryAgain}
            </Button>
          </div>
        );
      case "deleting":
        return <Notice>{copy.deleting}</Notice>;
      case "already-active":
        return (
          <div className="space-y-6">
            <Notice tone="success">{copy.alreadyActive(formatInstant(view.expiresAt, lang))}</Notice>
            <Button asChild variant="outline">
              <Link href={PAGE_PATH.account[lang]}>{copy.accountLink}</Link>
            </Button>
          </div>
        );
      case "contact-required":
        return (
          <div className="space-y-6">
            <OfferSummary lang={lang} offer={view.offer} />
            {user && <ContactVerification lang={lang} api={cleanSpaceApi} sessionKey={user.sessionKey} currentSession={currentSession} onVerified={() => reloadAccount()} />}
          </div>
        );
      case "ready": {
        const blocker = orderBlocker(view, choice);
        const locked = phase.kind !== "idle" && phase.kind !== "error";
        const price = choice.currency ? view.offer.prices.find((p) => p.currency === choice.currency) : undefined;
        const versions = view.offer.policyVersions;
        const accepted = (key: keyof PolicyVersions) => choice.accepted !== null && choice.accepted[key] === versions[key];
        const setAccepted = (key: keyof PolicyVersions, on: boolean) => {
          const base: PolicyVersions = choice.accepted ?? { terms: "", privacy: "", refunds: "" };
          const next = { ...base, [key]: on ? versions[key] : "" };
          update({ accepted: next.terms || next.privacy || next.refunds ? next : null });
        };
        return (
          <div className="space-y-6">
            <OfferSummary lang={lang} offer={view.offer} />
            {view.previousEndedAt !== null && <Notice>{copy.previousEnded(formatInstant(view.previousEndedAt, lang))}</Notice>}
            <Section>
              <p className="text-sm">
                {copy.signedInAs(signedInLabel)}
                {view.account.account.contact && <span className="block text-muted-foreground">{copy.contactConfirmed(view.account.account.contact.email)}</span>}
              </p>
              <fieldset className="mt-5" disabled={locked}>
                <legend className="mb-2 font-medium">{copy.currencyHeading}</legend>
                <RadioGroup value={choice.currency ?? ""} onValueChange={(value) => update({ currency: value as Currency })} className="gap-3">
                  {view.offer.prices
                    .filter((entry) => view.currencies.includes(entry.currency))
                    .map((entry) => (
                      <div key={entry.currency} className="flex items-center gap-3">
                        <RadioGroupItem value={entry.currency} id={`clean-space-currency-${entry.currency}`} />
                        <Label htmlFor={`clean-space-currency-${entry.currency}`} className="font-normal">
                          {copy.currencyNames[entry.currency]} — <span className="font-semibold">{formatPrice(entry)}</span>
                        </Label>
                      </div>
                    ))}
                </RadioGroup>
              </fieldset>
              {choice.currency === "USD" && (
                <div className="mt-5 flex flex-col gap-2 sm:max-w-sm">
                  <Label htmlFor="clean-space-country">{copy.countryLabel}</Label>
                  <select
                    id="clean-space-country"
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    value={choice.buyerCountry ?? ""}
                    disabled={locked}
                    onChange={(event) => update({ buyerCountry: event.target.value || null })}
                  >
                    <option value="">{copy.countryPlaceholder}</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <fieldset className="mt-6 space-y-3" disabled={locked}>
                <legend className="mb-2 font-medium">{copy.policiesHeading}</legend>
                {(
                  [
                    ["terms", copy.acceptTerms],
                    ["privacy", copy.acceptPrivacy],
                    ["refunds", copy.acceptRefunds],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-start gap-3">
                    <Checkbox id={`clean-space-accept-${key}`} checked={accepted(key)} onCheckedChange={(on) => setAccepted(key, on === true)} className="mt-0.5" />
                    <Label htmlFor={`clean-space-accept-${key}`} className="font-normal leading-relaxed">
                      {label}
                    </Label>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">{copy.policyVersions(versions.terms, versions.privacy, versions.refunds)}</p>
              </fieldset>
              {(phase.kind === "idle" || phase.kind === "error" || phase.kind === "creating") && (
                <Button className="mt-6" onClick={continueToPayment} disabled={blocker !== null || phase.kind === "creating"}>
                  {phase.kind === "creating" ? copy.preparing : copy.continueToPayment}
                </Button>
              )}
              {(phase.kind === "rendering" || phase.kind === "ready" || phase.kind === "submitting") && (
                <Button className="mt-6" variant="ghost" onClick={() => update({})} disabled={phase.kind === "submitting"}>
                  {copy.changeChoice}
                </Button>
              )}
            </Section>
            {(phase.kind === "rendering" || phase.kind === "ready" || phase.kind === "submitting") && (
              <Section>
                {phase.kind === "rendering" && <p className="mb-3 text-sm text-muted-foreground">{copy.preparing}</p>}
                <div id={METHODS_ID} />
                <div id={AGREEMENT_ID} />
                {declined && (
                  <Notice className="mt-4" tone="info">
                    {copy.declined}
                  </Notice>
                )}
                {phase.kind !== "rendering" && price && (
                  <div className="mt-4 space-y-2">
                    <Button onClick={pay} disabled={!agreed || phase.kind === "submitting"} size="lg">
                      {phase.kind === "submitting" ? copy.paying : copy.payButton(formatPrice(phase.order.money))}
                    </Button>
                    {!agreed && <p className="text-xs text-muted-foreground">{copy.agreeTossTerms}</p>}
                  </div>
                )}
              </Section>
            )}
            {phase.kind === "error" && <Notice tone="error">{phase.message}</Notice>}
          </div>
        );
      }
    }
  })();

  return (
    <SensitiveLayout lang={lang} title={copy.checkoutTitle} languageRoute="checkout" seller>
      <PageTitle title={copy.offerName} />
      {resume.kind === "problem" && (
        <Notice tone="error" className="mb-6">
          {resume.message}
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
