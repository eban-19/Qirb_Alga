import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X, Check, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import notificationService, { Notification } from '@/services/notificationService';
import websocketService from '@/services/websocketService';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set up WebSocket event handlers
      websocketService.onNotification((notification) => {
        console.log('🔔 Real-time notification received in UI:', notification);
        // Add new notification to the list
        setNotifications(prev => [notification, ...prev]);
        // Increment unread count
        setUnreadCount(prev => prev + 1);
      });

      websocketService.onUnreadCount((count) => {
        console.log('📊 Real-time unread count update:', count);
        setUnreadCount(count);
      });

      websocketService.onConnection((connected) => {
        console.log('🔌 Real-time connection status:', connected);
        setIsRealTimeConnected(connected);
      });

      websocketService.onError((error) => {
        console.error('❌ WebSocket error:', error);
      });

      // Connect to WebSocket
      websocketService.connect(token);
    }

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchUnreadCount();
    
    // Set up polling for new notifications (every 30 seconds)
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(20);
      console.log('🔔 Notifications API response:', response);
      if (response.success) {
        setNotifications(response.data);
        console.log('🔔 Notifications data set:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      console.log('🔔 Unread count API response:', response);
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
        console.log('🔔 Unread count set:', response.data.unreadCount);
      }
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      // Use WebSocket for real-time marking if connected
      if (isRealTimeConnected) {
        websocketService.markNotificationAsRead(notificationId);
        console.log('🚀 Marked notification as read via WebSocket');
      } else {
        // Fallback to API
        await notificationService.markAsRead(notificationId);
        console.log('📡 Marked notification as read via API');
      }
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(n => 
          n.notification_id === notificationId 
            ? { ...n, is_read: 1 }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: 1 }))
      );
      
      // Update unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'business_approval': <div className="text-green-600">🎉</div>,
      'new_booking': <div className="text-blue-600">🏨</div>,
      'payment_received': <div className="text-emerald-600">💰</div>,
      'room_status_change': <div className="text-purple-600">🏠</div>,
      'booking_cancelled': <div className="text-red-600">❌</div>,
      'booking_modified': <div className="text-amber-600">✏️</div>,
      'guest_review': <div className="text-yellow-600">⭐</div>,
      'system_alert': <div className="text-slate-600">⚠️</div>
    };

    return iconMap[type] || <div className="text-slate-600">📢</div>;
  };

  const getNotificationColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'business_approval': 'border-green-200 bg-green-50 hover:bg-green-100',
      'new_booking': 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      'payment_received': 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
      'room_status_change': 'border-purple-200 bg-purple-50 hover:bg-purple-100',
      'booking_cancelled': 'border-red-200 bg-red-50 hover:bg-red-100',
      'booking_modified': 'border-amber-200 bg-amber-50 hover:bg-amber-100',
      'guest_review': 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
      'system_alert': 'border-slate-200 bg-slate-50 hover:bg-slate-100'
    };

    return colorMap[type] || 'border-slate-200 bg-slate-50 hover:bg-slate-100';
  };

  const formatTime = (createdAt: string) => {
    return notificationService.formatNotificationTime(createdAt);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('🔔 Notification bell clicked, current isOpen:', isOpen);
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative p-2 hover:bg-slate-100 transition-colors"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-slate-700" />
        ) : (
          <Bell className="h-5 w-5 text-slate-600" />
        )}
        {/* Real-time connection indicator */}
        <div 
          className={`absolute top-0 right-0 w-2 h-2 rounded-full ${
            isRealTimeConnected ? 'bg-green-500' : 'bg-gray-300'
          }`}
          title={isRealTimeConnected ? 'Real-time connected' : 'Real-time disconnected'}
        />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {console.log('🔔 Dropdown should be visible, isOpen:', isOpen)}
          <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center p-8 text-slate-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                      notification.is_read === 0 ? getNotificationColor(notification.type) : 'hover:bg-slate-50'
                    }`}
                    onClick={() => notification.is_read === 0 && markAsRead(notification.notification_id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium text-slate-900 ${
                            notification.is_read === 0 ? 'font-semibold' : 'font-normal'
                          }`}>
                            {notification.title}
                          </h4>
                          {notification.is_read === 0 && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Navigate to full notifications page (if implemented)
                    setIsOpen(false);
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-700"
                >
                  View all notifications
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
