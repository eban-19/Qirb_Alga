-- Migration: Add Multilingual Fields
-- Created: 2026-04-16
-- Description: Add JSON columns for multilingual support in rooms, packages, and pensions tables

-- Add multilingual columns to rooms table
ALTER TABLE rooms 
ADD COLUMN room_type_ml JSON NULL COMMENT 'Multilingual room type: {"en":"...", "am":"...", "om":"..."}';

-- Add multilingual columns to packages table
ALTER TABLE packages 
ADD COLUMN name_ml JSON NULL COMMENT 'Multilingual package name: {"en":"...", "am":"...", "om":"..."}',
ADD COLUMN description_ml JSON NULL COMMENT 'Multilingual package description: {"en":"...", "am":"...", "om":"..."}';

-- Add multilingual columns to pensions table
ALTER TABLE pensions 
ADD COLUMN name_ml JSON NULL COMMENT 'Multilingual pension name: {"en":"...", "am":"...", "om":"..."}',
ADD COLUMN description_ml JSON NULL COMMENT 'Multilingual pension description: {"en":"...", "am":"...", "om":"..."}',
ADD COLUMN owner_info_ml JSON NULL COMMENT 'Multilingual owner info: {"en":"...", "am":"...", "om":"..."}',
ADD COLUMN room_details_ml JSON NULL COMMENT 'Multilingual room details: {"en":"...", "am":"...", "om":"..."}';

-- Migrate existing data to new multilingual JSON structure
-- Rooms
UPDATE rooms 
SET room_type_ml = JSON_OBJECT('en', room_type) 
WHERE room_type_ml IS NULL AND room_type IS NOT NULL;

-- Packages
UPDATE packages 
SET name_ml = JSON_OBJECT('en', name) 
WHERE name_ml IS NULL AND name IS NOT NULL;

UPDATE packages 
SET description_ml = JSON_OBJECT('en', description) 
WHERE description_ml IS NULL AND description IS NOT NULL;

-- Pensions
UPDATE pensions 
SET name_ml = JSON_OBJECT('en', name) 
WHERE name_ml IS NULL AND name IS NOT NULL;

UPDATE pensions 
SET description_ml = JSON_OBJECT('en', description) 
WHERE description_ml IS NULL AND description IS NOT NULL;

UPDATE pensions 
SET owner_info_ml = JSON_OBJECT('en', owner_info) 
WHERE owner_info_ml IS NULL AND owner_info IS NOT NULL;

UPDATE pensions 
SET room_details_ml = JSON_OBJECT('en', room_details) 
WHERE room_details_ml IS NULL AND room_details IS NOT NULL;

-- Add indexes for JSON fields (MySQL 8.0+)
-- Note: These may not work on older MySQL versions, but won't cause failures
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'rooms' 
     AND INDEX_NAME = 'idx_rooms_room_type_ml') > 0,
    'SELECT "Index idx_rooms_room_type_ml already exists" as message;',
    'CREATE INDEX idx_rooms_room_type_ml ON rooms((CAST(room_type_ml AS CHAR(255) ARRAY))))'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'packages' 
     AND INDEX_NAME = 'idx_packages_name_ml') > 0,
    'SELECT "Index idx_packages_name_ml already exists" as message;',
    'CREATE INDEX idx_packages_name_ml ON packages((CAST(name_ml AS CHAR(255) ARRAY))))'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'pensions' 
     AND INDEX_NAME = 'idx_pensions_name_ml') > 0,
    'SELECT "Index idx_pensions_name_ml already exists" as message;',
    'CREATE INDEX idx_pensions_name_ml ON pensions((CAST(name_ml AS CHAR(255) ARRAY))))'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
