import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutOrder, describeCallableError, openCheckout, type CallableErrorInfo } from "@/lib/checkout/api";
import {
  APP_ERROR,
  type CheckoutCredential,
  type CheckoutOption,
  type CreateOrderResponse,
  type Currency,
  type Lang,
  type OfferVersions,
  type OpenCheckoutResponse,
} from "@/lib/checkout/contract";
import { CHECKOUT_COPY, fill, formatPrice } from "@/lib/checkout/copy";
import { countryOptions } from "@/lib/checkout/countries";
import {
  checkoutPath,
  isProductConfigured,
  productUrl,
  type CheckoutProduct,
  type ClosedProduct,
  type OpenProduct,
} from "@/lib/checkout/products";
import { forgetHold, newCheckoutKey, readHold, saveHold, takeHandoff, type CheckoutHold } from "@/lib/checkout/session";
import { renderPaymentWidget, sdkErrorCode, type PaymentWidget } from "@/lib/checkout/toss";
import { sameCheckoutIdentity, validCheckoutIdentity } from "@/lib/checkout/review";
import { CheckoutLayout, LinkButton, Notice, Spinner } from "./CheckoutLayout";
import { ReviewEmailNotice } from "./ReviewPaymentNotices";

/** `text` with each `{name}` replaced by a node (a link). */
export function richText(text: string, nodes: Record<string, ReactNode>): ReactNode {
  return text
    .split(/\{(\w+)\}/)
    .map((part, index) => <Fragment key={index}>{index % 2 === 1 ? (nodes[part] ?? `{${part}}`) : part}</Fragment>);
}

/** A page of the product's site linked from the checkout: in a new tab, so the checkout keeps its place. */
function NewTabLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="underline" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/**
 * A product's checkout that this build keeps closed: it says so and offers nothing. It calls nothing (no Firebase, no
 * Toss) and keeps nothing; a handoff in the address leaves it all the same. The product's own server refuses its sales
 * too, whatever a page shows (its sales switch).
 */
export function ClosedCheckout({ product, lang }: { product: ClosedProduct; lang: Lang }) {
  const name = product.name[lang];
  useEffect(() => {
    takeHandoff();
  }, []);
  return (
    <CheckoutLayout product={product} lang={lang}>
      <h1 className="text-2xl font-semibold">{name.productName}</h1>
      <div className="mt-6 space-y-6" data-checkout="closed">
        <Notice>{CHECKOUT_COPY[lang].closed}</Notice>
        <div className="flex flex-wrap gap-3">
          <LinkButton primary href={productUrl(product, lang, "home")}>
            {name.backToProduct}
          </LinkButton>
        </div>
      </div>
    </CheckoutLayout>
  );
}

type Opening =
  | { kind: "opening" }
  | { kind: "unconfigured" }
  /** No handoff in the address, and nothing held in this tab. */
  | { kind: "missing" }
  | { kind: "refused"; message: string; code: string | null }
  /** The product's backend couldn't be reached: the same open may go through. */
  | { kind: "unreachable"; message: string; hold: CheckoutHold }
  | { kind: "open"; checkout: OpenCheckoutResponse; credential: CheckoutCredential };

/** What to say when the checkout can't be opened for a reason of the product's backend. */
function openRefusal(product: OpenProduct, lang: Lang, info: CallableErrorInfo): string {
  const copy = CHECKOUT_COPY[lang];
  const productCopy = product.copy[lang];
  if (info.code !== null && info.code === product.alreadyOwnedCode) return productCopy.already;
  switch (info.code) {
    case APP_ERROR.checkoutExpired:
      return productCopy.ended;
    case APP_ERROR.accountDeleted:
      return productCopy.accountDeleted;
    case APP_ERROR.emailNotConfirmed:
      return productCopy.emailNotConfirmed;
    case APP_ERROR.accountUnavailable:
      return productCopy.accountUnavailable;
    case APP_ERROR.currencyUnavailable:
      return copy.unavailable;
    case APP_ERROR.salesClosed:
      return productCopy.salesClosed;
    default:
      return fill(copy.openFailed, { message: info.message });
  }
}

/**
 * A product's checkout, /checkout/<product>/ (Korean: /ko/checkout/<product>/), closed unless this build opens it.
 * The product's site sends the signed-in buyer here with a one-time handoff; this page opens the checkout with it
 * (lib/checkout/session.ts), then shows the product and the account it is for, takes the currency, the agreements and,
 * for PayPal, the buyer's country, makes the order at the server's price and renders Toss's 결제위젯. Toss sends the
 * buyer back to this checkout's success or fail page.
 */
export function CheckoutPage({ product, lang }: { product: CheckoutProduct; lang: Lang }) {
  if (product.enabled === false) return <ClosedCheckout product={product} lang={lang} />;
  return <OpenCheckout product={product} lang={lang} />;
}

function OpenCheckout({ product, lang }: { product: OpenProduct; lang: Lang }) {
  const copy = CHECKOUT_COPY[lang];
  const productCopy = product.copy[lang];
  const [state, setState] = useState<Opening>({ kind: "opening" });
  const started = useRef(false);

  const open = (hold: CheckoutHold) => {
    setState({ kind: "opening" });
    openCheckout(product, hold).then(
      (checkout) => {
        const credential = { checkoutId: hold.checkoutId, checkoutKey: hold.checkoutKey };
        saveHold(product, credential); // the code is spent: only the key opens the checkout from now on
        setState({ kind: "open", checkout, credential });
      },
      (error: unknown) => {
        const info = describeCallableError(error);
        if (info.code === null && info.retryable) {
          setState({ kind: "unreachable", message: info.message, hold });
          return;
        }
        // Refused for good (ended, or an account that can't buy now): this tab keeps nothing of it.
        forgetHold(product);
        setState({ kind: "refused", message: openRefusal(product, lang, info), code: info.code });
      }
    );
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    // First of all, the code leaves the address (and so the history entry the browser keeps).
    const handoff = takeHandoff();
    if (!isProductConfigured(product)) {
      setState({ kind: "unconfigured" });
      return;
    }
    let hold = readHold(product);
    if (handoff) {
      // A new handoff replaces whatever this tab held: a key of this page's own, bound with the code.
      hold = { checkoutId: handoff.checkoutId, checkoutKey: newCheckoutKey(), handoffCode: handoff.handoffCode };
      saveHold(product, hold);
    }
    if (!hold) {
      setState({ kind: "missing" });
      return;
    }
    open(hold);
    // Runs once: the handoff is taken from the address on the first run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backToStart = (
    <div className="flex flex-wrap gap-3">
      <LinkButton primary href={productUrl(product, lang, product.startPage)}>
        {productCopy.backToProduct}
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
          {backToStart}
        </>
      );
      break;
    case "missing":
      body = (
        <>
          <Notice>{productCopy.noCheckout}</Notice>
          {backToStart}
        </>
      );
      break;
    case "refused": {
      const owned = state.code !== null && state.code === product.alreadyOwnedCode;
      body = (
        <>
          <Notice tone={owned ? "success" : "error"}>{state.message}</Notice>
          {owned ? (
            <div className="flex flex-wrap gap-3">
              <LinkButton primary href={productUrl(product, lang, "account")}>
                {copy.seeAccount}
              </LinkButton>
              <LinkButton href={productUrl(product, lang, "home")}>{productCopy.backToProduct}</LinkButton>
            </div>
          ) : (
            backToStart
          )}
        </>
      );
      break;
    }
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
      body = <Checkout product={product} lang={lang} checkout={state.checkout} credential={state.credential} />;
      break;
  }

  return (
    <CheckoutLayout product={product} lang={lang}>
      <h1 className="text-2xl font-semibold">{productCopy.productName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{productCopy.seller}</p>
      <div className="mt-6 space-y-6">{body}</div>
    </CheckoutLayout>
  );
}

/** Korean pages suggest won, English pages dollars; the buyer can change it. */
function suggestedCurrency(lang: Lang, options: CheckoutOption[]): Currency {
  const preferred: Currency = lang === "ko" ? "KRW" : "USD";
  return options.some((option) => option.currency === preferred) ? preferred : (options[0]?.currency ?? "KRW");
}

export function Checkout({
  product,
  lang,
  checkout,
  credential,
}: {
  product: OpenProduct;
  lang: Lang;
  checkout: OpenCheckoutResponse;
  credential: CheckoutCredential;
}) {
  const copy = CHECKOUT_COPY[lang];
  const productCopy = product.copy[lang];
  const { options } = checkout;
  const testOption = options.find((option) => option.test) ?? null;
  // A product sold on Toss's test keys before its launch says so while a currency's client key is a test key.
  const onTestKeys =
    productCopy.testKeys !== undefined && options.some((option) => !option.test && /^test_/.test(option.clientKey));
  const [currency, setCurrency] = useState<Currency>(() => suggestedCurrency(lang, options));
  const option = options.find((candidate) => candidate.currency === currency) ?? options[0] ?? null;
  // The page states a pass's length in fixed words: a server that says otherwise stops the payment before it starts.
  const termOutOfDate = product.passDays !== undefined && checkout.passDays !== product.passDays;
  const terms = <NewTabLink href={productUrl(product, lang, "terms")}>{copy.termsLink}</NewTabLink>;
  const refund = <NewTabLink href={productUrl(product, lang, "refund")}>{copy.refundLink}</NewTabLink>;
  if (!validCheckoutIdentity(checkout)) return <Notice tone="error">{copy.notConfigured}</Notice>;

  return (
    <>
      {testOption && (
        <Notice>{fill(productCopy.testMode, { price: formatPrice(testOption.price, testOption.currency, lang) })}</Notice>
      )}
      {!testOption && onTestKeys && <Notice>{productCopy.testKeys}</Notice>}
      {checkout.review !== true && <Notice>
        {fill(productCopy.account, { email: checkout.receiptEmail })}{" "}
        <a className="underline" href={productUrl(product, lang, product.startPage)}>
          {productCopy.notYou}
        </a>
      </Notice>}
      <section aria-labelledby="product" className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h2 id="product" className="sr-only">
          {productCopy.productName}
        </h2>
        <p>{productCopy.lead}</p>
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
                <PriceText product={product} lang={lang} option={candidate} />
              </label>
            ))}
          </fieldset>
        ) : (
          options.map((candidate) => (
            <div key={candidate.currency} className="rounded-md border border-border p-3">
              <PriceText product={product} lang={lang} option={candidate} />
            </div>
          ))
        )}
        <p className="text-sm text-muted-foreground">{productCopy.priceTerms}</p>
        <p className="text-sm text-muted-foreground">{productCopy.period}</p>
        {productCopy.renewal && <p className="text-sm text-muted-foreground">{productCopy.renewal}</p>}
        {productCopy.periodTerms && (
          <p className="text-sm text-muted-foreground">
            {richText(productCopy.periodTerms.text, {
              terms: (
                <NewTabLink href={`${productUrl(product, lang, "terms")}#${productCopy.periodTerms.anchor}`}>
                  {productCopy.periodTerms.link}
                </NewTabLink>
              ),
            })}
          </p>
        )}
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {productCopy.includes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">{richText(copy.policies, { terms, refund })}</p>
      </section>
      {termOutOfDate ? (
        <Notice tone="error">{copy.termChanged}</Notice>
      ) : option ? (
        <section className="space-y-4 rounded-lg border border-border bg-card p-6">
          {/* A new currency starts the payment over: an order is in one currency. */}
          <Payment
            key={option.currency}
            product={product}
            lang={lang}
            option={option}
            credential={credential}
            versions={offerVersions(checkout)}
            orderName={checkout.orderName}
            receiptEmail={checkout.receiptEmail}
            review={checkout.review}
          />
        </section>
      ) : (
        <Notice>{copy.unavailable}</Notice>
      )}
    </>
  );
}

/** "₩6,600 / Korean won / For Korean cards and easy-pay services, VAT included"; a test amount says so. */
function PriceText({ product, lang, option }: { product: OpenProduct; lang: Lang; option: CheckoutOption }) {
  const copy = CHECKOUT_COPY[lang];
  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-lg font-semibold">{formatPrice(option.price, option.currency, lang)}</span>
      {option.test && <span className="text-xs text-muted-foreground">{copy.testPrice}</span>}
      <span className="text-sm">{copy.currencyNames[option.currency]}</span>
      <span className="text-xs text-muted-foreground">{product.copy[lang].currencyNotes[option.currency]}</span>
    </span>
  );
}

type Step =
  | { kind: "agree" }
  | { kind: "preparing" }
  | { kind: "paying"; order: CreateOrderResponse }
  | { kind: "error"; message: string; ended: boolean };

/** What to say when the order is refused for a reason of the product's backend (Toss's messages are shown as they come). */
function orderRefusal(product: OpenProduct, lang: Lang, info: CallableErrorInfo): string {
  const copy = CHECKOUT_COPY[lang];
  const productCopy = product.copy[lang];
  if (info.code !== null && info.code === product.alreadyOwnedCode) return productCopy.already;
  switch (info.code) {
    case APP_ERROR.checkoutExpired:
      return productCopy.ended;
    case APP_ERROR.checkoutInProgress:
      return copy.inProgress;
    case APP_ERROR.accountDeleted:
      return productCopy.accountDeleted;
    case APP_ERROR.emailNotConfirmed:
      return productCopy.emailNotConfirmed;
    case APP_ERROR.currencyUnavailable:
      return copy.unavailable;
    case APP_ERROR.salesClosed:
      return productCopy.salesClosed;
    case APP_ERROR.offerChanged:
      return copy.offerChanged;
    default:
      return info.message;
  }
}

/** The versions the server gave with the checkout, to send back with the order: those it gave, and nothing else. */
function offerVersions({ productVersion, termsVersion, refundPolicyVersion }: OpenCheckoutResponse): OfferVersions {
  return {
    ...(productVersion !== undefined && { productVersion }),
    ...(termsVersion !== undefined && { termsVersion }),
    ...(refundPolicyVersion !== undefined && { refundPolicyVersion }),
  };
}

function Payment({
  product,
  lang,
  option,
  credential,
  versions,
  orderName,
  receiptEmail,
  review,
}: {
  product: OpenProduct;
  lang: Lang;
  option: CheckoutOption;
  credential: CheckoutCredential;
  /** What the server gave with the checkout, sent back with the order. */
  versions: OfferVersions;
  orderName: string;
  receiptEmail: string | null;
  review?: true;
}) {
  const copy = CHECKOUT_COPY[lang];
  const productCopy = product.copy[lang];
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
      productDescription: product.paypalDescription,
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
  }, [step, option, product]);

  const ready = step.kind === "paying" && widget?.orderId === step.order.orderId ? widget.widget : null;

  const start = () => {
    setStep({ kind: "preparing" });
    createCheckoutOrder(product, {
      ...credential,
      ...versions,
      termsAccepted: true,
      ageConfirmed: true,
      currency: option.currency,
    }).then(
      (order) => {
        if (!sameCheckoutIdentity({ review, receiptEmail }, order)) {
          setStep({ kind: "error", message: copy.notConfigured, ended: false });
          return;
        }
        // What Toss charges must be what this page showed: a price changed since stops here, before anything reaches Toss.
        if (order.currency !== option.currency || order.amount !== option.price) {
          setStep({ kind: "error", message: copy.priceChanged, ended: false });
          return;
        }
        setStep({ kind: "paying", order });
      },
      (error: unknown) => {
        const info = describeCallableError(error);
        if (info.code === APP_ERROR.checkoutExpired) forgetHold(product);
        setStep({
          kind: "error",
          message: orderRefusal(product, lang, info),
          ended: info.code === APP_ERROR.checkoutExpired,
        });
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
        successUrl: `${window.location.origin}${checkoutPath(product, lang, "success")}`,
        failUrl: `${window.location.origin}${checkoutPath(product, lang, "fail")}`,
        // The address frozen on the order: Toss sends the receipt there.
        ...(order.review === true ? {} : { customerEmail: order.receiptEmail ?? undefined }),
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
  // The product's own label where its account email isn't a recovery address (Clean Space's contact email).
  const receiptLabel = productCopy.receiptEmail ?? copy.receiptEmail;
  const receipt = review === true ? <ReviewEmailNotice lang={lang} /> : <p className="text-sm text-muted-foreground">{fill(receiptLabel, { email: shownEmail ?? "" })}</p>;

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
                terms: <NewTabLink href={productUrl(product, lang, "terms")}>{copy.termsLink}</NewTabLink>,
                refund: <NewTabLink href={productUrl(product, lang, "refund")}>{copy.refundLink}</NewTabLink>,
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
            <LinkButton primary href={productUrl(product, lang, product.startPage)}>
              {productCopy.backToProduct}
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
