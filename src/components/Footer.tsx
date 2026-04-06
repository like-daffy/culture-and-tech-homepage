interface FooterProps {
  language: "en" | "ko";
}

export function Footer({ language }: FooterProps) {
  const content = {
    en: {
      companyInfo: "Culture & Tech | Representative: Chan Baek | Business Registration: 111-20-53033",
      address: "3rd floor, 18 Jayangbeonyeong-ro, Gwangjin-gu, Seoul, 05098, South Korea",
      copyright: "© 2026 Culture & Tech. All rights reserved.",
    },
    ko: {
      companyInfo: "Culture & Tech | 대표자: 백찬 | 사업자등록번호: 111-20-53033",
      address: "05098 서울특별시 광진구 자양번영로 18, 3층",
      email: "sochan@cultureand.tech",
      copyright: "© 2026 컬처앤테크. All right reserved.",
    },
  };

  const isKorean = language === "ko";
  const { companyInfo, address, copyright } = content[language];

  return (
    <footer className="border-t border-border bg-muted/30 py-8">
      <div className="container">
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