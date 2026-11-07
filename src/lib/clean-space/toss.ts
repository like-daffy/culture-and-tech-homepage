/**
 * Toss Payments 결제위젯 v2 for Clean Space's order (plan §7.2.3). The client key and widget variant come from the
 * service's createOrder answer, never from this site's settings, so a test key and a live service (or the reverse)
 * cannot meet: a production build refuses anything but a live key, every other build anything but a test key. Dollars
 * are paid through Toss's PayPal route with what PayPal needs (`foreignEasyPay`: the country the buyer chose and the
 * product, no shipping); no PayPal SDK is loaded directly.
 */
import { PAGE_PATH, tossAmountNumber, type CreateOrderResponse, type PageLang } from "./contract.generated";
import type { CleanSpaceEnvironment } from "./config-rules";

/** Why the order's Toss settings can't be used by this build, or null. */
export function tossKeyProblem(order: CreateOrderResponse, environment: CleanSpaceEnvironment | null): string | null {
  const { clientKey, environment: tossEnvironment } = order.toss;
  if (typeof clientKey !== "string" || !/^(test|live)_[A-Za-z0-9_]{8,200}$/.test(clientKey)) return "The payment settings from the service are not valid.";
  const live = environment === "production";
  if (live && (tossEnvironment !== "live" || !clientKey.startsWith("live_"))) return "The service sent test payment settings to the live site.";
  if (!live && (tossEnvironment !== "test" || !clientKey.startsWith("test_"))) return "The service sent live payment settings to a test build.";
  return null;
}

/** The widget variants: the service's payment UI variant (DEFAULT when it names none) and the agreement UI. */
export function widgetVariants(order: CreateOrderResponse): { variantKey: string; agreementVariantKey: string } {
  // `agreementVariantKey` is not in contract v1; read it if a later service adds it, else Toss's default.
  const extra = (order.toss as { agreementVariantKey?: unknown }).agreementVariantKey;
  return {
    variantKey: order.toss.variantKey ?? "DEFAULT",
    agreementVariantKey: typeof extra === "string" && /^[A-Za-z0-9_-]{1,50}$/.test(extra) ? extra : "AGREEMENT",
  };
}

/** What PayPal is told about the purchase (English, as Toss recommends): a digital licence, so nothing is shipped. */
export const PAYPAL_PRODUCT_DESCRIPTION =
  "Digital licence, no shipping: 364 days of the Clean Space website download's features for the buyer's account. One payment, no automatic renewal.";

export interface WidgetPaymentRequest {
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  customerEmail: string | null;
  foreignEasyPay?: {
    country: string;
    products: Array<{ name: string; quantity: number; unitAmount: number; currency: string; description: string }>;
  };
}

/** The payment request for the order: result pages under Clean Space's checkout on this origin, in the page's language. */
export function paymentRequestFor(order: CreateOrderResponse, options: { lang: PageLang; origin: string; buyerCountry: string | null }): WidgetPaymentRequest {
  const request: WidgetPaymentRequest = {
    orderId: order.orderID,
    orderName: order.orderName,
    successUrl: `${options.origin}${PAGE_PATH.success[options.lang]}`,
    failUrl: `${options.origin}${PAGE_PATH.fail[options.lang]}`,
    customerEmail: order.receiptEmail || null,
  };
  if (order.money.currency === "USD") {
    if (!options.buyerCountry || !/^[A-Z]{2}$/.test(options.buyerCountry)) throw new Error("Choose the country you are in first.");
    request.foreignEasyPay = {
      country: options.buyerCountry,
      products: [
        {
          name: order.orderName,
          quantity: 1,
          unitAmount: tossAmountNumber(order.money),
          currency: order.money.currency,
          description: PAYPAL_PRODUCT_DESCRIPTION,
        },
      ],
    };
  }
  return request;
}

export interface PaymentWidget {
  /** Opens the payment window; Toss then sends the browser to the success or fail page. */
  requestPayment(request: WidgetPaymentRequest): Promise<void>;
  /** Called when the buyer ticks or unticks Toss's required terms. */
  onAgreementChange(listener: (agreedRequiredTerms: boolean) => void): void;
  /** Removes both widgets; repeating it is harmless. */
  destroy(): Promise<void>;
}

let previousWidget: Promise<void> = Promise.resolve();

/**
 * loadTossPayments(order's client key) → widgets({ customerKey }) → setAmount → payment methods and agreement. Toss
 * renders one pair at a time, so a new render waits for the previous one's removal. If one widget fails, the other is
 * removed again.
 */
export function renderPaymentWidget(
  order: CreateOrderResponse,
  options: { environment: CleanSpaceEnvironment | null; methodsSelector: string; agreementSelector: string },
): Promise<PaymentWidget> {
  const problem = tossKeyProblem(order, options.environment);
  if (problem) return Promise.reject(new Error(problem));
  const waitFor = previousWidget;
  let gone!: () => void;
  previousWidget = new Promise<void>((resolve) => {
    gone = resolve;
  });
  return (async (): Promise<PaymentWidget> => {
    try {
      await waitFor;
      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(order.toss.clientKey);
      const widgets = tossPayments.widgets({ customerKey: order.customerKey });
      await widgets.setAmount({ currency: order.money.currency, value: tossAmountNumber(order.money) });
      const { variantKey, agreementVariantKey } = widgetVariants(order);
      const [methods, agreement] = await Promise.allSettled([
        widgets.renderPaymentMethods({ selector: options.methodsSelector, variantKey }),
        widgets.renderAgreement({ selector: options.agreementSelector, variantKey: agreementVariantKey }),
      ]);
      if (methods.status === "rejected" || agreement.status === "rejected") {
        await Promise.allSettled([
          methods.status === "fulfilled" ? methods.value.destroy() : null,
          agreement.status === "fulfilled" ? agreement.value.destroy() : null,
        ]);
        throw methods.status === "rejected" ? methods.reason : (agreement as PromiseRejectedResult).reason;
      }
      let destroyed: Promise<void> | null = null;
      return {
        requestPayment: async (request) => {
          await widgets.requestPayment(request);
        },
        onAgreementChange: (listener) => {
          agreement.value.on("agreementStatusChange", (status) => listener(status.agreedRequiredTerms));
        },
        destroy: () => (destroyed ??= Promise.allSettled([methods.value.destroy(), agreement.value.destroy()]).then(() => gone())),
      };
    } catch (error) {
      gone();
      throw error;
    }
  })();
}

/** A Toss SDK error's code (USER_CANCEL, NEED_AGREEMENT_WITH_REQUIRED_TERMS, …), or null. */
export function sdkErrorCode(error: unknown): string | null {
  const code: unknown = typeof error === "object" && error !== null ? (error as { code?: unknown }).code : undefined;
  return typeof code === "string" ? code : null;
}
