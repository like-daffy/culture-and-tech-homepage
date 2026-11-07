import { CheckoutSuccess } from "@/components/checkout/CheckoutResult";
import { PRODUCTS } from "@/lib/checkout/products";

// Where Toss Payments sends the buyer back after a payment, in English (src/components/checkout/CheckoutResult.tsx)
export default function DjDuplicateGuardCheckoutSuccess() {
  return <CheckoutSuccess product={PRODUCTS["dj-duplicate-guard"]} lang="en" />;
}
