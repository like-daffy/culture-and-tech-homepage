import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Music, Keyboard, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageProvider";

export function Services() {
  const { translations } = useLanguage();

  const services = [
    {
      icon: Code,
      title: translations.services.qa.title,
      description: translations.services.qa.description,
    },
    {
      icon: Music,
      title: translations.services.music.title,
      description: translations.services.music.description,
    },
    {
      icon: Keyboard,
      title: translations.services.session.title,
      description: translations.services.session.description,
    },
  ];

  return (
    <section id="services" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {translations.services.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {translations.services.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}