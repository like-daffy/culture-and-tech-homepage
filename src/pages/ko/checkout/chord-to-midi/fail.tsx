import { CheckoutFail } from "@/components/checkout/CheckoutResult";

// Where Toss Payments sends the buyer back when a payment didn't go through, in Korean
export default function ChordToMidiCheckoutFail() {
  return <CheckoutFail lang="ko" />;
}
