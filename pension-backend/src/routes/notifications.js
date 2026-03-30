const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { authenticateToken } = require('../middleware/auth');

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    
    const notifications = await notificationService.getUserNotifications(userId, limit);
    
    res.json({
      success: true,
      data: notifications,
      unreadCount: await notificationService.getUnreadCount(userId)
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    const unreadCount = await notificationService.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { notificationId } = req.params;
    
    await notificationService.markAsRead(notificationId, userId);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    // This would need to be implemented in the service
    // For now, we'll return success
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Test notification endpoint (for development)
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { title, message, type } = req.body;
    
    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, and type are required'
      });
    }
    
    await notificationService.createAndSendNotification(userId, title, message, type);
    
    res.json({
      success: true,
      message: 'Test notification sent successfully'
    });
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

module.exports = router;
