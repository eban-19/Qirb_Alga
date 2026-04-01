-- Migration: Add Payment Integration
-- Created: 2026-03-31
-- Description: Integrate existing payments table with bookings system

-- Update bookings table to include payment references
ALTER TABLE bookings ADD COLUMN payment_id INT NULL;
ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN payment_status ENUM('Pending', 'Paid', 'Refunded', 'Failed') DEFAULT 'Pending';

-- Add payment processing indexes
CREATE INDEX IF NOT EXISTS idx_bookings_payment_id ON bookings(payment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);

-- Create indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
