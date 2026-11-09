import { CheckoutFail } from "@/components/checkout/CheckoutResult";
import { PRODUCTS } from "@/lib/checkout/products";

// Where Toss Payments sends the buyer back when an All-in-one payment didn't go through, in English
export default function AllInOneCheckoutFail() {
  return <CheckoutFail product={PRODUCTS["all-in-one"]} lang="en" />;
}
