import prisma from '../lib/prisma';
import { PensionStatus, ApprovalStatus, Prisma } from '@prisma/client';
import geocodingService from './geocoding';

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
      const pensions = await prisma.pension.findMany({
        where: {
          status: PensionStatus.active,
          owner: {
            ownerProfile: {
              approval_status: ApprovalStatus.Approved
            }
          },
          latitude: { not: null },
          longitude: { not: null }
        },
        orderBy: { name: 'asc' }
      });

      const mapPensions = await Promise.all(pensions.map(async (p) => ({
        pension_id: p.pension_id,
        name: p.name,
        latitude: p.latitude ? parseFloat(p.latitude.toString()) : 0,
        longitude: p.longitude ? parseFloat(p.longitude.toString()) : 0,
        address: p.address || '',
        city: p.city || 'Unknown',
        region: p.region || 'Unknown',
        image_url: p.image_url || undefined,
        price_range: await this.getPriceRange(p.pension_id),
        rating: 0 // TODO: Calculate from reviews
      })));

      return mapPensions;
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

  // Geocode address to coordinates (using OpenStreetMap Nominatim via GeocodingService)
  async geocodeAddress(address: string): Promise<Coordinates> {
    try {
      const result = await geocodingService.geocodeAddress(address);
      return {
        lat: result.lat,
        lng: result.lng
      };
    } catch (error) {
      console.error('Error geocoding address in LocationService:', error);
      // Fallback to Addis Ababa coordinates
      return { lat: 9.1450, lng: 38.7617 };
    }
  }

  // Reverse geocode coordinates to address (via GeocodingService)
  async reverseGeocode(lat: number, lng: number): Promise<Address> {
    return await geocodingService.reverseGeocode(lat, lng);
  }

  // Update pension coordinates
  async updatePensionCoordinates(pensionId: number, lat: number, lng: number, address?: Address): Promise<void> {
    try {
      await prisma.pension.update({
        where: { pension_id: pensionId },
        data: {
          latitude: new Prisma.Decimal(lat),
          longitude: new Prisma.Decimal(lng),
          city: address?.city,
          region: address?.region,
          country: address?.country
        }
      });
    } catch (error) {
      console.error('Error updating pension coordinates:', error);
      throw error;
    }
  }

  // Get price range for a pension (helper method)
  private async getPriceRange(pensionId: number): Promise<string> {
    try {
      const aggregate = await prisma.package.aggregate({
        where: { 
          pension_id: pensionId,
          is_active: true
        },
        _min: { price: true },
        _max: { price: true }
      });
      
      if (aggregate._min.price === null || aggregate._max.price === null) {
        return 'Price not available';
      }
      
      const minPrice = aggregate._min.price.toNumber();
      const maxPrice = aggregate._max.price.toNumber();

      if (minPrice === maxPrice) {
        return `${minPrice} ETB`;
      }
      return `${minPrice} - ${maxPrice} ETB`;
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
