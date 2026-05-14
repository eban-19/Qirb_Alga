import * as https from 'https';

interface Coordinates {
  lat: number;
  lng: number;
  displayName: string;
}

interface Address {
  city: string;
  region: string;
  country: string;
  full_address: string;
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
      
      // Step 1: Try OpenStreetMap API with multiple address variations for highest precision
      const addressVariations = [
        // Original address with country context
        address + ', Ethiopia',
        // Add city context for better matching
        address + ', Addis Ababa, Ethiopia' + (address.toLowerCase().includes('addis') ? '' : ', Addis Ababa'),
        // Reverse order for different matching
        'Ethiopia, ' + address,
        // Remove common words that might confuse API
        address.replace(/Building|Hotel|Pension|Guest House|Lodge/gi, '').trim() + ', Ethiopia',
        // Specific Ethiopian city context
        address.includes('Addis') ? address : address + ', Ethiopia'
      ];

      // Remove duplicates and try each variation
      const uniqueVariations = [...new Set(addressVariations)];
      
      for (let i = 0; i < uniqueVariations.length; i++) {
        const variation = uniqueVariations[i];
        try {
          // Add 1 second delay between variations to comply with Nominatim policy
          // (Skip delay for the very first attempt to keep it fast if it succeeds)
          if (i > 0) {
            console.log(`⏱️ Waiting 1s before trying next variation...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          console.log(`🔍 Trying address variation: "${variation}"`);
          const query = encodeURIComponent(variation);
          const url = `${this.baseUrl}?q=${query}&format=json&limit=1&addressdetails=1`;
          
          const result = await this.makeGeocodingRequest(url, variation);
          if (result) {
            // Detect precision level
            const precision = this.detectPrecision(result);
            console.log(`✅ Found ${precision} coordinates for "${variation}":`, result);
            return result;
          }
        } catch (error: any) {
          console.log(`⚠️ Variation failed: "${variation}" (${error.message}) - trying next...`);
          continue;
        }
      }

      console.log(`⚠️ All API variations failed for address: "${address}" - using fallback locations`);
      
      // Step 2: Fallback to known locations only if API completely fails
      const knownLocations: { [key: string]: Coordinates } = {
        // Building-level (highest precision)
        'abd building': { lat: 9.0200, lng: 38.7960, displayName: 'ABD Building, Addis Ababa, Ethiopia' },
        'sheraton': { lat: 9.0239, lng: 38.7615, displayName: 'Sheraton Addis, Ethiopia' },
        'hilton': { lat: 9.0200, lng: 38.7620, displayName: 'Hilton Addis, Ethiopia' },
        
        // Street-level (medium precision)
        'bole road': { lat: 9.0200, lng: 38.7960, displayName: 'Bole Road, Addis Ababa, Ethiopia' },
        'congo street': { lat: 9.0180, lng: 38.7950, displayName: 'Congo Street, Addis Ababa, Ethiopia' },
        'bambis road': { lat: 9.0190, lng: 38.7965, displayName: 'Bambis Road, Addis Ababa, Ethiopia' },
        
        // Area-level (lower precision)
        'bole': { lat: 9.0200, lng: 38.7960, displayName: 'Bole, Addis Ababa, Ethiopia' },
        'gerji': { lat: 9.0320, lng: 38.7850, displayName: 'Gerji, Addis Ababa, Ethiopia' },
        'mercato': { lat: 9.0340, lng: 38.7420, displayName: 'Mercato, Addis Ababa, Ethiopia' },
        'piassa': { lat: 9.0350, lng: 38.7430, displayName: 'Piassa, Addis Ababa, Ethiopia' },
        'kazanchis': { lat: 9.0140, lng: 38.7560, displayName: 'Kazanchis, Addis Ababa, Ethiopia' },
        'sarbet': { lat: 9.0130, lng: 38.7580, displayName: 'Sarbet, Addis Ababa, Ethiopia' },
        'arat kilo': { lat: 9.0370, lng: 38.7450, displayName: 'Arat Kilo, Addis Ababa, Ethiopia' },
        'mexico': { lat: 9.0037, lng: 38.7600, displayName: 'Mexico, Addis Ababa, Ethiopia' },
        
        // City-level (medium precision)
        'nekemte': { lat: 9.4833, lng: 37.0333, displayName: 'Nekemte, Ethiopia' },
        'jimma': { lat: 7.6694, lng: 36.8344, displayName: 'Jimma, Ethiopia' },
        'adama': { lat: 8.5405, lng: 39.2748, displayName: 'Adama, Ethiopia' },
        'nazret': { lat: 8.5405, lng: 39.2748, displayName: 'Nazret (Adama), Ethiopia' },
        'dire dawa': { lat: 9.5944, lng: 41.8661, displayName: 'Dire Dawa, Ethiopia' },
        'bahirdar': { lat: 11.5765, lng: 37.3639, displayName: 'Bahirdar, Ethiopia' },
        'gondar': { lat: 12.6030, lng: 37.4478, displayName: 'Gondar, Ethiopia' },
        'mekelle': { lat: 13.4967, lng: 39.4753, displayName: 'Mekelle, Ethiopia' },
        'hawassa': { lat: 7.0595, lng: 38.4675, displayName: 'Hawassa, Ethiopia' },
        
        // Region-level (lowest precision - last resort)
        'oromia': { lat: 8.5405, lng: 39.2748, displayName: 'Oromia, Ethiopia' },
        'tigray': { lat: 13.4967, lng: 39.4753, displayName: 'Tigray, Ethiopia' },
        'amhara': { lat: 11.5765, lng: 37.3639, displayName: 'Amhara, Ethiopia' },
        'snnpr': { lat: 7.0595, lng: 38.4675, displayName: 'SNNPR, Ethiopia' }
      };

      // Check for known locations (prioritize specific over general)
      const lowerAddress = address.toLowerCase();
      
      // Check building-level first
      for (const [location, coords] of Object.entries(knownLocations)) {
        if (lowerAddress.includes(location) && 
            (location.includes('building') || location.includes('sheraton') || location.includes('hilton'))) {
          console.log(`✅ Using building-level fallback location "${location}" for address: "${address}"`);
          return coords;
        }
      }
      
      // Check street-level
      for (const [location, coords] of Object.entries(knownLocations)) {
        if (lowerAddress.includes(location) && location.includes('street')) {
          console.log(`✅ Using street-level fallback location "${location}" for address: "${address}"`);
          return coords;
        }
      }
      
      // Check area-level
      for (const [location, coords] of Object.entries(knownLocations)) {
        if (lowerAddress.includes(location) && 
            !location.includes('building') && !location.includes('street') && !location.includes('region')) {
          console.log(`✅ Using area-level fallback location "${location}" for address: "${address}"`);
          return coords;
        }
      }
      
      // Check city-level
      for (const [location, coords] of Object.entries(knownLocations)) {
        if (lowerAddress.includes(location) && 
            ['nekemte', 'jimma', 'adama', 'dire dawa', 'bahirdar', 'gondar', 'mekelle', 'hawassa'].includes(location)) {
          console.log(`✅ Using city-level fallback location "${location}" for address: "${address}"`);
          return coords;
        }
      }
      
      // Check region-level (last resort)
      for (const [location, coords] of Object.entries(knownLocations)) {
        if (lowerAddress.includes(location)) {
          console.log(`✅ Using region-level fallback location "${location}" for address: "${address}"`);
          return coords;
        }
      }
      
      console.log(`⚠️ No known location found for address: "${address}"`);
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

  private detectPrecision(result: Coordinates): string {
    // Simple precision detection based on coordinate specificity
    if (result.displayName.includes('Building') || result.displayName.includes('Hotel') || result.displayName.includes('Sheraton')) {
      return '🎯 High precision: Building-level';
    } else if (result.displayName.includes('Street') || result.displayName.includes('Road')) {
      return '📍 Medium precision: Street-level';
    } else if (result.displayName.includes('Addis Ababa') || result.displayName.includes(',')) {
      return '🗺️ Medium precision: Area-level';
    } else {
      return '🌍 Low precision: Region-level';
    }
  }

  private async makeGeocodingRequest(url: string, originalAddress: string, retryCount = 0): Promise<Coordinates> {
    try {
      const data = await this.makeRequest(url, retryCount);
      const results = JSON.parse(data);
      
      if (results && results.length > 0) {
        const result = results[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name || originalAddress
        };
      } else {
        throw new Error('No results found');
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Convert coordinates to address
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns Promise<Address>
   */
  async reverseGeocode(lat: number, lng: number): Promise<Address> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      
      const response = await this.makeRequest(url);
      const data = JSON.parse(response);
      
      return {
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
        region: data.address?.state || data.address?.region || 'Unknown',
        country: data.address?.country || 'Ethiopia',
        full_address: data.display_name || 'Unknown location'
      };
    } catch (error: any) {
      console.error('❌ Reverse geocoding error:', error.message);
      return {
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        country: 'Ethiopia',
        full_address: 'Addis Ababa, Ethiopia'
      };
    }
  }

  private async makeRequest(url: string, retryCount = 0): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = https.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json'
        }
      }, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          if (response.statusCode !== 200) {
            reject(new Error(`API returned status ${response.statusCode}`));
            return;
          }

          resolve(data);
        });
      });

      request.on('error', async (error: any) => {
        // Handle ECONNRESET / socket hang up with a single retry
        if ((error.code === 'ECONNRESET' || error.message.includes('socket hang up')) && retryCount < 1) {
          console.log(`🔄 Connection reset, retrying request (attempt ${retryCount + 1})...`);
          try {
            await new Promise(resolveDelay => setTimeout(resolveDelay, 1000)); // Delay before retry
            const retryResult = await this.makeRequest(url, retryCount + 1);
            resolve(retryResult);
          } catch (retryError) {
            reject(retryError);
          }
          return;
        }

        reject(error);
      });

      request.setTimeout(15000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
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
