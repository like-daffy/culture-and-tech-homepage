import Head from "next/head";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BUSINESS } from "@/lib/checkout/config";
import { CHECKOUT_COPY } from "@/lib/checkout/copy";
import { CONTENT_LANG, COPY } from "@/lib/clean-space/copy";
import { SUPPORT_EMAIL } from "@/lib/clean-space/config";
import { PAGE_PATH, type PageLang } from "@/lib/clean-space/contract.generated";
import { otherLanguagePath } from "@/lib/clean-space/return-target";
import { DIRECT_SALE_POLICY_PATHS } from "@/lib/clean-space/site";
import { LANGUAGE_PATHS } from "@/lib/seo";
import { cn } from "@/lib/utils";

interface SensitiveLayoutProps {
  lang: PageLang;
  title: string;
  /** The page, for its link to the other language; none on a page that holds a callback. */
  languageRoute?: "account" | "activate";
  /** Show the seller's details (the account page, where a purchase starts). */
  seller?: boolean;
  /** The language the page's main text is written in (default CONTENT_LANG: the activation page is English for now). */
  contentLang?: "en" | "ko";
  children: ReactNode;
}

/**
 * The frame of Clean Space's account, sign-in callback and activation pages: the site's colours and type, without its
 * navigation, footer video or any other embed (plan §5.1). Out of search results (noindex here and X-Robots-Tag in
 * firebase.json), and no referrer beyond the origin. Its links to the site's other pages load them in full, so that
 * nothing those pages load (fonts, the monitoring script) ever runs in a page where someone signs in.
 *
 * Its footer links the website edition's Terms of Service, Refund Policy and Privacy Policy, and shows the seller's
 * details as the checkout does (BUSINESS, labelled by the checkout's reviewed words, src/lib/checkout/), in the page's
 * language.
 */
export function SensitiveLayout({ lang, title, languageRoute, seller = false, contentLang, children }: SensitiveLayoutProps) {
  const copy = COPY[lang];
  const checkoutCopy = CHECKOUT_COPY[lang];
  const labels = checkoutCopy.footer;
  const business = BUSINESS[lang];
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
              <a href={LANGUAGE_PATHS[lang]} className="text-xl font-semibold text-primary">
                {copy.brand}
              </a>
              <span aria-hidden="true" className="text-muted-foreground">
                /
              </span>
              <a href={PAGE_PATH.product[lang]} className="font-medium text-foreground hover:text-accent">
                {copy.product}
              </a>
            </div>
            {languageRoute && (
              <a href={otherLanguagePath(languageRoute, lang)} className="text-sm font-medium text-foreground hover:text-accent" lang={lang === "en" ? "ko" : "en"}>
                {copy.languageLink}
              </a>
            )}
          </div>
        </header>
        <main lang={contentLang ?? CONTENT_LANG[lang]} className="container max-w-3xl flex-1 py-10 md:py-14">
          {children}
        </main>
        <footer lang={lang} className="border-t border-border bg-muted/30 py-8 text-xs text-muted-foreground">
          <div className="container max-w-3xl space-y-3">
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <a className="underline underline-offset-4 hover:text-accent" href={DIRECT_SALE_POLICY_PATHS.terms}>
                {checkoutCopy.termsLink}
              </a>
              <a className="underline underline-offset-4 hover:text-accent" href={DIRECT_SALE_POLICY_PATHS.refund}>
                {checkoutCopy.refundLink}
              </a>
              <a className="underline underline-offset-4 hover:text-accent" href={DIRECT_SALE_POLICY_PATHS.privacy}>
                {checkoutCopy.privacyLink}
              </a>
              <span>
                {copy.support}:{" "}
                <a className="underline underline-offset-4 hover:text-accent" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
              </span>
            </p>
            {seller && (
              <div className="space-y-1 leading-relaxed">
                <p>
                  {labels.seller}: {business.companyName} · {labels.representative}: {business.representative}
                </p>
                <p>
                  {labels.registrationNumber}: {business.registrationNumber} · {labels.mailOrderNumber}:{" "}
                  {business.mailOrderNumber}
                </p>
                <p>
                  {labels.address}: {business.address}
                </p>
                <p>
                  {labels.phone}: {business.phone} · {labels.email}: {business.email}
                </p>
                <p>
                  {labels.hostingProvider}: {business.hostingProvider} · {labels.payments}
                </p>
              </div>
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
