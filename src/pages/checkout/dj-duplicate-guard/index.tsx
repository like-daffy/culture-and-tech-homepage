import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { PRODUCTS } from "@/lib/checkout/products";

// DJ Duplicate Guard's Expert checkout, in English: closed unless the build opens it (src/lib/checkout/products.ts)
export default function DjDuplicateGuardCheckout() {
  return <CheckoutPage product={PRODUCTS["dj-duplicate-guard"]} lang="en" />;
}
