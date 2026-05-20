import en from "./en.json";
import am from "./am.json";
import om from "./om.json";
import ti from "./ti.json";
import so from "./so.json";
import aa from "./aa.json";

export type Language = "en" | "am" | "om" | "ti" | "so" | "aa";

export const languageLabels: Record<Language, string> = {
  en: "English",
  am: "አማርኛ",
  om: "Afaan Oromoo",
  ti: "ትግርኛ",
  so: "Soomaali",
  aa: "Qafar afa"
};

export const languageFlags: Record<Language, string> = {
  en: "https://flagcdn.com/w40/gb.png",
  am: "https://flagcdn.com/w40/et.png",
  om: "https://flagcdn.com/w40/et.png",
  ti: "https://flagcdn.com/w40/er.png",
  so: "https://flagcdn.com/w40/so.png",
  aa: "https://flagcdn.com/w40/et.png"
};

export type TranslationSchema = typeof en;

export const translations: Record<Language, TranslationSchema> = {
  en,
  am,
  om,
  ti,
  so,
  aa
};

// Backend translation function - calls API for real translation
export async function translateText(text: string, language: Language): Promise<string> {
  if (language === "en") return text;

  try {
    const response = await fetch("http://localhost:3006/api/translations/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim(), targetLanguage: language })
    });
    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error("Translation failed:", error);
    return text; // Fallback to original
  }
}

// Backend batch translation function
export async function translateTextBatch(texts: string[], language: Language): Promise<string[]> {
  if (language === "en") return texts;

  try {
    const response = await fetch("http://localhost:3006/api/translations/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts,
        targetLanguage: language,
        sourceLanguage: "en"
      })
    });

    if (!response.ok) {
      console.error("Batch translation API error:", response.status);
      return texts; // Fallback to originals
    }

    const data = await response.json();
    return data.translatedTexts || texts;
  } catch (error) {
    console.error("Batch translation failed:", error);
    return texts; // Fallback to originals
  }
}

// Legacy function for backward compatibility
export const trDict = (text: string, lang: Language): string => {
  return text; // Will be translated asynchronously by components
};
