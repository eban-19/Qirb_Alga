import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { languageLabels, languageFlags, translations, translateText, type Language, type TranslationSchema } from "@/lib/i18n";

export interface TFunction extends TranslationSchema {
  (path: string): string;
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TFunction;
  tr: (text: string | { en?: string; am?: string; om?: string; ti?: string; so?: string; aa?: string }) => string;
  trAsync: (text: string) => Promise<string>;
  options: Array<{ value: Language; label: string; flag: string }>;
}

const STORAGE_KEY = "qirb-alga-language";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function isLanguage(value: string): value is Language {
  return value === "en" || value === "am" || value === "om" || value === "ti" || value === "so" || value === "aa";
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isLanguage(stored)) return stored;
  return "en";
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

// Deep merges translation objects to guarantee fallback translations for all properties, with robust Array support
function deepMerge(target: any, source: any): any {
  if (Array.isArray(target) && Array.isArray(source)) {
    return target.length > 0 ? target : source;
  }

  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object") {
      if (Array.isArray(source[key])) {
        if (!(key in target) || !Array.isArray(target[key]) || target[key].length === 0) {
          output[key] = source[key];
        } else {
          output[key] = target[key].map((item: any, idx: number) => {
            if (item && typeof item === "object") {
              return deepMerge(item, source[key][idx] || {});
            }
            return item !== undefined && item !== "" ? item : source[key][idx];
          });
        }
      } else {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      }
    } else {
      if (!(key in target) || target[key] === undefined || target[key] === "") {
        output[key] = source[key];
      }
    }
  }
  return output;
}

function createTFunction(language: Language): TFunction {
  const currentTranslation = translations[language];
  const englishTranslation = translations["en"];

  const tFn = (path: string): string => {
    // 1. Try resolving path from target language
    let val = getNestedValue(currentTranslation, path);
    if (val !== undefined && typeof val === "string") return val;

    // 2. Fall back to English
    val = getNestedValue(englishTranslation, path);
    if (val !== undefined && typeof val === "string") return val;

    // 3. Fall back to key itself
    return path;
  };

  // Build a merged translation tree to support nested object-path calls
  const merged = deepMerge(currentTranslation || {}, englishTranslation);
  Object.assign(tFn, merged);

  return tFn as unknown as TFunction;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => {
      const t = createTFunction(language);
      return {
        language,
        setLanguage,
        t,
        tr: (text: string | { en?: string; am?: string; om?: string; ti?: string; so?: string; aa?: string }): string => {
          // Handle multilingual objects (name_ml, description_ml)
          if (typeof text === "object" && text !== null) {
            return (text[language] || text.en || "") as string;
          }
          // Handle string fallback - returns original text
          return text as string;
        },
        trAsync: async (text: string) => {
          // Asynchronous backend translation
          return await translateText(text, language);
        },
        options: [
          { value: "en", label: t.navbar?.langEn || languageLabels.en, flag: languageFlags.en },
          { value: "am", label: t.navbar?.langAm || languageLabels.am, flag: languageFlags.am },
          { value: "om", label: t.navbar?.langOm || languageLabels.om, flag: languageFlags.om },
          { value: "ti", label: t.navbar?.langTi || languageLabels.ti, flag: languageFlags.ti },
          { value: "so", label: t.navbar?.langSo || languageLabels.so, flag: languageFlags.so },
          { value: "aa", label: t.navbar?.langAa || languageLabels.aa, flag: languageFlags.aa }
        ]
      };
    },
    [language]
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
