export interface PensionPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  videoUrl?: string;
  services: string[];
  availableRooms: number;
  isCustom?: boolean;
  customName?: string;
  customPrice?: number;
}

export interface Pension {
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
  phone: string;
  email: string;
  website?: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  amenities: string[];
  images: string[];
  videoUrl?: string;
  packages: PensionPackage[];
  totalRooms: number;
  availableRooms: number;
  status: 'Active' | 'Inactive' | 'Maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface PensionSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  latitude: number;
  longitude: number;
  city: string;
  area: string;
}
