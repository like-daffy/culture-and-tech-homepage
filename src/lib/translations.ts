import type { SupportedLanguage } from "./language-detection";

/**
 * Translation Management System
 * Centralized translations for all components
 */

export interface Translations {
  navigation: {
    home: string;
    about: string;
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
      services: "Services",
      contact: "Contact",
      brandName: "Culture & Tech",
    },
    hero: {
      title: "Culture & Tech",
      subtitle: "Innovative Solutions for Modern Business",
      description: "Quality Assurance, Music Production, and Professional Session Services",
    },
    about: {
      title: "About Us",
      description: "We are a leading company specializing in quality assurance, music production, and professional session services. Our mission is to deliver excellence through the harmonious blend of culture and technology.",
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
      services: "서비스",
      contact: "연락",
      brandName: "컬처앤테크",
    },
    hero: {
      title: "컬처앤테크",
      subtitle: "컬처와 테크의 조화를 모토",
      description: "품질 보증, 음악 제작 및 전문 세션 서비스",
    },
    about: {
      title: "회사 소개",
      description: "저희는 품질 보증, 음악 제작 및 전문 세션 서비스를 전문으로 하는 선도적인 회사입니다. 문화와 기술의 조화로운 결합을 통해 최고의 서비스를 제공하는 것이 저희의 사명입니다.",
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
  let value: any = translations[language];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}