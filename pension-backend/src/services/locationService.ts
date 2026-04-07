import { executeQuery } from '../config/database';

// Coordinate interface
export interface Coordinates {
  lat: number;
  lng: number;
}

// Pension data for map display
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

// Nearby pension with distance
export interface NearbyPension extends MapPension {
  distance_km: number;
}

// Address data from reverse geocoding
export interface Address {
  city: string;
  region: string;
  country: string;
  full_address: string;
}

class LocationService {
  // Haversine formula to calculate distance between two coordinates
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Convert degrees to radians
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get all pensions for map display
  async getMapPensions(): Promise<MapPension[]> {
    try {
      const result = await executeQuery(`
        SELECT 
          p.pension_id,
          p.name,
          p.latitude,
          p.longitude,
          p.address,
          p.city,
          p.region,
          p.image_url,
          p.status,
          op.approval_status
        FROM pensions p
        LEFT JOIN ownerprofiles op ON p.owner_id = op.owner_id
        WHERE p.status = 'active' 
        AND op.approval_status = 'Approved'
        AND p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL
        ORDER BY p.name
      `);

      return result.map((p: any) => ({
        pension_id: p.pension_id,
        name: p.name,
        latitude: parseFloat(p.latitude),
        longitude: parseFloat(p.longitude),
        address: p.address || '',
        city: p.city || 'Unknown',
        region: p.region || 'Unknown',
        image_url: p.image_url,
        price_range: this.getPriceRange(p.pension_id),
        rating: 0 // TODO: Calculate from reviews
      }));
    } catch (error) {
      console.error('Error getting map pensions:', error);
      throw error;
    }
  }

  // Find pensions within radius of user location
  async findNearbyPensions(lat: number, lng: number, radiusKm: number = 50): Promise<NearbyPension[]> {
    try {
      // First get all active pensions
      const allPensions = await this.getMapPensions();
      
      // Calculate distance for each pension
      const nearbyPensions = allPensions
        .map(pension => ({
          ...pension,
          distance_km: this.calculateDistance(lat, lng, pension.latitude, pension.longitude)
        }))
        .filter(pension => pension.distance_km <= radiusKm)
        .sort((a, b) => a.distance_km - b.distance_km);

      return nearbyPensions;
    } catch (error) {
      console.error('Error finding nearby pensions:', error);
      throw error;
    }
  }

  // Geocode address to coordinates (using OpenStreetMap Nominatim)
  async geocodeAddress(address: string): Promise<Coordinates> {
    try {
      // Using OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        // Fallback to Addis Ababa coordinates
        return { lat: 9.1450, lng: 38.7617 };
      }
      
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      // Fallback to Addis Ababa coordinates
      return { lat: 9.1450, lng: 38.7617 };
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat: number, lng: number): Promise<Address> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding service unavailable');
      }
      
      const data = await response.json();
      
      return {
        city: data.address?.city || data.address?.town || 'Unknown',
        region: data.address?.state || data.address?.region || 'Unknown',
        country: data.address?.country || 'Ethiopia',
        full_address: data.display_name || 'Unknown location'
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return {
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        country: 'Ethiopia',
        full_address: 'Addis Ababa, Ethiopia'
      };
    }
  }

  // Update pension coordinates
  async updatePensionCoordinates(pensionId: number, lat: number, lng: number, address?: Address): Promise<void> {
    try {
      await executeQuery(`
        UPDATE pensions 
        SET latitude = ?, longitude = ?, city = ?, region = ?, country = ?
        WHERE pension_id = ?
      `, [lat, lng, address?.city, address?.region, address?.country, pensionId]);
    } catch (error) {
      console.error('Error updating pension coordinates:', error);
      throw error;
    }
  }

  // Get price range for a pension (helper method)
  private async getPriceRange(pensionId: number): Promise<string> {
    try {
      const result = await executeQuery(
        'SELECT MIN(price) as min_price, MAX(price) as max_price FROM packages WHERE pension_id = ? AND is_active = 1',
        [pensionId]
      );
      
      if (result.length === 0 || !result[0].min_price) {
        return 'Price not available';
      }
      
      const { min_price, max_price } = result[0];
      if (min_price === max_price) {
        return `${min_price} ETB`;
      }
      return `${min_price} - ${max_price} ETB`;
    } catch (error) {
      return 'Price not available';
    }
  }

  // Validate coordinates
  validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  // Get bounding box for map display
  getBoundingBox(center: Coordinates, radiusKm: number): { 
    minLat: number; 
    maxLat: number; 
    minLng: number; 
    maxLng: number; 
  } {
    const latDelta = radiusKm / 111; // Approximate degrees per km
    const lngDelta = radiusKm / (111 * Math.cos(this.toRadians(center.lat)));
    
    return {
      minLat: center.lat - latDelta,
      maxLat: center.lat + latDelta,
      minLng: center.lng - lngDelta,
      maxLng: center.lng + lngDelta
    };
  }
}

export default new LocationService();
