import { cn } from "@/lib/utils";
import { pageLanguageFromPath } from "@/lib/seo";
import { isCheckoutPage, isSensitivePage } from "@/lib/clean-space/sensitive-routes";
import { Html, Head, Main, NextScript, type DocumentProps } from "next/document";

/**
 * Pages where a person pays, signs in or approves something (src/lib/clean-space/sensitive-routes.ts): the checkout
 * pages of every product (/checkout/…, /ko/checkout/…), and Clean Space's account, sign-in callback and activation
 * pages. They load nothing from other hosts but what that needs (Toss Payments, and the product's Firebase backend with
 * App Check): no web fonts and no monitoring script, so that a buyer's details there reach only the parties the
 * product's privacy policy names (README, "The central checkout"; docs/clean-space-direct-sale.md). Every other page
 * loads them as before.
 */

/**
 * On the checkout pages, first of all: the handoff after `#` leaves the address before Next.js starts, so that nothing
 * copies it (Next.js keeps the address it started with, and writes it back after hydrating a page opened with a query).
 * The page reads it from this tab's window once (takeHandoff, src/lib/checkout/session.ts).
 */
const TAKE_HANDOFF = `(function(){var h=location.hash;if(h){window.__checkoutHandoff=h;history.replaceState(history.state,"",location.pathname+location.search)}})()`;

export default function Document({ __NEXT_DATA__ }: DocumentProps) {
  const checkout = isCheckoutPage(__NEXT_DATA__.page);
  const sensitive = isSensitivePage(__NEXT_DATA__.page);
  return (
    <Html lang={pageLanguageFromPath(__NEXT_DATA__.page)}>
      <Head>
        {checkout && <script dangerouslySetInnerHTML={{ __html: TAKE_HANDOFF }} />}
        {/* Neither of these two is on clean-space.app (__CLEAN_SPACE_APP_SITE__): they are cultureand.tech's own */}
        {__CLEAN_SPACE_APP_SITE__ ? null : <meta name="keywords" content="지하아이돌, 지하돌, 오리곡, 오리지널곡, 라이브아이돌" />}
        {/* Naver Search Advisor's ownership check for https://cultureand.tech (docs/seo.md, Registration); keep it */}
        {__CLEAN_SPACE_APP_SITE__ ? null : <meta name="naver-site-verification" content="1cb906c075f395477e7f5193106f23d39cda8fd6" />}
        {/* canonical, hreflang and robots are set per page: components/SEO.tsx, pages/404.tsx */}
        {!sensitive && (
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
          />
        )}
        {/*
          CRITICAL: DO NOT REMOVE THIS SCRIPT
          The Softgen AI monitoring script is essential for core app functionality.
          The application will not function without it.
          (Every page but the sensitive ones above has it.)
        */}
        {!sensitive && (
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
