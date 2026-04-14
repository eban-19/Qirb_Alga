-- Migration: Add Walk-In Booking Support
-- Created: 2026-04-13
-- Description: Add support for walk-in bookings with booking source tracking

-- Add booking_source ENUM to existing bookings table
ALTER TABLE bookings 
ADD COLUMN booking_source ENUM('App', 'Walk-In') DEFAULT 'App' AFTER status;

-- Add walk-in guest fields
ALTER TABLE bookings 
ADD COLUMN walk_in_guest_name VARCHAR(100) NULL AFTER total_price,
ADD COLUMN walk_in_guest_phone VARCHAR(20) NULL AFTER walk_in_guest_name,
ADD COLUMN walk_in_guest_email VARCHAR(255) NULL AFTER walk_in_guest_phone;

-- Update existing records to have default values
UPDATE bookings 
SET 
  booking_source = 'App',
  walk_in_guest_name = NULL,
  walk_in_guest_phone = NULL,
  walk_in_guest_email = NULL
WHERE booking_source IS NULL;

-- Add index for better query performance on booking source
CREATE INDEX idx_bookings_source ON bookings(booking_source);

-- Add index for walk-in guest queries
CREATE INDEX idx_bookings_walk_in_guest ON bookings(walk_in_guest_name, walk_in_guest_phone);
