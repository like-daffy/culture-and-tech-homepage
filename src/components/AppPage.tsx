import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, ExternalLink } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AppIcon } from "@/components/AppIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageProvider";
import { APPS, APP_PAGE_LABELS, APP_SLUGS, type AppSection, type AppSlug } from "@/lib/apps";
import type { SupportedLanguage } from "@/lib/language-detection";
import { APP_METADATA, LANGUAGE_PATHS, appJsonLd, appPaths } from "@/lib/seo";
import { cn } from "@/lib/utils";

interface AppPageProps {
  slug: AppSlug;
  /** Language this page is pre-rendered in ("/apps/…" English, "/ko/apps/…" Korean) */
  language: SupportedLanguage;
}

// Alternate section backgrounds: even bands are tinted
const band = (index: number) => (index % 2 === 0 ? "bg-muted/30" : "");

function SectionItems({ section }: { section: AppSection }) {
  if (section.style === "steps") {
    return (
      <ol className="grid gap-4 md:grid-cols-2">
        {section.items.map((item, index) => (
          <li key={item.title} className="flex gap-4 rounded-lg border border-border bg-card p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {index + 1}
            </span>
            <div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", section.items.length > 4 && "lg:grid-cols-3")}>
      {section.items.map((item) => (
        <div key={item.title} className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

/** The page of one app, built from its content in src/lib/apps.ts */
export function AppPage({ slug, language }: AppPageProps) {
  const app = APPS[slug];
  const { title, description } = APP_METADATA[slug][language];

  // Like the homepage, the English page shows the visitor's language; the Korean page stays Korean
  const { language: shown } = useLanguage();
  const content = app.content[shown];
  const labels = APP_PAGE_LABELS[shown];
  const homePath = LANGUAGE_PATHS[shown];
  const otherApps = APP_SLUGS.filter((other) => other !== slug);
  const [supportBefore, supportAfter] = content.support.split("{email}");
  const afterSections = content.sections.length;

  return (
    <>
      <SEO
        title={title}
        description={description}
        image={app.ogImage}
        path={appPaths(slug)[language]}
        language={language}
        alternates={appPaths(slug)}
        jsonLd={appJsonLd(app, language)}
      />
      <div className="min-h-screen">
        <Navigation homePath={homePath} />
        <main>
          {/* Header */}
          <section className="pt-28 pb-16 md:pt-32 md:pb-20 bg-muted/30">
            <div className="container max-w-5xl">
              <nav aria-label={labels.breadcrumb} className="mb-8 text-sm text-muted-foreground">
                <ol className="flex flex-wrap items-center gap-1.5">
                  <li>
                    <Link href={homePath} className="hover:text-accent transition-colors">
                      {labels.home}
                    </Link>
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </li>
                  <li aria-current="page" className="font-medium text-foreground">
                    {content.name}
                  </li>
                </ol>
              </nav>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <AppIcon app={app} size={112} priority />
                <div>
                  <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-primary">
                    {content.status}
                  </span>
                  <h1 className="mt-3 text-4xl md:text-5xl font-bold text-primary">{content.name}</h1>
                  <p className="mt-3 text-xl md:text-2xl font-medium text-foreground/90 text-balance">
                    {content.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-8 max-w-3xl space-y-4">
                {content.intro.map((paragraph) => (
                  <p key={paragraph} className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {content.cta && (
                <Button asChild size="lg" className="mt-8">
                  <a href={content.cta.href} target="_blank" rel="noopener">
                    {content.cta.label}
                    <ExternalLink />
                  </a>
                </Button>
              )}
            </div>
          </section>

          {/* Screenshots */}
          <section className="py-16">
            <div className="container max-w-5xl space-y-12">
              {content.screenshots.map((shot, index) => (
                <figure key={shot.src}>
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-md">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={shot.width}
                      height={shot.height}
                      priority={index === 0}
                      sizes="(min-width: 1024px) 960px, 100vw"
                      className="h-auto w-full"
                    />
                  </div>
                  {shot.caption && (
                    <figcaption className="mx-auto mt-4 max-w-3xl text-center text-sm text-muted-foreground leading-relaxed">
                      {shot.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>

          {/* What the app does, for musicians */}
          {content.sections.map((section, index) => (
            <section key={section.title} className={cn("py-16", band(index))}>
              <div className="container max-w-5xl">
                <h2 className="mb-4 text-2xl md:text-3xl font-bold text-primary">{section.title}</h2>
                {section.intro && (
                  <p className="mb-8 max-w-3xl text-base md:text-lg text-muted-foreground leading-relaxed">
                    {section.intro}
                  </p>
                )}
                <SectionItems section={section} />
                {section.note && (
                  <p className="mt-8 max-w-3xl border-l-2 border-accent pl-4 text-sm md:text-base text-foreground/80 leading-relaxed">
                    {section.note}
                  </p>
                )}
              </div>
            </section>
          ))}

          {/* FAQ: the same questions and answers as the page's structured data */}
          <section className={cn("py-16", band(afterSections))}>
            <div className="container max-w-5xl">
              <h2 className="mb-8 text-2xl md:text-3xl font-bold text-primary">{labels.faq}</h2>
              <div className="max-w-3xl space-y-6">
                {content.faq.map((item) => (
                  <div key={item.question}>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{item.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Support */}
          <section className={cn("py-12", band(afterSections + 1))}>
            <div className="container max-w-5xl">
              <h2 className="mb-3 text-2xl font-bold text-primary">{labels.support}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {supportBefore}
                <a
                  href={`mailto:${app.supportEmail}`}
                  className="font-medium text-primary underline underline-offset-4 hover:text-accent"
                >
                  {app.supportEmail}
                </a>
                {supportAfter}
              </p>
              {app.privacyPolicyPath && (
                <p className="mt-2">
                  <a
                    href={app.privacyPolicyPath}
                    className="font-medium text-primary underline underline-offset-4 hover:text-accent"
                  >
                    {labels.privacyPolicy}
                  </a>
                </p>
              )}
            </div>
          </section>

          {/* More from the studio */}
          <section className={cn("py-16", band(afterSections + 2))}>
            <div className="container max-w-5xl grid gap-6 md:grid-cols-2">
              {otherApps.map((other) => {
                const otherApp = APPS[other];
                const otherContent = otherApp.content[shown];
                return (
                  <Card key={other} className="flex flex-col">
                    <CardHeader>
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {labels.moreApps}
                      </h2>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <AppIcon app={otherApp} size={56} />
                        <div>
                          <h3 className="text-xl font-bold text-primary">{otherContent.name}</h3>
                          <p className="text-sm text-muted-foreground">{otherContent.status}</p>
                        </div>
                      </div>
                      <p className="flex-1 font-medium text-foreground">{otherContent.tagline}</p>
                      <Button asChild variant="outline" className="self-start">
                        <Link href={appPaths(other)[shown]}>
                          {labels.learnMore}
                          <ArrowRight />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              <Card className="flex flex-col">
                <CardHeader>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {labels.studioTitle}
                  </h2>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="flex-1 font-medium text-foreground">{labels.studioText}</p>
                  <Button asChild variant="outline" className="self-start">
                    <Link href={`${homePath}#music-details`}>
                      {labels.studioLink}
                      <ArrowRight />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
