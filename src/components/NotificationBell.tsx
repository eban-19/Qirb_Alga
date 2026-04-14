import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, BellRing, X, Check, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import notificationService, { Notification } from '@/services/notificationService';
import websocketService from '@/services/websocketService';
import apiService from '@/services/api';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Toggle notification panel
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  // Close notification panel
  const closeNotifications = () => {
    setIsOpen(false);
  };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getNotifications(50);
      if (response.success) {
        let notifications = response.data.items || response.data || [];
        
        console.log('📥 Fetched notifications:', notifications);
        
        // Check if we have admin notifications (string IDs)
        const hasAdminNotifications = notifications.some((n: any) => typeof n.notification_id === 'string');
        console.log('🔍 Has admin notifications:', hasAdminNotifications);
        
        // Apply localStorage read state to admin notifications
        const readAdminNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '[]');
        console.log('💾 Read admin notifications from localStorage:', readAdminNotifications);
        
        notifications = notifications.map((n: any) => {
          if (typeof n.notification_id === 'string' && readAdminNotifications.includes(n.notification_id)) {
            console.log('✅ Marking as read from localStorage:', n.notification_id);
            return { ...n, is_read: 1 };
          }
          return n;
        });
        
        console.log('📊 Notifications after applying localStorage:', notifications);
        
        // Calculate unread count from filtered notifications (source of truth)
        const unreadCount = notifications.filter((n: any) => !n.is_read).length;
        console.log('🔢 Calculated unread count:', unreadCount);
        
        setNotifications(notifications);
        setUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number | string) => {
    try {
      console.log('🔔 Marking as read:', notificationId, 'Type:', typeof notificationId);
      
      // Check if notificationId is a string (admin notification) or number (regular notification)
      if (typeof notificationId === 'string') {
        // Admin notification - persist read state in localStorage
        const readAdminNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '[]');
        console.log('💾 Current read admin notifications before save:', readAdminNotifications);
        
        if (!readAdminNotifications.includes(notificationId)) {
          readAdminNotifications.push(notificationId);
          localStorage.setItem('readAdminNotifications', JSON.stringify(readAdminNotifications));
          console.log('💾 Saved to localStorage:', readAdminNotifications);
        } else {
          console.log('⚠️ Notification already in localStorage');
        }
        
        // Optimistic update
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            String(n.notification_id) === notificationId ? { ...n, is_read: 1 } : n
          )
        );
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      } else {
        // Regular notification - call backend API
        await apiService.markNotificationAsRead(notificationId);
        // Refresh notifications
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Mark all admin notifications as read in localStorage
      const adminNotifications = notifications.filter((n: any) => typeof n.notification_id === 'string');
      const adminNotificationIds = adminNotifications.map((n: any) => n.notification_id);
      const readAdminNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '[]');
      
      adminNotificationIds.forEach((id: string) => {
        if (!readAdminNotifications.includes(id)) {
          readAdminNotifications.push(id);
        }
      });
      localStorage.setItem('readAdminNotifications', JSON.stringify(readAdminNotifications));
      
      // Mark regular notifications as read via API
      await apiService.markAllNotificationsAsRead();
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Outside click detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        closeNotifications();
      }
    };

    // ESC key detection
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeNotifications();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // Close notification panel on route change
  useEffect(() => {
    closeNotifications();
  }, [location.pathname]);

  // Fetch notifications on component mount and when panel opens
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Refresh notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Initialize WebSocket connection (for real-time updates)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set up WebSocket event handlers
      websocketService.onNotification((notification) => {
        console.log('Real-time notification received:', notification);
        // Refresh notifications when new one arrives
        fetchNotifications();
      });

      websocketService.onUnreadCount((count) => {
        console.log('Real-time unread count update:', count);
        // Ensure count is a valid number, fallback to 0 if invalid
        const validCount = typeof count === 'number' && count >= 0 ? count : 0;
        setUnreadCount(validCount);
      });

      websocketService.onConnection((connected) => {
        console.log('Real-time connection status:', connected);
        setIsRealTimeConnected(connected);
      });

      websocketService.onError((error) => {
        console.error('WebSocket error:', error);
      });

      // Connect to WebSocket
      websocketService.connect(token);
    }

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleNotifications}
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
        <div 
          ref={notificationRef}
          className="absolute right-0 top-12 w-64 sm:w-80 md:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-[9999] max-h-80 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 origin-top-right"
          onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeNotifications}
                className="p-1 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="text-center p-6 sm:p-8 text-slate-500">
                  <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-slate-600 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm sm:text-base">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center p-6 sm:p-8 text-slate-500">
                  <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm sm:text-base">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`p-3 sm:p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => markAsRead(notification.notification_id)}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                        <div className="text-blue-600">{"\ud83d\udccb"}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-xs sm:text-sm font-medium text-slate-900 truncate ${
                            !notification.is_read ? 'font-semibold' : 'font-normal'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mb-1 line-clamp-2 sm:line-clamp-3">
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
              <div className="p-3 sm:p-4 border-t border-slate-200 space-y-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-slate-600 hover:text-slate-900"
                    onClick={markAllAsRead}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark all as read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-slate-600 hover:text-slate-900"
                  onClick={() => console.log('View all notifications')}
                >
                  View all notifications
                </Button>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default NotificationBell;
