-- Migration: Add Pension Approval System
-- Created: 2026-03-30
-- Description: Add columns for pension-level approval workflow
-- Note: These columns are already included in 001_initial_schema.sql, this migration is for backward compatibility

-- Add approval tracking columns to pensions table (if they don't exist)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'pensions' 
     AND COLUMN_NAME = 'rejection_reason') > 0,
    'SELECT "Column rejection_reason already exists" as message;',
    'ALTER TABLE pensions ADD COLUMN rejection_reason TEXT NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'pensions' 
     AND COLUMN_NAME = 'reviewed_by') > 0,
    'SELECT "Column reviewed_by already exists" as message;',
    'ALTER TABLE pensions ADD COLUMN reviewed_by INT NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'pensions' 
     AND COLUMN_NAME = 'reviewed_at') > 0,
    'SELECT "Column reviewed_at already exists" as message;',
    'ALTER TABLE pensions ADD COLUMN reviewed_at TIMESTAMP NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for reviewed_by (references admin user) - only if constraint doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'pensions' 
     AND CONSTRAINT_NAME = 'fk_pensions_reviewed_by') > 0,
    'SELECT "Constraint fk_pensions_reviewed_by already exists" as message;',
    'ALTER TABLE pensions ADD CONSTRAINT fk_pensions_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for performance (if they don't exist)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'pensions' 
     AND INDEX_NAME = 'idx_pensions_reviewed_by') > 0,
    'SELECT "Index idx_pensions_reviewed_by already exists" as message;',
    'CREATE INDEX idx_pensions_reviewed_by ON pensions(reviewed_by);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'pensions' 
     AND INDEX_NAME = 'idx_pensions_reviewed_at') > 0,
    'SELECT "Index idx_pensions_reviewed_at already exists" as message;',
    'CREATE INDEX idx_pensions_reviewed_at ON pensions(reviewed_at);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing pensions to 'active' if they don't have a proper status
UPDATE pensions 
SET status = 'active' 
WHERE status IS NULL OR status = '' OR status NOT IN ('active', 'inactive', 'pending');
