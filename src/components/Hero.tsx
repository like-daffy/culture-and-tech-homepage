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
      title: "컬처앤테크",
      subtitle: "컬처와 테크의 조화를 모토",
      description: "품질 보증, 음악 제작 및 전문 세션 서비스",
    },
  };

  const { title, subtitle, description } = content[language];

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Video Preview Background (fallback) */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundImage: "url('https://img.youtube.com/vi/ClIMiux5hjE/maxresdefault.jpg')",
        }}
      />
      
      {/* Auto-playing YouTube Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <iframe
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            transform: "scale(1.2)",
            width: "100%",
            height: "100%",
          }}
          src="https://www.youtube.com/embed/ClIMiux5hjE?autoplay=1&loop=1&playlist=ClIMiux5hjE&mute=1&playsinline=1&controls=0&showinfo=0&autohide=1&allowfullscreen=1&mode=transparent&modestbranding=1&rel=0&iv_load_policy=3"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Background Video"
        />
      </div>
      
      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/50 z-0" />
      
      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4 font-medium drop-shadow-md">
            {subtitle}
          </p>
          <p className="text-base md:text-lg text-white/80 drop-shadow-md">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}