import * as express from 'express';
import { executeQuery } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Get all owners for admin dashboard
router.get('/owners', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const owners = await executeQuery(`
      SELECT u.user_id, u.email, u.full_name, u.phone, u.role, u.approved, u.created_at,
             op.business_name, op.business_email, op.business_phone, op.license_number, 
             op.id_document_url, op.approval_status,
             COUNT(DISTINCT p.pension_id) as property_count
      FROM users u
      LEFT JOIN ownerprofiles op ON u.user_id = op.owner_id
      LEFT JOIN pensions p ON u.user_id = p.owner_id
      WHERE u.role = 'Owner'
      GROUP BY u.user_id
      ORDER BY u.created_at DESC
    `);

    const formattedOwners = owners.map((owner: any) => ({
      id: owner.user_id.toString(),
      businessName: owner.business_name || owner.full_name || 'Unknown',
      ownerName: owner.full_name,
      email: owner.business_email || owner.email,
      phone: owner.business_phone || owner.phone || '',
      businessId: `BUS${owner.user_id}`,
      status: owner.approved === 1 ? 'verified' : (owner.approved === -1 ? 'suspended' : 'pending'),
      registrationDate: owner.created_at,
      totalProperties: owner.property_count,
      totalRevenue: 0, // Would need to calculate from bookings
      rating: 0, // Would need to calculate from reviews
      documentStatus: owner.approval_status || 'pending',
      lastActive: owner.created_at,
      // Add business details
      licenseNumber: owner.license_number,
      documentUrl: owner.id_document_url,
      approvalStatus: owner.approval_status
    }));

    res.json({
      success: true,
      data: formattedOwners
    });
  } catch (error: any) {
    console.error('Get owners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owners'
    });
  }
});

// Get detailed business information for a specific owner
router.get('/owners/:ownerId/details', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const { ownerId } = req.params;
    
    const businessDetails = await executeQuery(`
      SELECT u.user_id, u.email, u.full_name, u.phone, u.role, u.approved, u.created_at,
             op.business_name, op.business_email, op.business_phone, op.license_number, 
             op.id_document_url, op.approval_status, op.created_at as profile_created_at,
             COUNT(DISTINCT p.pension_id) as property_count
      FROM users u
      LEFT JOIN ownerprofiles op ON u.user_id = op.owner_id
      LEFT JOIN pensions p ON u.user_id = p.owner_id
      WHERE u.user_id = ? AND u.role = 'Owner'
      GROUP BY u.user_id
    `, [ownerId]);

    if (businessDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    const owner = businessDetails[0];
    const formattedDetails = {
      id: owner.user_id.toString(),
      businessName: owner.business_name || owner.full_name || 'Unknown',
      ownerName: owner.full_name,
      email: owner.business_email || owner.email,
      phone: owner.business_phone || owner.phone || '',
      businessId: `BUS${owner.user_id}`,
      status: owner.approved === 1 ? 'verified' : (owner.approved === -1 ? 'suspended' : 'pending'),
      registrationDate: owner.created_at,
      profileCreatedAt: owner.profile_created_at,
      totalProperties: owner.property_count,
      totalRevenue: 0, // Would need to calculate from bookings
      rating: 0, // Would need to calculate from reviews
      documentStatus: owner.approval_status || 'pending',
      lastActive: owner.created_at,
      // Business details from ownerprofiles
      licenseNumber: owner.license_number,
      documentUrl: owner.id_document_url,
      approvalStatus: owner.approval_status
    };

    res.json({
      success: true,
      data: formattedDetails
    });
  } catch (error: any) {
    console.error('Get owner details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owner details'
    });
  }
});

// Approve owner
router.put('/owners/:ownerId/approve', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const { ownerId } = req.params;
    
    // Update both users table and ownerprofiles table
    await executeQuery(
      'UPDATE users SET approved = 1 WHERE user_id = ? AND role = "Owner"',
      [ownerId]
    );
    
    // Also update ownerprofiles approval status
    await executeQuery(
      'UPDATE ownerprofiles SET approval_status = "Approved" WHERE owner_id = ?',
      [ownerId]
    );

    console.log(`✅ Owner ${ownerId} approved in both users and ownerprofiles tables`);

    res.json({
      success: true,
      message: 'Owner approved successfully'
    });
  } catch (error: any) {
    console.error('Approve owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve owner'
    });
  }
});

// Reject owner
router.put('/owners/:ownerId/reject', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const { ownerId } = req.params;
    
    // Update both users table and ownerprofiles table
    await executeQuery(
      'UPDATE users SET approved = 0 WHERE user_id = ? AND role = "Owner"',
      [ownerId]
    );
    
    // Also update ownerprofiles approval status
    await executeQuery(
      'UPDATE ownerprofiles SET approval_status = "Rejected" WHERE owner_id = ?',
      [ownerId]
    );

    console.log(`✅ Owner ${ownerId} rejected in both users and ownerprofiles tables`);

    res.json({
      success: true,
      message: 'Owner rejected successfully'
    });
  } catch (error: any) {
    console.error('Reject owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject owner'
    });
  }
});

// Suspend owner
router.put('/owners/:ownerId/suspend', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const { ownerId } = req.params;
    
    await executeQuery(
      'UPDATE users SET approved = -1 WHERE user_id = ? AND role = "Owner"',
      [ownerId]
    );

    res.json({
      success: true,
      message: 'Owner suspended successfully'
    });
  } catch (error: any) {
    console.error('Suspend owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend owner'
    });
  }
});

// Get all properties for admin dashboard
router.get('/properties', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const properties = await executeQuery(`
      SELECT p.*, u.full_name, u.email as owner_email
      FROM pensions p
      JOIN users u ON p.owner_id = u.user_id
      ORDER BY p.created_at DESC
    `);

    const formattedProperties = properties.map((property: any) => ({
      id: property.pension_id.toString(),
      name: property.name,
      address: property.address,
      ownerName: property.full_name,
      ownerEmail: property.owner_email,
      status: property.status || 'pending', // Track actual status from database
      roomsCount: 0, // Would need to calculate from rooms table
      occupancyRate: 0, // Would need to calculate from bookings
      monthlyRevenue: 0, // Would need to calculate from bookings
      rating: 0, // Would need to calculate from reviews
      registeredDate: property.created_at,
      rejectionReason: property.rejection_reason || null
    }));

    res.json({
      success: true,
      data: formattedProperties
    });
  } catch (error: any) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties'
    });
  }
});

// Get all bookings for admin dashboard
router.get('/bookings', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    // Use JOIN to get property names and guest information
    const bookings = await executeQuery(`
      SELECT b.booking_id, b.room_id, b.customer_id, b.check_in_date, b.check_out_date, 
             b.total_price, b.status, b.created_at,
             u.full_name as guest_name, u.email as guest_email, u.phone as guest_phone,
             p.name as property_name, r.room_number
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN rooms r ON b.room_id = r.room_id
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      ORDER BY b.created_at DESC
      LIMIT 100
    `);

    const formattedBookings = bookings.map((booking: any) => ({
      id: booking.booking_id.toString(),
      propertyName: booking.property_name || 'Unknown Property',
      guestName: booking.guest_name || 'Guest',
      guestEmail: booking.guest_email || 'N/A',
      guestPhone: booking.guest_phone || 'N/A',
      checkIn: booking.check_in_date,
      checkOut: booking.check_out_date,
      totalPrice: booking.total_price,
      status: booking.status,
      paymentStatus: booking.status === 'confirmed' ? 'paid' : 'pending',
      ownerName: 'Property Owner',
      roomNumber: booking.room_number,
      specialRequests: '',
      createdAt: booking.created_at
    }));

    res.json({
      success: true,
      data: formattedBookings
    });
  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Test endpoint without auth for debugging
router.get('/test-debug', async (req: express.Request, res: express.Response) => {
  try {
    console.log('🔍 Debug: Testing admin routes without auth...');
    
    // Get counts
    const [ownersCount, propertiesCount, bookingsCount, pendingCount] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM users WHERE role = "Owner"'),
      executeQuery('SELECT COUNT(*) as count FROM pensions'),
      executeQuery('SELECT COUNT(*) as count FROM bookings'),
      executeQuery('SELECT COUNT(*) as count FROM users WHERE role = "Owner" AND approved != 1')
    ]);

    const metrics = {
      totalOwners: ownersCount[0].count,
      totalProperties: propertiesCount[0].count,
      totalBookings: bookingsCount[0].count,
      monthlyRevenue: 0,
      occupancyRate: 0,
      pendingVerifications: pendingCount[0].count,
      activeProperties: propertiesCount[0].count,
      averageRating: 0
    };

    console.log('🔍 Debug: Admin metrics result:', metrics);

    res.json({
      success: true,
      data: metrics,
      debug: 'Admin routes working without authentication'
    });
  } catch (error: any) {
    console.error('🔍 Debug: Admin metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics',
      error: error.message
    });
  }
});

// Get all pensions for admin approval (matches frontend expectation)
router.get('/pensions/all', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    console.log('🔍 Admin fetching all pensions for approval...');
    
    const pensions = await executeQuery(`
      SELECT p.*, u.full_name as owner_name, u.email as owner_email
      FROM pensions p
      JOIN users u ON p.owner_id = u.user_id
      ORDER BY p.created_at DESC
    `);

    const formattedPensions = pensions.map((property: any) => {
      // Debug the raw pension data
      console.log(`🔍 Raw pension data for ${property.name}:`, {
        pension_id: property.pension_id,
        name: property.name,
        description: property.description,
        address: property.address,
        phone: property.phone,
        email: property.email,
        capacity: property.capacity,
        owner_name: property.owner_name,
        owner_email: property.owner_email,
        created_at: property.created_at,
        created_at_type: typeof property.created_at,
        created_at_value: property.created_at ? JSON.stringify(property.created_at) : 'NULL',
        all_fields: Object.keys(property)
      });

      // Safe date conversion with multiple fallbacks
      let safeDate;
      try {
        if (property.created_at) {
          const dateObj = new Date(property.created_at);
          if (isNaN(dateObj.getTime())) {
            console.log(`⚠️ Invalid date for pension ${property.pension_id}: ${property.created_at}`);
            safeDate = new Date().toISOString();
          } else {
            safeDate = dateObj.toISOString();
          }
        } else {
          safeDate = new Date().toISOString();
        }
      } catch (dateError: any) {
        console.error(`❌ Date conversion error for pension ${property.pension_id}:`, dateError);
        safeDate = new Date().toISOString();
      }

      return {
        pension_id: property.pension_id,
        id: property.pension_id.toString(), // Frontend fallback
        name: property.name,
        description: property.description,
        address: property.address,
        phone: property.phone,
        email: property.email,
        capacity: property.capacity,
        ownerName: property.owner_name,
        ownerEmail: property.owner_email,
        owner_name: property.owner_name, // Frontend expects this
        owner_email: property.owner_email, // Frontend expects this
        status: property.status || 'pending', // Track actual status from database
        roomsCount: 0, // Would need to calculate from rooms table
        occupancyRate: 0, // Would need to calculate from bookings
        monthlyRevenue: 0, // Would need to calculate from bookings
        rating: 0, // Would need to calculate from reviews
        registeredDate: safeDate,
        created_at: safeDate, // Add this field for frontend compatibility
        rejectionReason: property.rejection_reason || null
      };
    });

    console.log('🔍 Admin pensions result:', formattedPensions.length, 'pensions');
    
    // Log sample data for debugging
    if (formattedPensions.length > 0) {
      console.log('🔍 Sample pension data being sent to frontend:', formattedPensions[0]);
    }

    res.json({
      success: true,
      data: formattedPensions
    });
  } catch (error: any) {
    console.error('Get admin pensions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pensions'
    });
  }
});

// Approve pension
router.put('/pensions/:pensionId/approve', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const { pensionId } = req.params;
    
    // Update pension status to active
    await executeQuery(
      'UPDATE pensions SET status = "active", reviewed_by = ?, reviewed_at = NOW() WHERE pension_id = ?',
      [req.user.userId, pensionId]
    );

    console.log(`✅ Pension ${pensionId} approved by admin ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Pension approved successfully'
    });
  } catch (error: any) {
    console.error('Approve pension error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve pension'
    });
  }
});

// Reject pension
router.put('/pensions/:pensionId/reject', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const { pensionId } = req.params;
    const { rejectionReason } = req.body;
    
    // Update pension status to rejected
    await executeQuery(
      'UPDATE pensions SET status = "rejected", rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW() WHERE pension_id = ?',
      [rejectionReason, req.user.userId, pensionId]
    );

    console.log(`❌ Pension ${pensionId} rejected by admin ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Pension rejected successfully'
    });
  } catch (error: any) {
    console.error('Reject pension error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject pension'
    });
  }
});

// Debug endpoint - raw pension data without date processing
router.get('/pensions-debug', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    console.log('🔍 Debug: Fetching raw pension data...');
    
    const pensions = await executeQuery(`
      SELECT p.*, u.full_name as owner_name, u.email as owner_email
      FROM pensions p
      JOIN users u ON p.owner_id = u.user_id
      ORDER BY p.created_at DESC
    `);

    console.log('🔍 Debug: Raw pension data:', pensions);

    res.json({
      success: true,
      data: pensions,
      debug: {
        count: pensions.length,
        sample: pensions[0] ? {
          pension_id: pensions[0].pension_id,
          created_at: pensions[0].created_at,
          created_at_type: typeof pensions[0].created_at
        } : null
      }
    });
  } catch (error: any) {
    console.error('🔍 Debug: Raw pensions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch raw pensions',
      error: error.message
    });
  }
});

// Get admin metrics
router.get('/metrics', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    // Get counts
    const [ownersCount, propertiesCount, bookingsCount, pendingCount, pendingPensionsCount] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM users WHERE role = "Owner"'),
      executeQuery('SELECT COUNT(*) as count FROM pensions'),
      executeQuery('SELECT COUNT(*) as count FROM bookings'),
      executeQuery('SELECT COUNT(*) as count FROM users WHERE role = "Owner" AND approved != 1'),
      executeQuery('SELECT COUNT(*) as count FROM pensions WHERE status = "pending"')
    ]);

    const metrics = {
      totalOwners: ownersCount[0].count,
      totalProperties: propertiesCount[0].count,
      totalBookings: bookingsCount[0].count,
      monthlyRevenue: 0, // Would need to calculate from bookings
      occupancyRate: 0, // Would need to calculate from bookings vs rooms
      pendingVerifications: pendingCount[0].count,
      pendingPensions: pendingPensionsCount[0].count, // Track pending pension approvals
      activeProperties: propertiesCount[0].count, // Would need to filter active ones
      averageRating: 0 // Would need to calculate from reviews
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics'
    });
  }
});

// Get system alerts
router.get('/alerts', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const alerts: any[] = [];

    // Get pending verifications
    const pendingOwners = await executeQuery(
      'SELECT COUNT(*) as count FROM users WHERE role = "Owner" AND approved != 1'
    );

    if (pendingOwners[0].count > 0) {
      alerts.push({
        id: 'ALT001',
        type: 'verification',
        title: 'Pending Owner Verifications',
        message: `${pendingOwners[0].count} owners waiting for approval`,
        severity: 'medium',
        status: 'open',
        createdAt: new Date().toISOString()
      });
    }

    // Get pending pension approvals
    const pendingPensions = await executeQuery(
      'SELECT COUNT(*) as count FROM pensions WHERE status = "pending"'
    );

    if (pendingPensions[0].count > 0) {
      alerts.push({
        id: 'ALT002',
        type: 'pension_approval',
        title: 'Pending Pension Approvals',
        message: `${pendingPensions[0].count} pensions waiting for approval`,
        severity: 'high',
        status: 'open',
        createdAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: alerts
    });
  } catch (error: any) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

export default router;
