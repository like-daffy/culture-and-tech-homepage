import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { PRODUCTS } from "@/lib/checkout/products";

// The checkout of Chord to MIDI's Remove Ads, in English (src/components/checkout/CheckoutPage.tsx)
export default function ChordToMidiCheckout() {
  return <CheckoutPage product={PRODUCTS["chord-to-midi"]} lang="en" />;
}
