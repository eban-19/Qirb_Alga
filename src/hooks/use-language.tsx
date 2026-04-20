import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { languageLabels, translations, translateText, type Language, type TranslationSchema } from "@/lib/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationSchema;
  tr: (text: string | { en?: string; am?: string; om?: string }) => string;
  trAsync: (text: string) => Promise<string>;
  options: Array<{ value: Language; label: string }>;
}

const STORAGE_KEY = "qirb-alga-language";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function isLanguage(value: string): value is Language {
  return value === "en" || value === "om" || value === "am";
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isLanguage(stored)) return stored;
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: translations[language],
      tr: (text: string | { en?: string; am?: string; om?: string }): string => {
        // Handle multilingual objects (name_ml, description_ml)
        if (typeof text === 'object' && text !== null) {
          return (text[language] || text.en || '') as string;
        }
        // Handle string fallback - returns original text
        // Use trAsync for actual translation
        return text as string;
      },
      trAsync: async (text: string) => {
        // Asynchronous backend translation
        return await translateText(text, language);
      },
      options: [
        { value: "en", label: languageLabels.en },
        { value: "om", label: languageLabels.om },
        { value: "am", label: languageLabels.am },
      ],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
