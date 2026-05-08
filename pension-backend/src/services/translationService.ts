import fetch from 'node-fetch';
import prisma from '../lib/prisma';
import crypto from 'crypto';
import { TranslationMethod } from '@prisma/client';

interface CachedTranslation {
  text: string;
  expires: number;
}

class TranslationService {
  private memoryCache = new Map<string, CachedTranslation>();
  private readonly MEMORY_CACHE_TTL = 3600000; // 1 hour
  private readonly DB_CACHE_TTL = 604800000; // 7 days

  /**
   * Translate text with 4-layer cache strategy
   * Layer 1: Memory cache (fastest)
   * Layer 2: Database cache (persistent)
   * Layer 3: Translations table (permanent storage)
   * Layer 4: Google Translate API
   */
  async translate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    // Return original text if target language is same as source
    if (targetLang === sourceLang) {
      return text;
    }

    // Layer 1: Check memory cache
    const cacheKey = this.getCacheKey(text, targetLang);
    const memCached = this.memoryCache.get(cacheKey);
    if (memCached && memCached.expires > Date.now()) {
      return memCached.text;
    }

    // Layer 2: Check database cache
    const dbCached = await this.checkDatabaseCache(text, targetLang);
    if (dbCached) {
      this.memoryCache.set(cacheKey, { text: dbCached, expires: Date.now() + this.MEMORY_CACHE_TTL });
      return dbCached;
    }

    // Layer 3: Check translations table
    const persisted = await this.checkTranslationsTable(text, targetLang);
    if (persisted) {
      await this.saveToCache(text, targetLang, persisted);
      this.memoryCache.set(cacheKey, { text: persisted, expires: Date.now() + this.MEMORY_CACHE_TTL });
      return persisted;
    }

    // Layer 4: Call External API
    try {
      const result = await this.callExternalTranslateApi(text, sourceLang, targetLang);
      await this.saveTranslation(text, result, sourceLang, targetLang);
      await this.saveToCache(text, targetLang, result);
      this.memoryCache.set(cacheKey, { text: result, expires: Date.now() + this.MEMORY_CACHE_TTL });
      return result;
    } catch (error) {
      console.error('[TRANSLATION] API failed:', error);
      return text;
    }
  }

  /**
   * Batch translate multiple texts
   */
  async translateBatch(texts: string[], targetLang: string, sourceLang: string = 'en'): Promise<string[]> {
    return await Promise.all(
      texts.map(text => this.translate(text, targetLang, sourceLang))
    );
  }

  /**
   * Get cache key for translation
   */
  private getCacheKey(text: string, lang: string): string {
    const normalizedText = text.trim().toLowerCase();
    return crypto.createHash('md5').update(`${normalizedText}_${lang}`).digest('hex');
  }

  /**
   * Check database cache for translation
   */
  private async checkDatabaseCache(text: string, targetLang: string): Promise<string | null> {
    try {
      const cacheKey = this.getCacheKey(text, targetLang);
      const cached = await prisma.translationCache.findFirst({
        where: {
          cache_key: cacheKey,
          target_language: targetLang,
          OR: [
            { expires_at: null },
            { expires_at: { gt: new Date() } }
          ]
        }
      });
      return cached?.translated_text || null;
    } catch (error) {
      console.error('Database cache check failed:', error);
      return null;
    }
  }

  /**
   * Check translations table for translation
   */
  private async checkTranslationsTable(text: string, targetLang: string): Promise<string | null> {
    try {
      const translation = await prisma.translation.findUnique({
        where: {
          source_text_target_language: {
            source_text: text,
            target_language: targetLang
          }
        }
      });
      return translation?.translated_text || null;
    } catch (error) {
      console.error('Translations table check failed:', error);
      return null;
    }
  }

  /**
   * Call external translation API
   */
  private async callExternalTranslateApi(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json() as any;
    
    if (data.responseStatus === 200 && data.responseData) {
      const translatedText = data.responseData.translatedText;
      if (translatedText === text) {
        throw new Error('Translation API returned original text (unsupported language)');
      }
      return translatedText;
    }
    throw new Error('Translation API returned error');
  }

  /**
   * Save translation to translations table
   */
  private async saveTranslation(
    sourceText: string,
    translatedText: string,
    sourceLang: string,
    targetLang: string
  ): Promise<void> {
    try {
      await prisma.translation.upsert({
        where: {
          source_text_target_language: {
            source_text: sourceText,
            target_language: targetLang
          }
        },
        update: {
          translated_text: translatedText,
          updated_at: new Date()
        },
        create: {
          source_text: sourceText,
          translated_text: translatedText,
          source_language: sourceLang,
          target_language: targetLang,
          translation_method: TranslationMethod.google
        }
      });
    } catch (error) {
      console.error('Failed to save translation:', error);
    }
  }

  /**
   * Save translation to cache table
   */
  private async saveToCache(text: string, targetLang: string, translatedText: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(text, targetLang);
      const expiresAt = new Date(Date.now() + this.DB_CACHE_TTL);
      
      await prisma.translationCache.upsert({
        where: { cache_key: cacheKey },
        update: {
          translated_text: translatedText,
          expires_at: expiresAt
        },
        create: {
          cache_key: cacheKey,
          translated_text: translatedText,
          target_language: targetLang,
          expires_at: expiresAt
        }
      });
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    try {
      await prisma.translationCache.deleteMany({
        where: { expires_at: { lt: new Date() } }
      });
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }

  /**
   * Manually update a translation
   */
  async updateTranslation(
    translationId: number,
    translatedText: string
  ): Promise<boolean> {
    try {
      const translation = await prisma.translation.update({
        where: { translation_id: translationId },
        data: { 
          translated_text: translatedText, 
          translation_method: TranslationMethod.manual 
        }
      });
      
      // Clear cache for this translation
      if (translation) {
        const cacheKey = this.getCacheKey(translation.source_text, translation.target_language);
        this.memoryCache.delete(cacheKey);
        await prisma.translationCache.deleteMany({
          where: { cache_key: cacheKey }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update translation:', error);
      return false;
    }
  }

  /**
   * Get all translations for a language
   */
  async getTranslationsByLanguage(targetLang: string): Promise<Record<string, string>> {
    try {
      const results = await prisma.translation.findMany({
        where: { target_language: targetLang },
        select: { source_text: true, translated_text: true }
      });
      
      const translations: Record<string, string> = {};
      for (const row of results) {
        translations[row.source_text] = row.translated_text;
      }
      return translations;
    } catch (error) {
      console.error('Failed to get translations by language:', error);
      return {};
    }
  }

  /**
   * Clear memory cache
   */
  clearMemoryCache(): void {
    this.memoryCache.clear();
  }
}

// Export singleton instance
export const translationService = new TranslationService();
