import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, BellRing, X, Check, CheckCircle,
  ShieldAlert, UserCheck, Building2, CalendarCheck,
  Star, AlertCircle, Info, CreditCard, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/services/notificationService';
import websocketService from '@/services/websocketService';
import apiService from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationBellProps {
  className?: string;
}

// ── Role-based icon helpers ────────────────────────────────────────────────────

function getNotificationIcon(type: string) {
  if (type === 'owner_verification')  return <UserCheck    className="h-4 w-4 text-amber-600"   />;
  if (type === 'pension_approval')    return <Building2    className="h-4 w-4 text-purple-600"  />;
  if (['booking', 'new_booking', 'booking_created', 'booking_confirmed'].includes(type))
    return <CalendarCheck className="h-4 w-4 text-blue-600"   />;
  if (['review', 'guest_review'].includes(type))
    return <Star          className="h-4 w-4 text-yellow-500" />;
  if (type === 'pension_approved')    return <CheckCircle  className="h-4 w-4 text-emerald-600" />;
  if (type === 'pension_rejected')    return <AlertCircle  className="h-4 w-4 text-red-500"     />;
  if (['payment', 'payment_received'].includes(type))
    return <CreditCard    className="h-4 w-4 text-emerald-600" />;
  return <Info className="h-4 w-4 text-slate-500" />;
}

function getIconBg(type: string): string {
  if (type === 'owner_verification')  return 'bg-amber-50';
  if (type === 'pension_approval')    return 'bg-purple-50';
  if (['booking', 'new_booking', 'booking_created', 'booking_confirmed'].includes(type)) return 'bg-blue-50';
  if (['review', 'guest_review'].includes(type))  return 'bg-yellow-50';
  if (type === 'pension_approved')    return 'bg-emerald-50';
  if (type === 'pension_rejected')    return 'bg-red-50';
  if (['payment', 'payment_received'].includes(type)) return 'bg-emerald-50';
  return 'bg-slate-50';
}

/** Resolve the route to navigate to when a notification is clicked */
function getNotificationLink(
  notification: Notification,
  userRole: string
): string | null {
  const id   = String(notification.notification_id);
  const type = notification.type;

  // ── Admin: navigate to the relevant admin sub-page ──
  if (userRole === 'admin') {
    if (id.startsWith('owner_'))   return '/dashboard/admin/owners';
    if (id.startsWith('pension_')) return '/dashboard/admin/approvals';
    return '/dashboard/admin';
  }

  // ── Owner / manager / user ──
  if (['owner', 'manager', 'user'].includes(userRole)) {
    if (['booking', 'new_booking', 'booking_created'].includes(type)) return '/dashboard';
    if (['pension_approved', 'pension_rejected'].includes(type))       return '/dashboard';
    if (['review', 'guest_review'].includes(type))                     return '/dashboard';
    if (['payment', 'payment_received'].includes(type))                return '/dashboard';
    return '/dashboard';
  }

  // ── Customer ──
  if (['booking', 'booking_confirmed', 'booking_cancelled'].includes(type))
    return '/customer-dashboard';
  return null;
}

function rolePanelTitle(role: string): string {
  if (role === 'admin')                            return 'Admin Alerts';
  if (['owner', 'manager', 'user'].includes(role)) return 'Notifications';
  return 'Notifications';
}

function emptyStateMessage(role: string): string {
  if (role === 'admin') return 'No pending approvals';
  return 'No notifications yet';
}

// ── Component ──────────────────────────────────────────────────────────────────

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { user }  = useAuth();
  const rawUserRole  = user?.role ?? 'customer';
  const userRole  = rawUserRole.toLowerCase();
  const userId    = user?.id;

  const [isOpen,              setIsOpen]              = useState(false);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [notifications,       setNotifications]       = useState<Notification[]>([]);
  const [unreadCount,         setUnreadCount]         = useState(0);
  const [isLoading,           setIsLoading]           = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const location        = useLocation();
  const navigate        = useNavigate();

  // localStorage key scoped per user to prevent cross-user leakage
  const adminReadKey = userId
    ? `readAdminNotifications_${userId}`
    : 'readAdminNotifications_guest';

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getNotifications(50);
      if (response.success) {
        let items: any[] = response.data.items || response.data || [];

        if (userRole === 'admin') {
          // Reconcile with localStorage read state for dynamic admin notifications
          const readIds: string[] = JSON.parse(
            localStorage.getItem(adminReadKey) || '[]'
          );
          items = items.map((n: any) =>
            typeof n.notification_id === 'string' &&
            readIds.includes(String(n.notification_id))
              ? { ...n, is_read: 1 }
              : n
          );
        }

        const unread = items.filter((n: any) => !n.is_read).length;
        setNotifications(items);
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Mark single notification as read ─────────────────────────────────────────
  const markAsRead = async (notificationId: number | string) => {
    try {
      const isAdminStringId =
        userRole === 'admin' && typeof notificationId === 'string';

      if (isAdminStringId) {
        // Persist in user-scoped localStorage (backend is a no-op for admin)
        const readIds: string[] = JSON.parse(
          localStorage.getItem(adminReadKey) || '[]'
        );
        const idStr = String(notificationId);
        if (!readIds.includes(idStr)) {
          readIds.push(idStr);
          localStorage.setItem(adminReadKey, JSON.stringify(readIds));
        }
        // Optimistic update
        setNotifications(prev =>
          prev.map(n =>
            String(n.notification_id) === idStr ? { ...n, is_read: 1 } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        // Regular DB notification — call backend
        await apiService.markNotificationAsRead(notificationId);
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // ── Mark all as read ──────────────────────────────────────────────────────────
  const markAllAsRead = async () => {
    try {
      if (userRole === 'admin') {
        // Persist ALL visible admin notification IDs as read
        const adminIds = notifications
          .filter((n: any) => typeof n.notification_id === 'string')
          .map((n: any) => String(n.notification_id));

        const readIds: string[] = JSON.parse(
          localStorage.getItem(adminReadKey) || '[]'
        );
        adminIds.forEach(id => {
          if (!readIds.includes(id)) readIds.push(id);
        });
        localStorage.setItem(adminReadKey, JSON.stringify(readIds));

        // Optimistic UI update (backend call returns success immediately for admin)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
        // Still call backend so it stays symmetrical
        await apiService.markAllNotificationsAsRead();
      } else {
        await apiService.markAllNotificationsAsRead();
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // ── Handle notification click — mark read + navigate ─────────────────────────
  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.notification_id);
    const link = getNotificationLink(notification, userRole);
    if (link) {
      closeNotifications();
      navigate(link);
    }
  };

  // ── Panel helpers ─────────────────────────────────────────────────────────────
  const toggleNotifications = () => setIsOpen(o => !o);
  const closeNotifications  = () => setIsOpen(false);

  // ── Outside click & ESC ───────────────────────────────────────────────────────
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node))
        closeNotifications();
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeNotifications(); };
    if (isOpen) {
      document.addEventListener('mousedown', onClickOutside);
      document.addEventListener('keydown', onEsc);
    }
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [isOpen]);

  // ── Close panel on route change ───────────────────────────────────────────────
  useEffect(() => { closeNotifications(); }, [location.pathname]);

  // ── Initial fetch ─────────────────────────────────────────────────────────────
  useEffect(() => { fetchNotifications(); }, []);

  // ── Refresh when panel opens ──────────────────────────────────────────────────
  useEffect(() => { if (isOpen) fetchNotifications(); }, [isOpen]);

  // ── WebSocket real-time updates ───────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    websocketService.onNotification(() => fetchNotifications());
    websocketService.onUnreadCount(count => {
      // Admins compute their own unread count from pending items
      if (userRole !== 'admin') {
        setUnreadCount(typeof count === 'number' && count >= 0 ? count : 0);
      }
    });
    websocketService.onConnection(c => setIsRealTimeConnected(c));
    websocketService.onError(err => console.error('WS error:', err));
    websocketService.connect(token);
    return () => { websocketService.disconnect(); };
  }, []);

  // ── Time formatter ────────────────────────────────────────────────────────────
  const formatTime = (dateString: string) => {
    const date      = new Date(dateString);
    const now       = new Date();
    const diffMs    = now.getTime() - date.getTime();
    const diffMins  = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays  = Math.floor(diffMs / 86400000);
    if (diffMins  < 1)  return 'Just now';
    if (diffMins  < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays  < 7)  return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className={`relative ${className}`}>

      {/* Bell button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleNotifications}
        className="relative p-2 hover:bg-slate-100 transition-colors"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        {unreadCount > 0
          ? <BellRing className="h-5 w-5 text-slate-700" />
          : <Bell     className="h-5 w-5 text-slate-600" />
        }
        {/* Real-time indicator */}
        <div
          className={`absolute top-0 right-0 w-2 h-2 rounded-full ${
            isRealTimeConnected ? 'bg-green-500' : 'bg-gray-300'
          }`}
          title={isRealTimeConnected ? 'Real-time connected' : 'Reconnecting…'}
        />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          ref={notificationRef}
          className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[9999] max-h-[450px] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 origin-top-right"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 shrink-0 bg-white z-10">
            <div className="flex items-center gap-2">
              {userRole === 'admin' && (
                <ShieldAlert className="h-4 w-4 text-amber-500" />
              )}
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                {rolePanelTitle(userRole)}
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                  {unreadCount} new
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeNotifications}
              className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
            >
              <X className="h-4 w-4 text-slate-500" />
            </Button>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 min-h-0 bg-slate-50/20">
            {isLoading ? (
              <div className="text-center p-6 sm:p-8 text-slate-500">
                <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-slate-600 rounded-full mx-auto mb-2" />
                <p className="text-sm">Loading…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-6 sm:p-8 text-slate-500">
                <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm sm:text-base">{emptyStateMessage(userRole)}</p>
              </div>
            ) : (
              notifications.map(notification => {
                const hasLink = !!getNotificationLink(notification, userRole);
                return (
                  <div
                    key={String(notification.notification_id)}
                    className={`p-3 sm:p-4 border-b border-slate-100 transition-colors relative group/item ${
                      hasLink ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      !notification.is_read
                        ? 'bg-blue-50/50 border-blue-100 hover:bg-blue-100/50'
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Dismiss button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setNotifications(prev =>
                          prev.filter(n => n.notification_id !== notification.notification_id)
                        );
                        if (!notification.is_read) markAsRead(notification.notification_id);
                      }}
                      className="absolute top-3.5 right-3 h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all z-20"
                      title="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-start gap-2 sm:gap-3 pr-7">
                      {/* Role-based icon */}
                      <div className={`flex-shrink-0 mt-0.5 sm:mt-1 p-1.5 rounded-full ${getIconBg(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-xs sm:text-sm text-slate-900 truncate flex items-center gap-1 ${
                            !notification.is_read ? 'font-semibold' : 'font-normal'
                          }`}>
                            {notification.title}
                            {hasLink && (
                              <ExternalLink className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            )}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2 mr-2" />
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 mb-1 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-slate-400">
                            {formatTime(notification.created_at)}
                          </p>
                          {!notification.is_read && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                markAsRead(notification.notification_id);
                              }}
                              className="text-[10px] text-blue-600 hover:underline font-medium flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="p-3 sm:p-4 border-t border-slate-100 bg-white shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-slate-600 hover:text-slate-950 border border-slate-100 hover:bg-slate-50 rounded-lg font-bold"
                onClick={e => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
              >
                <CheckCircle className="h-4 w-4 mr-1.5 text-emerald-600" />
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
