import prisma from '../lib/prisma';
import { NotificationType } from '@prisma/client';
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

interface EmailNotificationData {
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
      await prisma.notification.create({
        data: {
          user_id: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.type as NotificationType
        }
      });
      
      // If User is connected via WebSocket, send real-time notification
      if (wsServer.isUserConnected(notification.user_id)) {
        wsServer.sendNotificationToUser(notification.user_id, notification);
      }
      
      console.log(`✅ Notification created for user ${notification.user_id}: ${notification.title}`);
    } catch (error: any) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(emailNotification: EmailNotificationData): Promise<void> {
    if (!transporter) {
      console.warn('⚠️ Email transporter not configured, skipping email notification.');
      return;
    }

    try {
      // Fetch user email
      const user = await prisma.user.findUnique({
        where: { user_id: emailNotification.user_id },
        select: { email: true }
      });

      if (!user || !user.email) {
        console.error(`❌ User with ID ${emailNotification.user_id} not found for email notification.`);
        return;
      }

      // Load email template
      const templatePath = path.join(__dirname, '../../emails/notification.html');
      let emailContent: string;

      try {
        let emailTemplate = fs.readFileSync(templatePath, 'utf8');
        // Replace placeholders
        emailTemplate = emailTemplate.replace('{{subject}}', emailNotification.subject);
        emailTemplate = emailTemplate.replace('{{message}}', emailNotification.message);
        emailTemplate = emailTemplate.replace('{{year}}', new Date().getFullYear().toString());
        emailContent = emailTemplate;
      } catch (templateError: any) {
        console.warn('⚠️ Email template not found, sending plain text email');
        emailContent = emailNotification.message;
      }

      await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: user.email,
        subject: emailNotification.subject,
        text: emailNotification.message,
        html: emailContent.includes('<') ? emailContent : undefined
      });

      if (emailNotification.email_id) {
        await prisma.emailNotification.update({
          where: { email_id: emailNotification.email_id },
          data: { status: 'Sent', sent_at: new Date() }
        });
      }

      console.log(`✅ Email notification sent to ${user.email}`);
    } catch (error: any) {
      console.error('❌ Error sending email notification:', error);
      if (emailNotification.email_id) {
        await prisma.emailNotification.update({
          where: { email_id: emailNotification.email_id },
          data: { status: 'Failed' }
        });
      }
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: number, limit: number = 50): Promise<any[]> {
    try {
      return await prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: limit
      });
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
      return await prisma.notification.count({
        where: { 
          user_id: userId,
          is_read: false
        }
      });
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
      await prisma.notification.updateMany({
        where: { 
          notification_id: notificationId,
          user_id: userId
        },
        data: { is_read: true }
      });
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
      await prisma.notification.updateMany({
        where: { 
          user_id: userId,
          is_read: false
        },
        data: { is_read: true }
      });
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
      await prisma.notification.deleteMany({
        where: { 
          notification_id: notificationId,
          user_id: userId
        }
      });
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
      const booking = await prisma.booking.findUnique({
        where: { booking_id: bookingId },
        include: {
          customer: { select: { full_name: true, user_id: true } },
          room: {
            include: {
              pension: { select: { name: true, owner_id: true } }
            }
          }
        }
      });
      
      if (!booking) {
        console.error(`❌ Booking ${bookingId} not found`);
        return;
      }

      let title = '';
      let message = '';
      let notifyOwner = false;
      let notifyCustomer = false;

      switch (type) {
        case 'created':
          title = 'New Booking Request';
          message = `New booking request for ${booking.room?.room_type} (${booking.room?.room_number}) from ${booking.check_in_date?.toLocaleDateString()} to ${booking.check_out_date?.toLocaleDateString()}`;
          notifyOwner = true;
          break;
        case 'confirmed':
          title = 'Booking Confirmed';
          message = `Your booking for ${booking.room?.pension.name} has been confirmed`;
          notifyCustomer = true;
          break;
        case 'cancelled':
          title = 'Booking Cancelled';
          message = `Booking for ${booking.room?.pension.name} has been cancelled`;
          notifyCustomer = true;
          notifyOwner = true;
          break;
        case 'completed':
          title = 'Booking Completed';
          message = `Your stay at ${booking.room?.pension.name} is complete. Please leave a review!`;
          notifyCustomer = true;
          break;
      }

      if (notifyOwner && booking.room?.pension.owner_id) {
        await this.createNotification({
          user_id: booking.room.pension.owner_id,
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
      const review = await prisma.review.findUnique({
        where: { review_id: reviewId },
        include: {
          customer: { select: { full_name: true } },
          pension: { select: { name: true, owner_id: true } }
        }
      });
      
      if (!review) {
        console.error(`❌ Review ${reviewId} not found`);
        return;
      }

      const title = 'New Review';
      const message = `New ${review.rating}-star review from ${review.customer?.full_name}: "${review.comment?.substring(0, 100)}..."`;

      if (review.pension?.owner_id) {
        await this.createNotification({
          user_id: review.pension.owner_id,
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
