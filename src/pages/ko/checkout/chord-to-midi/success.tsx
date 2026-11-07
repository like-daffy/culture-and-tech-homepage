import { CheckoutSuccess } from "@/components/checkout/CheckoutResult";

// Where Toss Payments sends the buyer back after a payment, in Korean (src/components/checkout/CheckoutResult.tsx)
export default function ChordToMidiCheckoutSuccess() {
  return <CheckoutSuccess lang="ko" />;
}
