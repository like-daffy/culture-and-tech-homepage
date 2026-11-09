import { CheckoutSuccess } from "@/components/checkout/CheckoutResult";
import { PRODUCTS } from "@/lib/checkout/products";

// Where Toss Payments sends the buyer back after a payment, in Korean (src/components/checkout/CheckoutResult.tsx)
export default function CleanSpaceCheckoutSuccess() {
  return <CheckoutSuccess product={PRODUCTS["clean-space"]} lang="ko" />;
}
