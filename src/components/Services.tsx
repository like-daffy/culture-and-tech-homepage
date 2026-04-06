import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Headphones, Mic } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageProvider";

export function Services() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Our Services",
      subtitle: "Professional music production services for Live-Idol groups",
      services: [
        {
          icon: Music,
          title: "Music Production",
          description: "Original music composition and arrangement specifically designed for Live-Idol performances.",
        },
        {
          icon: Headphones,
          title: "Mixing & Mastering",
          description: "Professional audio mixing and mastering services to ensure your tracks sound perfect on stage.",
        },
        {
          icon: Mic,
          title: "Session Recording",
          description: "High-quality recording sessions with professional equipment and guidance for optimal results.",
        },
      ],
    },
    ko: {
      title: "제공 서비스",
      subtitle: "라이브아이돌 그룹을 위한 전문 음악 제작 서비스",
      services: [
        {
          icon: Music,
          title: "음악 제작",
          description: "라이브아이돌 공연에 특화된 오리지널 음악 작곡 및 편곡을 제공합니다.",
        },
        {
          icon: Headphones,
          title: "믹싱 & 마스터링",
          description: "무대에서 완벽한 사운드를 보장하는 전문 오디오 믹싱 및 마스터링 서비스를 제공합니다.",
        },
        {
          icon: Mic,
          title: "세션 녹음",
          description: "전문 장비와 가이드를 통해 최적의 결과를 위한 고품질 녹음 세션을 제공합니다.",
        },
      ],
    },
  };

  const currentContent = content[language];

  return (
    <section id="services" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {currentContent.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {currentContent.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentContent.services.map((service, index) => {
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