import { Mail, MapPin, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ContactProps {
  language: "en" | "ko";
}

export function Contact({ language }: ContactProps) {
  const content = {
    en: {
      title: "Contact Information",
      email: {
        title: "Email",
        value: "sochan@cultureand.tech",
      },
      registration: {
        title: "Business Registration Number",
        value: "111-20-53033",
      },
      address: {
        title: "Business Address",
        value: "Jayang 2-Dong, Gwangjingu, Seoul, South Korea",
      },
    },
    ko: {
      title: "연락처 정보",
      email: {
        title: "이메일",
        value: "sochan@cultureand.tech",
      },
      registration: {
        title: "사업자 등록번호",
        value: "111-20-53033",
      },
      address: {
        title: "사업장 주소",
        value: "서울특별시 광진구 자양2동",
      },
    },
  };

  const { title, email, registration, address } = content[language];

  return (
    <section id="contact" className="py-20">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-border hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-sm text-primary mb-2">
                  {email.title}
                </h3>
                <a
                  href={`mailto:${email.value}`}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {email.value}
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-sm text-primary mb-2">
                  {registration.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {registration.value}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-sm text-primary mb-2">
                  {address.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {address.value}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}