import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface MusicDetailsProps {
  language: "en" | "ko";
}

export function MusicDetails({ language }: MusicDetailsProps) {
  const content = {
    en: {
      title: "Live-Idol Music Production Details",
      subtitle: "by Sochan - The Live-Idol Music Producer",
      discography: {
        title: "Recent Works",
        items: [
          "(2024) Oh My Sunshine - Uzuki",
          "(2024) NEK1 PR4DE SE (Opening Music)",
        ],
      },
      contract: {
        title: "Contract Information",
        payment: {
          title: "Payment (Overseas)",
          details: [
            "PayPal Invoice for fast confirmation",
            "Wise bank transfer (USD/JPY) for lower costs",
            "Currencies: JPY / USD",
            "Sender covers all fees (transfer/platform/FX)",
            "Invoice-based goods and services only (No F&F)",
          ],
        },
        details: {
          title: "Contract Details",
          items: [
            "Deliverables: Full Mix, Instrumental, Stems (Drum, Bass, Synth, Lead, FX)",
            "Lyrics: Adaptation allowed (language/meaning), melody/harmony/structure changes not allowed",
            "Local work: Vocal recording/mix/master handled by client",
            "Scope: Live-only (venue performance). Digital release requires 'Produced By Sochan' credit",
            "Revisions: Non-exclusive 2 times / Exclusive 3 times (small audio tweaks only)",
            "Lyrics adaptation doesn't consume revision counts",
            "Revisions beyond maximum are not permitted",
          ],
        },
      },
      faq: {
        title: "FAQ",
        items: [
          {
            question: "What's the difference between Exclusive and Non-Exclusive?",
            answer: "Exclusive: Grants exclusive use during the group's active period. Other teams cannot use the song during this time. If the group disbands or suspends activities indefinitely, the license converts to non-exclusive. Non-Exclusive: Multiple teams may use the same song.",
          },
          {
            question: "What counts as 'one' revision?",
            answer: "BPM adjustments, balance/tone tweaks, and adding FX—small edits completable within 2 hours. Melody changes, verse/chorus replacements, and structural changes are not permitted.",
          },
          {
            question: "Can I cancel after payment?",
            answer: "After payment, deliverables (Full Mix, Instrumental, Stems) are provided immediately. Due to instant service delivery, the contract cannot be canceled. Please decide carefully.",
          },
        ],
      },
      inquiry: {
        title: "Contract Inquiry",
        discord: "Discord ID: @sochan.kr",
        email: "Email: sochan@cultureand.tech",
      },
    },
    ko: {
      title: "라이브 아이돌 음악 제작 상세",
      subtitle: "by 소찬 - 라이브 아이돌 음악 프로듀서",
      discography: {
        title: "최근 작품",
        items: [
          "(2024) Oh My Sunshine - Uzuki",
          "(2024) NEK1 PR4DE SE (오프닝 음악)",
        ],
      },
      contract: {
        title: "계약 정보",
        payment: undefined,
        details: {
          title: "계약 세부사항",
          items: [
            "제공물: 풀 믹스, 인스트루멘탈, 스템 (드럼, 베이스, 신스, 리드, FX)",
            "가사: 적응 허용 (언어/의미), 멜로디/하모니/구조 변경 불가",
            "로컬 작업: 보컬 녹음/믹스/마스터는 클라이언트 담당",
            "범위: 라이브 전용 (공연장 공연). 디지털 릴리스는 'Produced By 소찬' 크레딧 필수",
            "수정: 비독점 2회 / 독점 3회 (작은 오디오 조정만)",
            "가사 적응은 수정 횟수에 포함되지 않음",
            "최대 수정 횟수 초과 불가",
          ],
        },
      },
      faq: {
        title: "자주 묻는 질문",
        items: [
          {
            question: "독점과 비독점의 차이점은?",
            answer: "독점: 그룹 활동 기간 동안 독점 사용권 부여. 이 기간 동안 다른 팀은 곡을 사용할 수 없습니다. 그룹이 해체되거나 무기한 활동 중단 시 라이선스는 자동으로 비독점으로 전환됩니다. 비독점: 여러 팀이 동일한 곡을 사용할 수 있습니다.",
          },
          {
            question: "'한 번'의 수정은 무엇을 의미하나요?",
            answer: "BPM 조정, 밸런스/톤 조정, FX 추가—2시간 내에 완료 가능한 작은 편집입니다. 멜로디 변경, 절/후렴 교체, 구조 변경은 허용되지 않습니다.",
          },
          {
            question: "결제 후 취소할 수 있나요?",
            answer: "결제 후 제공물(풀 믹스, 인스트루멘탈, 스템)이 즉시 제공됩니다. 즉시 서비스 제공으로 인해 계약 취소가 불가능합니다. 신중하게 결정하시기 바랍니다.",
          },
        ],
      },
      inquiry: {
        title: "계약 문의",
        discord: "Discord ID: @sochan.kr",
        email: "이메일: sochan@cultureand.tech",
      },
    },
  };

  const {
    title,
    subtitle,
    discography,
    contract,
    faq,
    inquiry,
  } = content[language];

  return (
    <section id="music-details" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          </div>

          {/* Discography */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{discography.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {discography.items.map((item, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Contract Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{contract.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment - only show if exists */}
              {contract.payment && (
                <div>
                  <h4 className="font-semibold text-lg mb-3">{contract.payment.title}</h4>
                  <ul className="space-y-2">
                    {contract.payment.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start">
                        <span className="text-accent mr-2">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Details */}
              <div>
                <h4 className="font-semibold text-lg mb-3">{contract.details.title}</h4>
                <ul className="space-y-2">
                  {contract.details.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start">
                      <span className="text-accent mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{faq.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faq.items.map((item, idx) => (
                <div key={idx}>
                  <h5 className="font-semibold text-base mb-2">{item.question}</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inquiry */}
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-accent">{inquiry.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Discord:</span>{" "}
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline inline-flex items-center gap-1"
                >
                  @sochan.kr
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <p className="text-sm">
                <span className="font-semibold">{inquiry.email.split(":")[0]}:</span>{" "}
                <a
                  href="mailto:sochan@cultureand.tech"
                  className="text-accent hover:underline"
                >
                  sochan@cultureand.tech
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}