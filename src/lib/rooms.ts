import heroBg from "@/assets/hero-bg.png";
import room1 from "@/assets/room-1.png";
import room2 from "@/assets/room-2.png";
import room3 from "@/assets/room-3.png";
import room4 from "@/assets/room-4.png";
import room5 from "@/assets/room-5.png";
import room6 from "@/assets/room-6.png";
import roomVideo from "@/assets/room.mp4";
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

export interface RoomPackage {
  name: string;
  price: number;
  description: string;
  image: string;
  videoUrl?: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  ownerInfo: string;
  roomDetails: string;
  locationName: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  availableRooms: number;
  images: string[];
  videoUrl?: string;
  services: string[];
  packages: RoomPackage[];
  distance?: number;
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
    videoUrl: roomVideo,
    services: ["WiFi", "Parking", "Laundry", "Security", "Water", "Electricity"],
    packages: [
      { 
        name: "Standard Room", 
        price: 3000, 
        description: "Basic room", 
        image: package101Standard,
        videoUrl: roomVideo 
      },
      { 
        name: "Deluxe Room", 
        price: 5000, 
        description: "Large room with balcony", 
        image: package101Premium,
        videoUrl: roomVideo
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
    videoUrl: roomVideo,
    services: ["WiFi", "Laundry", "Security", "Water", "Electricity"],
    packages: [
      { name: "Standard Room", price: 2800, description: "Comfort room", image: package102Standard },
      { name: "Deluxe Room", price: 4600, description: "Spacious room with city view", image: package102Premium },
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
    services: ["WiFi", "Parking", "Security", "Water", "Electricity"],
    packages: [
      { name: "Standard Room", price: 3400, description: "Basic business room", image: package103Standard },
      { name: "Deluxe Room", price: 5200, description: "Executive room", image: package103Premium },
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
    services: ["WiFi", "Water", "Electricity", "Security"],
    packages: [
      { name: "Standard Room", price: 2400, description: "Entry-level room", image: package104Standard },
      { name: "Deluxe Room", price: 3900, description: "Larger room", image: package104Premium },
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
    services: ["WiFi", "Parking", "Laundry", "Security", "Water", "Electricity"],
    packages: [
      { name: "Standard Room", price: 3600, description: "Comfort room", image: package105Standard },
      { name: "Deluxe Room", price: 5600, description: "Large room with balcony", image: package105Premium },
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
    services: ["WiFi", "Laundry", "Security", "Water", "Electricity"],
    packages: [
      { name: "Standard Room", price: 3000, description: "Standard room", image: package106Standard },
      { name: "Deluxe Room", price: 4700, description: "Large shared-apartment room", image: package106Premium },
    ],
  },
];

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
