import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutOrder, describeCallableError, openCheckout, type CallableErrorInfo } from "@/lib/checkout/api";
import { checkoutPath, chordToMidiUrl, isCheckoutConfigured } from "@/lib/checkout/config";
import {
  APP_ERROR,
  type CheckoutCredential,
  type CheckoutOption,
  type CreateOrderResponse,
  type Currency,
  type Lang,
  type OpenCheckoutResponse,
} from "@/lib/checkout/contract";
import { CHECKOUT_COPY, fill, formatPrice, type CheckoutCopy } from "@/lib/checkout/copy";
import { countryOptions } from "@/lib/checkout/countries";
import { forgetHold, newCheckoutKey, readHold, saveHold, takeHandoff, type CheckoutHold } from "@/lib/checkout/session";
import { renderPaymentWidget, sdkErrorCode, type PaymentWidget } from "@/lib/checkout/toss";
import { CheckoutLayout, LinkButton, Notice, Spinner } from "./CheckoutLayout";

/** `text` with each `{name}` replaced by a node (a link). */
export function richText(text: string, nodes: Record<string, ReactNode>): ReactNode {
  return text
    .split(/\{(\w+)\}/)
    .map((part, index) => <Fragment key={index}>{index % 2 === 1 ? (nodes[part] ?? `{${part}}`) : part}</Fragment>);
}

/** A page of Chord to MIDI linked from the checkout: in a new tab, so the checkout keeps its place. */
function NewTabLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="underline" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

type Opening =
  | { kind: "opening" }
  | { kind: "unconfigured" }
  /** No handoff in the address, and nothing held in this tab. */
  | { kind: "missing" }
  | { kind: "refused"; message: string; code: string | null }
  /** Chord to MIDI's backend couldn't be reached: the same open may go through. */
  | { kind: "unreachable"; message: string; hold: CheckoutHold }
  | { kind: "open"; checkout: OpenCheckoutResponse; credential: CheckoutCredential };

/** What to say when the checkout can't be opened for a reason of Chord to MIDI's. */
function openRefusal(copy: CheckoutCopy, info: CallableErrorInfo): string {
  switch (info.code) {
    case APP_ERROR.checkoutExpired:
      return copy.ended;
    case APP_ERROR.alreadyAdFree:
      return copy.already;
    case APP_ERROR.accountDeleted:
      return copy.accountDeleted;
    case APP_ERROR.emailNotConfirmed:
      return copy.emailNotConfirmed;
    case APP_ERROR.accountUnavailable:
      return copy.accountUnavailable;
    case APP_ERROR.currencyUnavailable:
      return copy.unavailable;
    default:
      return fill(copy.openFailed, { message: info.message });
  }
}

/**
 * The checkout of Chord to MIDI's Remove Ads, /checkout/chord-to-midi/ (Korean: /ko/checkout/chord-to-midi/). Chord to
 * MIDI's purchase page sends the signed-in buyer here with a one-time handoff; this page opens the checkout with it
 * (lib/checkout/session.ts), then shows the product and the account it is for, takes the currency, the agreements and,
 * for PayPal, the buyer's country, makes the order at the server's price and renders Toss's 결제위젯. Toss sends the
 * buyer back to this checkout's success or fail page.
 */
export function CheckoutPage({ lang }: { lang: Lang }) {
  const copy = CHECKOUT_COPY[lang];
  const [state, setState] = useState<Opening>({ kind: "opening" });
  const started = useRef(false);

  const open = (hold: CheckoutHold) => {
    setState({ kind: "opening" });
    openCheckout(hold).then(
      (checkout) => {
        const credential = { checkoutId: hold.checkoutId, checkoutKey: hold.checkoutKey };
        saveHold(credential); // the code is spent: only the key opens the checkout from now on
        setState({ kind: "open", checkout, credential });
      },
      (error: unknown) => {
        const info = describeCallableError(error);
        if (info.code === null && info.retryable) {
          setState({ kind: "unreachable", message: info.message, hold });
          return;
        }
        // Refused for good (ended, or an account that can't buy now): this tab keeps nothing of it.
        forgetHold();
        setState({ kind: "refused", message: openRefusal(copy, info), code: info.code });
      }
    );
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    // First of all, the code leaves the address (and so the history entry the browser keeps).
    const handoff = takeHandoff();
    if (!isCheckoutConfigured()) {
      setState({ kind: "unconfigured" });
      return;
    }
    let hold = readHold();
    if (handoff) {
      // A new handoff replaces whatever this tab held: a key of this page's own, bound with the code.
      hold = { checkoutId: handoff.checkoutId, checkoutKey: newCheckoutKey(), handoffCode: handoff.handoffCode };
      saveHold(hold);
    }
    if (!hold) {
      setState({ kind: "missing" });
      return;
    }
    open(hold);
    // Runs once: the handoff is taken from the address on the first run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backToPurchase = (
    <div className="flex flex-wrap gap-3">
      <LinkButton primary href={chordToMidiUrl(lang, "purchase")}>
        {copy.backToPurchase}
      </LinkButton>
    </div>
  );

  let body: ReactNode;
  switch (state.kind) {
    case "opening":
      body = <Spinner label={copy.opening} />;
      break;
    case "unconfigured":
      body = (
        <>
          <Notice tone="error">{copy.notConfigured}</Notice>
          {backToPurchase}
        </>
      );
      break;
    case "missing":
      body = (
        <>
          <Notice>{copy.noCheckout}</Notice>
          {backToPurchase}
        </>
      );
      break;
    case "refused":
      body = (
        <>
          <Notice tone={state.code === APP_ERROR.alreadyAdFree ? "success" : "error"}>{state.message}</Notice>
          {state.code === APP_ERROR.alreadyAdFree ? (
            <div className="flex flex-wrap gap-3">
              <LinkButton primary href={chordToMidiUrl(lang, "account")}>
                {copy.seeAccount}
              </LinkButton>
              <LinkButton href={chordToMidiUrl(lang, "")}>{copy.backToChordToMidi}</LinkButton>
            </div>
          ) : (
            backToPurchase
          )}
        </>
      );
      break;
    case "unreachable":
      body = (
        <>
          <Notice tone="error">{fill(copy.openFailed, { message: state.message })}</Notice>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => open(state.hold)}>
              {copy.retry}
            </Button>
          </div>
        </>
      );
      break;
    case "open":
      body = <Checkout lang={lang} checkout={state.checkout} credential={state.credential} />;
      break;
  }

  return (
    <CheckoutLayout lang={lang}>
      <h1 className="text-2xl font-semibold">{copy.productName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{copy.seller}</p>
      <div className="mt-6 space-y-6">{body}</div>
    </CheckoutLayout>
  );
}

/** Korean pages suggest won, English pages dollars; the buyer can change it. */
function suggestedCurrency(lang: Lang, options: CheckoutOption[]): Currency {
  const preferred: Currency = lang === "ko" ? "KRW" : "USD";
  return options.some((option) => option.currency === preferred) ? preferred : (options[0]?.currency ?? "KRW");
}

function Checkout({
  lang,
  checkout,
  credential,
}: {
  lang: Lang;
  checkout: OpenCheckoutResponse;
  credential: CheckoutCredential;
}) {
  const copy = CHECKOUT_COPY[lang];
  const { options } = checkout;
  const testOption = options.find((option) => option.test) ?? null;
  const [currency, setCurrency] = useState<Currency>(() => suggestedCurrency(lang, options));
  const option = options.find((candidate) => candidate.currency === currency) ?? options[0] ?? null;
  const terms = <NewTabLink href={chordToMidiUrl(lang, "terms")}>{copy.termsLink}</NewTabLink>;
  const refund = <NewTabLink href={chordToMidiUrl(lang, "refund")}>{copy.refundLink}</NewTabLink>;

  return (
    <>
      {testOption && <Notice>{fill(copy.testMode, { price: formatPrice(testOption.price, testOption.currency, lang) })}</Notice>}
      <Notice>
        {fill(copy.account, { email: checkout.receiptEmail })}{" "}
        <a className="underline" href={chordToMidiUrl(lang, "purchase")}>
          {copy.notYou}
        </a>
      </Notice>
      <section aria-labelledby="product" className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h2 id="product" className="sr-only">
          {copy.productName}
        </h2>
        <p>{copy.lead}</p>
        {options.length > 1 ? (
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">{copy.currencyLegend}</legend>
            {options.map((candidate) => (
              <label
                key={candidate.currency}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 has-[:checked]:border-primary"
              >
                <input
                  type="radio"
                  name="currency"
                  value={candidate.currency}
                  checked={candidate.currency === currency}
                  onChange={() => setCurrency(candidate.currency)}
                  className="mt-1"
                />
                <PriceText lang={lang} option={candidate} />
              </label>
            ))}
          </fieldset>
        ) : (
          options.map((candidate) => (
            <div key={candidate.currency} className="rounded-md border border-border p-3">
              <PriceText lang={lang} option={candidate} />
            </div>
          ))
        )}
        <p className="text-sm text-muted-foreground">{copy.priceTerms}</p>
        <p className="text-sm text-muted-foreground">{copy.period}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {copy.includes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">{richText(copy.policies, { terms, refund })}</p>
      </section>
      {option ? (
        <section className="space-y-4 rounded-lg border border-border bg-card p-6">
          {/* A new currency starts the payment over: an order is in one currency. */}
          <Payment
            key={option.currency}
            lang={lang}
            option={option}
            credential={credential}
            orderName={checkout.orderName}
            receiptEmail={checkout.receiptEmail}
          />
        </section>
      ) : (
        <Notice>{copy.unavailable}</Notice>
      )}
    </>
  );
}

/** "₩6,600 / Korean won / For Korean cards and easy-pay services, VAT included"; a test amount says so. */
function PriceText({ lang, option }: { lang: Lang; option: CheckoutOption }) {
  const copy = CHECKOUT_COPY[lang];
  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-lg font-semibold">{formatPrice(option.price, option.currency, lang)}</span>
      {option.test && <span className="text-xs text-muted-foreground">{copy.testPrice}</span>}
      <span className="text-sm">{copy.currencyNames[option.currency]}</span>
      <span className="text-xs text-muted-foreground">{copy.currencyNotes[option.currency]}</span>
    </span>
  );
}

type Step =
  | { kind: "agree" }
  | { kind: "preparing" }
  | { kind: "paying"; order: CreateOrderResponse }
  | { kind: "error"; message: string; ended: boolean };

/** What to say when the order is refused for a reason of Chord to MIDI's (Toss's own messages are shown as they come). */
function orderRefusal(copy: CheckoutCopy, info: CallableErrorInfo): string {
  switch (info.code) {
    case APP_ERROR.checkoutExpired:
      return copy.ended;
    case APP_ERROR.alreadyAdFree:
      return copy.already;
    case APP_ERROR.checkoutInProgress:
      return copy.inProgress;
    case APP_ERROR.accountDeleted:
      return copy.accountDeleted;
    case APP_ERROR.emailNotConfirmed:
      return copy.emailNotConfirmed;
    case APP_ERROR.currencyUnavailable:
      return copy.unavailable;
    default:
      return info.message;
  }
}

function Payment({
  lang,
  option,
  credential,
  orderName,
  receiptEmail,
}: {
  lang: Lang;
  option: CheckoutOption;
  credential: CheckoutCredential;
  orderName: string;
  receiptEmail: string;
}) {
  const copy = CHECKOUT_COPY[lang];
  const paypal = option.currency === "USD";
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  // PayPal asks where the buyer is (Toss's foreignEasyPay.country): the buyer says so; nothing guesses it.
  const [country, setCountry] = useState("");
  const [step, setStep] = useState<Step>({ kind: "agree" });
  const [tossAgreed, setTossAgreed] = useState(false);
  const [paying, setPaying] = useState(false);
  const [windowClosed, setWindowClosed] = useState(false);
  // The rendered 결제위젯 and the order it was rendered for.
  const [widget, setWidget] = useState<{ orderId: string; widget: PaymentWidget } | null>(null);

  useEffect(() => {
    if (step.kind !== "paying") return;
    let cancelled = false;
    let rendered: PaymentWidget | null = null;
    renderPaymentWidget({
      customerKey: step.order.customerKey,
      amount: step.order.amount,
      currency: step.order.currency,
      clientKey: option.clientKey,
      variantKey: option.variantKey,
      agreementVariantKey: option.agreementVariantKey,
      methodsSelector: "#payment-methods",
      agreementSelector: "#payment-agreement",
    }).then(
      (result) => {
        if (cancelled) {
          void result.destroy();
          return;
        }
        rendered = result;
        result.onAgreementChange(setTossAgreed);
        setTossAgreed(true);
        setWidget({ orderId: step.order.orderId, widget: result });
      },
      (error: unknown) => {
        // A render this payment has moved on from (another order, or a step since) reports nothing.
        if (!cancelled) setStep({ kind: "error", message: describeCallableError(error).message, ended: false });
      }
    );
    return () => {
      cancelled = true;
      void rendered?.destroy();
    };
  }, [step, option]);

  const ready = step.kind === "paying" && widget?.orderId === step.order.orderId ? widget.widget : null;

  const start = () => {
    setStep({ kind: "preparing" });
    createCheckoutOrder({ ...credential, termsAccepted: true, ageConfirmed: true, currency: option.currency }).then(
      (order) => {
        // What Toss charges must be what this page showed: a price changed since stops here, before anything reaches Toss.
        if (order.currency !== option.currency || order.amount !== option.price) {
          setStep({ kind: "error", message: copy.priceChanged, ended: false });
          return;
        }
        setStep({ kind: "paying", order });
      },
      (error: unknown) => {
        const info = describeCallableError(error);
        if (info.code === APP_ERROR.checkoutExpired) forgetHold();
        setStep({ kind: "error", message: orderRefusal(copy, info), ended: info.code === APP_ERROR.checkoutExpired });
      }
    );
  };

  const pay = (order: CreateOrderResponse) => {
    if (!ready || paying) return;
    setPaying(true);
    setWindowClosed(false);
    ready
      .requestPayment({
        orderId: order.orderId,
        orderName: order.orderName || orderName,
        successUrl: `${window.location.origin}${checkoutPath(lang, "success")}`,
        failUrl: `${window.location.origin}${checkoutPath(lang, "fail")}`,
        // The address frozen on the order: Toss sends the receipt there.
        customerEmail: order.receiptEmail,
        ...(paypal ? { country } : {}),
      })
      .catch((error: unknown) => {
        const code = sdkErrorCode(error);
        // The buyer closed Toss's window: nothing was charged, and the same widget can pay again.
        if (code === "USER_CANCEL") setWindowClosed(true);
        else if (code === "NEED_AGREEMENT_WITH_REQUIRED_TERMS") setTossAgreed(false);
        else setStep({ kind: "error", message: describeCallableError(error).message, ended: false });
      })
      .finally(() => setPaying(false));
  };

  const shownEmail = step.kind === "paying" ? step.order.receiptEmail : receiptEmail;
  const receipt = <p className="text-sm text-muted-foreground">{fill(copy.receiptEmail, { email: shownEmail })}</p>;

  if (step.kind === "agree" || step.kind === "preparing") {
    return (
      <>
        {receipt}
        {paypal && <CountryField lang={lang} country={country} onChange={setCountry} />}
        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
            />
            <span>
              {richText(copy.agreeTerms, {
                terms: <NewTabLink href={chordToMidiUrl(lang, "terms")}>{copy.termsLink}</NewTabLink>,
                refund: <NewTabLink href={chordToMidiUrl(lang, "refund")}>{copy.refundLink}</NewTabLink>,
              })}
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={ageConfirmed}
              onChange={(event) => setAgeConfirmed(event.target.checked)}
            />
            <span>{copy.agreeAge}</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={!termsAccepted || !ageConfirmed || (paypal && country === "") || step.kind === "preparing"}
            onClick={start}
          >
            {step.kind === "preparing" ? copy.preparing : copy.continue}
          </Button>
        </div>
      </>
    );
  }

  if (step.kind === "error") {
    return (
      <>
        <Notice tone="error">{fill(copy.failed, { message: step.message })}</Notice>
        <div className="flex flex-wrap gap-3">
          {step.ended ? (
            <LinkButton primary href={chordToMidiUrl(lang, "purchase")}>
              {copy.backToPurchase}
            </LinkButton>
          ) : (
            <Button type="button" variant="outline" onClick={() => setStep({ kind: "agree" })}>
              {copy.retry}
            </Button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {receipt}
      <div id="payment-methods" className="min-h-[120px]" />
      <div id="payment-agreement" />
      {windowClosed && <Notice>{copy.windowClosed}</Notice>}
      <div className="flex flex-wrap gap-3">
        <Button type="button" disabled={!tossAgreed || paying || !ready} onClick={() => pay(step.order)}>
          {fill(copy.pay, { price: formatPrice(step.order.amount, step.order.currency, lang) })}
        </Button>
      </div>
      {!tossAgreed && <p className="text-sm text-muted-foreground">{copy.agreeToss}</p>}
    </>
  );
}

/** Where the buyer is, for PayPal: required, chosen from every country (no default). */
function CountryField({ lang, country, onChange }: { lang: Lang; country: string; onChange: (country: string) => void }) {
  const copy = CHECKOUT_COPY[lang];
  const [options] = useState(() => countryOptions(lang));
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{copy.countryLabel}</span>
      <select
        className="h-9 rounded-md border border-input bg-background px-3"
        value={country}
        required
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{copy.countryChoose}</option>
        {options.map(({ code, name }) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      <span className="text-xs text-muted-foreground">{copy.countryNote}</span>
    </label>
  );
}
