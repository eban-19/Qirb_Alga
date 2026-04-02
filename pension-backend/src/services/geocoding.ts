import * as https from 'https';

interface Coordinates {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Simple geocoding service using OpenStreetMap Nominatim API (Free)
 * Converts address string to latitude/longitude coordinates
 */
class GeocodingService {
  private baseUrl: string;
  private userAgent: string;

  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org/search';
    this.userAgent = 'PensionManagementSystem/1.0'; // Required by Nominatim
  }

  /**
   * Convert address to coordinates
   * @param address - The address to geocode
   * @returns Promise<Coordinates>
   */
  async geocodeAddress(address: string): Promise<Coordinates> {
    if (!address || address.trim() === '') {
      // Return default Addis Ababa coordinates if no address
      return {
        lat: 9.03,
        lng: 38.74,
        displayName: 'Addis Ababa, Ethiopia'
      };
    }

    try {
      console.log(`🔍 Geocoding address: "${address}"`);
      
      const query = encodeURIComponent(address + ', Ethiopia'); // Add Ethiopia for better results
      const url = `${this.baseUrl}?q=${query}&format=json&limit=1&addressdetails=1`;
      
      return new Promise((resolve, reject) => {
        const request = https.get(url, {
          headers: {
            'User-Agent': this.userAgent
          }
        }, (response) => {
          let data = '';
          
          response.on('data', (chunk) => {
            data += chunk;
          });
          
          response.on('end', () => {
            try {
              const results = JSON.parse(data);
              
              if (results && results.length > 0) {
                const result = results[0];
                const coordinates: Coordinates = {
                  lat: parseFloat(result.lat),
                  lng: parseFloat(result.lon),
                  displayName: result.display_name || address
                };
                
                console.log(`✅ Geocoded "${address}" to:`, coordinates);
                resolve(coordinates);
              } else {
                console.log(`⚠️ No results found for address: "${address}"`);
                // Return default coordinates if geocoding fails
                resolve({
                  lat: 9.03,
                  lng: 38.74,
                  displayName: address
                });
              }
            } catch (parseError: any) {
              console.error('❌ Error parsing geocoding response:', parseError);
              reject(parseError);
            }
          });
        });
        
        request.on('error', (error: any) => {
          console.error('❌ Geocoding request error:', error);
          reject(error);
        });
        
        request.setTimeout(5000, () => {
          request.destroy();
          console.log('⏰ Geocoding request timeout');
          resolve({
            lat: 9.03,
            lng: 38.74,
            displayName: address
          });
        });
      });
      
    } catch (error: any) {
      console.error('❌ Geocoding service error:', error);
      // Return default coordinates on any error
      return {
        lat: 9.03,
        lng: 38.74,
        displayName: address
      };
    }
  }

  /**
   * Batch geocode multiple addresses (with rate limiting)
   * @param addresses - Array of addresses to geocode
   * @returns Promise<Array> Array of geocoded results
   */
  async batchGeocode(addresses: string[]): Promise<Coordinates[]> {
    const results: Coordinates[] = [];
    
    for (const address of addresses) {
      try {
        const result = await this.geocodeAddress(address);
        results.push(result);
        
        // Rate limiting: wait 1 second between requests (Nominatim policy)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error: any) {
        console.error(`❌ Failed to geocode "${address}":`, error);
        results.push({
          lat: 9.03,
          lng: 38.74,
          displayName: address
        });
      }
    }
    
    return results;
  }
}

const geocodingService = new GeocodingService();
export default geocodingService;
