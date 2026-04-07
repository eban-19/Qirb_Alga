-- Migration: Add notes column to bookings table
-- Created: 2026-04-04
-- Description: Add notes column for early completion notes

ALTER TABLE bookings ADD COLUMN notes TEXT NULL;
