import { executeQuery } from '../config/database';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import wsServer from '../websocket';

// Email transporter configuration (only if SMTP is configured)
let transporter: any = null;
if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
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

interface Notification {
  user_id: number;
  title: string;
  message: string;
  type: string;
}

interface EmailNotification {
  user_id: number;
  subject: string;
  message: string;
  email_id?: number;
}

/**
 * Create notification service
 */
class NotificationService {
  /**
   * Create in-app notification
   */
  async createNotification(notification: Notification): Promise<void> {
    try {
      const query = `
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
      `;
      await executeQuery(query, [notification.user_id, notification.title, notification.message, notification.type]);
      
      // If user is connected via WebSocket, send real-time notification
      if (wsServer.isUserConnected(notification.user_id)) {
        wsServer.sendNotificationToUser(notification.user_id, notification);
      }
    } catch (error: any) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(emailNotification: EmailNotification): Promise<void> {
    if (!transporter) {
      console.warn('⚠️ Email transporter not configured, skipping email notification.');
      return;
    }

    try {
      // Fetch user email
      const users = await executeQuery('SELECT email FROM users WHERE user_id = ?', [emailNotification.user_id]);
      if (users.length === 0) {
        console.error(`❌ User with ID ${emailNotification.user_id} not found for email notification.`);
        return;
      }
      const userEmail = users[0].email;

      // Load email template
      const templatePath = path.join(__dirname, '../../emails/notification.html');
      let emailTemplate = fs.readFileSync(templatePath, 'utf8');

      // Replace placeholders
      emailTemplate = emailTemplate.replace('{{subject}}', emailNotification.subject);
      emailTemplate = emailTemplate.replace('{{message}}', emailNotification.message);
      emailTemplate = emailTemplate.replace('{{year}}', new Date().getFullYear().toString());

      await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: userEmail,
        subject: emailNotification.subject,
        html: emailTemplate
      });

      if (emailNotification.email_id) {
        const updateQuery = 'UPDATE email_notifications SET status = "Sent", sent_at = NOW() WHERE email_id = ?';
        await executeQuery(updateQuery, [emailNotification.email_id]);
      }

      console.log(`✅ Email notification sent to ${userEmail}`);
    } catch (error: any) {
      console.error('❌ Error sending email notification:', error);
      if (emailNotification.email_id) {
        const updateQuery = 'UPDATE email_notifications SET status = "Failed" WHERE email_id = ?';
        await executeQuery(updateQuery, [emailNotification.email_id]);
      }
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: number, limit: number = 50): Promise<any[]> {
    try {
      const query = `
        SELECT notification_id, user_id, title, message, type, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `;
      return await executeQuery(query, [userId, limit]);
    } catch (error: any) {
      console.error('❌ Error getting user notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: number): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count FROM notifications 
        WHERE user_id = ? AND is_read = 0
      `;
      const result = await executeQuery(query, [userId]);
      return result[0]?.count || 0;
    } catch (error: any) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: number): Promise<void> {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = 1 
        WHERE notification_id = ? AND user_id = ?
      `;
      await executeQuery(query, [notificationId, userId]);
    } catch (error: any) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: number): Promise<void> {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = 1 
        WHERE user_id = ? AND is_read = 0
      `;
      await executeQuery(query, [userId]);
    } catch (error: any) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    try {
      const query = `
        DELETE FROM notifications 
        WHERE notification_id = ? AND user_id = ?
      `;
      await executeQuery(query, [notificationId, userId]);
    } catch (error: any) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Create booking notification
   */
  async createBookingNotification(bookingId: number, type: 'created' | 'confirmed' | 'cancelled' | 'completed'): Promise<void> {
    try {
      // Get booking details
      const bookingQuery = `
        SELECT b.*, u.full_name as customer_name, u.email as customer_email,
               p.name as pension_name, p.owner_id,
               r.room_type, r.room_number
        FROM bookings b
        LEFT JOIN users u ON b.customer_id = u.user_id
        LEFT JOIN rooms r ON b.room_id = r.room_id
        LEFT JOIN pensions p ON r.pension_id = p.pension_id
        WHERE b.booking_id = ?
      `;
      const bookings = await executeQuery(bookingQuery, [bookingId]);
      
      if (bookings.length === 0) {
        console.error(`❌ Booking ${bookingId} not found`);
        return;
      }

      const booking = bookings[0];

      let title = '';
      let message = '';
      let notifyOwner = false;
      let notifyCustomer = false;

      switch (type) {
        case 'created':
          title = 'New Booking Request';
          message = `New booking request for ${booking.room_type} (${booking.room_number}) from ${booking.check_in_date} to ${booking.check_out_date}`;
          notifyOwner = true;
          break;
        case 'confirmed':
          title = 'Booking Confirmed';
          message = `Your booking for ${booking.pension_name} has been confirmed`;
          notifyCustomer = true;
          break;
        case 'cancelled':
          title = 'Booking Cancelled';
          message = `Booking for ${booking.pension_name} has been cancelled`;
          notifyCustomer = true;
          notifyOwner = true;
          break;
        case 'completed':
          title = 'Booking Completed';
          message = `Your stay at ${booking.pension_name} is complete. Please leave a review!`;
          notifyCustomer = true;
          break;
      }

      if (notifyOwner && booking.owner_id) {
        await this.createNotification({
          user_id: booking.owner_id,
          title,
          message,
          type: 'booking'
        });
      }

      if (notifyCustomer && booking.customer_id) {
        await this.createNotification({
          user_id: booking.customer_id,
          title,
          message,
          type: 'booking'
        });
      }

    } catch (error: any) {
      console.error('❌ Error creating booking notification:', error);
      throw error;
    }
  }

  /**
   * Create review notification
   */
  async createReviewNotification(reviewId: number): Promise<void> {
    try {
      // Get review details
      const reviewQuery = `
        SELECT r.*, u.full_name as reviewer_name,
               p.name as pension_name, p.owner_id
        FROM reviews r
        LEFT JOIN users u ON r.customer_id = u.user_id
        LEFT JOIN pensions p ON r.pension_id = p.pension_id
        WHERE r.review_id = ?
      `;
      const reviews = await executeQuery(reviewQuery, [reviewId]);
      
      if (reviews.length === 0) {
        console.error(`❌ Review ${reviewId} not found`);
        return;
      }

      const review = reviews[0];

      const title = 'New Review';
      const message = `New ${review.rating}-star review from ${review.reviewer_name}: "${review.comment.substring(0, 100)}..."`;

      if (review.owner_id) {
        await this.createNotification({
          user_id: review.owner_id,
          title,
          message,
          type: 'review'
        });
      }

    } catch (error: any) {
      console.error('❌ Error creating review notification:', error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
