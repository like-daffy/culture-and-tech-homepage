import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { AppIcon } from "@/components/AppIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageProvider";
import { APPS, APPS_SECTION, APP_SLUGS } from "@/lib/apps";
import { appPaths } from "@/lib/seo";

/** The homepage's Apps section: one card per app, linking to the app's page */
export function Apps() {
  const { language } = useLanguage();
  const section = APPS_SECTION[language];

  return (
    <section id="apps" className="py-20">
      <div className="container">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">{section.title}</h2>
          <p className="text-base md:text-lg text-muted-foreground">{section.intro}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {APP_SLUGS.map((slug) => {
            const app = APPS[slug];
            const content = app.content[language];
            const pagePath = appPaths(slug)[language];

            return (
              <Card key={slug} className="border-border hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <AppIcon app={app} size={64} />
                    <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-primary">
                      {content.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-primary">
                    <Link href={pagePath} className="hover:text-accent transition-colors">
                      {content.name}
                    </Link>
                  </h3>
                  <p className="text-base font-semibold text-foreground leading-snug">{content.tagline}</p>
                  <CardDescription className="text-sm leading-relaxed">{content.summary}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 mb-6 flex-1">
                    {content.highlights.map((highlight) => (
                      <li key={highlight} className="text-sm text-muted-foreground flex items-start">
                        <span className="mr-2 text-accent">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <Link href={pagePath}>
                        {section.learnMore}
                        <ArrowRight />
                      </Link>
                    </Button>
                    {content.cta && (
                      <Button asChild variant="outline" className="flex-1">
                        <a href={content.cta.href} target="_blank" rel="noopener">
                          {content.cta.label}
                          <ExternalLink />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
