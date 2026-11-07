import { CheckoutFail } from "@/components/checkout/CheckoutResult";
import { PRODUCTS } from "@/lib/checkout/products";

// Where Toss Payments sends the buyer back when a payment didn't go through, in English
export default function ChordToMidiCheckoutFail() {
  return <CheckoutFail product={PRODUCTS["chord-to-midi"]} lang="en" />;
}
