import type { SupportedLanguage } from "./language-detection";

/**
 * Translation Management System
 * Centralized translations for all components
 */

export interface Translations {
  navigation: {
    home: string;
    about: string;
    apps: string;
    services: string;
    contact: string;
    brandName: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  about: {
    title: string;
    description: string;
  };
  services: {
    title: string;
    subtitle: string;
    qa: {
      title: string;
      description: string;
    };
    music: {
      title: string;
      description: string;
    };
    session: {
      title: string;
      description: string;
    };
  };
  contact: {
    title: string;
    description: string;
    email: string;
    phone: string;
    address: string;
  };
  footer: {
    rights: string;
    description: string;
  };
}

const translations: Record<SupportedLanguage, Translations> = {
  en: {
    navigation: {
      home: "Home",
      about: "About",
      apps: "Apps",
      services: "Services",
      contact: "Contact",
      brandName: "Culture & Tech",
    },
    hero: {
      title: "Culture & Tech",
      subtitle: "Music for live idols. Apps for musicians.",
      description: "Original songs produced by Sochan, and the apps we built for our own studio: Chord to MIDI and Storage Review.",
    },
    about: {
      title: "About Us",
      description: "Culture & Tech is a music studio in Seoul. We write and produce original songs for live idols, play keyboard sessions and build QA automation. Our apps for musicians come from the same desk, and each one started with a problem we ran into while making music.",
    },
    services: {
      title: "Our Services",
      subtitle: "Comprehensive solutions tailored to your needs",
      qa: {
        title: "Quality Assurance",
        description: "Rigorous testing and quality control to ensure your products meet the highest standards.",
      },
      music: {
        title: "Music Production",
        description: "Professional music production services with state-of-the-art equipment and experienced producers.",
      },
      session: {
        title: "Session Services",
        description: "Expert session musicians and recording services for your next project.",
      },
    },
    contact: {
      title: "Get in Touch",
      description: "We'd love to hear from you. Contact us for inquiries or collaboration opportunities.",
      email: "Email",
      phone: "Phone",
      address: "Address",
    },
    footer: {
      rights: "All rights reserved.",
      description: "Harmonizing Culture and Technology",
    },
  },
  ko: {
    navigation: {
      home: "홈",
      about: "소개",
      apps: "앱",
      services: "서비스",
      contact: "문의",
      brandName: "컬처앤테크",
    },
    hero: {
      title: "컬처앤테크",
      subtitle: "라이브아이돌 음악 제작, 그리고 음악가를 위한 앱",
      description: "소찬이 제작하는 라이브아이돌 오리지널곡, 그리고 작업실에서 직접 쓰려고 만든 앱 Chord to MIDI와 Storage Review.",
    },
    about: {
      title: "회사 소개",
      description: "컬처앤테크는 서울의 음악 스튜디오입니다. 서브컬처와 라이브아이돌을 위한 오리지널곡을 만들고, 키보드 세션과 QA 자동화 일을 합니다. 음악가를 위한 앱도 같은 책상에서 만듭니다. 모두 저희가 음악을 만들다 부딪힌 문제에서 시작했습니다.",
    },
    services: {
      title: "서비스",
      subtitle: "고객의 니즈에 맞춘 종합 솔루션",
      qa: {
        title: "품질 보증",
        description: "제품이 최고 수준을 충족하도록 엄격한 테스트 및 품질 관리를 제공합니다.",
      },
      music: {
        title: "음악 제작",
        description: "최첨단 장비와 경험 많은 프로듀서와 함께하는 전문 음악 제작 서비스입니다.",
      },
      session: {
        title: "세션 서비스",
        description: "다음 프로젝트를 위한 전문 세션 뮤지션 및 녹음 서비스를 제공합니다.",
      },
    },
    contact: {
      title: "연락하기",
      description: "문의 사항이나 협업 기회가 있으시면 언제든지 연락 주세요.",
      email: "이메일",
      phone: "전화",
      address: "주소",
    },
    footer: {
      rights: "모든 권리 보유.",
      description: "문화와 기술의 조화",
    },
  },
};

/**
 * Get translations for a specific language
 */
export function getTranslations(language: SupportedLanguage): Translations {
  return translations[language];
}

/**
 * Get a specific translation key
 */
export function translate(
  language: SupportedLanguage,
  key: string
): string {
  const keys = key.split(".");
  let value: unknown = translations[language];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}
