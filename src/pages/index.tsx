"use client";

import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { MusicDetails } from "@/components/MusicDetails";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [language, setLanguage] = useState<"en" | "ko">("en");

  return (
    <>
      <SEO
        title="Culture & Tech | QA Automation, Music Production, Session Services"
        description="Professional QA automation solutions, live-idol music production by Sochan, and expert keyboardist session services in Seoul, South Korea."
        image="/og-image.png"
        url="https://cultureand.tech"
      />
      <div className="min-h-screen" lang={language}>
        <Navigation language={language} onLanguageChange={setLanguage} />
        <main>
          <Hero language={language} />
          <About language={language} />
          <Services language={language} />
          <MusicDetails language={language} />
          <Contact language={language} />
        </main>
        <Footer language={language} />
      </div>
    </>
  );
}