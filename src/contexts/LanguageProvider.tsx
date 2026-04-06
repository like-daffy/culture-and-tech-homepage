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
  // Initialize with synchronous detection to avoid hydration mismatch
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== "undefined") {
      return detectUserLanguageSync();
    }
    return "en";
  });

  const [isLoading, setIsLoading] = useState(true);
  const [translations, setTranslations] = useState<Translations>(getTranslations(language));

  // Perform async detection after mount
  useEffect(() => {
    let mounted = true;

    async function performAsyncDetection() {
      try {
        const detectedLanguage = await detectUserLanguage();
        if (mounted && detectedLanguage !== language) {
          setLanguageState(detectedLanguage);
          setTranslations(getTranslations(detectedLanguage));
        }
      } catch (error) {
        console.error("Error during async language detection:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    performAsyncDetection();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle language changes
  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    setTranslations(getTranslations(newLanguage));
    storeLanguagePreference(newLanguage);

    // Log language change for analytics (optional)
    console.log("Language changed to:", newLanguage);
  };

  // Update translations when language changes
  useEffect(() => {
    setTranslations(getTranslations(language));
  }, [language]);

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