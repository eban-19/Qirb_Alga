-- Add package columns to existing pensions table
ALTER TABLE pensions 
ADD COLUMN packages JSON NULL AFTER description,
ADD COLUMN package_images JSON NULL AFTER packages;

-- Update existing pension with sample packages
UPDATE pensions 
SET 
  packages = '[
    {
      "name": "Basic",
      "price": 2000,
      "description": "Comfortable room with essential amenities",
      "services": ["WiFi", "Clean Room", "Basic Amenities"],
      "availableRooms": 2
    },
    {
      "name": "Standard", 
      "price": 3500,
      "description": "Comfortable stay with private amenities",
      "videoUrl": "https://player.vimeo.com/external/403666579.sd.mp4?s=12bb9b52a92e1efffc9f4ce10e14bf768b58df8a&profile_id=164&oauth2_token_id=57447761",
      "services": ["High-speed WiFi", "Private Bathroom", "Breakfast Included", "Free Parking"],
      "availableRooms": 3
    },
    {
      "name": "Premium",
      "price": 5000,
      "description": "Luxury experience with full board",
      "videoUrl": "https://player.vimeo.com/external/494250269.sd.mp4?s=f5eb19e71dfa705139fb7429188d6be62b66238b&profile_id=165&oauth2_token_id=57447761",
      "services": ["Premium WiFi", "Private Balcony", "3 Meals Included", "Airport Pickup", "Laundry Service"],
      "availableRooms": 1
    }
  ]',
  package_images = '["/src/assets/package-101-standard.png", "/src/assets/package-101-premium.png"]'
WHERE pension_id = 1;
