import { useLanguage } from "@/contexts/LanguageProvider";

export function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  const content = {
    en: {
      companyInfo: "Culture & Tech | Representative: Chan Baek | Business Registration: 111-20-53033",
      address: "3rd floor, 18 Jayangbeonyeong-ro, Gwangjin-gu, Seoul, 05098, South Korea",
      email: "sochan@cultureand.tech",
      description: "Specialized in Live-Idol and K-Pop music production, mixing, and mastering services.",
      rights: "All rights reserved.",
    },
    ko: {
      companyInfo: "Culture & Tech | 대표자: 백찬 | 사업자등록번호: 111-20-53033",
      address: "05098 서울특별시 광진구 자양번영로 18, 3층 | sochan@cultureand.tech",
      description: "라이브아이돌 및 K-Pop 음악 제작, 믹싱, 마스터링 서비스 전문.",
      rights: "모든 권리 보유.",
    },
  };

  const currentContent = content[language];

  return (
    <footer className="relative border-t border-border py-8 overflow-hidden">
      {/* Video Background Preview (Thumbnail) */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://img.youtube.com/vi/ynYmTnt9xjY/maxresdefault.jpg')",
        }}
      />

      {/* Video Background (Auto-play) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <iframe
          className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          src="https://www.youtube.com/embed/ynYmTnt9xjY?autoplay=1&mute=1&loop=1&playlist=ynYmTnt9xjY&controls=0&showinfo=0&modestbranding=1&playsinline=1&enablejsapi=1&rel=0"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Footer Background Video"
        />
      </div>

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="container relative z-10">
        <div className="text-center space-y-3">
          <p className="text-sm text-white/90 drop-shadow-lg">
            {currentContent.companyInfo}
          </p>
          <p className="text-sm text-white/90 drop-shadow-lg">
            {currentContent.address}
          </p>
          {language === "en" && (
            <p className="text-sm text-white/90 drop-shadow-lg">
              {currentContent.email}
            </p>
          )}
          <p className="text-sm text-white/90 drop-shadow-lg">
            {currentContent.description}
          </p>
          
          {/* Separator */}
          <div className="pt-4">
            <div className="w-full max-w-md mx-auto border-t border-white/30 mb-4"></div>
            <p className="text-xs text-white/80 drop-shadow-lg">
              © {currentYear} Culture & Tech. {currentContent.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}