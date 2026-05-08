import * as express from 'express';
import prisma from '../lib/prisma';
import { Role, UserStatus, PensionStatus, BookingSource, ApprovalStatus, NotificationType } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import notificationService from '../services/notificationService';

const router = express.Router();

// Get all owners for admin dashboard
router.get('/owners', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const owners = await prisma.user.findMany({
      where: { role: Role.Owner },
      include: {
        ownerProfile: true,
        _count: {
          select: { pensions: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedOwners = owners.map((owner) => ({
      id: owner.user_id.toString(),
      businessName: owner.ownerProfile?.business_name || owner.full_name || 'Unknown',
      ownerName: owner.full_name,
      email: owner.ownerProfile?.business_email || owner.email,
      phone: owner.ownerProfile?.business_phone || owner.phone || '',
      businessId: `BUS${owner.user_id}`,
      status: owner.approved === 1 ? 'verified' : (owner.approved === -1 ? 'suspended' : 'pending'),
      registrationDate: owner.created_at,
      totalProperties: owner._count.pensions,
      totalRevenue: 0, // Would need to calculate from bookings
      rating: 0, // Would need to calculate from reviews
      documentStatus: owner.ownerProfile?.approval_status || 'pending',
      lastActive: owner.created_at,
      // Add business details
      licenseNumber: owner.ownerProfile?.license_number,
      documentUrl: owner.ownerProfile?.id_document_url,
      approvalStatus: owner.ownerProfile?.approval_status
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
    
    const owner = await prisma.user.findUnique({
      where: { 
        user_id: parseInt(ownerId as string),
        role: Role.Owner
      },
      include: {
        ownerProfile: true,
        _count: {
          select: { pensions: true }
        }
      }
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    const formattedDetails = {
      id: owner.user_id.toString(),
      businessName: owner.ownerProfile?.business_name || owner.full_name || 'Unknown',
      ownerName: owner.full_name,
      email: owner.ownerProfile?.business_email || owner.email,
      phone: owner.ownerProfile?.business_phone || owner.phone || '',
      businessId: `BUS${owner.user_id}`,
      status: owner.approved === 1 ? 'verified' : (owner.approved === -1 ? 'suspended' : 'pending'),
      registrationDate: owner.created_at,
      profileCreatedAt: owner.ownerProfile?.created_at,
      totalProperties: owner._count.pensions,
      totalRevenue: 0, // Would need to calculate from bookings
      rating: 0, // Would need to calculate from reviews
      documentStatus: owner.ownerProfile?.approval_status || 'pending',
      lastActive: owner.created_at,
      // Business details from ownerprofiles
      licenseNumber: owner.ownerProfile?.license_number,
      documentUrl: owner.ownerProfile?.id_document_url,
      approvalStatus: owner.ownerProfile?.approval_status
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
    const id = parseInt(ownerId);
    
    // Update both users table and ownerprofiles table in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { user_id: id, role: Role.Owner },
        data: { approved: 1 }
      }),
      prisma.ownerProfile.update({
        where: { owner_id: id },
        data: { approval_status: ApprovalStatus.Approved }
      })
    ]);

    console.log(`✅ Owner ${ownerId} approved in both users and ownerprofiles tables`);

    // Send email notification to owner
    try {
      const owner = await prisma.user.findUnique({
        where: { user_id: id },
        include: { ownerProfile: true }
      });

      if (owner) {
        const businessName = owner.ownerProfile?.business_name || owner.full_name || 'Your Business';

        await notificationService.sendEmailNotification({
          user_id: id,
          subject: 'Your Business Has Been Approved',
          message: `Congratulations! Your business "${businessName}" has been approved by the admin.\n\nYou can now access your dashboard and create your pension listing on the platform.\n\nThank you for joining our platform!`
        });

        console.log(`✅ Email notification sent to owner ${ownerId} at ${owner.email}`);
      }
    } catch (notificationError: any) {
      console.error('⚠️ Failed to send approval email notification:', notificationError);
      // Don't fail the approval if email fails
    }

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
    const id = parseInt(ownerId);
    
    // Update both users table and ownerprofiles table in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { user_id: id, role: Role.Owner },
        data: { approved: 0 }
      }),
      prisma.ownerProfile.update({
        where: { owner_id: id },
        data: { approval_status: ApprovalStatus.Rejected }
      })
    ]);

    console.log(`✅ Owner ${ownerId} rejected in both users and ownerprofiles tables`);

    // Send email notification to owner
    try {
      const owner = await prisma.user.findUnique({
        where: { user_id: id },
        include: { ownerProfile: true }
      });

      if (owner) {
        const businessName = owner.ownerProfile?.business_name || owner.full_name || 'Your Business';

        await notificationService.sendEmailNotification({
          user_id: id,
          subject: 'Your Business Registration Has Been Rejected',
          message: `We regret to inform you that your business "${businessName}" registration has been rejected by the admin.\n\nPlease review the requirements and submit a new registration with the necessary corrections.\n\nIf you have any questions, please contact support.`
        });

        console.log(`✅ Email notification sent to owner ${ownerId} at ${owner.email}`);
      }
    } catch (notificationError: any) {
      console.error('⚠️ Failed to send rejection email notification:', notificationError);
      // Don't fail the rejection if email fails
    }

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
    
    await prisma.user.update({
      where: { 
        user_id: parseInt(ownerId),
        role: Role.Owner
      },
      data: { approved: -1 }
    });

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
    const properties = await prisma.pension.findMany({
      include: {
        owner: { select: { full_name: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedProperties = properties.map((property) => ({
      id: property.pension_id.toString(),
      name: property.name,
      address: property.address,
      ownerName: property.owner.full_name,
      ownerEmail: property.owner.email,
      status: property.status || 'pending',
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
    const bookings = await prisma.booking.findMany({
      include: {
        customer: { select: { full_name: true, email: true, phone: true } },
        room: {
          include: {
            pension: { select: { name: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 100
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.booking_id.toString(),
      propertyName: booking.room?.pension.name || 'Unknown Property',
      guestName: booking.customer?.full_name || 'Guest',
      guestEmail: booking.customer?.email || 'N/A',
      guestPhone: booking.customer?.phone || 'N/A',
      checkIn: booking.check_in_date,
      checkOut: booking.check_out_date,
      totalPrice: booking.total_price,
      status: booking.status,
      paymentStatus: booking.status === 'Confirmed' ? 'paid' : 'pending',
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
    
    const [ownersCount, propertiesCount, bookingsCount, pendingCount] = await Promise.all([
      prisma.user.count({ where: { role: Role.Owner } }),
      prisma.pension.count(),
      prisma.booking.count({ where: { booking_source: BookingSource.App } }),
      prisma.user.count({ where: { role: Role.Owner, approved: { not: 1 } } })
    ]);

    const metrics = {
      totalOwners: ownersCount,
      totalProperties: propertiesCount,
      totalBookings: bookingsCount,
      monthlyRevenue: 0,
      occupancyRate: 0,
      pendingVerifications: pendingCount,
      activeProperties: propertiesCount,
      averageRating: 0
    };

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
    const pensions = await prisma.pension.findMany({
      include: {
        owner: { select: { full_name: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedPensions = pensions.map((property) => {
      const safeDate = property.created_at?.toISOString() || new Date().toISOString();

      return {
        pension_id: property.pension_id,
        id: property.pension_id.toString(), // Frontend fallback
        name: property.name,
        description: property.description,
        address: property.address,
        phone: property.phone,
        email: property.email,
        capacity: property.capacity,
        ownerName: property.owner.full_name,
        ownerEmail: property.owner.email,
        owner_name: property.owner.full_name, // Frontend expects this
        owner_email: property.owner.email, // Frontend expects this
        status: property.status || 'pending',
        roomsCount: 0, // Would need to calculate from rooms table
        occupancyRate: 0, // Would need to calculate from bookings
        monthlyRevenue: 0, // Would need to calculate from bookings
        rating: 0, // Would need to calculate from reviews
        registeredDate: safeDate,
        created_at: safeDate, // Add this field for frontend compatibility
        rejectionReason: property.rejection_reason || null
      };
    });

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
    
    await prisma.pension.update({
      where: { pension_id: parseInt(pensionId) },
      data: {
        status: PensionStatus.active,
        reviewed_by: req.user.userId,
        reviewed_at: new Date()
      }
    });

    console.log(`✅ Pension ${pensionId} approved by admin ${req.user.userId}`);

    const pension = await prisma.pension.findUnique({
      where: { pension_id: parseInt(pensionId) },
      select: { name: true, owner_id: true }
    });

    if (pension) {
      const ownerId = pension.owner_id;
      const pensionName = pension.name;

      // Create in-app notification for owner
      await notificationService.createNotification({
        user_id: ownerId,
        title: 'Pension Approved',
        message: `Your pension "${pensionName}" has been approved and is now live on the platform.`,
        type: 'pension_approved'
      });

      // Send email notification to owner
      await notificationService.sendEmailNotification({
        user_id: ownerId,
        subject: 'Your Pension Has Been Approved',
        message: `Congratulations! Your pension "${pensionName}" has been approved by the admin and is now live on the platform.\n\nYou can start receiving bookings from customers.`
      });
    }

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

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    await prisma.pension.update({
      where: { pension_id: parseInt(pensionId) },
      data: {
        status: PensionStatus.inactive,
        rejection_reason: rejectionReason,
        reviewed_by: req.user.userId,
        reviewed_at: new Date()
      }
    });

    console.log(`✅ Pension ${pensionId} rejected by admin ${req.user.userId}`);

    const pension = await prisma.pension.findUnique({
      where: { pension_id: parseInt(pensionId) },
      select: { name: true, owner_id: true }
    });

    if (pension) {
      const ownerId = pension.owner_id;
      const pensionName = pension.name;

      // Create in-app notification for owner
      await notificationService.createNotification({
        user_id: ownerId,
        title: 'Pension Rejected',
        message: `Your pension "${pensionName}" has been rejected. Reason: ${rejectionReason}`,
        type: 'pension_rejected'
      });

      // Send email notification to owner
      await notificationService.sendEmailNotification({
        user_id: ownerId,
        subject: 'Your Pension Has Been Rejected',
        message: `Your pension "${pensionName}" has been rejected by the admin.\n\nReason: ${rejectionReason}\n\nPlease review the rejection reason and make necessary changes before resubmitting.`
      });
    }

    res.json({
      success: true,
      message: 'Pension rejected successfully'
    });
  } catch (error: any) {
    console.error('❌ Reject pension error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject pension',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Debug endpoint - raw pension data
router.get('/pensions-debug', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const pensions = await prisma.pension.findMany({
      include: {
        owner: { select: { full_name: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      success: true,
      data: pensions,
      debug: {
        count: pensions.length,
        sample: pensions[0] || null
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
    const [ownersCount, propertiesCount, bookingsCount, pendingCount, pendingPensionsCount] = await Promise.all([
      prisma.user.count({ where: { role: Role.Owner } }),
      prisma.pension.count(),
      prisma.booking.count({ where: { booking_source: BookingSource.App } }),
      prisma.user.count({ where: { role: Role.Owner, approved: { not: 1 } } }),
      prisma.pension.count({ where: { status: PensionStatus.pending } })
    ]);

    const metrics = {
      totalOwners: ownersCount,
      totalProperties: propertiesCount,
      totalBookings: bookingsCount,
      monthlyRevenue: 0,
      occupancyRate: 0,
      pendingVerifications: pendingCount,
      pendingPensions: pendingPensionsCount,
      activeProperties: propertiesCount,
      averageRating: 0
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

    const pendingOwnersCount = await prisma.user.count({
      where: { role: Role.Owner, approved: { not: 1 } }
    });

    if (pendingOwnersCount > 0) {
      alerts.push({
        id: 'ALT001',
        type: 'verification',
        title: 'Pending Owner Verifications',
        message: `${pendingOwnersCount} owners waiting for approval`,
        severity: 'medium',
        status: 'open',
        createdAt: new Date().toISOString()
      });
    }

    const pendingPensionsCount = await prisma.pension.count({
      where: { status: PensionStatus.pending }
    });

    if (pendingPensionsCount > 0) {
      alerts.push({
        id: 'ALT002',
        type: 'pension_approval',
        title: 'Pending Pension Approvals',
        message: `${pendingPensionsCount} pensions waiting for approval`,
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
