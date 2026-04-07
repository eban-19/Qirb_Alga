// Simple API service without axios dependency
import { Coordinates, MapPension, NearbyPension, Address, LocationSearchResult } from '../types/location';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005/api';

class LocationApiService {
  // Simple fetch wrapper
  private async fetchApi(url: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get all pensions for map display
  async getMapPensions(): Promise<LocationSearchResult> {
    try {
      const response = await this.fetchApi(`${API_BASE_URL}/location/map-data`);
      return response;
    } catch (error) {
      console.error('Error fetching map pensions:', error);
      throw error;
    }
  }

  // Find pensions near user location
  async getNearbyPensions(lat: number, lng: number, radiusKm: number = 50): Promise<LocationSearchResult> {
    try {
      const response = await this.fetchApi(
        `${API_BASE_URL}/location/near-me?lat=${lat}&lng=${lng}&radius=${radiusKm}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching nearby pensions:', error);
      throw error;
    }
  }

  // Search pensions by location with filters
  async searchPensions(params: {
    lat?: number;
    lng?: number;
    radius?: number;
    city?: string;
    region?: string;
  }): Promise<LocationSearchResult> {
    try {
      const searchParams = new URLSearchParams();
      if (params.lat) searchParams.append('lat', params.lat.toString());
      if (params.lng) searchParams.append('lng', params.lng.toString());
      if (params.radius) searchParams.append('radius', params.radius.toString());
      if (params.city) searchParams.append('city', params.city);
      if (params.region) searchParams.append('region', params.region);

      const response = await this.fetchApi(`${API_BASE_URL}/location/search?${searchParams}`);
      return response;
    } catch (error) {
      console.error('Error searching pensions:', error);
      throw error;
    }
  }

  // Geocode address to coordinates
  async geocodeAddress(address: string): Promise<{ coordinates: Coordinates; address: Address }> {
    try {
      const response = await this.fetchApi(`${API_BASE_URL}/location/geocode`, {
        method: 'POST',
        body: JSON.stringify({ address }),
      });
      return response.data;
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat: number, lng: number): Promise<Address> {
    try {
      const response = await this.fetchApi(
        `${API_BASE_URL}/location/reverse-geocode?lat=${lat}&lng=${lng}`
      );
      return response.data;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }

  // Get distance from user to specific pension
  async getDistanceToPension(pensionId: number, userLat: number, userLng: number): Promise<{
    distance_km: number;
    pension_name: string;
  }> {
    try {
      const response = await this.fetchApi(
        `${API_BASE_URL}/location/distance/${pensionId}?lat=${userLat}&lng=${userLng}`
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  }
}

export default new LocationApiService();
