import heroBg from "@/assets/hero-bg.png";
import room1 from "@/assets/room-1.png";
import room2 from "@/assets/room-2.png";
import room3 from "@/assets/room-3.png";
import room4 from "@/assets/room-4.png";
import room5 from "@/assets/room-5.png";
import room6 from "@/assets/room-6.png";
import package101Standard from "@/assets/package-101-standard.png";
import package101Premium from "@/assets/package-101-premium.png";
import package102Standard from "@/assets/package-102-standard.png";
import package102Premium from "@/assets/package-102-premium.png";
import package103Standard from "@/assets/package-103-standard.png";
import package103Premium from "@/assets/package-103-premium.png";
import package104Standard from "@/assets/package-104-standard.png";
import package104Premium from "@/assets/package-104-premium.png";
import package105Standard from "@/assets/package-105-standard.png";
import package105Premium from "@/assets/package-105-premium.png";
import package106Standard from "@/assets/package-106-standard.png";
import package106Premium from "@/assets/package-106-premium.png";

export type PackageTier = "Basic" | "Standard" | "Premium";

export interface RoomPackage {
  name: PackageTier;
  price: number;
  description: string;
  image: string;
  images?: string[];
  videoUrl?: string;
  services: string[];
  availableRooms: number;
  isMostPopular?: boolean;
  imageType?: string;
  name_ml?: { en?: string; am?: string; om?: string };
  description_ml?: { en?: string; am?: string; om?: string };
}

export interface Room {
  id: string;
  name: string;
  name_ml?: { en?: string; am?: string; om?: string };
  description: string;
  description_ml?: { en?: string; am?: string; om?: string };
  ownerInfo: string;
  owner_info_ml?: { en?: string; am?: string; om?: string };
  roomDetails: string;
  room_details_ml?: { en?: string; am?: string; om?: string };
  locationName: string;
  address?: string;
  address_ml?: { en?: string; am?: string; om?: string };
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  availableRooms: number;
  totalRooms?: number;
  rooms?: any[];
  packages?: any[];
  images: string[];
  videoUrl?: string;
  distance?: number;
  phone?: string;
  email?: string;
}

const roomSeedData: Room[] = [
  {
    id: "101",
    name: "Sunshine Pension",
    description: "Clean and affordable pension close to key transport and shopping areas.",
    ownerInfo: "Managed by Sunshine Hospitality PLC.",
    roomDetails: "Single and double rooms with private bathroom options.",
    locationName: "Addis Ababa, Bole",
    city: "Addis Ababa",
    area: "Bole",
    latitude: 8.9806,
    longitude: 38.7578,
    availableRooms: 5,
    images: [room1, heroBg],
    videoUrl: "https://player.vimeo.com/external/328940142.sd.mp4?s=1ea5efcc41a1a5b4816c148f322301c38cc01aa6&profile_id=164&oauth2_token_id=57447761",
    packages: [
      { 
        name: "Basic", 
        price: 2000, 
        description: "Room only with shared essentials.", 
        image: room5,
        services: ["Standard WiFi", "Shared Bathroom", "Daily Cleaning"],
        availableRooms: 1
      },
      { 
        name: "Standard", 
        price: 3500, 
        description: "Comfortable stay with private amenities.", 
        image: package101Standard,
        videoUrl: "https://player.vimeo.com/external/403666579.sd.mp4?s=12bb9b52a92e1efffc9f4ce10e14bf768b58df8a&profile_id=164&oauth2_token_id=57447761",
        services: ["High-speed WiFi", "Private Bathroom", "Breakfast Included", "Free Parking"],
        availableRooms: 3
      },
      { 
        name: "Premium", 
        price: 5000, 
        description: "Luxury experience with full board.", 
        image: package101Premium,
        videoUrl: "https://player.vimeo.com/external/494250269.sd.mp4?s=f5eb19e71dfa705139fb7429188d6be62b66238b&profile_id=165&oauth2_token_id=57447761",
        services: ["Premium WiFi", "Private Balcony", "3 Meals Included", "Airport Pickup", "Laundry Service"],
        availableRooms: 1
      },
    ],
  },
  {
    id: "102",
    name: "Abyssinia Guest House",
    description: "Cozy rooms for short and mid-term stays in central Addis.",
    ownerInfo: "Family-run guest house with 10+ years of service.",
    roomDetails: "Quiet floors, daily housekeeping, and optional meal plans.",
    locationName: "Addis Ababa, Piassa",
    city: "Addis Ababa",
    area: "Piassa",
    latitude: 9.0396,
    longitude: 38.7469,
    availableRooms: 2,
    images: [room2, heroBg],
    videoUrl: "https://player.vimeo.com/external/517090025.sd.mp4?s=ded8051e2bc00bded0fe00ca899d501dbf66a2e4&profile_id=165&oauth2_token_id=57447761",
    packages: [
      { 
        name: "Basic", 
        price: 1800, 
        description: "Functional and affordable room.", 
        image: room6,
        services: ["Standard WiFi", "Shared Bathroom", "Fresh Towels"],
        availableRooms: 2
      },
      { 
        name: "Standard", 
        price: 2800, 
        description: "Comfort room with private bathroom.", 
        image: package102Standard, 
        videoUrl: "https://player.vimeo.com/external/403666579.sd.mp4?s=12bb9b52a92e1efffc9f4ce10e14bf768b58df8a&profile_id=164&oauth2_token_id=57447761",
        services: ["High-speed WiFi", "Private Bathroom", "Breakfast Included"],
        availableRooms: 0
      },
      { 
        name: "Premium", 
        price: 4600, 
        description: "Spacious room with city view.", 
        image: package102Premium, 
        videoUrl: "https://player.vimeo.com/external/328940142.sd.mp4?s=1ea5efcc41a1a5b4816c148f322301c38cc01aa6&profile_id=164&oauth2_token_id=57447761",
        services: ["Premium WiFi", "En-suite Bathroom", "All Meals Included", "Laundry Service"],
        availableRooms: 0
      },
    ],
  },
  {
    id: "103",
    name: "Habesha Inn",
    description: "Modern pension with upgraded interiors and on-site support staff.",
    ownerInfo: "Operated by Habesha City Lodging.",
    roomDetails: "Business-friendly rooms with desk space and fast internet.",
    locationName: "Addis Ababa, Kazanchis",
    city: "Addis Ababa",
    area: "Kazanchis",
    latitude: 9.0146,
    longitude: 38.7608,
    availableRooms: 1,
    images: [room3, heroBg],
    videoUrl: "https://player.vimeo.com/external/494250269.sd.mp4?s=f5eb19e71dfa705139fb7429188d6be62b66238b&profile_id=165&oauth2_token_id=57447761",
    packages: [
      { 
        name: "Basic", 
        price: 2200, 
        description: "Compact room with essential utilities.", 
        image: room1, 
        services: ["Standard WiFi", "Shared Bathroom", "Fresh Linens"],
        availableRooms: 0
      },
      { 
        name: "Standard", 
        price: 3400, 
        description: "Basic business room with workspace.", 
        image: package103Standard, 
        videoUrl: "https://player.vimeo.com/external/403666579.sd.mp4?s=12bb9b52a92e1efffc9f4ce10e14bf768b58df8a&profile_id=164&oauth2_token_id=57447761",
        services: ["High-speed WiFi", "Private Bathroom", "Breakfast Included", "Dedicated Workspace"],
        availableRooms: 1
      },
      { 
        name: "Premium", 
        price: 5200, 
        description: "Executive room with all-inclusive services.", 
        image: package103Premium, 
        videoUrl: "https://player.vimeo.com/external/517090025.sd.mp4?s=ded8051e2bc00bded0fe00ca899d501dbf66a2e4&profile_id=165&oauth2_token_id=57447761",
        services: ["Premium WiFi", "En-suite Bathroom", "All Meals Included", "Laundry Service", "Airport Transfer"],
        availableRooms: 0
      },
    ],
  },
  {
    id: "104",
    name: "Green Valley Pension",
    description: "Budget-friendly property with easy access to city bus routes.",
    ownerInfo: "Privately owned neighborhood pension.",
    roomDetails: "Simple rooms for students and workers.",
    locationName: "Addis Ababa, Mexico",
    city: "Addis Ababa",
    area: "Mexico",
    latitude: 9.0037,
    longitude: 38.7636,
    availableRooms: 8,
    images: [room4, heroBg],
    videoUrl: "https://player.vimeo.com/external/403666579.sd.mp4?s=12bb9b52a92e1efffc9f4ce10e14bf768b58df8a&profile_id=164&oauth2_token_id=57447761",
    packages: [
      { 
        name: "Basic", 
        price: 1500, 
        description: "Standard room, very budget-friendly.", 
        image: room2, 
        services: ["Standard WiFi", "Shared Bathroom", "Weekly Cleaning"],
        availableRooms: 4
      },
      { 
        name: "Standard", 
        price: 2400, 
        description: "Entry-level private room.", 
        image: package104Standard, 
        videoUrl: "https://player.vimeo.com/external/328940142.sd.mp4?s=1ea5efcc41a1a5b4816c148f322301c38cc01aa6&profile_id=164&oauth2_token_id=57447761",
        services: ["High-speed WiFi", "Private Bathroom", "Breakfast Included"],
        availableRooms: 3
      },
      { 
        name: "Premium", 
        price: 3900, 
        description: "Larger room with better ventilation and services.", 
        image: package104Premium, 
        videoUrl: "https://player.vimeo.com/external/494250269.sd.mp4?s=f5eb19e71dfa705139fb7429188d6be62b66238b&profile_id=165&oauth2_token_id=57447761",
        services: ["Premium WiFi", "En-suite Bathroom", "All Meals Included", "Free Parking"],
        availableRooms: 1
      },
    ],
  },
  {
    id: "105",
    name: "Royal Comfort Lodge",
    description: "Comfort-oriented lodge with improved facilities and reception desk.",
    ownerInfo: "Managed by Royal Comfort Holdings.",
    roomDetails: "Includes rooms with private balcony and improved ventilation.",
    locationName: "Addis Ababa, Sarbet",
    city: "Addis Ababa",
    area: "Sarbet",
    latitude: 9.0134,
    longitude: 38.7393,
    availableRooms: 3,
    images: [room5, heroBg],
    videoUrl: "https://player.vimeo.com/external/328940142.sd.mp4?s=1ea5efcc41a1a5b4816c148f322301c38cc01aa6&profile_id=164&oauth2_token_id=57447761",
    packages: [
      { 
        name: "Basic", 
        price: 2500, 
        description: "Standard lodge room.", 
        image: room3, 
        services: ["Standard WiFi", "Shared Bathroom", "Fresh Towels"],
        availableRooms: 0
      },
      { 
        name: "Standard", 
        price: 3600, 
        description: "Comfort room with private bathroom.", 
        image: package105Standard, 
        videoUrl: "https://player.vimeo.com/external/494250269.sd.mp4?s=f5eb19e71dfa705139fb7429188d6be62b66238b&profile_id=165&oauth2_token_id=57447761",
        services: ["High-speed WiFi", "Private Bathroom", "Breakfast Included", "Free Parking"],
        availableRooms: 2
      },
      { 
        name: "Premium", 
        price: 5600, 
        description: "Large room with balcony.", 
        image: package105Premium, 
        videoUrl: "https://player.vimeo.com/external/517090025.sd.mp4?s=ded8051e2bc00bded0fe00ca899d501dbf66a2e4&profile_id=165&oauth2_token_id=57447761",
        services: ["Premium WiFi", "Private Balcony", "All Meals Included", "Laundry Service", "Airport Transfer"],
        availableRooms: 1
      },
    ],
  },
  {
    id: "106",
    name: "City Center Rooms",
    description: "Convenient city-center rooms for students, workers, and visitors.",
    ownerInfo: "Operated by City Center Housing Services.",
    roomDetails: "Flexible stay duration and practical shared facilities.",
    locationName: "Addis Ababa, Arat Kilo",
    city: "Addis Ababa",
    area: "Arat Kilo",
    latitude: 9.0371,
    longitude: 38.7614,
    availableRooms: 6,
    images: [room6, heroBg],
        videoUrl: "https://player.vimeo.com/external/328940142.sd.mp4?s=1ea5efcc41a1a5b4816c148f322301c38cc01aa6&profile_id=164&oauth2_token_id=57447761",
        packages: [
          { 
            name: "Basic", 
            price: 2500, 
            description: "Standard lodge room.", 
            image: room3, 
            services: ["Standard WiFi", "Shared Bathroom", "Fresh Towels"],
            availableRooms: 0
          },
          { 
            name: "Standard", 
            price: 3600, 
            description: "Comfort room with private bathroom.", 
            image: package105Standard, 
            videoUrl: "https://player.vimeo.com/external/494250269.sd.mp4?s=f5eb19e71dfa705139fb7429188d6be62b66238b&profile_id=165&oauth2_token_id=57447761",
            services: ["High-speed WiFi", "Private Bathroom", "Breakfast Included", "Free Parking"],
            availableRooms: 2
          },
          { 
            name: "Premium", 
            price: 5600, 
            description: "Large room with balcony.", 
            image: package105Premium, 
            videoUrl: "https://player.vimeo.com/external/517090025.sd.mp4?s=ded8051e2bc00bded0fe00ca899d501dbf66a2e4&profile_id=165&oauth2_token_id=57447761",
            services: ["Premium WiFi", "Private Balcony", "All Meals Included", "Laundry Service", "Airport Transfer"],
            availableRooms: 1
          },
        ],
      },
      {
        id: "106",
        name: "City Center Rooms",
        description: "Convenient city-center rooms for students, workers, and visitors.",
        ownerInfo: "Operated by City Center Housing Services.",
        roomDetails: "Flexible stay duration and practical shared facilities.",
        locationName: "Addis Ababa, Arat Kilo",
        city: "Addis Ababa",
        area: "Arat Kilo",
        latitude: 9.0371,
        longitude: 38.7614,
        availableRooms: 6,
        images: [room6, heroBg],
        videoUrl: "https://player.vimeo.com/external/517090025.sd.mp4?s=ded8051e2bc00bded0fe00ca899d501dbf66a2e4&profile_id=165&oauth2_token_id=57447761",
        packages: [
          { 
            name: "Basic", 
            price: 1800, 
            description: "Practical shared-facility room.", 
            image: room4, 
            services: ["Standard WiFi", "Shared Bathroom", "Basic Cleaning"],
            availableRooms: 3
          },
          { 
            name: "Standard", 
            price: 3000, 
            description: "Standard private room.", 
            image: package106Standard, 
            videoUrl: "https://player.vimeo.com/external/494250269.sd.mp4?s=f5eb19e71dfa705139fb7429188d6be62b66238b&profile_id=165&oauth2_token_id=57447761",
            services: ["High-speed WiFi", "Private Bathroom", "Breakfast Included"],
            availableRooms: 2
          },
          { 
            name: "Premium", 
            price: 4700, 
            description: "Large shared-apartment room with all perks.", 
            image: package106Premium, 
            videoUrl: "https://player.vimeo.com/external/328940142.sd.mp4?s=1ea5efcc41a1a5b4816c148f322301c38cc01aa6&profile_id=164&oauth2_token_id=57447761",
            services: ["Premium WiFi", "En-suite Bathroom", "All Meals Included", "Laundry Service"],
            availableRooms: 1
          },
        ],
      },
    ];

// Helper function to construct full URLs for images
export const getFullImageUrl = (imagePath: string | undefined | null): string => {
  console.log('🔍 getFullImageUrl input:', {
    imagePath,
    type: typeof imagePath,
    isNull: imagePath === null,
    isUndefined: imagePath === undefined,
    isEmpty: imagePath === ''
  });
  
  if (!imagePath) {
    const fallback = '/src/assets/room-1.png';
    console.log('🔍 Using fallback:', fallback);
    return fallback;
  }
  
  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    console.log('🔍 Already full URL:', imagePath);
    return imagePath;
  }
  
  // If it's a frontend asset path (/src/assets/), return as-is (served by frontend)
  if (imagePath.startsWith('/src/assets/')) {
    console.log('🔍 Frontend asset path, keeping as-is:', imagePath);
    return imagePath;
  }
  
  // If it's an uploaded file path (/uploads/), prepend the backend URL with cache-busting
  if (imagePath.startsWith('/uploads/')) {
    const timestamp = Date.now(); // Cache-busting parameter
    const fullUrl = `http://localhost:3006${imagePath}?t=${timestamp}`;
    console.log('🔍 Backend uploaded file, constructed full URL with cache-busting:', fullUrl);
    return fullUrl;
  }
  
  // Default: assume it's a backend file with cache-busting
  const timestamp = Date.now();
  const fullUrl = `http://localhost:3006${imagePath}?t=${timestamp}`;
  console.log('🔍 Default backend file, constructed full URL with cache-busting:', fullUrl);
  return fullUrl;
};

// Placeholder API layer: replace internals with real backend calls later.
export async function getRooms(): Promise<Room[]> {
  return Promise.resolve(roomSeedData);
}

export async function getRoomById(id: string): Promise<Room | null> {
  const room = roomSeedData.find((item) => item.id === id) ?? null;
  return Promise.resolve(room);
}

export function getGoogleMapsNavigationUrl(room: Pick<Room, "latitude" | "longitude">): string {
  const destination = `${room.latitude},${room.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}
