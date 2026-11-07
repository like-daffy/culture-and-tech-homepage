import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  confirmCheckoutPayment,
  describeCallableError,
  failCheckoutOrder,
  preparePaymentResume,
  type CallableErrorInfo,
} from "@/lib/checkout/api";
import { APP_ERROR, type ConfirmPaymentResponse, type Lang, type PaymentDetails } from "@/lib/checkout/contract";
import { CHECKOUT_COPY, fill, formatDate, formatInstant } from "@/lib/checkout/copy";
import {
  checkoutPath,
  isProductConfigured,
  productResumeUrl,
  productUrl,
  type CheckoutProduct,
  type OpenProduct,
} from "@/lib/checkout/products";
import { forgetHold, paidOrder, readHold, rememberPaid, type PaidOrder } from "@/lib/checkout/session";
import { paymentMethodLabel } from "@/lib/checkout/toss";
import { ClosedCheckout } from "./CheckoutPage";
import { CheckoutLayout, LinkButton, Notice, Spinner } from "./CheckoutLayout";

/** Toss's success parameters, if the address has them. */
function paymentDetails(search: string): PaymentDetails | null {
  const params = new URLSearchParams(search);
  const paymentKey = params.get("paymentKey");
  const orderId = params.get("orderId");
  const amount = Number(params.get("amount"));
  return paymentKey && orderId && Number.isFinite(amount) && amount > 0 ? { paymentKey, orderId, amount } : null;
}

/** Only an https page (Toss's receipt) is linked; a test build's fake Toss serves its receipts over http. */
const safeLink = (product: OpenProduct, url: string | null): string | null =>
  url && (/^https:\/\//.test(url) || (product.emulators && /^http:\/\//.test(url))) ? url : null;

/** A pass's start and end with their time zone, for a product sold as a pass. */
function PassTerm({ product, lang, pass }: { product: OpenProduct; lang: Lang; pass: PaidOrder["pass"] | undefined }) {
  const text = product.copy[lang].passTerm;
  if (!pass || !text) return null;
  const start = new Date(pass.start);
  const end = new Date(pass.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return (
    <p className="text-sm font-medium" data-pass-term="">
      {fill(text, { start: formatInstant(start, lang), end: formatInstant(end, lang) })}
    </p>
  );
}

type Confirmation =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "unconfigured" }
  | { kind: "confirming" }
  | { kind: "done"; result: ConfirmPaymentResponse }
  /** A reload after the payment went through in this tab, whose checkout is forgotten since. */
  | { kind: "paid"; paid: PaidOrder }
  | { kind: "error"; info: CallableErrorInfo; details: PaymentDetails }
  /** This tab no longer holds the checkout: the payment is kept for its buyer to finish on the product's site. */
  | { kind: "keeping" }
  | { kind: "kept"; resumeId: string }
  | { kind: "keepFailed"; message: string; details: PaymentDetails };

/**
 * /checkout/<product>/success/: where Toss sends the buyer back. The checkout this tab holds confirms the payment with
 * the product's server (which approves it with Toss, grants the product to the account and answers the same to a
 * reload). A tab that no longer holds it (Toss came back in another tab or browser, or the hour ran out) keeps the
 * payment for its buyer instead, who finishes it signed in on the product's site: nothing that opens the account is
 * ever put in an address. A product whose checkout is closed in this build calls nothing here either.
 */
export function CheckoutSuccess({ product, lang }: { product: CheckoutProduct; lang: Lang }) {
  if (product.enabled === false) return <ClosedCheckout product={product} lang={lang} />;
  return <Success product={product} lang={lang} />;
}

function Success({ product, lang }: { product: OpenProduct; lang: Lang }) {
  const copy = CHECKOUT_COPY[lang];
  const productCopy = product.copy[lang];
  const [state, setState] = useState<Confirmation>({ kind: "loading" });
  const started = useRef(false);

  const keep = (details: PaymentDetails) => {
    setState({ kind: "keeping" });
    preparePaymentResume(product, details).then(
      ({ resumeId }) => setState({ kind: "kept", resumeId }),
      (error: unknown) => setState({ kind: "keepFailed", message: describeCallableError(error).message, details })
    );
  };

  const confirm = (details: PaymentDetails) => {
    const hold = readHold(product);
    if (!hold) {
      const paid = paidOrder(product);
      if (paid?.orderId === details.orderId) setState({ kind: "paid", paid });
      else keep(details);
      return;
    }
    setState({ kind: "confirming" });
    confirmCheckoutPayment(product, { checkoutId: hold.checkoutId, checkoutKey: hold.checkoutKey, ...details }).then(
      (result) => {
        // Its job is done: the tab keeps no key that opens the account's checkout any more.
        rememberPaid(product, { orderId: result.orderId, pass: result.pass ?? null });
        setState({ kind: "done", result });
      },
      (error: unknown) => {
        const info = describeCallableError(error);
        if (info.code !== null && info.code === product.alreadyOwnedCode) forgetHold(product);
        if (info.code === APP_ERROR.checkoutExpired) {
          forgetHold(product);
          keep(details);
          return;
        }
        // The tab holds another account's checkout (a later handoff in it): the order's buyer finishes it signed in.
        if (info.code === APP_ERROR.notOrderOwner) {
          keep(details);
          return;
        }
        setState({ kind: "error", info, details });
      }
    );
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const details = paymentDetails(window.location.search);
    if (!details) setState({ kind: "missing" });
    else if (!isProductConfigured(product)) setState({ kind: "unconfigured" });
    else confirm(details);
    // Runs once, for the address Toss sent the buyer to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backLinks = (
    <>
      <LinkButton primary href={productUrl(product, lang, "home")}>
        {productCopy.backToProduct}
      </LinkButton>
      <LinkButton href={productUrl(product, lang, "account")}>{copy.seeAccount}</LinkButton>
    </>
  );

  let body: ReactNode;
  switch (state.kind) {
    case "loading":
    case "confirming":
      body = <Spinner label={copy.confirming} />;
      break;
    case "missing":
      body = <Notice tone="error">{copy.missing}</Notice>;
      break;
    case "unconfigured":
      body = <Notice tone="error">{copy.notConfigured}</Notice>;
      break;
    case "keeping":
      body = <Spinner label={copy.keeping} />;
      break;
    case "kept":
      body = (
        <>
          <Notice>{productCopy.finishOnProduct}</Notice>
          <div className="flex flex-wrap gap-3">
            <LinkButton primary href={productResumeUrl(product, lang, state.resumeId)}>
              {productCopy.finishButton}
            </LinkButton>
          </div>
        </>
      );
      break;
    case "keepFailed":
      body = (
        <>
          <Notice tone="error">{fill(copy.keepFailed, { message: state.message })}</Notice>
          <ContactLine lang={lang} orderId={state.details.orderId} />
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => keep(state.details)}>
              {copy.retry}
            </Button>
          </div>
        </>
      );
      break;
    case "error": {
      const { code, message } = state.info;
      if (code !== null && code === product.alreadyOwnedCode) {
        // Refused before anything reached Toss: the account has the product through another payment.
        body = (
          <>
            <Notice>{productCopy.alreadyOwned}</Notice>
            <div className="flex flex-wrap gap-3">
              <LinkButton primary href={productUrl(product, lang, "account")}>
                {copy.seeAccount}
              </LinkButton>
              <LinkButton href={productUrl(product, lang, "home")}>{productCopy.backToProduct}</LinkButton>
            </div>
          </>
        );
        break;
      }
      const deleted = code === APP_ERROR.accountDeleted;
      body = (
        <>
          <Notice tone="error">
            {code === APP_ERROR.checkoutInProgress
              ? copy.inProgressResult
              : deleted
                ? productCopy.accountDeletedResult
                : fill(copy.confirmFailed, { message })}
          </Notice>
          <ContactLine lang={lang} orderId={state.details.orderId} />
          {!deleted && (
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => confirm(state.details)}>
                {copy.retry}
              </Button>
            </div>
          )}
        </>
      );
      break;
    }
    case "paid":
      body = (
        <>
          <Notice tone="success">
            <strong>{copy.successTitle}</strong>
            <br />
            {productCopy.successBody}
          </Notice>
          <PassTerm product={product} lang={lang} pass={state.paid.pass} />
          <p className="text-sm text-muted-foreground">{fill(copy.orderNumber, { orderId: state.paid.orderId })}</p>
          <div className="flex flex-wrap gap-3">{backLinks}</div>
        </>
      );
      break;
    case "done": {
      const { result } = state;
      const receiptUrl = safeLink(product, result.receiptUrl);
      body = (
        <>
          <Notice tone="success">
            <strong>{copy.successTitle}</strong>
            <br />
            {productCopy.successBody}
            {result.receiptEmail && (
              <>
                <br />
                {fill(copy.receiptSent, { email: result.receiptEmail })}
              </>
            )}
          </Notice>
          <PassTerm product={product} lang={lang} pass={result.pass} />
          <p className="text-sm text-muted-foreground">
            {fill(copy.details, {
              orderId: result.orderId,
              method: paymentMethodLabel(result.method, result.provider ?? null),
              date: formatDate(new Date(result.approvedAt), lang),
            })}
          </p>
          <div className="flex flex-wrap gap-3">
            {backLinks}
            {receiptUrl && (
              <LinkButton href={receiptUrl} newTab>
                {copy.receipt}
              </LinkButton>
            )}
          </div>
        </>
      );
      break;
    }
  }

  return (
    <CheckoutLayout product={product} lang={lang}>
      <h1 className="text-2xl font-semibold">{productCopy.productName}</h1>
      <div className="mt-6 space-y-6">{body}</div>
    </CheckoutLayout>
  );
}

function ContactLine({ lang, orderId }: { lang: Lang; orderId: string }) {
  const copy = CHECKOUT_COPY[lang];
  return (
    <p className="text-sm text-muted-foreground">
      {fill(copy.contactWithOrder, { orderId })}{" "}
      <a className="underline" href="mailto:contact@cultureand.tech">
        contact@cultureand.tech
      </a>
    </p>
  );
}

/**
 * failUrl codes said in the page's language (Toss's message, in Korean, follows in small print). A Map, so that a code
 * from the address such as `constructor` finds nothing rather than a property every object inherits.
 */
const failMessages = new Map<string, "aborted" | "rejected">([
  ["PAY_PROCESS_ABORTED", "aborted"],
  ["REJECT_CARD_COMPANY", "rejected"],
]);

/**
 * /checkout/<product>/fail/: Toss sends the buyer back here when the payment didn't go through. With an orderId (a
 * cancel by the buyer comes without one), the checkout this tab holds records why; the buyer can try again in it.
 */
export function CheckoutFail({ product, lang }: { product: CheckoutProduct; lang: Lang }) {
  if (product.enabled === false) return <ClosedCheckout product={product} lang={lang} />;
  return <Fail product={product} lang={lang} />;
}

function Fail({ product, lang }: { product: OpenProduct; lang: Lang }) {
  const copy = CHECKOUT_COPY[lang];
  const [failure, setFailure] = useState<{ code: string; message: string } | null>(null);
  const reported = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") ?? "";
    const message = params.get("message") ?? "";
    const orderId = params.get("orderId");
    setFailure({ code, message });
    const hold = readHold(product);
    if (reported.current || !orderId || !hold || !isProductConfigured(product)) return;
    reported.current = true;
    void failCheckoutOrder(product, {
      checkoutId: hold.checkoutId,
      checkoutKey: hold.checkoutKey,
      orderId,
      code: code || "UNKNOWN",
      message: message || "unknown",
    }).catch(() => {});
  }, [product]);

  const canceled = failure?.code === "PAY_PROCESS_CANCELED" || failure?.code === "USER_CANCEL";
  const known = failure && !canceled ? failMessages.get(failure.code) : undefined;

  return (
    <CheckoutLayout product={product} lang={lang}>
      <h1 className="text-2xl font-semibold">{copy.failTitle}</h1>
      <div className="mt-6 space-y-6">
        {failure === null ? (
          <Spinner label={copy.loading} />
        ) : (
          <>
            {/* What the address says comes from Toss, but anyone can write an address: it shows only in small print. */}
            <Notice tone={canceled ? "info" : "error"}>
              {canceled ? copy.canceled : known ? copy[known] : copy.notCompleted}
            </Notice>
            {!canceled && (failure.message || failure.code) && (
              <p className="text-sm text-muted-foreground">
                {copy.reported} {`${failure.message ? `${failure.message} ` : ""}${failure.code ? `(${failure.code})` : ""}`}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <LinkButton primary href={checkoutPath(product, lang)}>
                {copy.retry}
              </LinkButton>
              <LinkButton href={productUrl(product, lang, "home")}>{product.copy[lang].backToProduct}</LinkButton>
            </div>
          </>
        )}
      </div>
    </CheckoutLayout>
  );
}
