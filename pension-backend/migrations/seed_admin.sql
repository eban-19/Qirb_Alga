-- Seed Admin User
-- Created: 2026-04-04
-- Description: Create initial admin user for pension management system

-- Insert admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (full_name, email, email_verified, phone, password_hash, role, status, approved, created_at) 
VALUES (
    'System Administrator',
    'admin@pension.com',
    1,
    '+1234567890',
    '$2b$10$mll8u3FGGt2xQXEE49KnqO/dZt8CMjqKa7W.d3Wo2T5a9.sPnAM7e',
    'Admin',
    'Approved',
    1,
    NOW()
)
ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name),
    email_verified = VALUES(email_verified),
    phone = VALUES(phone),
    role = VALUES(role),
    status = VALUES(status),
    approved = VALUES(approved);

-- Verify admin user was created
SELECT 'Admin user created successfully' as message, user_id, email, role, status 
FROM users 
WHERE email = 'admin@pension.com';
