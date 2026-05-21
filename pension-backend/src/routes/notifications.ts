import * as express from 'express';
import notificationService from '../services/notificationService';
import { authenticateToken } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role, PensionStatus } from '@prisma/client';

// Helper: check if a user is admin by role string
const isAdminRole = (role: string): boolean =>
  role === 'admin' || role === Role.Admin;

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit as string) || 50;
    
    let notifications: any[] = [];
    let unreadCount = 0;
    
    // Check if user is admin
    if (userRole === 'admin' || userRole === Role.Admin) {
      // Return admin-specific notifications (pending owners, pending pensions)
      
      // Get pending owners as individual notification items
      const pendingOwners = await prisma.user.findMany({
        where: { 
          role: Role.Owner,
          approved: { not: 1 }
        },
        orderBy: { created_at: 'desc' },
        take: limit
      });

      pendingOwners.forEach((owner) => {
        notifications.push({
          notification_id: `owner_${owner.user_id}`,
          user_id: userId,
          title: 'Pending Owner Verification',
          message: `${owner.full_name} (${owner.email}) is waiting for approval`,
          type: 'owner_verification',
          is_read: 0,
          created_at: owner.created_at
        });
      });

      // Get pending pensions as individual notification items
      const pendingPensions = await prisma.pension.findMany({
        where: { status: PensionStatus.pending },
        include: { owner: { select: { full_name: true } } },
        orderBy: { created_at: 'desc' },
        take: limit
      });

      pendingPensions.forEach((pension) => {
        notifications.push({
          notification_id: `pension_${pension.pension_id}`,
          user_id: userId,
          title: 'Pending Pension Approval',
          message: `${pension.name} by ${pension.owner?.full_name || 'Unknown'} is waiting for approval`,
          type: 'pension_approval',
          is_read: 0,
          created_at: pension.created_at
        });
      });

      // Calculate unread count
      unreadCount = notifications.filter((n: any) => n.is_read === 0).length;
      
    } else {
      // Return standard user notifications
      notifications = await notificationService.getUserNotifications(userId, limit);
      unreadCount = await notificationService.getUnreadCount(userId);
    }
    
    res.json({
      success: true,
      data: notifications,
      unreadCount: unreadCount
    });
  } catch (error: any) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get unread notification count (role-based)
router.get('/unread-count', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;
    let unreadCount = 0;

    if (isAdminRole(userRole)) {
      // Admin unread count = total pending owners + pending pensions
      const [pendingOwners, pendingPensions] = await Promise.all([
        prisma.user.count({
          where: { role: Role.Owner, approved: { not: 1 } }
        }),
        prisma.pension.count({
          where: { status: PensionStatus.pending }
        })
      ]);
      unreadCount = pendingOwners + pendingPensions;
    } else {
      unreadCount = await notificationService.getUnreadCount(userId);
    }

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error: any) {
    console.error('❌ Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

// Mark notification as read (role-based)
// Admin notifications use string IDs (e.g. 'owner_5', 'pension_12') and are
// tracked client-side; this endpoint is a no-op for those but still returns success.
router.put('/:notificationId/read', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;
    const { notificationId } = req.params;

    if (isAdminRole(userRole)) {
      // Admin notification IDs are strings (e.g. 'owner_5') — tracked on client.
      // Nothing to update in DB. Return success so the UI can proceed.
      return res.json({
        success: true,
        message: 'Admin notification acknowledged'
      });
    }

    const numericId = parseInt(notificationId);
    if (isNaN(numericId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    await notificationService.markAsRead(numericId, userId);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error: any) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read (role-based)
// Admin notifications are dynamic (not in DB), so we return success immediately
// and let the client persist read state in localStorage.
router.put('/mark-all-read', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;

    if (isAdminRole(userRole)) {
      // Admin notifications are not persisted in DB — client handles read state.
      return res.json({
        success: true,
        message: 'All admin notifications acknowledged'
      });
    }

    await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error: any) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Test notification endpoint (for development)
router.post('/test', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { title, message, type } = req.body;
    
    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, and type are required'
      });
    }
    
    await notificationService.createNotification({
      user_id: userId,
      title,
      message,
      type
    });
    
    res.json({
      success: true,
      message: 'Test notification sent successfully'
    });
  } catch (error: any) {
    console.error('❌ Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

export default router;
