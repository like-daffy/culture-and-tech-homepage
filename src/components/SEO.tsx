import Head from 'next/head';
import type { SupportedLanguage } from "@/lib/language-detection";
import { HOME_METADATA, OG_LOCALES, SITE_URL } from "@/lib/seo";

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  /** Path of this page, e.g. "/" or "/ko/"; gives the canonical URL and og:url */
  path?: string;
  language?: SupportedLanguage;
  /** Paths of this page's language versions, for hreflang links */
  alternates?: Partial<Record<SupportedLanguage, string>>;
  /** Structured data (JSON-LD); must state only what the page shows */
  jsonLd?: object;
}

/**
 * SEO component for use in individual pages (uses next/head).
 *
 * Place this as the FIRST child in each page component to ensure
 * meta tags appear early in the <head> for social media crawlers.
 * All image URLs are automatically converted to absolute URLs.
 *
 * With `output: "export"`, Next.js pre-renders next/head tags into
 * the static HTML at build time — no JS execution needed by crawlers.
 */
export function SEO({
  title = HOME_METADATA.en.title,
  description = HOME_METADATA.en.description,
  image = DEFAULT_OG_IMAGE,
  path = "/",
  language = "en",
  alternates,
  jsonLd,
}: SEOProps) {
  const url = `${SITE_URL}${path}`;

  // Ensure image is always an absolute URL
  const absoluteImage = image.startsWith("http")
    ? image
    : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;

  const alternateLanguages = Object.keys(alternates ?? {}) as SupportedLanguage[];

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Language versions (hreflang); English is the default */}
      {alternateLanguages.map((lang) => (
        <link
          key={`alternate-${lang}`}
          rel="alternate"
          hrefLang={lang}
          href={`${SITE_URL}${alternates?.[lang]}`}
        />
      ))}
      {alternates?.en && (
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${alternates.en}`} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={OG_LOCALES[language]} />
      {alternateLanguages
        .filter((lang) => lang !== language)
        .map((lang) => (
          <meta key={`og-locale-${lang}`} property="og:locale:alternate" content={OG_LOCALES[lang]} />
        ))}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
    </Head>
  );
}
