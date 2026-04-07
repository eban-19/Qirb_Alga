-- Migration: Create Payments Table
-- Created: 2026-03-31
-- Description: Create payments table for booking payment tracking

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    customer_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'mobile_money', 'online') NOT NULL,
    payment_status ENUM('Pending', 'Paid', 'Refunded', 'Failed', 'Partially_Refunded') DEFAULT 'Pending',
    transaction_id VARCHAR(255),
    payment_date DATETIME,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_reason TEXT,
    refund_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for performance (compatible with older MySQL versions)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'payments' 
     AND INDEX_NAME = 'idx_payments_booking_id') > 0,
    'SELECT "Index idx_payments_booking_id already exists" as message;',
    'CREATE INDEX idx_payments_booking_id ON payments(booking_id);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'payments' 
     AND INDEX_NAME = 'idx_payments_customer_id') > 0,
    'SELECT "Index idx_payments_customer_id already exists" as message;',
    'CREATE INDEX idx_payments_customer_id ON payments(customer_id);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'payments' 
     AND INDEX_NAME = 'idx_payments_status') > 0,
    'SELECT "Index idx_payments_status already exists" as message;',
    'CREATE INDEX idx_payments_status ON payments(payment_status);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'payments' 
     AND INDEX_NAME = 'idx_payments_method') > 0,
    'SELECT "Index idx_payments_method already exists" as message;',
    'CREATE INDEX idx_payments_method ON payments(payment_method);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'payments' 
     AND INDEX_NAME = 'idx_payments_transaction_id') > 0,
    'SELECT "Index idx_payments_transaction_id already exists" as message;',
    'CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'payments' 
     AND INDEX_NAME = 'idx_payments_payment_date') > 0,
    'SELECT "Index idx_payments_payment_date already exists" as message;',
    'CREATE INDEX idx_payments_payment_date ON payments(payment_date);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
