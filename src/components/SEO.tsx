import Head from 'next/head';

const SITE_URL = "https://cultureand.tech";
const DEFAULT_TITLE = "Culture & Tech";
const DEFAULT_DESCRIPTION =
  "Culture & Tech offers software consultation and live-idol music production. Contact us for business inquiries, QA automation solutions, and music production services in Seoul, South Korea.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
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
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG_IMAGE,
  url = SITE_URL,
}: SEOProps) {
  // Ensure image is always an absolute URL
  const absoluteImage = image.startsWith("http")
    ? image
    : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
    </Head>
  );
}
