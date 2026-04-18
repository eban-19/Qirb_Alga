-- Migration: Add checkout to notifications type ENUM
-- Created: 2026-04-15
-- Description: Add 'checkout' type to notifications ENUM for checkout notifications

-- Modify the type column to include 'checkout'
ALTER TABLE notifications 
MODIFY COLUMN type ENUM('new_booking', 'booking_confirmed', 'booking_cancelled', 'review_received', 
                        'pension_approved', 'pension_rejected', 'checkout', 'system') 
DEFAULT 'system';
