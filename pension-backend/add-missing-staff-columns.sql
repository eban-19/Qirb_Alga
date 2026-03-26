-- Add missing columns to staff table (one at a time for MySQL compatibility)

-- Add department column
ALTER TABLE staff ADD COLUMN department VARCHAR(100) AFTER role;

-- Add email column  
ALTER TABLE staff ADD COLUMN email VARCHAR(255) AFTER department;

-- Add status column with default value
ALTER TABLE staff ADD COLUMN status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active' AFTER email;

-- Add index for status column for better performance
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
