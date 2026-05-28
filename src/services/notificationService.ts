import apiService from './api';

export interface Notification {
  notification_id: number | string;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  unreadCount?: number;
}

class NotificationService {
  /**
   * Get user notifications
   */
  async getNotifications(limit: number = 50): Promise<NotificationResponse> {
    try {
      const response = await apiService.getNotifications(limit);
      return response;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ success: boolean; data: { unreadCount: number } }> {
    try {
      const response = await apiService.getUnreadCount();
      return response;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      return response;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      return response;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Send test notification (for development)
   */
  async sendTestNotification(title: string, message: string, type: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.sendTestNotification(title, message, type);
      return response;
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      throw error;
    }
  }

  /**
   * Format notification time
   */
  formatNotificationTime(createdAt: string): string {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return notificationTime.toLocaleDateString();
    }
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'business_approval': '🎉',
      'new_booking': '🏨',
      'payment_received': '💰',
      'room_status_change': '🏠',
      'booking_cancelled': '❌',
      'booking_modified': '✏️',
      'guest_review': '⭐',
      'system_alert': '⚠️'
    };

    return iconMap[type] || '📢';
  }

  /**
   * Get notification color based on type
   */
  getNotificationColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'business_approval': 'text-green-600 bg-green-50 border-green-200',
      'new_booking': 'text-blue-600 bg-blue-50 border-blue-200',
      'payment_received': 'text-emerald-600 bg-emerald-50 border-emerald-200',
      'room_status_change': 'text-purple-600 bg-purple-50 border-purple-200',
      'booking_cancelled': 'text-red-600 bg-red-50 border-red-200',
      'booking_modified': 'text-amber-600 bg-amber-50 border-amber-200',
      'guest_review': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'system_alert': 'text-slate-600 bg-slate-50 border-slate-200'
    };

    return colorMap[type] || 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export default new NotificationService();
