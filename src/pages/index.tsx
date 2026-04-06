import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { MusicDetails } from "@/components/MusicDetails";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <SEO
        title="Culture & Tech | QA Automation, Music Production, Session Services"
        description="Professional QA automation solutions, live-idol music production by Sochan, and expert keyboardist session services in Seoul, South Korea."
        image="/og-image.png"
        url="https://cultureand.tech"
      />
      <div className="min-h-screen">
        <Navigation />
        <main>
          <Hero />
          <About />
          <Services />
          <MusicDetails />
        </main>
        <Footer />
      </div>
    </>
  );
}