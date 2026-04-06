/**
 * Language Detection Utility
 * Implements multi-tier language detection with priority hierarchy:
 * 1. Persistent Preference (localStorage/cookies)
 * 2. Browser Settings (navigator.language)
 * 3. IP-based Geolocation
 * 4. Fallback (English)
 */

export type SupportedLanguage = "en" | "ko";

const STORAGE_KEY = "user-language";
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "ko"];
const DEFAULT_LANGUAGE: SupportedLanguage = "en";

// Map country codes to languages
const COUNTRY_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  KR: "ko", // South Korea
  KP: "ko", // North Korea
  US: "en",
  GB: "en",
  CA: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  // Add more mappings as needed
};

/**
 * Priority 1: Check for stored language preference
 */
function getStoredLanguage(): SupportedLanguage | null {
  if (typeof window === "undefined") return null;

  try {
    // Check localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }

    // Check cookies as fallback
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === STORAGE_KEY && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)) {
        return value as SupportedLanguage;
      }
    }
  } catch (error) {
    console.warn("Error reading stored language:", error);
  }

  return null;
}

/**
 * Priority 2: Detect language from browser settings
 */
function getBrowserLanguage(): SupportedLanguage | null {
  if (typeof window === "undefined" || !navigator.language) return null;

  try {
    // Get primary language code (e.g., "en-US" -> "en", "ko-KR" -> "ko")
    const browserLang = navigator.language.split("-")[0].toLowerCase();

    // Check if it's a supported language
    if (SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
      return browserLang as SupportedLanguage;
    }

    // Check navigator.languages array for fallback
    if (navigator.languages) {
      for (const lang of navigator.languages) {
        const langCode = lang.split("-")[0].toLowerCase();
        if (SUPPORTED_LANGUAGES.includes(langCode as SupportedLanguage)) {
          return langCode as SupportedLanguage;
        }
      }
    }
  } catch (error) {
    console.warn("Error detecting browser language:", error);
  }

  return null;
}

/**
 * Priority 3: Detect language from IP-based geolocation
 */
async function getGeolocationLanguage(): Promise<SupportedLanguage | null> {
  if (typeof window === "undefined") return null;

  try {
    // Try Cloudflare's CF-IPCountry header first (if available via API route)
    const response = await fetch("/api/detect-location", {
      method: "GET",
      cache: "no-cache",
    });

    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country as string;

      if (countryCode && COUNTRY_LANGUAGE_MAP[countryCode]) {
        return COUNTRY_LANGUAGE_MAP[countryCode];
      }
    }
  } catch (error) {
    console.warn("Geolocation detection failed, using fallback:", error);
  }

  return null;
}

/**
 * Store language preference persistently
 */
export function storeLanguagePreference(language: SupportedLanguage): void {
  if (typeof window === "undefined") return;

  try {
    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, language);

    // Store in cookie for server-side detection (expires in 1 year)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${STORAGE_KEY}=${language}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.warn("Error storing language preference:", error);
  }
}

/**
 * Main language detection function
 * Follows priority hierarchy: Stored > Browser > Geolocation > Fallback
 */
export async function detectUserLanguage(): Promise<SupportedLanguage> {
  // Priority 1: Stored preference
  const stored = getStoredLanguage();
  if (stored) {
    console.log("Language detected from storage:", stored);
    return stored;
  }

  // Priority 2: Browser settings
  const browser = getBrowserLanguage();
  if (browser) {
    console.log("Language detected from browser:", browser);
    storeLanguagePreference(browser); // Store for future visits
    return browser;
  }

  // Priority 3: Geolocation (async)
  const geolocation = await getGeolocationLanguage();
  if (geolocation) {
    console.log("Language detected from geolocation:", geolocation);
    storeLanguagePreference(geolocation); // Store for future visits
    return geolocation;
  }

  // Priority 4: Fallback
  console.log("Using fallback language:", DEFAULT_LANGUAGE);
  return DEFAULT_LANGUAGE;
}

/**
 * Synchronous language detection (skips geolocation)
 * Used for initial render to avoid hydration issues
 */
export function detectUserLanguageSync(): SupportedLanguage {
  const stored = getStoredLanguage();
  if (stored) return stored;

  const browser = getBrowserLanguage();
  if (browser) return browser;

  return DEFAULT_LANGUAGE;
}

/**
 * Check if a language is supported
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}