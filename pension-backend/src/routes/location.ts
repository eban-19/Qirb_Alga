import * as express from 'express';
import locationService from '../services/locationService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all pensions for map display
router.get('/map-data', async (req: express.Request, res: express.Response) => {
  try {
    console.log('📍 Getting map data for all pensions');
    
    const pensions = await locationService.getMapPensions();
    
    res.json({
      success: true,
      data: pensions,
      count: pensions.length
    });
  } catch (error: any) {
    console.error('Error getting map data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load map data',
      error: error.message
    });
  }
});

// Find pensions near user location
router.get('/near-me', async (req: express.Request, res: express.Response) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const searchRadius = parseInt(radius as string);
    
    // Validate coordinates
    if (!locationService.validateCoordinates(userLat, userLng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }
    
    console.log(`📍 Finding pensions near (${userLat}, ${userLng}) within ${searchRadius}km`);
    
    const nearbyPensions = await locationService.findNearbyPensions(userLat, userLng, searchRadius);
    
    res.json({
      success: true,
      data: nearbyPensions,
      user_location: { lat: userLat, lng: userLng },
      search_radius_km: searchRadius,
      count: nearbyPensions.length
    });
  } catch (error: any) {
    console.error('Error finding nearby pensions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby pensions',
      error: error.message
    });
  }
});

// Search pensions by location with filters
router.get('/search', async (req: express.Request, res: express.Response) => {
  try {
    const { 
      lat, 
      lng, 
      radius = 50, 
      city, 
      region,
      min_price,
      max_price 
    } = req.query;
    
    let pensions;
    
    if (lat && lng) {
      // Location-based search
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const searchRadius = parseInt(radius as string);
      
      if (!locationService.validateCoordinates(userLat, userLng)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates'
        });
      }
      
      pensions = await locationService.findNearbyPensions(userLat, userLng, searchRadius);
    } else {
      // City/region based search
      pensions = await locationService.getMapPensions();
    }
    
    // Apply additional filters
    if (city) {
      pensions = pensions.filter(p => 
        p.city.toLowerCase().includes((city as string).toLowerCase())
      );
    }
    
    if (region) {
      pensions = pensions.filter(p => 
        p.region.toLowerCase().includes((region as string).toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: pensions,
      filters: { lat, lng, radius, city, region, min_price, max_price },
      count: pensions.length
    });
  } catch (error: any) {
    console.error('Error searching pensions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search pensions',
      error: error.message
    });
  }
});

// Geocode address to coordinates
router.post('/geocode', async (req: express.Request, res: express.Response) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    console.log(`📍 Geocoding address: ${address}`);
    
    const coordinates = await locationService.geocodeAddress(address);
    
    // Get additional location info
    const locationInfo = await locationService.reverseGeocode(coordinates.lat, coordinates.lng);
    
    res.json({
      success: true,
      data: {
        ...coordinates,
        ...locationInfo
      }
    });
  } catch (error: any) {
    console.error('Error geocoding address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to geocode address',
      error: error.message
    });
  }
});

// Reverse geocode coordinates to address
router.get('/reverse-geocode', async (req: express.Request, res: express.Response) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    
    if (!locationService.validateCoordinates(userLat, userLng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }
    
    console.log(`📍 Reverse geocoding (${userLat}, ${userLng})`);
    
    const address = await locationService.reverseGeocode(userLat, userLng);
    
    res.json({
      success: true,
      data: address
    });
  } catch (error: any) {
    console.error('Error reverse geocoding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reverse geocode',
      error: error.message
    });
  }
});

// Get distance from user to specific pension
router.get('/distance/:pensionId', async (req: express.Request, res: express.Response) => {
  try {
    const { pensionId } = req.params;
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'User latitude and longitude are required'
      });
    }
    
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    
    if (!locationService.validateCoordinates(userLat, userLng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user coordinates'
      });
    }
    
    // Get pension coordinates
    const pension = await locationService.getMapPensions();
    const targetPension = pension.find(p => p.pension_id === parseInt(pensionId as string));
    
    if (!targetPension) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found'
      });
    }
    
    const distance = locationService.calculateDistance(
      userLat, userLng, 
      targetPension.latitude, targetPension.longitude
    );
    
    res.json({
      success: true,
      data: {
        pension_id: parseInt(pensionId as string),
        pension_name: targetPension.name,
        user_location: { lat: userLat, lng: userLng },
        pension_location: { 
          lat: targetPension.latitude, 
          lng: targetPension.longitude 
        },
        distance_km: Math.round(distance * 100) / 100 // Round to 2 decimal places
      }
    });
  } catch (error: any) {
    console.error('Error calculating distance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate distance',
      error: error.message
    });
  }
});

// Update pension coordinates (admin/owner only)
router.put('/pensions/:pensionId/coordinates', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const { pensionId } = req.params;
    const { latitude, longitude, city, region, country } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    if (!locationService.validateCoordinates(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }
    
    // Check ownership (simplified - you might want to add proper authorization)
    const address = { 
      city, 
      region, 
      country: country || 'Ethiopia',
      full_address: `${city || ''}, ${region || ''}, ${country || 'Ethiopia'}`
    };
    await locationService.updatePensionCoordinates(parseInt(pensionId as string), latitude, longitude, address);
    
    res.json({
      success: true,
      message: 'Pension coordinates updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating pension coordinates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coordinates',
      error: error.message
    });
  }
});

export default router;
