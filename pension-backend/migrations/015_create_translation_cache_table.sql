-- Migration: Create translation_cache table for performance caching
-- Created: 2026-04-15
-- Description: Cache translations for performance with auto-expiration

CREATE TABLE IF NOT EXISTS translation_cache (
  cache_id INT AUTO_INCREMENT PRIMARY KEY,
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  translated_text TEXT NOT NULL,
  target_language VARCHAR(5) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  INDEX idx_cache_key (cache_key),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
