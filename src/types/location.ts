// Location types for interactive maps

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapPension {
  pension_id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  region: string;
  image_url?: string;
  price_range?: string;
  rating?: number;
}

export interface NearbyPension extends MapPension {
  distance_km: number;
}

export interface Address {
  city: string;
  region: string;
  country: string;
  full_address: string;
}

export interface LocationSearchResult {
  success: boolean;
  data: MapPension[] | NearbyPension[] | Address | Coordinates;
  count?: number;
  user_location?: Coordinates;
  search_radius_km?: number;
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface UserLocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt';
}
