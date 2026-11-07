import Head from "next/head";
import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CONTENT_LANG, COPY } from "@/lib/clean-space/copy";
import { DIRECT_SALE_POLICY_PATHS, SELLER, SUPPORT_EMAIL } from "@/lib/clean-space/config";
import { PAGE_PATH, type PageLang } from "@/lib/clean-space/contract.generated";
import { otherLanguagePath } from "@/lib/clean-space/return-target";
import { LANGUAGE_PATHS } from "@/lib/seo";
import { cn } from "@/lib/utils";

interface SensitiveLayoutProps {
  lang: PageLang;
  title: string;
  /** The page, for its link to the other language; none on pages that hold a callback or payment result. */
  languageRoute?: "checkout" | "account" | "activate";
  /** Show the seller block (the checkout and its result pages). */
  seller?: boolean;
  children: ReactNode;
}

/**
 * The frame of Clean Space's sign-in, account, activation and checkout pages: the site's colours and type, without
 * its navigation, footer video or any other embed (plan §5.1). Out of search results (noindex here and X-Robots-Tag in
 * firebase.json), and no referrer beyond the origin.
 */
export function SensitiveLayout({ lang, title, languageRoute, seller = false, children }: SensitiveLayoutProps) {
  const copy = COPY[lang];
  const sellerFacts = SELLER[lang];
  return (
    <>
      <Head>
        <title>{`${title} | Clean Space`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="strict-origin" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border bg-background/95">
          <div className="container flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm">
              <Link href={LANGUAGE_PATHS[lang]} className="text-xl font-semibold text-primary">
                {copy.brand}
              </Link>
              <span aria-hidden="true" className="text-muted-foreground">
                /
              </span>
              <Link href={PAGE_PATH.product[lang]} className="font-medium text-foreground hover:text-accent">
                {copy.product}
              </Link>
            </div>
            {languageRoute && (
              <a href={otherLanguagePath(languageRoute, lang)} className="text-sm font-medium text-foreground hover:text-accent" lang={lang === "en" ? "ko" : "en"}>
                {copy.languageLink}
              </a>
            )}
          </div>
        </header>
        <main lang={CONTENT_LANG[lang]} className="container max-w-3xl flex-1 py-10 md:py-14">
          {children}
        </main>
        <footer className="border-t border-border bg-muted/30 py-8 text-xs text-muted-foreground">
          <div className="container max-w-3xl space-y-3">
            <p lang={CONTENT_LANG[lang]} className="flex flex-wrap gap-x-4 gap-y-1">
              <a className="underline underline-offset-4 hover:text-accent" href={DIRECT_SALE_POLICY_PATHS.terms}>
                {copy.policyLinks.terms}
              </a>
              <a className="underline underline-offset-4 hover:text-accent" href={DIRECT_SALE_POLICY_PATHS.privacy}>
                {copy.policyLinks.privacy}
              </a>
              <a className="underline underline-offset-4 hover:text-accent" href={DIRECT_SALE_POLICY_PATHS.refunds}>
                {copy.policyLinks.refunds}
              </a>
              <span>
                {copy.support}:{" "}
                <a className="underline underline-offset-4 hover:text-accent" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
              </span>
            </p>
            {seller && (
              <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
                <dt className="font-medium" lang={CONTENT_LANG[lang]}>
                  {copy.sellerHeading}
                </dt>
                <dd>{sellerFacts.companyName}</dd>
                {(Object.keys(copy.sellerLabels) as (keyof typeof copy.sellerLabels)[]).map((key) => (
                  <div key={key} className="contents">
                    <dt className="font-medium" lang={CONTENT_LANG[lang]}>
                      {copy.sellerLabels[key]}
                    </dt>
                    <dd>{sellerFacts[key]}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </footer>
      </div>
    </>
  );
}

type Tone = "info" | "error" | "success";

/** A short message in the page: information, a problem, or a success. */
export function Notice({ tone = "info", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const Icon = tone === "error" ? AlertCircle : tone === "success" ? CheckCircle2 : Info;
  return (
    <Alert variant={tone === "error" ? "destructive" : "default"} className={cn(tone === "success" && "border-accent/40 bg-accent/5", className)}>
      <Icon className="h-4 w-4" />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

/** A heading and the page's first line. */
export function PageTitle({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-primary">{title}</h1>
      {intro && <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">{intro}</p>}
    </div>
  );
}

export function Section({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-border bg-card p-5 md:p-6", className)}>
      {title && <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>}
      {children}
    </section>
  );
}

/** An exact instant with its time zone, and the UTC instant for machines. */
export function Instant({ seconds, text }: { seconds: number; text: string }) {
  return <time dateTime={new Date(seconds * 1000).toISOString()}>{text}</time>;
}
