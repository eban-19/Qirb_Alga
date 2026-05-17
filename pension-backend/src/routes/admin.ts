import * as express from 'express';
import prisma from '../lib/prisma';
import { Role, UserStatus, PensionStatus, BookingSource, ApprovalStatus, NotificationType } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import notificationService from '../services/notificationService';
import * as bcrypt from 'bcryptjs';

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
    const id = parseInt(ownerId.replace('OWN', ''));
    
    // Update both users table and ownerprofiles table in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { user_id: id, role: Role.Owner },
        data: { approved: 1, status: UserStatus.Approved }
      }),
      prisma.ownerProfile.upsert({
        where: { owner_id: id },
        update: { approval_status: ApprovalStatus.Approved },
        create: { 
          owner_id: id,
          approval_status: ApprovalStatus.Approved,
          business_name: 'Pending Setup',
          business_email: '',
          business_phone: '',
          license_number: ''
        }
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
    const id = parseInt(ownerId.replace('OWN', ''));
    
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
    const id = parseInt(ownerId.replace('OWN', ''));
    
    await prisma.user.update({
      where: { 
        user_id: id,
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

// Reactivate owner
router.put('/owners/:ownerId/reactivate', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const { ownerId } = req.params;
    const id = parseInt(ownerId.replace('OWN', ''));
    
    await prisma.user.update({
      where: { 
        user_id: id,
        role: Role.Owner
      },
      data: { approved: 1, status: UserStatus.Approved }
    });

    res.json({
      success: true,
      message: 'Owner reactivated successfully'
    });
  } catch (error: any) {
    console.error('Reactivate owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate owner'
    });
  }
});

// Delete owner
router.delete('/owners/:ownerId', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const { ownerId } = req.params;
    // Strip "OWN" prefix if present
    const id = parseInt(ownerId.replace('OWN', ''));
    
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid owner ID' });
    }

    await prisma.user.delete({
      where: { user_id: id, role: Role.Owner }
    });

    console.log(`🗑️ Owner ${id} deleted successfully`);

    res.json({
      success: true,
      message: 'Owner deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete owner'
    });
  }
});

// Bulk Owners Action
router.post('/owners/bulk', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const { action, ownerIds } = req.body;
    
    if (!action || !ownerIds || !Array.isArray(ownerIds) || ownerIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid bulk action payload' });
    }

    const ids = ownerIds.map((id: string) => parseInt(id.replace('OWN', ''))).filter((id: number) => !isNaN(id));

    if (action === 'delete') {
      await prisma.user.deleteMany({
        where: { user_id: { in: ids }, role: Role.Owner }
      });
    } else {
      let updateData: any = {};
      let profileData: any = {};
      
      switch (action) {
        case 'approve':
        case 'reactivate':
          updateData = { approved: 1, status: UserStatus.Approved };
          profileData = { approval_status: ApprovalStatus.Approved };
          break;
        case 'reject':
          updateData = { approved: 0 };
          profileData = { approval_status: ApprovalStatus.Rejected };
          break;
        case 'suspend':
          updateData = { approved: -1 };
          break;
        default:
          return res.status(400).json({ success: false, message: 'Invalid action' });
      }

      await prisma.user.updateMany({
        where: { user_id: { in: ids }, role: Role.Owner },
        data: updateData
      });

      if (Object.keys(profileData).length > 0) {
        await prisma.ownerProfile.updateMany({
          where: { owner_id: { in: ids } },
          data: profileData
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully executed ${action} on ${ids.length} owners`
    });
  } catch (error: any) {
    console.error('Bulk owners action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute bulk action'
    });
  }
});

// Get all properties for admin dashboard
router.get('/properties', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const properties = await prisma.pension.findMany({
      include: {
        owner: { select: { full_name: true, email: true, user_id: true } },
        _count: { select: { rooms: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedProperties = properties.map((property) => ({
      id: property.pension_id.toString(),
      name: property.name,
      address: property.address,
      description: property.description,
      phone: property.phone,
      email: property.email,
      capacity: property.capacity,
      image_url: property.image_url,
      ownerId: property.owner_id.toString(),
      ownerName: property.owner.full_name,
      ownerEmail: property.owner.email,
      status: property.status || 'pending',
      roomsCount: property._count.rooms,
      occupancyRate: 0,
      monthlyRevenue: 0,
      rating: 0,
      registeredDate: property.created_at,
      created_at: property.created_at,
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
            pension: {
              select: {
                name: true,
                pension_id: true,
                owner_id: true,
                owner: { select: { full_name: true, email: true } }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 200
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.booking_id.toString(),
      propertyName: booking.room?.pension?.name || 'Unknown Property',
      pensionId: booking.room?.pension?.pension_id?.toString() || null,
      ownerId: booking.room?.pension?.owner_id?.toString() || null,
      ownerName: booking.room?.pension?.owner?.full_name || 'Unknown Owner',
      ownerEmail: booking.room?.pension?.owner?.email || '',
      guestName: booking.customer?.full_name || 'Guest',
      guestEmail: booking.customer?.email || 'N/A',
      guestPhone: booking.customer?.phone || 'N/A',
      checkIn: booking.check_in_date,
      checkOut: booking.check_out_date,
      totalPrice: booking.total_price,
      status: booking.status,
      paymentStatus: booking.status === 'Confirmed' ? 'paid' : 'pending',
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

      // Send email notification to owner (non-blocking)
      try {
        await notificationService.sendEmailNotification({
          user_id: ownerId,
          subject: 'Your Pension Has Been Approved',
          message: `Congratulations! Your pension "${pensionName}" has been approved by the admin and is now live on the platform.\n\nYou can start receiving bookings from customers.`
        });
      } catch (emailError: any) {
        console.error('⚠️ Failed to send pension approval email:', emailError.message);
      }
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

      // Send email notification to owner (non-blocking)
      try {
        await notificationService.sendEmailNotification({
          user_id: ownerId,
          subject: 'Update Regarding Your Pension Application',
          message: `Your pension "${pensionName}" has been reviewed by the admin and unfortunately was not approved at this time.\n\nReason: ${rejectionReason || 'Does not meet current platform requirements'}\n\nYou can update your pension details and submit for approval again.`
        });
      } catch (emailError: any) {
        console.error('⚠️ Failed to send pension rejection email:', emailError.message);
      }
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

// Suspend pension
router.put('/pensions/:pensionId/suspend', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const { pensionId } = req.params;

    await prisma.pension.update({
      where: { pension_id: parseInt(pensionId) },
      data: {
        status: PensionStatus.inactive,
        reviewed_by: req.user.userId,
        reviewed_at: new Date()
      }
    });

    const pension = await prisma.pension.findUnique({
      where: { pension_id: parseInt(pensionId) },
      select: { name: true, owner_id: true }
    });

    if (pension) {
      await notificationService.createNotification({
        user_id: pension.owner_id,
        title: 'Pension Suspended',
        message: `Your pension "${pension.name}" has been suspended by the admin. Please contact support for more information.`,
        type: 'pension_rejected'
      });
      try {
        await notificationService.sendEmailNotification({
          user_id: pension.owner_id,
          subject: 'Your Pension Has Been Suspended',
          message: `Your pension "${pension.name}" has been suspended by the platform administrator. Please contact our support team for more information or to appeal this decision.`
        });
      } catch (emailError: any) {
        console.error('Failed to send suspension email:', emailError.message);
      }
    }

    res.json({ success: true, message: 'Pension suspended successfully' });
  } catch (error: any) {
    console.error('Suspend pension error:', error);
    res.status(500).json({ success: false, message: 'Failed to suspend pension' });
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

// Bulk Pensions Action
router.post('/pensions/bulk', authenticateToken as any, requireAdmin as any, async (req: any, res: express.Response) => {
  try {
    const { action, pensionIds, rejectionReason } = req.body;

    if (!action || !pensionIds || !Array.isArray(pensionIds) || pensionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid bulk action payload' });
    }

    let updateData: any = {};
    switch (action) {
      case 'approve':
        updateData = {
          status: PensionStatus.active,
          reviewed_by: req.user.userId,
          reviewed_at: new Date()
        };
        break;
      case 'reject':
        updateData = {
          status: PensionStatus.inactive,
          rejection_reason: rejectionReason || 'Bulk rejected',
          reviewed_by: req.user.userId,
          reviewed_at: new Date()
        };
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await prisma.pension.updateMany({
      where: { pension_id: { in: pensionIds } },
      data: updateData
    });

    res.json({
      success: true,
      message: `Successfully executed ${action} on ${pensionIds.length} pensions`
    });
  } catch (error: any) {
    console.error('Bulk pensions action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute bulk action'
    });
  }
});

// Get admin metrics
router.get('/metrics', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const now = new Date();
    // Build last 6 months date boundaries
    const months: { label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const label = start.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      months.push({ label, start, end });
    }

    const [
      ownersCount,
      propertiesCount,
      bookingsCount,
      totalUsersCount,
      pendingCount,
      pendingPensionsCount,
      activePropertiesCount
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.Owner } }),
      prisma.pension.count(),
      prisma.booking.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.Owner, approved: { not: 1 } } }),
      prisma.pension.count({ where: { status: PensionStatus.pending } }),
      prisma.pension.count({ where: { status: PensionStatus.active } })
    ]);

    // Build monthly bookings analytics
    const monthlyAnalytics = await Promise.all(
      months.map(async (m) => {
        const count = await prisma.booking.count({
          where: { created_at: { gte: m.start, lte: m.end } }
        });
        const revenueAgg = await prisma.booking.aggregate({
          where: { created_at: { gte: m.start, lte: m.end } },
          _sum: { total_price: true }
        });
        return {
          month: m.label,
          bookings: count,
          revenue: Number(revenueAgg._sum.total_price || 0)
        };
      })
    );

    const metrics = {
      totalOwners: ownersCount,
      totalProperties: propertiesCount,
      totalBookings: bookingsCount,
      totalUsers: totalUsersCount,
      monthlyRevenue: 0,
      occupancyRate: 0,
      pendingVerifications: pendingCount,
      pendingPensions: pendingPensionsCount,
      activeProperties: activePropertiesCount,
      averageRating: 0,
      monthlyAnalytics
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

// Get all customers
router.get('/customers', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: Role.Customer },
      include: {
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedCustomers = customers.map(c => ({
      id: c.user_id.toString(),
      name: c.full_name || 'Unknown',
      email: c.email,
      phone: c.phone || '',
      status: c.status === 'Approved' ? 'active' : c.status.toLowerCase(),
      totalBookings: c._count.bookings,
      joinedAt: c.created_at
    }));

    res.json({
      success: true,
      data: formattedCustomers
    });
  } catch (error: any) {
    console.error('Get customers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
});

// Get all staffs
router.get('/staffs', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const staffs = await prisma.user.findMany({
      where: { role: Role.Admin },
      orderBy: { created_at: 'desc' }
    });

    const formattedStaffs = staffs.map(s => ({
      id: s.user_id.toString(),
      name: s.full_name || 'Unknown',
      email: s.email,
      phone: s.phone || '',
      role: s.admin_role || 'superAdmin',
      status: s.status === 'Approved' ? 'active' : s.status.toLowerCase(),
      joinedAt: s.created_at
    }));

    res.json({
      success: true,
      data: formattedStaffs
    });
  } catch (error: any) {
    console.error('Get staffs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staffs' });
  }
});

// Add new staff
router.post('/staffs', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const { name, email, role, phone } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('Admin@123', salt);

    const newStaff = await prisma.user.create({
      data: {
        full_name: name,
        email,
        phone: phone || null,
        password_hash,
        role: Role.Admin,
        admin_role: role,
        status: UserStatus.Approved,
        approved: 1
      }
    });

    res.json({
      success: true,
      message: 'Staff added successfully. Default password is Admin@123',
      data: {
        id: newStaff.user_id.toString(),
        name: newStaff.full_name,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.admin_role,
        status: 'active',
        joinedAt: newStaff.created_at
      }
    });
  } catch (error: any) {
    console.error('Add staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to add staff' });
  }
});

export default router;
