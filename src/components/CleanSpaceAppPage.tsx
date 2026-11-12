import Head from "next/head";
import { AppPage } from "@/components/AppPage";
import { APPS } from "@/lib/apps";
import { cleanSpaceAppJsonLd } from "@/lib/clean-space-app-site";
import type { SupportedLanguage } from "@/lib/language-detection";

/**
 * clean-space.app's home page in one language: Clean Space's product page (AppPage, which on this site links
 * cultureand.tech's pages absolutely and leaves its structured data to this component), with the structured data of this
 * site (src/lib/clean-space-app-site.ts). Only src/pages/*.clean-space-app.js use it.
 */
export function CleanSpaceAppPage({ language }: { language: SupportedLanguage }) {
  const jsonLd = cleanSpaceAppJsonLd(APPS["clean-space"], language);
  return (
    <>
      <AppPage slug="clean-space" language={language} />
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </Head>
    </>
  );
}
