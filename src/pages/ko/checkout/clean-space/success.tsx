// Clean Space's direct sale (docs/clean-space-direct-sale.md): a sensitive page, out of search results.
// The Korean address; its text is English until the owner reviews a translation.
import { PaymentSuccessPage } from "@/components/clean-space/PaymentResultPages";

export default function KoreanCleanSpaceCheckoutSuccess() {
  return <PaymentSuccessPage lang="ko" />;
}
