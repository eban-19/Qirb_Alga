-- Migration 008: Add Location Support for Interactive Maps
-- Phase 1: Interactive map display, distance search, near me functionality

-- Add coordinate columns to pensions table
ALTER TABLE pensions 
ADD COLUMN latitude DECIMAL(10,8) NULL COMMENT 'Latitude for map display',
ADD COLUMN longitude DECIMAL(11,8) NULL COMMENT 'Longitude for map display';

-- Add location metadata for better search and filtering
ALTER TABLE pensions 
ADD COLUMN city VARCHAR(100) NULL COMMENT 'City name for location search',
ADD COLUMN region VARCHAR(100) NULL COMMENT 'Region/state for location search',
ADD COLUMN country VARCHAR(100) DEFAULT 'Ethiopia' COMMENT 'Country for location search';

-- Add indexes for location-based queries
CREATE INDEX idx_pensions_latitude ON pensions(latitude);
CREATE INDEX idx_pensions_longitude ON pensions(longitude);
CREATE INDEX idx_pensions_city ON pensions(city);
CREATE INDEX idx_pensions_region ON pensions(region);

-- Create a table for location search cache (optional for performance)
CREATE TABLE IF NOT EXISTS location_cache (
  cache_id INT AUTO_INCREMENT PRIMARY KEY,
  user_lat DECIMAL(10,8) NOT NULL,
  user_lng DECIMAL(11,8) NOT NULL,
  radius_km INT NOT NULL,
  cached_results JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (DATE_ADD(NOW(), INTERVAL 1 HOUR)),
  INDEX idx_location_cache_coords (user_lat, user_lng, radius_km),
  INDEX idx_location_cache_expires (expires_at)
);

-- Update existing pensions with Ethiopia default coordinates if they don't have coordinates
-- Addis Ababa coordinates as default (9.1450, 38.7617)
UPDATE pensions 
SET latitude = 9.1450, longitude = 38.7617, city = 'Addis Ababa', region = 'Addis Ababa'
WHERE latitude IS NULL AND longitude IS NULL;

-- Add a table for user location preferences (future enhancement)
CREATE TABLE IF NOT EXISTS user_location_preferences (
  preference_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  default_city VARCHAR(100) NULL,
  default_region VARCHAR(100) NULL,
  search_radius_km INT DEFAULT 50 COMMENT 'Default search radius in kilometers',
  location_sharing BOOLEAN DEFAULT TRUE COMMENT 'Allow location sharing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_location_preferences (user_id)
);

-- Log migration completion
SELECT 'Location support migration completed successfully' as status;
