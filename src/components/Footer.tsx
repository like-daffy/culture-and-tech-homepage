interface FooterProps {
  language: "en" | "ko";
}

export function Footer({ language }: FooterProps) {
  const content = {
    en: {
      email: "Email",
      registration: "Business Registration",
      address: "Address",
      addressText: "3rd floor, 18 Jayangbeonyeong-ro, Gwangjin-gu, Seoul, South Korea",
      copyright: "© 2026 Culture & Tech. All rights reserved.",
    },
    ko: {
      email: "이메일",
      registration: "사업자 등록번호",
      address: "주소",
      addressText: "서울시 광진구 자양번영로 18, 3층",
      copyright: "© 2026 컬처앤테크. All right reserved.",
    },
  };

  const { email, registration, address, addressText, copyright } = content[language];

  return (
    <footer className="border-t border-border bg-muted/30 py-8">
      <div className="container">
        <div className="text-center space-y-3">
          {/* Email and Business Registration - Same Line */}
          <p className="text-sm text-muted-foreground">
            {email}: <a href="mailto:sochan@cultureand.tech" className="hover:text-accent transition-colors">sochan@cultureand.tech</a>
            <span className="mx-3">|</span>
            {registration}: <span className="font-medium">111-20-53033</span>
          </p>
          
          {/* Address */}
          <p className="text-sm text-muted-foreground">
            {address}: {addressText}
          </p>

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