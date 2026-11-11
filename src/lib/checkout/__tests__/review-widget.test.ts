import { describe, expect, it, vi } from "vitest";
import { renderPaymentWidget } from "../toss";

const fixture = vi.hoisted(() => ({ requests: [] as Record<string, unknown>[] }));
vi.mock("@tosspayments/tosspayments-sdk", () => ({
  loadTossPayments: async () => ({ widgets: () => ({
    setAmount: async () => {},
    renderPaymentMethods: async () => ({ destroy: async () => {} }),
    renderAgreement: async () => ({ destroy: async () => {}, on: () => {} }),
    requestPayment: async (request: Record<string, unknown>) => { fixture.requests.push(request); },
  }) }),
}));

describe("Toss receipt email", () => {
  it("omits the email field if absent and preserves a normal customer's email", async () => {
    const widget = await renderPaymentWidget({ customerKey: "fixture", amount: 100, currency: "KRW", clientKey: "fixture", variantKey: "fixture", agreementVariantKey: "fixture", methodsSelector: "#methods", agreementSelector: "#agreement", productDescription: "fixture" });
    const request = { orderId: "fixture", orderName: "fixture", successUrl: "https://example.invalid/success", failUrl: "https://example.invalid/fail" };
    await widget.requestPayment(request);
    await widget.requestPayment({ ...request, customerEmail: "fixture@example.invalid" });
    expect(fixture.requests[0]).not.toHaveProperty("customerEmail");
    expect(fixture.requests[1].customerEmail).toBe("fixture@example.invalid");
    await widget.destroy();
  });
});
