-- Migration: Initial Database Schema
-- Created: 2026-03-30
-- Description: Create all initial tables for pension management system

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    email_verified TINYINT(1) DEFAULT 0,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Owner', 'Customer') NOT NULL,
    status ENUM('Pending', 'Approved', 'Blocked') NOT NULL DEFAULT 'Pending',
    approved INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pensions table
CREATE TABLE IF NOT EXISTS pensions (
    pension_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    description TEXT,
    owner_info TEXT,
    room_details TEXT,
    packages JSON,
    package_images JSON,
    city VARCHAR(50),
    sub_city VARCHAR(50),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    address TEXT,
    capacity INT DEFAULT 0,
    image_url VARCHAR(255),
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    rejection_reason TEXT NULL,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    pension_id INT NOT NULL,
    owner_id INT,
    room_type VARCHAR(100),
    number_of_beds INT,
    capacity INT,
    price_per_night DECIMAL(10,2),
    availability_status ENUM('Available', 'Occupied', 'Maintenance', 'Blocked'),
    last_status_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    package_id INT,
    room_number VARCHAR(50),
    FOREIGN KEY (pension_id) REFERENCES pensions(pension_id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    customer_id INT,
    check_in_date DATETIME,
    check_out_date DATETIME,
    actual_check_out DATETIME,
    total_price DECIMAL(10,2),
    status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_document_url VARCHAR(255),
    pass_code VARCHAR(10),
    room_number VARCHAR(50),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE SET NULL
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    pension_id INT NOT NULL,
    booking_id INT NOT NULL,
    customer_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pension_id) REFERENCES pensions(pension_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('new_booking', 'booking_confirmed', 'booking_cancelled', 'review_received', 'pension_approved', 'pension_rejected', 'system') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    pension_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT DEFAULT 1,
    inclusions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pension_id) REFERENCES pensions(pension_id) ON DELETE CASCADE
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    pension_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    position VARCHAR(50),
    salary DECIMAL(10,2),
    hire_date DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pension_id) REFERENCES pensions(pension_id) ON DELETE CASCADE
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT,
    amount DECIMAL(10,2),
    category VARCHAR(50),
    description TEXT,
    expense_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Owner Profiles table (missing from original migration)
CREATE TABLE IF NOT EXISTS ownerprofiles (
    owner_id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(100),
    business_email VARCHAR(255),
    business_phone VARCHAR(20),
    license_number VARCHAR(100),
    id_document_url VARCHAR(255),
    approval_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Email Notifications table (missing from original migration)
CREATE TABLE IF NOT EXISTS emailnotifications (
    email_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(150),
    message TEXT,
    status ENUM('Pending', 'Sent', 'Failed') DEFAULT 'Pending',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Room Availability Logs table (missing from original migration)
CREATE TABLE IF NOT EXISTS roomavailabilitylogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    changed_by INT NOT NULL,
    old_status ENUM('Available', 'Occupied', 'Maintenance', 'Blocked'),
    new_status ENUM('Available', 'Occupied', 'Maintenance', 'Blocked'),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_pensions_owner_id ON pensions(owner_id);
CREATE INDEX IF NOT EXISTS idx_pensions_status ON pensions(status);
CREATE INDEX IF NOT EXISTS idx_rooms_pension_id ON rooms(pension_id);
CREATE INDEX IF NOT EXISTS idx_rooms_owner_id ON rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_package_id ON rooms(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_emailnotifications_user_id ON emailnotifications(user_id);
CREATE INDEX IF NOT EXISTS idx_emailnotifications_status ON emailnotifications(status);
CREATE INDEX IF NOT EXISTS idx_ownerprofiles_owner_id ON ownerprofiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_roomavailabilitylogs_room_id ON roomavailabilitylogs(room_id);
CREATE INDEX IF NOT EXISTS idx_roomavailabilitylogs_changed_by ON roomavailabilitylogs(changed_by);
