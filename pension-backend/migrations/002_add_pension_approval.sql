-- Migration: Add Pension Approval System
-- Created: 2026-03-30
-- Description: Add columns for pension-level approval workflow

-- Add approval tracking columns to pensions table
ALTER TABLE pensions 
ADD COLUMN rejection_reason TEXT NULL,
ADD COLUMN reviewed_by INT NULL,
ADD COLUMN reviewed_at TIMESTAMP NULL;

-- Add foreign key constraint for reviewed_by (references admin user)
ALTER TABLE pensions 
ADD CONSTRAINT fk_pensions_reviewed_by 
FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_pensions_reviewed_by ON pensions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_pensions_reviewed_at ON pensions(reviewed_at);

-- Update existing pensions to 'active' if they don't have a proper status
UPDATE pensions 
SET status = 'active' 
WHERE status IS NULL OR status = '' OR status NOT IN ('active', 'inactive', 'pending');
