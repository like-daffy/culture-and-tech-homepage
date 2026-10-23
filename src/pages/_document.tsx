import { cn } from "@/lib/utils";
import { pageLanguageFromPath } from "@/lib/seo";
import { Html, Head, Main, NextScript, type DocumentProps } from "next/document";

export default function Document({ __NEXT_DATA__ }: DocumentProps) {
  return (
    <Html lang={pageLanguageFromPath(__NEXT_DATA__.page)}>
      <Head>
        <meta name="keywords" content="지하아이돌, 지하돌, 오리곡, 오리지널곡, 라이브아이돌" />
        {/* Naver Search Advisor's ownership check for https://cultureand.tech (docs/seo.md, Registration); keep it */}
        <meta name="naver-site-verification" content="1cb906c075f395477e7f5193106f23d39cda8fd6" />
        {/* canonical, hreflang and robots are set per page: components/SEO.tsx, pages/404.tsx */}
        {/*
          CRITICAL: DO NOT REMOVE THIS SCRIPT
          The Softgen AI monitoring script is essential for core app functionality.
          The application will not function without it.
        */}
        <script
          src="https://cdn.softgen.ai/script.js"
          async
          data-softgen-monitoring="true"
        />
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
