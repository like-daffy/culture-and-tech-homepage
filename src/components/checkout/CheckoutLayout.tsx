import Head from "next/head";
import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BUSINESS } from "@/lib/checkout/config";
import type { Lang } from "@/lib/checkout/contract";
import { CHECKOUT_COPY } from "@/lib/checkout/copy";
import { productUrl, type CheckoutProduct, type ProductPage } from "@/lib/checkout/products";
import { CLEAN_SPACE_PORTAL } from "@/lib/clean-space/site";

/**
 * Where the header's two links go, in the page's language (the owner, 2026-11-12): the logo to the account portal (the
 * origin of the checkout's other portal links, src/lib/checkout/products.ts), "Official Page" to this site's homepage.
 */
const HEADER_LINKS: Record<Lang, { portal: string; officialPage: string }> = {
  en: { portal: CLEAN_SPACE_PORTAL.origin, officialPage: "https://cultureand.tech/" },
  ko: { portal: `${CLEAN_SPACE_PORTAL.origin}/ko`, officialPage: "https://cultureand.tech/ko/" },
};

/** The footer's label of each of a product's legal and help pages. */
const FOOTER_LABELS: Partial<
  Record<ProductPage, "termsLink" | "refundLink" | "privacyLink" | "businessLink" | "helpLink">
> = {
  terms: "termsLink",
  refund: "refundLink",
  privacy: "privacyLink",
  business: "businessLink",
  help: "helpLink",
};

/**
 * The checkout's own frame: Culture & Tech's name, the page, and the seller's details at the bottom, as Toss Payments
 * asks of a merchant's payment pages, with the product's own legal pages (none for a closed product). It loads nothing
 * from other hosts: none of the homepage's embedded video, web fonts or monitoring script (_document.tsx leaves those
 * out here), so that a buyer's details on these pages reach only the product's own backend and Toss Payments, as on the
 * product's site.
 */
export function CheckoutLayout({
  product,
  lang,
  children,
}: {
  product: CheckoutProduct;
  lang: Lang;
  children: ReactNode;
}) {
  const copy = CHECKOUT_COPY[lang];
  const business = BUSINESS[lang];
  const labels = copy.footer;
  return (
    <>
      <Head>
        <title>{product.enabled ? product.copy[lang].pageTitle : copy.closedTitle}</title>
        <meta name="robots" content="noindex" />
        <meta name="referrer" content="strict-origin" />
      </Head>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
            {/* Both links open a new tab, with no opener or referrer: the buyer keeps this checkout, and the other
                pages get none of it. */}
            <a
              href={HEADER_LINKS[lang].portal}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xl font-semibold text-primary"
            >
              <Image src="/brand/logo-transparent-192.png" width={32} height={32} alt="" />
              Culture &amp; Tech
            </a>
            <div className="flex items-center gap-4 whitespace-nowrap">
              <span className="text-sm text-muted-foreground">{copy.checkout}</span>
              <a
                href={HEADER_LINKS[lang].officialPage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground transition-colors hover:text-accent"
              >
                {copy.officialPage}
              </a>
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
          {children}
        </main>
        <footer className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-2xl space-y-2 px-4 py-6 text-xs leading-relaxed text-muted-foreground">
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
              {labels.phone}: {business.phone} · {labels.email}:{" "}
              <a className="underline" href={`mailto:${business.email}`}>
                {business.email}
              </a>
            </p>
            <p>
              {labels.hostingProvider}: {business.hostingProvider} · {labels.payments}
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
              {(product.enabled ? product.footerPages : []).map((page) => {
                const label = FOOTER_LABELS[page];
                return label ? (
                  <a
                    key={page}
                    className="underline"
                    href={productUrl(product, lang, page)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy[label]}
                  </a>
                ) : null;
              })}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

type Tone = "info" | "error" | "success";

const toneClasses: Record<Tone, string> = {
  info: "border-border bg-muted/50",
  error: "border-destructive/40 bg-destructive/10",
  success: "border-emerald-700/30 bg-emerald-50 dark:bg-emerald-950/30",
};

/** A message in the page: announced to screen readers when it appears. */
export function Notice({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-md border p-4 text-sm leading-relaxed text-foreground", toneClasses[tone])}
    >
      {children}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <p role="status" className="flex items-center gap-3 text-sm text-muted-foreground">
      <span
        aria-hidden="true"
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
      />
      {label}
    </p>
  );
}

/** A link styled as a button (a page of the product's site, or of this checkout). */
export function LinkButton({
  href,
  primary = false,
  newTab = false,
  children,
}: {
  href: string;
  primary?: boolean;
  newTab?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors",
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </a>
  );
}
