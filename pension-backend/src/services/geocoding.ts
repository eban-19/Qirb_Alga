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
      
      // Known coordinates for major Ethiopian locations
      const knownLocations: { [key: string]: Coordinates } = {
        'adama': { lat: 8.5405, lng: 39.2748, displayName: 'Adama, Ethiopia' },
        'nazret': { lat: 8.5405, lng: 39.2748, displayName: 'Nazret (Adama), Ethiopia' },
        'bole': { lat: 9.0200, lng: 38.7960, displayName: 'Bole, Addis Ababa, Ethiopia' },
        'gerji': { lat: 9.0320, lng: 38.7850, displayName: 'Gerji, Addis Ababa, Ethiopia' },
        'mercato': { lat: 9.0340, lng: 38.7420, displayName: 'Mercato, Addis Ababa, Ethiopia' },
        'piassa': { lat: 9.0350, lng: 38.7430, displayName: 'Piassa, Addis Ababa, Ethiopia' },
        'kazanchis': { lat: 9.0140, lng: 38.7560, displayName: 'Kazanchis, Addis Ababa, Ethiopia' },
        'sarbet': { lat: 9.0130, lng: 38.7580, displayName: 'Sarbet, Addis Ababa, Ethiopia' },
        'arat kilo': { lat: 9.0370, lng: 38.7450, displayName: 'Arat Kilo, Addis Ababa, Ethiopia' },
        'mexico': { lat: 9.0037, lng: 38.7600, displayName: 'Mexico, Addis Ababa, Ethiopia' },
        'jimma': { lat: 7.6694, lng: 36.8344, displayName: 'Jimma, Ethiopia' },
        'oromia': { lat: 8.5405, lng: 39.2748, displayName: 'Oromia, Ethiopia' }
      };

      // Check for known locations first
      const lowerAddress = address.toLowerCase();
      for (const [location, coords] of Object.entries(knownLocations)) {
        if (lowerAddress.includes(location)) {
          console.log(`✅ Found known location "${location}" in address: "${address}"`);
          return coords;
        }
      }

      // Try different address formats for better geocoding
      const addressVariations = [
        address,
        address + ', Ethiopia',
        address + ', Addis Ababa, Ethiopia'
      ];

      for (const addressVariation of addressVariations) {
        try {
          const query = encodeURIComponent(addressVariation);
          const url = `${this.baseUrl}?q=${query}&format=json&limit=1&addressdetails=1`;
          
          const result = await this.makeGeocodingRequest(url, addressVariation);
          if (result) {
            return result;
          }
        } catch (error) {
          // Try next variation
          continue;
        }
      }

      console.log(`⚠️ No results found for address: "${address}"`);
      // Return default coordinates if all variations fail
      return {
        lat: 9.03,
        lng: 38.74,
        displayName: address
      };
      
    } catch (error: any) {
      console.error('❌ Geocoding error:', error.message);
      // Return default coordinates on error
      return {
        lat: 9.03,
        lng: 38.74,
        displayName: address
      };
    }
  }

  private async makeGeocodingRequest(url: string, originalAddress: string): Promise<Coordinates> {
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
                displayName: result.display_name || originalAddress
              };
              
              console.log(`✅ Geocoded "${originalAddress}" to:`, coordinates);
              resolve(coordinates);
            } else {
              reject(new Error('No results found'));
            }
          } catch (parseError: any) {
            console.error('❌ Error parsing geocoding response:', parseError);
            reject(parseError);
          }
        });
      });

      request.on('error', (error) => {
        console.error('❌ Geocoding request error:', error);
        reject(error);
      });

      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Geocoding request timeout'));
      });
    });
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
