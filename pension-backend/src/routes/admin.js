const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all owners for admin dashboard
router.get('/owners', authenticateToken, requireAdmin, async (req, res) => {
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

    const formattedOwners = owners.map(owner => ({
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
  } catch (error) {
    console.error('Get owners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owners'
    });
  }
});

// Get detailed business information for a specific owner
router.get('/owners/:ownerId/details', authenticateToken, requireAdmin, async (req, res) => {
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
  } catch (error) {
    console.error('Get owner details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owner details'
    });
  }
});

// Approve owner
router.put('/owners/:ownerId/approve', authenticateToken, requireAdmin, async (req, res) => {
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
  } catch (error) {
    console.error('Approve owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve owner'
    });
  }
});

// Reject owner
router.put('/owners/:ownerId/reject', authenticateToken, requireAdmin, async (req, res) => {
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
  } catch (error) {
    console.error('Reject owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject owner'
    });
  }
});

// Suspend owner
router.put('/owners/:ownerId/suspend', authenticateToken, requireAdmin, async (req, res) => {
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
  } catch (error) {
    console.error('Suspend owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend owner'
    });
  }
});

// Get all properties for admin dashboard
router.get('/properties', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const properties = await executeQuery(`
      SELECT p.*, u.full_name, u.email as owner_email
      FROM pensions p
      JOIN users u ON p.owner_id = u.user_id
      ORDER BY p.created_at DESC
    `);

    const formattedProperties = properties.map(property => ({
      id: property.pension_id.toString(),
      name: property.name,
      address: property.address,
      ownerName: property.full_name,
      ownerEmail: property.owner_email,
      status: 'active', // Would need to determine based on business logic
      roomsCount: 0, // Would need to calculate from rooms table
      occupancyRate: 0, // Would need to calculate from bookings
      monthlyRevenue: 0, // Would need to calculate from bookings
      rating: 0, // Would need to calculate from reviews
      registeredDate: property.created_at
    }));

    res.json({
      success: true,
      data: formattedProperties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties'
    });
  }
});

// Get all bookings for admin dashboard
router.get('/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Use only columns we know exist from the database schema
    const bookings = await executeQuery(`
      SELECT b.booking_id, b.room_id, b.customer_id, b.check_in_date, b.check_out_date, 
             b.total_price, b.status, b.created_at
      FROM bookings b
      ORDER BY b.created_at DESC
      LIMIT 100
    `);

    const formattedBookings = bookings.map(booking => ({
      id: booking.booking_id.toString(),
      propertyName: 'Unknown Property', // Would need JOIN with rooms and pensions
      guestName: 'Guest', // Would need JOIN with users
      guestEmail: '',
      guestPhone: '',
      checkIn: booking.check_in_date,
      checkOut: booking.check_out_date,
      totalPrice: booking.total_price || 0,
      status: booking.status || 'Pending',
      paymentStatus: 'Pending' // Default since payment_status column doesn't exist
    }));

    res.json({
      success: true,
      data: formattedBookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Get admin metrics
router.get('/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
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
      monthlyRevenue: 0, // Would need to calculate from bookings
      occupancyRate: 0, // Would need to calculate from bookings vs rooms
      pendingVerifications: pendingCount[0].count,
      activeProperties: propertiesCount[0].count, // Would need to filter active ones
      averageRating: 0 // Would need to calculate from reviews
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics'
    });
  }
});

// Get system alerts
router.get('/alerts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const alerts = [];

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

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

module.exports = router;
