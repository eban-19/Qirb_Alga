import fetch from 'node-fetch';
import { executeQuery } from '../config/database';
import crypto from 'crypto';

interface CachedTranslation {
  text: string;
  expires: number;
}

class TranslationService {
  private memoryCache = new Map<string, CachedTranslation>();
  private readonly MEMORY_CACHE_TTL = 3600000; // 1 hour
  private readonly DB_CACHE_TTL = 604800000; // 7 days

  /**
   * Translate text with 3-layer cache strategy
   * Layer 1: Memory cache (fastest)
   * Layer 2: Database cache (persistent)
   * Layer 3: Translations table (permanent storage)
   * Layer 4: Google Translate API
   */
  async translate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    // Return original text if target language is same as source
    if (targetLang === sourceLang) {
      console.log('[TRANSLATION] Same language, returning original:', text);
      return text;
    }

    // Layer 1: Check memory cache
    const cacheKey = this.getCacheKey(text, targetLang);
    const memCached = this.memoryCache.get(cacheKey);
    if (memCached && memCached.expires > Date.now()) {
      console.log('[TRANSLATION] Memory cache hit | Text:', text, '| Lang:', targetLang);
      return memCached.text;
    }

    // Layer 2: Check database cache
    const dbCached = await this.checkDatabaseCache(text, targetLang);
    if (dbCached) {
      this.memoryCache.set(cacheKey, { text: dbCached, expires: Date.now() + this.MEMORY_CACHE_TTL });
      console.log('[TRANSLATION] Database cache hit | Text:', text, '| Lang:', targetLang);
      return dbCached;
    }

    // Layer 3: Check translations table
    const persisted = await this.checkTranslationsTable(text, targetLang);
    if (persisted) {
      await this.saveToCache(text, targetLang, persisted);
      this.memoryCache.set(cacheKey, { text: persisted, expires: Date.now() + this.MEMORY_CACHE_TTL });
      console.log('[TRANSLATION] Translations table hit | Text:', text, '| Lang:', targetLang);
      return persisted;
    }

    // Layer 4: Call Google Translate API
    try {
      console.log('[TRANSLATION] External API call | Text:', text, '| Lang:', targetLang, '| Source:', sourceLang);
      const result = await this.callGoogleTranslate(text, sourceLang, targetLang);
      await this.saveTranslation(text, result, sourceLang, targetLang);
      await this.saveToCache(text, targetLang, result);
      this.memoryCache.set(cacheKey, { text: result, expires: Date.now() + this.MEMORY_CACHE_TTL });
      console.log('[TRANSLATION] API success | Result:', result);
      return result;
    } catch (error) {
      console.error('[TRANSLATION] API failed | Text:', text, '| Lang:', targetLang, '| Error:', error);
      // Return original text but log the error explicitly
      console.warn('[TRANSLATION] Returning original text due to translation failure');
      return text;
    }
  }

  /**
   * Batch translate multiple texts
   */
  async translateBatch(texts: string[], targetLang: string, sourceLang: string = 'en'): Promise<string[]> {
    const translations = await Promise.all(
      texts.map(text => this.translate(text, targetLang, sourceLang))
    );
    return translations;
  }

  /**
   * Get cache key for translation
   */
  private getCacheKey(text: string, lang: string): string {
    const normalizedText = text.trim().toLowerCase();
    return crypto.createHash('md5').update(`${normalizedText}_${lang}`).digest('hex');
  }

  /**
   * Normalize text for consistent caching
   */
  private normalizeText(text: string): string {
    return text.trim();
  }

  /**
   * Check database cache for translation
   */
  private async checkDatabaseCache(text: string, targetLang: string): Promise<string | null> {
    try {
      const cacheKey = this.getCacheKey(text, targetLang);
      const query = `
        SELECT translated_text 
        FROM translation_cache 
        WHERE cache_key = ? 
        AND target_language = ? 
        AND (expires_at IS NULL OR expires_at > NOW())
      `;
      const results = await executeQuery(query, [cacheKey, targetLang]);
      
      if (results && results.length > 0) {
        return results[0].translated_text;
      }
      return null;
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
      const query = `
        SELECT translated_text 
        FROM translations 
        WHERE source_text = ? 
        AND target_language = ?
      `;
      const results = await executeQuery(query, [text, targetLang]);
      
      if (results && results.length > 0) {
        return results[0].translated_text;
      }
      return null;
    } catch (error) {
      console.error('Translations table check failed:', error);
      return null;
    }
  }

  /**
   * Call MyMemory free translation API
   * Note: MyMemory has limited support for some languages like Afaan Oromo (om) and Amharic (am)
   */
  private async callGoogleTranslate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
      const response = await fetch(url);
      const data = await response.json() as any;
      
      if (data.responseStatus === 200 && data.responseData) {
        const translatedText = data.responseData.translatedText;
        // Check if API returned the same text (indicates unsupported language)
        if (translatedText === text) {
          console.warn(`[TRANSLATION] API returned original text for ${sourceLang}|${targetLang}, likely unsupported`);
          throw new Error('Translation API returned original text (unsupported language)');
        }
        return translatedText;
      } else {
        console.error('[TRANSLATION] API error response:', data);
        throw new Error('Translation API returned error');
      }
    } catch (error) {
      console.error('[TRANSLATION] API call failed:', error);
      throw error;
    }
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
      const query = `
        INSERT INTO translations (source_text, translated_text, source_language, target_language, translation_method)
        VALUES (?, ?, ?, ?, 'google')
        ON DUPLICATE KEY UPDATE 
        translated_text = VALUES(translated_text),
        updated_at = CURRENT_TIMESTAMP
      `;
      await executeQuery(query, [sourceText, translatedText, sourceLang, targetLang]);
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
      
      const query = `
        INSERT INTO translation_cache (cache_key, translated_text, target_language, expires_at)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        translated_text = VALUES(translated_text),
        expires_at = VALUES(expires_at)
      `;
      await executeQuery(query, [cacheKey, translatedText, targetLang, expiresAt]);
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    try {
      const query = `DELETE FROM translation_cache WHERE expires_at < NOW()`;
      await executeQuery(query);
      console.log('Cleared expired cache entries');
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
      const query = `
        UPDATE translations 
        SET translated_text = ?, translation_method = 'manual', updated_at = CURRENT_TIMESTAMP
        WHERE translation_id = ?
      `;
      await executeQuery(query, [translatedText, translationId]);
      
      // Clear cache for this translation
      const infoQuery = `SELECT source_text, target_language FROM translations WHERE translation_id = ?`;
      const results = await executeQuery(infoQuery, [translationId]);
      if (results && results.length > 0) {
        const cacheKey = this.getCacheKey(results[0].source_text, results[0].target_language);
        this.memoryCache.delete(cacheKey);
        await executeQuery(`DELETE FROM translation_cache WHERE cache_key = ?`, [cacheKey]);
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
      const query = `
        SELECT source_text, translated_text 
        FROM translations 
        WHERE target_language = ?
      `;
      const results = await executeQuery(query, [targetLang]);
      
      const translations: Record<string, string> = {};
      if (results) {
        for (const row of results) {
          translations[row.source_text] = row.translated_text;
        }
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
