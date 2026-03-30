import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Music, Keyboard, ExternalLink } from "lucide-react";

interface ServicesProps {
  language: "en" | "ko";
}

export function Services({ language }: ServicesProps) {
  const content = {
    en: {
      title: "Our Services",
      services: [
        {
          icon: Code,
          title: "QA Automation Solution & Consulting",
          description: "Professional quality assurance automation solutions and consulting services. Available for on-site work in Seoul and Gyeonggi offices.",
          features: [
            "Test automation implementation",
            "QA process consulting",
            "On-site support available",
            "Custom solution development",
          ],
        },
        {
          icon: Music,
          title: "Live-Idol Music Production",
          description: "Professional music production services for live idol performances by Sochan, the live-idol music producer.",
          features: [
            "Exclusive & Non-Exclusive licenses",
            "Full Mix, Instrumental & Stems delivery",
            "Multiple revision options",
            "Overseas payment supported",
          ],
          cta: "View Details",
          link: "#music-details",
        },
        {
          icon: Keyboard,
          title: "Professional Keyboardist Sessions",
          description: "Expert keyboard session services for live gigs, stages, and studio recordings.",
          features: [
            "Live performance sessions",
            "Studio recording",
            "Professional equipment",
            "Flexible scheduling",
          ],
        },
      ],
    },
    ko: {
      title: "서비스",
      services: [
        {
          icon: Code,
          title: "QA 자동화 솔루션 및 컨설팅",
          description: "전문 품질 보증 자동화 솔루션 및 컨설팅 서비스. 서울 및 경기도 사무실에서 상주 근무 가능합니다.",
          features: [
            "테스트 자동화 구현",
            "QA 프로세스 컨설팅",
            "현장 지원 가능",
            "맞춤형 솔루션 개발",
          ],
        },
        {
          icon: Music,
          title: "라이브 아이돌 음악 제작",
          description: "라이브 아이돌 음악 프로듀서 소찬의 전문 음악 제작 서비스.",
          features: [
            "독점 및 비독점 라이선스",
            "풀 믹스, 인스트루멘탈 및 스템 제공",
            "다양한 수정 옵션",
          ],
          cta: "자세히 보기",
          link: "#music-details",
        },
        {
          icon: Keyboard,
          title: "전문 키보디스트 세션",
          description: "라이브 공연, 무대 및 스튜디오 녹음을 위한 전문 키보드 세션 서비스.",
          features: [
            "라이브 공연 세션",
            "스튜디오 녹음",
            "유연한 일정 조정",
          ],
        },
      ],
    },
  };

  const { title, services } = content[language];

  return (
    <section id="services" className="py-20">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
          {title}
        </h2>
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
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start">
                        <span className="text-accent mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {service.cta && service.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const element = document.querySelector(service.link);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                    >
                      {service.cta}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}