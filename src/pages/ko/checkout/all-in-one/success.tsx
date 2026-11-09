import { CheckoutSuccess } from "@/components/checkout/CheckoutResult";
import { PRODUCTS } from "@/lib/checkout/products";

// Where Toss Payments sends the buyer back after an All-in-one payment, in Korean (src/components/checkout/CheckoutResult.tsx)
export default function AllInOneCheckoutSuccess() {
  return <CheckoutSuccess product={PRODUCTS["all-in-one"]} lang="ko" />;
}
