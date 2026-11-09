import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { PRODUCTS } from "@/lib/checkout/products";

// Clean Space's 364 days Unlock checkout, in Korean: closed unless the build opens it (src/lib/checkout/products.ts)
export default function CleanSpaceCheckout() {
  return <CheckoutPage product={PRODUCTS["clean-space"]} lang="ko" />;
}
