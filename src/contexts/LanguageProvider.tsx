import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  type SupportedLanguage,
  detectUserLanguage,
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
    try {
      // Stored preference, then browser settings, then English
      const detected = detectUserLanguage();
      if (detected !== "en") {
        setLanguageState(detected);
        setTranslations(getTranslations(detected));
      }
    } catch (error) {
      console.error("Error during language detection:", error);
    } finally {
      setIsLoading(false);
    }
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