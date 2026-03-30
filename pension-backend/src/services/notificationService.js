const { executeQuery } = require('../config/database');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const wsServer = require('../websocket');

// Email transporter configuration (only if SMTP is configured)
let transporter = null;
if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });
  console.log('✅ Email transporter configured');
} else {
  console.log('⚠️ Email not configured - notifications will be in-app only');
}

/**
 * Create notification service
 */
class NotificationService {
  /**
   * Create in-app notification
   */
  async createNotification(userId, title, message, type) {
    try {
      const query = `
        INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, ?, 0, NOW())
      `;
      
      const result = await executeQuery(query, [userId, title, message, type]);
      console.log('✅ In-app notification created:', result.insertId);

      // Get the full notification data for real-time sending
      const notificationData = await executeQuery(
        'SELECT * FROM notifications WHERE notification_id = ?',
        [result.insertId]
      );

      if (notificationData.length > 0) {
        const notification = notificationData[0];
        
        // Send real-time notification via WebSocket
        wsServer.sendNotificationToUser(userId, {
          notification_id: notification.notification_id,
          user_id: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: notification.is_read,
          created_at: notification.created_at
        });

        console.log('🚀 Real-time notification sent to user:', userId);
      }

      return result.insertId;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create email notification
   */
  async createEmailNotification(userId, subject, message) {
    try {
      const query = `
        INSERT INTO emailnotifications (user_id, subject, message, status, created_at)
        VALUES (?, ?, ?, 'Pending', NOW())
      `;
      
      const result = await executeQuery(query, [userId, subject, message]);
      console.log('✅ Email notification created:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('❌ Error creating email notification:', error);
      throw error;
    }
  }

  /**
   * Send email
   */
  async sendEmail(to, subject, message) {
    if (!transporter) {
      console.log('⚠️ Email not configured - skipping email send');
      return { messageId: 'email-not-configured' };
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: to,
        subject: subject,
        html: message
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  /**
   * Get user email
   */
  async getUserEmail(userId) {
    try {
      const query = 'SELECT email FROM users WHERE user_id = ?';
      const result = await executeQuery(query, [userId]);
      return result[0]?.email;
    } catch (error) {
      console.error('❌ Error getting user email:', error);
      throw error;
    }
  }

  /**
   * Create and send notification (both in-app and email)
   */
  async createAndSendNotification(userId, title, message, type, emailSubject = null) {
    try {
      // Create in-app notification
      const notificationId = await this.createNotification(userId, title, message, type);

      // Get user email
      const userEmail = await this.getUserEmail(userId);
      if (!userEmail) {
        console.log('⚠️ No email found for user:', userId);
        return notificationId;
      }

      // Create email notification
      const emailSubject = title;
      const emailId = await this.createEmailNotification(userId, emailSubject, message);

      // Send email (only if configured)
      if (transporter) {
        try {
          await this.sendEmail(userEmail, emailSubject, message);
          
          // Update email status to Sent
          await this.updateEmailStatus(emailId, 'Sent');
          console.log('✅ Notification sent successfully (in-app + email)');
        } catch (emailError) {
          // Update email status to Failed
          await this.updateEmailStatus(emailId, 'Failed');
          console.log('⚠️ In-app notification created, but email failed');
        }
      } else {
        // Mark email as skipped
        await this.updateEmailStatus(emailId, 'Failed');
        console.log('⚠️ In-app notification created, email not configured');
      }

      return notificationId;
    } catch (error) {
      console.error('❌ Error in createAndSendNotification:', error);
      throw error;
    }
  }

  /**
   * Update email status
   */
  async updateEmailStatus(emailId, status) {
    try {
      const query = `
        UPDATE emailnotifications 
        SET status = ?, sent_at = NOW() 
        WHERE email_id = ?
      `;
      await executeQuery(query, [status, emailId]);
    } catch (error) {
      console.error('❌ Error updating email status:', error);
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, limit = 50) {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      const result = await executeQuery(query, [userId, limit]);
      return result;
    } catch (error) {
      console.error('❌ Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = 1 
        WHERE notification_id = ? AND user_id = ?
      `;
      await executeQuery(query, [notificationId, userId]);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count FROM notifications 
        WHERE user_id = ? AND is_read = 0
      `;
      const result = await executeQuery(query, [userId]);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }
}

module.exports = new NotificationService();
