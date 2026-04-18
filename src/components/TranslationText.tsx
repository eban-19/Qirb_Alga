import React, { useState, useEffect } from 'react';
import { translateText } from '@/lib/i18n';
import { Language } from '@/lib/i18n';

interface TranslationTextProps {
  text: string;
  language: Language;
  className?: string;
  fallback?: string;
}

/**
 * Async-safe translation component
 * Handles translation loading state and displays fallback while loading
 */
export const TranslationText: React.FC<TranslationTextProps> = ({
  text,
  language,
  className = '',
  fallback
}) => {
  const [translated, setTranslated] = useState<string>(text);
  const [loading, setLoading] = useState<boolean>(false);

  console.log('🔍 TranslationText rendered:', { text, language, translated, loading });

  useEffect(() => {
    const translate = async () => {
      console.log('🔍 TranslationText: Starting translation for:', { text, language });
      
      if (language === 'en') {
        console.log('🔍 TranslationText: Language is en, returning original');
        setTranslated(text);
        return;
      }

      setLoading(true);
      try {
        console.log('🔍 TranslationText: Calling translateText API');
        const result = await translateText(text, language);
        console.log('🔍 TranslationText: Translation result:', result);
        setTranslated(result);
      } catch (error) {
        console.error('🔍 TranslationText: Translation error:', error);
        setTranslated(fallback || text);
      } finally {
        setLoading(false);
      }
    };

    translate();
  }, [text, language, fallback]);

  if (loading) {
    return <span className={className}>{fallback || text}</span>;
  }

  return <span className={className}>{translated}</span>;
};

/**
 * Hook for async translation in components
 */
export const useTranslation = (text: string, language: Language) => {
  const [translated, setTranslated] = useState<string>(text);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const translate = async () => {
      if (language === 'en') {
        setTranslated(text);
        return;
      }

      setLoading(true);
      try {
        const result = await translateText(text, language);
        setTranslated(result);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslated(text);
      } finally {
        setLoading(false);
      }
    };

    translate();
  }, [text, language]);

  return { translated, loading };
};

/**
 * Hook for batch translation (more efficient for multiple strings)
 */
export const useBatchTranslation = (texts: string[], language: Language) => {
  const [translated, setTranslated] = useState<string[]>(texts);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const translate = async () => {
      if (language === 'en') {
        setTranslated(texts);
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(
          texts.map(text => translateText(text, language))
        );
        setTranslated(results);
      } catch (error) {
        console.error('Batch translation error:', error);
        setTranslated(texts);
      } finally {
        setLoading(false);
      }
    };

    translate();
  }, [texts, language]);

  return { translated, loading };
};
