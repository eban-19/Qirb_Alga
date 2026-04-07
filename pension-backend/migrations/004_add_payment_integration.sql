-- Migration: Add Payment Integration
-- Created: 2026-03-31
-- Description: Integrate existing payments table with bookings system

-- Update bookings table to include payment references (if columns don't exist)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'bookings' 
     AND COLUMN_NAME = 'payment_id') > 0,
    'SELECT "Column payment_id already exists" as message;',
    'ALTER TABLE bookings ADD COLUMN payment_id INT NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'bookings' 
     AND COLUMN_NAME = 'payment_method') > 0,
    'SELECT "Column payment_method already exists" as message;',
    'ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'bookings' 
     AND COLUMN_NAME = 'payment_status') > 0,
    'SELECT "Column payment_status already exists" as message;',
    'ALTER TABLE bookings ADD COLUMN payment_status ENUM("Pending", "Paid", "Refunded", "Failed") DEFAULT "Pending";'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add payment processing indexes (if they don't exist)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'bookings' 
     AND INDEX_NAME = 'idx_bookings_payment_id') > 0,
    'SELECT "Index idx_bookings_payment_id already exists" as message;',
    'CREATE INDEX idx_bookings_payment_id ON bookings(payment_id);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'bookings' 
     AND INDEX_NAME = 'idx_bookings_payment_status') > 0,
    'SELECT "Index idx_bookings_payment_status already exists" as message;',
    'CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'bookings' 
     AND INDEX_NAME = 'idx_bookings_payment_method') > 0,
    'SELECT "Index idx_bookings_payment_method already exists" as message;',
    'CREATE INDEX idx_bookings_payment_method ON bookings(payment_method);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for payment_id (if constraint doesn't exist)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'bookings' 
     AND CONSTRAINT_NAME = 'fk_bookings_payment_id') > 0,
    'SELECT "Constraint fk_bookings_payment_id already exists" as message;',
    'ALTER TABLE bookings ADD CONSTRAINT fk_bookings_payment_id FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE SET NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
