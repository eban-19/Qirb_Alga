-- Create ownerprofiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS ownerprofiles (
  owner_id INT PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  business_email VARCHAR(255),
  business_phone VARCHAR(20),
  license_number VARCHAR(100),
  id_document_url VARCHAR(500),
  approval_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  reviewed_by INT,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Also update users table to include approved column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS role ENUM('admin', 'user', 'manager', 'Owner') DEFAULT 'user';
