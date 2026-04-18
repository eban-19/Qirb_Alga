-- Migration: Create translations table for persistent translation storage
-- Created: 2026-04-15
-- Description: Store translations for dynamic content with manual correction support

CREATE TABLE IF NOT EXISTS translations (
  translation_id INT AUTO_INCREMENT PRIMARY KEY,
  source_text VARCHAR(500) NOT NULL,
  translated_text TEXT NOT NULL,
  source_language VARCHAR(5) DEFAULT 'en',
  target_language VARCHAR(5) NOT NULL,
  translation_method ENUM('google', 'manual') DEFAULT 'google',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (source_text, target_language),
  INDEX idx_target_language (target_language),
  INDEX idx_source_text (source_text(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
