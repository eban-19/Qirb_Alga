const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

// Test email configuration
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }

    console.log('🧪 Testing email configuration...');
    console.log('📧 Sending test email to:', email);

    // Send test email
    await notificationService.sendEmail(
      email,
      'Pension System - Test Email',
      `
        <h2>🎉 Email Configuration Working!</h2>
        <p>This is a test email from the Pension Management System.</p>
        <p><strong>If you receive this email, email notifications are working correctly!</strong></p>
        <br>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
        <hr>
        <p><em>Pension Management System</em></p>
      `
    );

    console.log('✅ Test email sent successfully');
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully!' 
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email: ' + error.message 
    });
  }
});

// Test notification with email
router.post('/test-notification-email', async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId, title, and message are required' 
      });
    }

    console.log('🧪 Testing notification with email...');
    console.log('👤 User ID:', userId);
    console.log('📧 Title:', title);
    console.log('💬 Message:', message);

    // Create notification with email
    const notificationId = await notificationService.createAndSendNotification(
      userId,
      title,
      message,
      'test_notification',
      title
    );

    console.log('✅ Test notification with email sent successfully');
    
    res.json({ 
      success: true, 
      message: 'Test notification with email sent successfully!',
      notificationId 
    });

  } catch (error) {
    console.error('❌ Test notification with email failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test notification with email: ' + error.message 
    });
  }
});

module.exports = router;
