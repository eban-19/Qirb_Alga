-- Migration: Add actual_check_in column to bookings table
-- Created: 2026-04-16
-- Description: Add actual_check_in column if it doesn't exist (fix for missing column)

-- Add actual_check_in column if it doesn't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS actual_check_in DATETIME NULL AFTER check_out_date;
