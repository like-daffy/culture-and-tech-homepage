import type { Lang, OfferVersions } from "./contract";
import { productUrl, type OpenProduct } from "./products";
import type { RefundPhase } from "../refund-schedule";

const prior = "2026-11-10";
const published = "2026-11-23";

const policies = {
  "all-in-one": {
    terms: new Map([
      ["terms-6d509c3ba8a0533291667570b4a90238f2aae6a3f094c8c06dfd959520de80c9", prior],
      ["terms-b65669e4a687ae6a6d04b60c057419bfa55f459e4f419ff20d2a1d1811c41515", published],
    ]),
    refund: new Map([
      ["refunds-e7d429a08df19cf49bede77684aeb82670757154d414905b7222332f5f76a1c3", prior],
      ["refunds-24123442be13355910d68b7307b94c41c2654aa09af7ca5d011f3680003164a9", published],
    ]),
  },
  "clean-space": {
    terms: new Map([
      ["2026-11-10-705b9411bb55", prior],
      ["2026-11-23.7c994dc70ccb", published],
    ]),
    refund: new Map([
      ["2026-11-10-8b6b7b622d43", prior],
      ["2026-11-23.5cb47964694c", published],
    ]),
  },
};

export interface CheckoutPolicies {
  terms: string;
  refund: string;
  refundPhase: RefundPhase;
}

/** A checkout binds consent to the product's exact offered versions, even when the canonical page has advanced. */
export function checkoutPolicies(
  product: OpenProduct,
  lang: Lang,
  versions: OfferVersions,
  scheduledPhase: RefundPhase,
): CheckoutPolicies | null {
  const terms = productUrl(product, lang, "terms");
  const refund = productUrl(product, lang, "refund");
  const slug = product.slug;
  if (slug !== "all-in-one" && slug !== "clean-space") return { terms, refund, refundPhase: scheduledPhase };

  const termsDate = policies[slug].terms.get(versions.termsVersion ?? "");
  const refundDate = policies[slug].refund.get(versions.refundPolicyVersion ?? "");
  if (!termsDate || !refundDate) return null;
  if (slug === "clean-space" && (!terms.endsWith(".html") || !refund.endsWith(".html"))) return null;

  return {
    terms: slug === "clean-space" ? terms.replace(/\.html$/, `-${termsDate}.html`) : `${terms}/${termsDate}`,
    refund: slug === "clean-space" ? refund.replace(/\.html$/, `-${refundDate}.html`) : `${refund}/${refundDate}`,
    refundPhase: refundDate === published ? "effective" : "inactive",
  };
}
