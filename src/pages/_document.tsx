import { cn } from "@/lib/utils";
import { pageLanguageFromPath } from "@/lib/seo";
import { Html, Head, Main, NextScript, type DocumentProps } from "next/document";

/**
 * The checkout pages of every product (/checkout/…, /ko/checkout/…) load nothing from other hosts but what the payment
 * needs (Toss Payments, and the product's Firebase backend with App Check): no web fonts and no monitoring script, so
 * that a buyer's details there reach only the parties the product's privacy policy names (README, "The central
 * checkout"). Every other page loads them as before.
 */
const isCheckoutPage = (page: string) => /^(\/ko)?\/checkout(\/|$)/.test(page);

/**
 * On the checkout pages, first of all: the handoff after `#` leaves the address before Next.js starts, so that nothing
 * copies it (Next.js keeps the address it started with, and writes it back after hydrating a page opened with a query).
 * The page reads it from this tab's window once (takeHandoff, src/lib/checkout/session.ts).
 */
const TAKE_HANDOFF = `(function(){var h=location.hash;if(h){window.__checkoutHandoff=h;history.replaceState(history.state,"",location.pathname+location.search)}})()`;

export default function Document({ __NEXT_DATA__ }: DocumentProps) {
  const checkout = isCheckoutPage(__NEXT_DATA__.page);
  return (
    <Html lang={pageLanguageFromPath(__NEXT_DATA__.page)}>
      <Head>
        {checkout && <script dangerouslySetInnerHTML={{ __html: TAKE_HANDOFF }} />}
        <meta name="keywords" content="지하아이돌, 지하돌, 오리곡, 오리지널곡, 라이브아이돌" />
        {/* Naver Search Advisor's ownership check for https://cultureand.tech (docs/seo.md, Registration); keep it */}
        <meta name="naver-site-verification" content="1cb906c075f395477e7f5193106f23d39cda8fd6" />
        {/* canonical, hreflang and robots are set per page: components/SEO.tsx, pages/404.tsx */}
        {!checkout && (
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
          />
        )}
        {/*
          CRITICAL: DO NOT REMOVE THIS SCRIPT
          The Softgen AI monitoring script is essential for core app functionality.
          The application will not function without it.
          (Every page but the checkout's has it.)
        */}
        {!checkout && (
          <script
            src="https://cdn.softgen.ai/script.js"
            async
            data-softgen-monitoring="true"
          />
        )}
      </Head>
      <body
        className={cn(
          "min-h-screen w-full scroll-smooth bg-background text-foreground antialiased"
        )}
      >
        <Main />
        <NextScript />

        {/* Visual Editor Script */}
        {process.env.NODE_ENV === "development" && (
          <script
            src="https://cdn.softgen.dev/visual-editor.min.js"
            async
            data-softgen-visual-editor="true"
          />
        )}
      </body>
    </Html>
  );
}
