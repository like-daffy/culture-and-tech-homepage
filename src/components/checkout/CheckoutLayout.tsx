import Head from "next/head";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BUSINESS, chordToMidiUrl } from "@/lib/checkout/config";
import type { Lang } from "@/lib/checkout/contract";
import { CHECKOUT_COPY } from "@/lib/checkout/copy";

/**
 * The checkout's own frame: Culture & Tech's name, the page, and the seller's details at the bottom, as Toss Payments
 * asks of a merchant's payment pages. It loads nothing from other hosts: none of the homepage's embedded video, web
 * fonts or monitoring script (_document.tsx leaves those out here), so that a buyer's details on these pages reach only
 * Chord to MIDI's own backend and Toss Payments, as on Chord to MIDI's site.
 */
export function CheckoutLayout({ lang, children }: { lang: Lang; children: ReactNode }) {
  const copy = CHECKOUT_COPY[lang];
  const business = BUSINESS[lang];
  const labels = copy.footer;
  return (
    <>
      <Head>
        <title>{copy.pageTitle}</title>
        <meta name="robots" content="noindex" />
        <meta name="referrer" content="strict-origin" />
      </Head>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
            {/* A new tab, with no opener or referrer: the homepage's other pages get none of this tab's checkout. */}
            <a
              href={lang === "ko" ? "/ko/" : "/"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-semibold text-primary"
            >
              Culture &amp; Tech
            </a>
            <span className="text-sm text-muted-foreground">{copy.checkout}</span>
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
              <a className="underline" href={chordToMidiUrl(lang, "terms")} target="_blank" rel="noopener noreferrer">
                {copy.termsLink}
              </a>
              <a className="underline" href={chordToMidiUrl(lang, "refund")} target="_blank" rel="noopener noreferrer">
                {copy.refundLink}
              </a>
              <a className="underline" href={chordToMidiUrl(lang, "privacy")} target="_blank" rel="noopener noreferrer">
                {copy.privacyLink}
              </a>
              <a className="underline" href={chordToMidiUrl(lang, "business")} target="_blank" rel="noopener noreferrer">
                {copy.businessLink}
              </a>
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

/** A link styled as a button (a page of Chord to MIDI, or of this checkout). */
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
