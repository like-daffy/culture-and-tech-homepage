import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  type SupportedLanguage,
  detectUserLanguage,
  detectUserLanguageSync,
  storeLanguagePreference,
} from "@/lib/language-detection";
import { getTranslations, type Translations } from "@/lib/translations";

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translations: Translations;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Always initialize with "en" to prevent hydration mismatch
  // Detection happens in useEffect after mount
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [isLoading, setIsLoading] = useState(true);
  const [translations, setTranslations] = useState<Translations>(getTranslations("en"));

  // Detect and apply language after component mounts (client-side only)
  useEffect(() => {
    let mounted = true;

    async function detectAndApplyLanguage() {
      try {
        // First try synchronous detection (stored preference + browser)
        const syncDetected = detectUserLanguageSync();
        if (mounted && syncDetected !== "en") {
          setLanguageState(syncDetected);
          setTranslations(getTranslations(syncDetected));
        }

        // Then try async detection (geolocation)
        const asyncDetected = await detectUserLanguage();
        if (mounted && asyncDetected !== syncDetected) {
          setLanguageState(asyncDetected);
          setTranslations(getTranslations(asyncDetected));
        }
      } catch (error) {
        console.error("Error during language detection:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    detectAndApplyLanguage();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle manual language changes
  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    setTranslations(getTranslations(newLanguage));
    storeLanguagePreference(newLanguage);

    // Log language change for analytics (optional)
    console.log("Language changed to:", newLanguage);
  };

  const value: LanguageContextValue = {
    language,
    setLanguage,
    translations,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}