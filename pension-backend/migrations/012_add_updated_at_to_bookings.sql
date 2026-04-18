-- Migration: Add updated_at to bookings table
-- Created: 2026-04-15
-- Description: Add updated_at timestamp column to bookings table for consistency with other tables

-- Add updated_at column to bookings table
ALTER TABLE bookings 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
AFTER created_at;

-- Log migration completion
INSERT INTO migrations (migration_name, executed_at) 
VALUES ('012_add_updated_at_to_bookings', NOW())
ON DUPLICATE KEY UPDATE executed_at = NOW();
