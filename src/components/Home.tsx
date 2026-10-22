import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Apps } from "@/components/Apps";
import { Services } from "@/components/Services";
import { MusicDetails, musicDetailsContent } from "@/components/MusicDetails";
import { Footer } from "@/components/Footer";
import type { SupportedLanguage } from "@/lib/language-detection";
import { HOME_METADATA, LANGUAGE_PATHS, homeJsonLd } from "@/lib/seo";

interface HomeProps {
  /** Language this homepage is pre-rendered in ("/" English, "/ko/" Korean) */
  language: SupportedLanguage;
}

export function Home({ language }: HomeProps) {
  const { title, description } = HOME_METADATA[language];

  return (
    <>
      <SEO
        title={title}
        description={description}
        path={LANGUAGE_PATHS[language]}
        language={language}
        alternates={LANGUAGE_PATHS}
        jsonLd={homeJsonLd(language, musicDetailsContent[language].faq.items)}
      />
      <div className="min-h-screen">
        <Navigation />
        <main>
          <Hero />
          <About />
          <Apps />
          <Services />
          <MusicDetails />
        </main>
        <Footer />
      </div>
    </>
  );
}
