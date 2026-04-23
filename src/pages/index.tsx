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
        title="Culture & Tech"
        description="Culture & Tech offers software consultation and live-idol music production. Contact us for business inquiries, QA automation solutions, and music production services in Seoul, South Korea."
        image="https://cultureand.tech/og-image.png"
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