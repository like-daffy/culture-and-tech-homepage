import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { AppIcon } from "@/components/AppIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageProvider";
import { APPS, APPS_SECTION, APP_SLUGS, SITE_APPS, type AppContent } from "@/lib/apps";
import { appPaths } from "@/lib/seo";
import { cn } from "@/lib/utils";

interface AppCardProps {
  icon: ReactNode;
  content: Pick<AppContent, "name" | "status" | "tagline" | "summary" | "highlights" | "cta">;
  /** The app's page on this site, or (outside) its own site, opened in a new tab like the other outside links */
  href: string;
  outside: boolean;
  learnMore: string;
  className?: string;
}

/** One app's card: its icon and badge, name, tagline, summary and points, and a button to learn more */
function AppCard({ icon, content, href, outside, learnMore, className }: AppCardProps) {
  return (
    <Card className={cn("border-border hover:shadow-lg transition-shadow flex flex-col", className)}>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          {icon}
          <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-primary">
            {content.status}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-primary">
          {outside ? (
            <a href={href} target="_blank" rel="noopener" className="hover:text-accent transition-colors">
              {content.name}
            </a>
          ) : (
            <Link href={href} className="hover:text-accent transition-colors">
              {content.name}
            </Link>
          )}
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
            {outside ? (
              <a href={href} target="_blank" rel="noopener">
                {learnMore}
                <ExternalLink />
              </a>
            ) : (
              <Link href={href}>
                {learnMore}
                <ArrowRight />
              </Link>
            )}
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
}

/**
 * The homepage's Apps section: one card per app, the apps with a page here first (linking to it), then the apps on
 * sites of their own (linking there). Two cards a row from medium width; a last card alone in its row is centred, one
 * column wide.
 */
export function Apps() {
  const { language } = useLanguage();
  const section = APPS_SECTION[language];
  const total = APP_SLUGS.length + SITE_APPS.length;
  const lone = (index: number) => total % 2 === 1 && index === total - 1 && "md:col-span-2 md:mx-auto md:w-[calc((100%_-_1.5rem)/2)]";

  return (
    <section id="apps" className="py-20">
      <div className="container">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">{section.title}</h2>
          <p className="text-base md:text-lg text-muted-foreground">{section.intro}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {APP_SLUGS.map((slug, index) => {
            const app = APPS[slug];
            // An app whose page moved to its own site (Clean Space) links there, as the apps on sites of their own do
            return (
              <AppCard
                key={slug}
                icon={<AppIcon app={app} size={64} />}
                content={app.content[language]}
                href={app.site?.[language] ?? appPaths(slug)[language]}
                outside={Boolean(app.site)}
                learnMore={section.learnMore}
                className={cn(lone(index))}
              />
            );
          })}
          {SITE_APPS.map((app, index) => (
            <AppCard
              key={app.slug}
              icon={<Image src={app.icon} alt="" width={64} height={64} className="shrink-0" />}
              content={app.content[language]}
              href={app.site[language]}
              outside
              learnMore={section.learnMore}
              className={cn(lone(APP_SLUGS.length + index))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
