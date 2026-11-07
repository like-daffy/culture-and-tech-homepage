import { CheckoutSuccess } from "@/components/checkout/CheckoutResult";
import { PRODUCTS } from "@/lib/checkout/products";

// Where Toss Payments sends the buyer back after a payment, in English (src/components/checkout/CheckoutResult.tsx)
export default function ChordToMidiCheckoutSuccess() {
  return <CheckoutSuccess product={PRODUCTS["chord-to-midi"]} lang="en" />;
}
