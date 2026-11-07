import { COPY } from "@/lib/clean-space/copy";
import { DIRECT_SALE_POLICY_PATHS } from "@/lib/clean-space/config";
import type { GetOfferResponse, PageLang } from "@/lib/clean-space/contract.generated";
import { formatPrice } from "@/lib/clean-space/display";
import { Section } from "./SensitiveLayout";

/**
 * What the buyer gets, shown before any payment (plan §7.2.1): Clean Space, the 364-day term and its start rule, no
 * automatic renewal, what it unlocks and for which download, compatibility, the exact prices from the service, and the
 * policies.
 */
export function OfferSummary({ lang, offer }: { lang: PageLang; offer: GetOfferResponse | null }) {
  const copy = COPY[lang];
  return (
    <Section title={copy.offerName}>
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        <li>{copy.offerWhat}</li>
        <li>{copy.offerNotAppStore}</li>
        <li>{copy.offerTerm}</li>
        <li>{copy.offerNoRenewal}</li>
        <li>{copy.offerAfter}</li>
        <li>{copy.offerCompatibility}</li>
      </ul>
      {offer && (
        <dl className="mt-4 grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
          {offer.prices.map((price) => (
            <div key={price.currency} className="contents">
              <dt className="font-medium">{copy.currencyNames[price.currency]}</dt>
              <dd className={price.available ? "" : "text-muted-foreground line-through"}>{formatPrice(price)}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <a className="underline underline-offset-4 hover:text-accent" href={DIRECT_SALE_POLICY_PATHS.terms}>
          {copy.policyLinks.terms}
        </a>
        <a className="underline underline-offset-4 hover:text-accent" href={DIRECT_SALE_POLICY_PATHS.privacy}>
          {copy.policyLinks.privacy}
        </a>
        <a className="underline underline-offset-4 hover:text-accent" href={DIRECT_SALE_POLICY_PATHS.refunds}>
          {copy.policyLinks.refunds}
        </a>
      </p>
    </Section>
  );
}
