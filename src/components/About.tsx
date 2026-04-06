import { useLanguage } from "@/contexts/LanguageProvider";

export function About() {
  const { translations } = useLanguage();

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            {translations.about.title}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {translations.about.description}
          </p>
        </div>
      </div>
    </section>
  );
}