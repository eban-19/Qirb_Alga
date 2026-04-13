import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, BellRing, X, Check, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import notificationService, { Notification } from '@/services/notificationService';
import websocketService from '@/services/websocketService';

interface SystemAlert {
  id: string;
  type: "verification" | "payment" | "complaint" | "system";
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "resolved" | "investigating";
  createdAt: string;
  relatedEntity?: string;
  entityType?: "owner" | "property" | "booking" | "guest";
}

interface NotificationBellProps {
  className?: string;
  alerts?: SystemAlert[];
  onAlertClick?: (alertId: string) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '', alerts = [], onAlertClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Calculate unread count from alerts
  const unreadCount = alerts.filter(alert => alert?.status === 'open').length;

  // Handle alert click to mark as read
  const handleAlertClick = (alert: SystemAlert) => {
    if (alert.status === 'open' && onAlertClick) {
      onAlertClick(alert.id);
    }
  };

  // Toggle notification panel
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  // Close notification panel
  const closeNotifications = () => {
    setIsOpen(false);
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

  // Initialize WebSocket connection (for future real-time updates)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set up WebSocket event handlers
      websocketService.onNotification((notification) => {
        console.log('Real-time notification received:', notification);
      });

      websocketService.onUnreadCount((count) => {
        console.log('Real-time unread count update:', count);
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

  const getAlertIcon = (type: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'verification': <div className="text-blue-600">{"\ud83d\udd10"}</div>,
      'payment': <div className="text-green-600">{"\ud83d\udcb0"}</div>,
      'complaint': <div className="text-red-600">{"\u26a0\ufe0f"}</div>,
      'system': <div className="text-slate-600">{"\ud83d\udcca"}</div>
    };

    return iconMap[type] || <div className="text-slate-600">{"\ud83d\udce2"}</div>;
  };

  const getAlertColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'verification': 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      'payment': 'border-green-200 bg-green-50 hover:bg-green-100',
      'complaint': 'border-red-200 bg-red-50 hover:bg-red-100',
      'system': 'border-slate-200 bg-slate-50 hover:bg-slate-100'
    };

    return colorMap[type] || 'border-slate-200 bg-slate-50 hover:bg-slate-100';
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
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

            {/* Alerts List */}
            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center p-6 sm:p-8 text-slate-500">
                  <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm sm:text-base">No notifications yet</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 sm:p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                      alert.status === 'open' ? getAlertColor(alert.type) : 'hover:bg-slate-50'
                    }`}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-xs sm:text-sm font-medium text-slate-900 truncate ${
                            alert.status === 'open' ? 'font-semibold' : 'font-normal'
                          }`}>
                            {alert.title}
                          </h4>
                          {alert.status === 'open' && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mb-1 line-clamp-2 sm:line-clamp-3">
                          {alert.message}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatTime(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="p-3 border-t border-slate-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Navigate to alerts tab
                    setIsOpen(false);
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-700"
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
