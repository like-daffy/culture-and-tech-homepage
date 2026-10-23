import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import {
  type SupportedLanguage,
  detectUserLanguage,
  storeLanguagePreference,
} from "@/lib/language-detection";
import { languagePathsFor, pageLanguageFromPath } from "@/lib/seo";
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
  const router = useRouter();
  // Language the current page is pre-rendered in: "/" and "/apps/…" are English, "/ko/…" is Korean
  const pageLanguage = pageLanguageFromPath(router.pathname);
  // Only the English homepage adapts to the visitor. Every other page shows the language of its address, so that
  // its text matches its title, description and structured data
  const adaptsToVisitor = router.pathname === "/";

  // Language the English homepage shows this visitor. Always starts as "en" to prevent
  // hydration mismatch; detection happens in useEffect after mount
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>("en");
  const [isLoading, setIsLoading] = useState(true);

  const language = adaptsToVisitor ? preferredLanguage : pageLanguage;
  const translations: Translations = getTranslations(language);

  // Detect and apply language after component mounts (client-side only)
  useEffect(() => {
    if (!adaptsToVisitor) {
      setIsLoading(false);
      return;
    }

    try {
      // Stored preference, then browser settings, then English
      setPreferredLanguage(detectUserLanguage());
    } catch (error) {
      console.error("Error during language detection:", error);
    } finally {
      setIsLoading(false);
    }
  }, [adaptsToVisitor]);

  // Keep <html lang> correct when the English page shows Korean
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Handle manual language changes: each language has its own version of the page
  const setLanguage = (newLanguage: SupportedLanguage) => {
    setPreferredLanguage(newLanguage);
    storeLanguagePreference(newLanguage);
    if (newLanguage !== pageLanguage) {
      router.push(languagePathsFor(router.pathname)[newLanguage]);
    }

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