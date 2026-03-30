interface AboutProps {
  language: "en" | "ko";
}

export function About({ language }: AboutProps) {
  const content = {
    en: {
      title: "About Us",
      description: "Culture & Tech is a multifaceted company providing professional services across technology, music, and entertainment sectors. We combine technical expertise with creative excellence to deliver outstanding results for our clients.",
      taxInvoice: "Tax invoices are available upon request.",
    },
    ko: {
      title: "회사 소개",
      description: "Culture & Tech는 기술, 음악 및 엔터테인먼트 분야에서 전문 서비스를 제공하는 다각화된 회사입니다. 기술적 전문성과 창의적 우수성을 결합하여 고객에게 탁월한 결과를 제공합니다.",
      taxInvoice: "세금계산서 발행이 가능합니다.",
    },
  };

  const { title, description, taxInvoice } = content[language];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            {title}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>
          <p className="text-sm md:text-base text-accent font-medium">
            {taxInvoice}
          </p>
        </div>
      </div>
    </section>
  );
}