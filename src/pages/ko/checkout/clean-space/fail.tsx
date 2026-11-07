// Clean Space's direct sale (docs/clean-space-direct-sale.md): a sensitive page, out of search results.
// The Korean address; its text is English until the owner reviews a translation.
import { PaymentFailPage } from "@/components/clean-space/PaymentResultPages";

export default function KoreanCleanSpaceCheckoutFail() {
  return <PaymentFailPage lang="ko" />;
}
