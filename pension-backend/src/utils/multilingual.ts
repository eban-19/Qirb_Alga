/**
 * Multilingual field utility functions
 * Handles extraction and fallback logic for multilingual JSON fields
 */

export interface MultilingualField {
  en?: string;
  am?: string;
  om?: string;
}

/**
 * Extract text for a specific language from a multilingual field
 * Falls back to English if the requested language is not available
 * Falls back to the first available language if English is not available
 */
export function getMultilingualText(
  field: MultilingualField | string | null | undefined,
  language: string = 'en'
): string {
  // If field is a plain string, return it
  if (typeof field === 'string') {
    return field;
  }

  // If field is null or undefined, return empty string
  if (!field) {
    return '';
  }

  // If field is an object, try to get the requested language
  if (typeof field === 'object') {
    // Try requested language first
    if (field[language as keyof MultilingualField]) {
      return field[language as keyof MultilingualField]!;
    }

    // Fallback to English
    if (field.en) {
      return field.en;
    }

    // Fallback to first available language
    const availableLanguages = Object.keys(field);
    if (availableLanguages.length > 0) {
      return field[availableLanguages[0] as keyof MultilingualField]!;
    }
  }

  return '';
}

/**
 * Create a multilingual field object from a string
 * Useful for backward compatibility when only English is provided
 */
export function createMultilingualField(text: string): MultilingualField {
  return {
    en: text
  };
}

/**
 * Update a multilingual field with a new translation
 * Preserves existing translations for other languages
 */
export function updateMultilingualField(
  field: MultilingualField | string | null | undefined,
  language: string,
  text: string
): MultilingualField {
  let baseField: MultilingualField;

  // Convert string to multilingual object if needed
  if (typeof field === 'string') {
    baseField = { en: field };
  } else if (!field) {
    baseField = {};
  } else {
    baseField = { ...field };
  }

  // Update the requested language
  baseField[language as keyof MultilingualField] = text;

  return baseField;
}
