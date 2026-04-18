import express from 'express';
import { translationService } from '../services/translationService';
import { executeQuery } from '../config/database';

const router = express.Router();

/**
 * POST /api/translations/translate
 * Translate text using Google Translate with caching
 */
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ 
        error: 'Missing required fields: text and targetLanguage' 
      });
    }

    const translatedText = await translationService.translate(
      text, 
      targetLanguage, 
      sourceLanguage
    );

    res.json({ 
      translatedText,
      sourceText: text,
      targetLanguage,
      sourceLanguage
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/translations/batch
 * Batch translate multiple texts
 */
router.post('/batch', async (req, res) => {
  try {
    const { texts, targetLanguage, sourceLanguage = 'en' } = req.body;

    if (!texts || !Array.isArray(texts) || !targetLanguage) {
      return res.status(400).json({ 
        error: 'Missing required fields: texts (array) and targetLanguage' 
      });
    }

    if (texts.length === 0) {
      return res.status(400).json({ 
        error: 'texts array cannot be empty' 
      });
    }

    const translatedTexts = await translationService.translateBatch(
      texts, 
      targetLanguage, 
      sourceLanguage
    );

    res.json({ 
      translatedTexts,
      targetLanguage,
      sourceLanguage
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({ 
      error: 'Batch translation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/translations/:language
 * Get all translations for a specific language
 */
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;

    if (!language) {
      return res.status(400).json({ 
        error: 'Language parameter is required' 
      });
    }

    const translations = await translationService.getTranslationsByLanguage(language);

    res.json({ 
      language,
      translations,
      count: Object.keys(translations).length
    });
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({ 
      error: 'Failed to get translations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/translations/:id
 * Manually update a translation
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { translatedText } = req.body;

    if (!translatedText) {
      return res.status(400).json({ 
        error: 'translatedText is required' 
      });
    }

    const success = await translationService.updateTranslation(
      parseInt(id), 
      translatedText
    );

    if (success) {
      res.json({ 
        success: true,
        message: 'Translation updated successfully'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to update translation' 
      });
    }
  } catch (error) {
    console.error('Update translation error:', error);
    res.status(500).json({ 
      error: 'Failed to update translation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/translations/:id
 * Delete a translation
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM translations WHERE translation_id = ?';
    await executeQuery(query, [id]);

    res.json({ 
      success: true,
      message: 'Translation deleted successfully'
    });
  } catch (error) {
    console.error('Delete translation error:', error);
    res.status(500).json({ 
      error: 'Failed to delete translation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/translations/cache/clear
 * Clear expired cache entries
 */
router.post('/cache/clear', async (req, res) => {
  try {
    await translationService.clearExpiredCache();
    res.json({ 
      success: true,
      message: 'Expired cache cleared successfully'
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/translations/stats
 * Get translation statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = {
      totalTranslations: 0,
      translationsByLanguage: {} as Record<string, number>,
      cacheEntries: 0,
      manualCorrections: 0
    };

    // Get total translations by language
    const langQuery = `
      SELECT target_language, COUNT(*) as count 
      FROM translations 
      GROUP BY target_language
    `;
    const langResults = await executeQuery(langQuery);
    
    if (langResults) {
      for (const row of langResults) {
        stats.translationsByLanguage[row.target_language] = row.count;
        stats.totalTranslations += row.count;
      }
    }

    // Get cache entry count
    const cacheQuery = 'SELECT COUNT(*) as count FROM translation_cache WHERE expires_at > NOW()';
    const cacheResults = await executeQuery(cacheQuery);
    if (cacheResults && cacheResults.length > 0) {
      stats.cacheEntries = cacheResults[0].count;
    }

    // Get manual correction count
    const manualQuery = "SELECT COUNT(*) as count FROM translations WHERE translation_method = 'manual'";
    const manualResults = await executeQuery(manualQuery);
    if (manualResults && manualResults.length > 0) {
      stats.manualCorrections = manualResults[0].count;
    }

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
