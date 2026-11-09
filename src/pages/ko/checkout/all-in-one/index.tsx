import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { PRODUCTS } from "@/lib/checkout/products";

// All-in-one — 364 Days checkout, in Korean: closed unless the build opens it (src/lib/checkout/products.ts)
export default function AllInOneCheckout() {
  return <CheckoutPage product={PRODUCTS["all-in-one"]} lang="ko" />;
}
