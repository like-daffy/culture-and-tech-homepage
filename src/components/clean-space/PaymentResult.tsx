import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/clean-space/copy";
import { PAGE_PATH, type ConfirmPaymentResponse, type PageLang } from "@/lib/clean-space/contract.generated";
import { formatInstant, formatPrice } from "@/lib/clean-space/display";
import { Instant, Notice, Section } from "./SensitiveLayout";

/** A payment the service verified and recorded: the period it bought, exactly, and what to do in the app. */
export function PaidResult({ lang, result }: { lang: PageLang; result: ConfirmPaymentResponse }) {
  const copy = COPY[lang];
  const { startsAt, expiresAt } = result.license;
  return (
    <div className="space-y-6">
      <Notice tone="success">{copy.paidHeading}</Notice>
      <Section>
        <dl className="grid gap-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="font-medium">{copy.orderNumber}</dt>
          <dd className="font-mono">{result.orderID}</dd>
          <dt className="font-medium">{copy.priceLabel}</dt>
          <dd>{formatPrice(result.money)}</dd>
        </dl>
        {startsAt !== null && expiresAt !== null && (
          <p className="mt-4 text-sm leading-relaxed">
            {copy.paidPeriod(formatInstant(startsAt, lang), formatInstant(expiresAt, lang))}{" "}
            <span className="text-muted-foreground">
              (UTC: <Instant seconds={startsAt} text={new Date(startsAt * 1000).toISOString().replace(".000Z", "Z")} /> –{" "}
              <Instant seconds={expiresAt} text={new Date(expiresAt * 1000).toISOString().replace(".000Z", "Z")} />)
            </span>
          </p>
        )}
        <p className="mt-4 text-sm leading-relaxed">{copy.paidNext}</p>
        <p className="mt-4 text-sm">
          {result.receiptURL ? (
            <a href={result.receiptURL} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4">
              {copy.receiptLink}
            </a>
          ) : (
            <span className="text-muted-foreground">{copy.receiptNone}</span>
          )}
        </p>
      </Section>
      <Button asChild variant="outline">
        <Link href={PAGE_PATH.account[lang]}>{copy.accountLink}</Link>
      </Button>
    </div>
  );
}

/** Toss approved, recording isn't finished: the page waits, and never suggests paying again (plan §7.2.7). */
export function PendingResult({ lang, orderID }: { lang: PageLang; orderID: string | null }) {
  const copy = COPY[lang];
  return (
    <div className="space-y-6">
      <Section title={copy.pendingHeading}>
        <p className="text-sm leading-relaxed">{copy.pendingText}</p>
        {orderID && (
          <p className="mt-4 text-sm">
            <span className="font-medium">{copy.orderNumber}:</span> <span className="font-mono">{orderID}</span>
          </p>
        )}
      </Section>
      <Button asChild variant="outline">
        <Link href={PAGE_PATH.account[lang]}>{copy.accountLink}</Link>
      </Button>
    </div>
  );
}
