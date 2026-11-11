import { describe, expect, it, vi } from "vitest";
import { recoverLostCheckout } from "@/components/checkout/CheckoutResult";
import { CHECKOUT_COPY } from "../copy";
import type { OpenProduct } from "../products";

const details = { orderId: "fixture", paymentKey: "fixture", amount: 100 };
describe("lost checkout recovery", () => {
  it("never keeps a Chord payment and instead shows the start-again state", () => {
    const show = vi.fn(), keep = vi.fn();
    recoverLostCheckout({ slug: "chord-to-midi" } as OpenProduct, details, show, keep);
    expect(show).toHaveBeenCalledOnce();
    expect(keep).not.toHaveBeenCalled();
    expect(CHECKOUT_COPY.en.chordLost).toContain("test payment charges nothing");
    expect(CHECKOUT_COPY.ko.chordLost).toContain("테스트 결제는 실제로 청구되지 않습니다");
  });
  it("keeps the existing recovery path for another product", () => {
    const show = vi.fn(), keep = vi.fn();
    recoverLostCheckout({ slug: "clean-space" } as OpenProduct, details, show, keep);
    expect(show).not.toHaveBeenCalled();
    expect(keep).toHaveBeenCalledWith(details);
  });
});
