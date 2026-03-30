interface FooterProps {
  language: "en" | "ko";
}

export function Footer({ language }: FooterProps) {
  const content = {
    en: {
      email: "Email",
      registration: "Business Registration",
      address: "Address",
      addressText: "Jayang 2-Dong, Gwangjingu, Seoul, South Korea",
      rights: "All rights reserved.",
    },
    ko: {
      email: "이메일",
      registration: "사업자 등록번호",
      address: "주소",
      addressText: "서울특별시 광진구 자양2동",
      rights: "All right reserved.",
    },
  };

  const { email, registration, address, addressText, rights } = content[language];

  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="container">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {email}: <a href="mailto:sochan@cultureand.tech" className="hover:text-accent">sochan@cultureand.tech</a>
          </p>
          <p className="text-sm text-muted-foreground">
            {registration}: 111-20-53033
          </p>
          <p className="text-sm text-muted-foreground">
            {address}: {addressText}
          </p>
          <p className="text-sm text-muted-foreground pt-4">
            © {new Date().getFullYear()} {language === "ko" ? "컬처앤테크" : "Culture & Tech"}. {rights}
          </p>
        </div>
      </div>
    </footer>
  );
}