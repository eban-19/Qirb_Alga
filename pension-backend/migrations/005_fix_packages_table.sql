-- Fix Packages Table Schema
-- Created: 2026-04-04
-- Description: Update packages table to match backend code expectations

-- Add missing columns if they don't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'packages' 
     AND COLUMN_NAME = 'services') > 0,
    'SELECT "services column already exists" as message',
    'ALTER TABLE packages ADD COLUMN services JSON'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'packages' 
     AND COLUMN_NAME = 'is_most_popular') > 0,
    'SELECT "is_most_popular column already exists" as message',
    'ALTER TABLE packages ADD COLUMN is_most_popular BOOLEAN DEFAULT 0'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'packages' 
     AND COLUMN_NAME = 'image_url') > 0,
    'SELECT "image_url column already exists" as message',
    'ALTER TABLE packages ADD COLUMN image_url VARCHAR(255)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify columns were added
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'packages' 
  AND COLUMN_NAME IN ('services', 'is_most_popular', 'image_url')
ORDER BY COLUMN_NAME;
