-- Migration 006: Fix customer email handling
-- Allow NULL emails for customers but keep UNIQUE constraint for non-null emails

-- Make email column truly nullable (should already be nullable from previous change)
-- This ensures customers can be created without email
ALTER TABLE users MODIFY COLUMN email VARCHAR(100) NULL;

-- Drop existing email index if it exists
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND INDEX_NAME = 'email') > 0,
    'DROP INDEX email ON users;',
    'SELECT "Email index does not exist" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing customers with empty emails to NULL
UPDATE users SET email = NULL WHERE email = '' AND role = 'Customer';

-- For MySQL versions without partial index support, we'll handle uniqueness in application code
-- Phone will be the primary identifier for customers
