interface FooterProps {
  language: "en" | "ko";
}

export function Footer({ language }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const content = {
    en: {
      companyInfo: "Culture & Tech | Representative: Chan Baek | Business Registration: 111-20-53033",
      address: "3rd floor, 18 Jayangbeonyeong-ro, Gwangjin-gu, Seoul, 05098, South Korea",
      copyright: `© ${currentYear} Culture & Tech. All rights reserved.`,
    },
    ko: {
      companyInfo: "Culture & Tech | 대표자: 백찬 | 사업자등록번호: 111-20-53033",
      address: "05098 서울특별시 광진구 자양번영로 18, 3층",
      email: "sochan@cultureand.tech",
      copyright: `© ${currentYear} 컬처앤테크. All right reserved.`,
    },
  };

  const isKorean = language === "ko";
  const { companyInfo, address, copyright } = content[language];

  return (
    <footer className="relative border-t border-border bg-muted/30 py-8 overflow-hidden">
      {/* Video Background Preview (Thumbnail) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://img.youtube.com/vi/ynYmTnt9xjY/maxresdefault.jpg')",
        }}
      />

      {/* Video Background (Auto-play) - Responsive */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <iframe
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none min-w-full min-h-full w-auto h-auto"
          style={{
            width: "100vw",
            height: "56.25vw", // 16:9 aspect ratio
            minHeight: "100%",
            minWidth: "177.78vh", // 16:9 aspect ratio
          }}
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
          {/* Company Info and Business Registration */}
          <p className="text-sm text-muted-foreground">
            {companyInfo}
          </p>

          {/* Address */}
          <p className="text-sm text-muted-foreground">
            {address}
          </p>

          {/* Email - Korean only */}
          {isKorean && (
            <p className="text-sm text-muted-foreground">
              {content.ko.email}
            </p>
          )}

          {/* Separator */}
          <div className="pt-4">
            <div className="w-full max-w-md mx-auto border-t border-border/50 mb-4"></div>
            {/* Copyright - Smaller */}
            <p className="text-xs text-muted-foreground/80">
              {copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}