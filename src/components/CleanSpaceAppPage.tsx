import Head from "next/head";
import { AppPage } from "@/components/AppPage";
import { APPS } from "@/lib/apps";
import { cleanSpaceAppJsonLd, withCleanSpaceAppWording } from "@/lib/clean-space-app-site";
import type { SupportedLanguage } from "@/lib/language-detection";

// The page's text on clean-space.app: the payment sentences name cultureand.tech (CLEAN_SPACE_APP_WORDING). AppPage reads
// APPS, so this site's build sets its own copy there before any page renders; cultureand.tech's build never loads this file.
APPS["clean-space"] = withCleanSpaceAppWording(APPS["clean-space"]);

/**
 * clean-space.app's home page in one language: Clean Space's product page (AppPage, which on this site links
 * cultureand.tech's pages absolutely and leaves its structured data to this component), with this site's wording and
 * structured data (src/lib/clean-space-app-site.ts). Only src/pages/*.clean-space-app.js use it.
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
