-- Migration: Add Check-In/Check-Out Logic
-- Created: 2026-04-04
-- Description: Add early check-in/check-out tracking and availability management

-- Add check-in/check-out tracking to bookings table
ALTER TABLE bookings 
ADD COLUMN actual_check_in DATETIME NULL,
ADD COLUMN early_check_in TINYINT(1) DEFAULT 0,
ADD COLUMN early_check_out TINYINT(1) DEFAULT 0,
ADD COLUMN check_in_by INT NULL,
ADD COLUMN check_out_by INT NULL;

-- Add availability history table
CREATE TABLE IF NOT EXISTS availability_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_by INT NULL,
    reason VARCHAR(255),
    booking_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_history_room ON availability_history(room_id);
CREATE INDEX IF NOT EXISTS idx_availability_history_date ON availability_history(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_checkin_checkout ON bookings(actual_check_in, actual_check_out);

-- Add trigger to automatically update room availability when booking is completed
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_booking_completed
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        UPDATE rooms 
        SET availability_status = 'Available',
            last_status_update = NOW()
        WHERE room_id = NEW.room_id;
        
        -- Log the availability change
        INSERT INTO availability_history (room_id, old_status, new_status, changed_by, reason, booking_id)
        VALUES (NEW.room_id, 'Occupied', 'Available', NEW.check_out_by, 'Guest check-out completed', NEW.booking_id);
    END IF;
END//
DELIMITER ;

-- Add trigger to automatically update room availability when booking is cancelled
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_booking_cancelled
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'Cancelled' AND OLD.status != 'Cancelled' THEN
        UPDATE rooms 
        SET availability_status = 'Available',
            last_status_update = NOW()
        WHERE room_id = NEW.room_id;
        
        -- Log the availability change
        INSERT INTO availability_history (room_id, old_status, new_status, reason, booking_id)
        VALUES (NEW.room_id, 'Occupied', 'Available', 'Booking cancelled', NEW.booking_id);
    END IF;
END//
DELIMITER ;
