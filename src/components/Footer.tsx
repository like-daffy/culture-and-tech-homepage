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
      rights: "모든 권리 보유.",
    },
  };

  const { email, registration, address, addressText, rights } = content[language];

  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-sm text-primary mb-2">{email}</h4>
            <a
              href="mailto:sochan@cultureand.tech"
              className="text-sm text-muted-foreground hover:text-accent"
            >
              sochan@cultureand.tech
            </a>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-primary mb-2">{registration}</h4>
            <p className="text-sm text-muted-foreground">111-20-53033</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-primary mb-2">{address}</h4>
            <p className="text-sm text-muted-foreground">{addressText}</p>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Culture & Tech. {rights}
          </p>
        </div>
      </div>
    </footer>
  );
}