interface HeroProps {
  language: "en" | "ko";
}

export function Hero({ language }: HeroProps) {
  const content = {
    en: {
      title: "Culture & Tech",
      subtitle: "Innovative Solutions for Modern Business",
      description: "Quality Assurance, Music Production, and Professional Session Services",
    },
    ko: {
      title: "Culture & Tech",
      subtitle: "현대 비즈니스를 위한 혁신적인 솔루션",
      description: "품질 보증, 음악 제작 및 전문 세션 서비스",
    },
  };

  const { title, subtitle, description } = content[language];

  return (
    <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-medium">
            {subtitle}
          </p>
          <p className="text-base md:text-lg text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}