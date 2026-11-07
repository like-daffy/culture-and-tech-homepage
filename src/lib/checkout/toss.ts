/**
 * Toss Payments' 결제위젯 v2 (주문서형) for the checkout, as Chord to MIDI's purchase page drove it before its checkout
 * moved here: the widget of the order's currency (its MID's client key and variants, from the checkout session), and
 * for dollars what PayPal needs (`foreignEasyPay`: the country the buyer chose and the product, no shipping).
 */
import type { Currency } from "./contract";
import { isCountryCode } from "./countries";

export interface PaymentWidgetOptions {
  /** From the order. */
  customerKey: string;
  amount: number;
  currency: Currency;
  /** From the currency's checkout option: its MID's client key and the variants to render. */
  clientKey: string;
  variantKey: string;
  agreementVariantKey: string;
  /** CSS selectors of the elements for the payment methods and the terms (약관) UI. */
  methodsSelector: string;
  agreementSelector: string;
  /**
   * What PayPal is told about the purchase (in English, as Toss recommends), for its seller protection and risk
   * checks: the product's own description (products.ts, `paypalDescription`), a digital service with no shipping.
   */
  productDescription: string;
}

export interface PaymentRequestOptions {
  orderId: string;
  orderName: string;
  /** Absolute URLs of the checkout's own success and fail pages in its language. */
  successUrl: string;
  failUrl: string;
  customerEmail?: string;
  /** Dollars (PayPal) only, and required there: the ISO 3166-1 alpha-2 code of the country the buyer chose. */
  country?: string;
}

export interface PaymentWidget {
  /** Opens the payment window for the selected method; Toss then redirects to successUrl or failUrl. */
  requestPayment(options: PaymentRequestOptions): Promise<void>;
  /** Calls `listener` when the buyer ticks or unticks Toss's required terms. */
  onAgreementChange(listener: (agreedRequiredTerms: boolean) => void): void;
  /** Removes both widgets. Repeating it is harmless. */
  destroy(): Promise<void>;
}

/**
 * Settles once the widget rendered last is gone: Toss renders one payment-methods and one agreement widget at a time,
 * so a new render waits for the old one's removal.
 */
let previousWidget: Promise<void> = Promise.resolve();

/**
 * loadTossPayments (with the client key of the currency's MID) → widgets({ customerKey }) → setAmount →
 * renderPaymentMethods and renderAgreement. The SDK script comes from js.tosspayments.com on first use. If either
 * widget fails to render, the other is removed again.
 */
export function renderPaymentWidget(options: PaymentWidgetOptions): Promise<PaymentWidget> {
  const waitFor = previousWidget;
  let gone!: () => void;
  previousWidget = new Promise<void>((resolve) => {
    gone = resolve;
  });
  return (async (): Promise<PaymentWidget> => {
    try {
      await waitFor;
      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(options.clientKey);
      const widgets = tossPayments.widgets({ customerKey: options.customerKey });
      await widgets.setAmount({ currency: options.currency, value: options.amount });
      const [methods, agreement] = await Promise.allSettled([
        widgets.renderPaymentMethods({ selector: options.methodsSelector, variantKey: options.variantKey }),
        widgets.renderAgreement({ selector: options.agreementSelector, variantKey: options.agreementVariantKey }),
      ]);
      if (methods.status === "rejected" || agreement.status === "rejected") {
        // The other one may have rendered: remove it, or the next attempt would find it still there.
        await Promise.allSettled([
          methods.status === "fulfilled" ? methods.value.destroy() : null,
          agreement.status === "fulfilled" ? agreement.value.destroy() : null,
        ]);
        throw methods.status === "rejected" ? methods.reason : (agreement as PromiseRejectedResult).reason;
      }
      let destroyed: Promise<void> | null = null;
      return {
        requestPayment: async (request) => {
          let paypal = {};
          if (options.currency === "USD") {
            if (!isCountryCode(request.country)) throw new Error("Choose the country you are in first.");
            paypal = {
              foreignEasyPay: {
                country: request.country,
                products: [
                  {
                    name: request.orderName,
                    quantity: 1,
                    unitAmount: options.amount,
                    currency: options.currency,
                    description: options.productDescription,
                  },
                ],
              },
            };
          }
          await widgets.requestPayment({
            orderId: request.orderId,
            orderName: request.orderName,
            successUrl: request.successUrl,
            failUrl: request.failUrl,
            customerEmail: request.customerEmail ?? null,
            customerName: null,
            ...paypal,
          });
        },
        onAgreementChange: (listener) => {
          agreement.value.on("agreementStatusChange", (status) => listener(status.agreedRequiredTerms));
        },
        destroy: () =>
          (destroyed ??= Promise.allSettled([methods.value.destroy(), agreement.value.destroy()]).then(() => gone())),
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

/** How a payment's method reads: PayPal by its name, others as Toss labels them ("카드", "간편결제"). */
export function paymentMethodLabel(method: string | null, provider: string | null): string {
  if (provider && /^(paypal|페이팔)$/i.test(provider.trim())) return "PayPal";
  return method ?? "—";
}
