import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  Trash2, 
  Circle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Check,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import apiService from '@/services/api';
import notificationService, { Notification } from '@/services/notificationService';
import { toast } from 'sonner';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications(100);
      if (response.success) {
        let items = response.data.items || response.data || [];
        
        // Handle admin string IDs via localStorage sync (matching NotificationBell logic)
        const readAdminNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '[]');
        items = items.map((n: any) => {
          if (typeof n.notification_id === 'string' && readAdminNotifications.includes(n.notification_id)) {
            return { ...n, is_read: 1 };
          }
          return n;
        });

        setNotifications(items);
      }
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ? true : (filter === 'unread' ? !n.is_read : n.is_read);
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredNotifications.map(n => n.notification_id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: number | string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (action: 'read' | 'unread' | 'delete') => {
    try {
      setIsBulkLoading(true);
      const idsArray = Array.from(selectedIds);
      
      if (action === 'read') {
        const readAdminNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '[]');
        
        for (const id of idsArray) {
          if (typeof id === 'string') {
            if (!readAdminNotifications.includes(id)) readAdminNotifications.push(id);
          } else {
            await apiService.markNotificationAsRead(id);
          }
        }
        localStorage.setItem('readAdminNotifications', JSON.stringify(readAdminNotifications));
        
        setNotifications(prev => prev.map(n => 
          selectedIds.has(n.notification_id) ? { ...n, is_read: 1 } : n
        ));
        toast.success(`Marked ${selectedIds.size} as read`);
      } else if (action === 'delete') {
        // Simple filter-out for delete (since we don't have bulk delete endpoint yet)
        setNotifications(prev => prev.filter(n => !selectedIds.has(n.notification_id)));
        toast.success(`Deleted ${selectedIds.size} notifications`);
      }
      
      setSelectedIds(new Set());
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const markSingleAsRead = async (id: number | string) => {
    try {
      if (typeof id === 'string') {
        const readAdminNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '[]');
        if (!readAdminNotifications.includes(id)) {
          readAdminNotifications.push(id);
          localStorage.setItem('readAdminNotifications', JSON.stringify(readAdminNotifications));
        }
      } else {
        await apiService.markNotificationAsRead(id);
      }
      
      setNotifications(prev => prev.map(n => 
        n.notification_id === id ? { ...n, is_read: 1 } : n
      ));
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Bell className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-500">Manage your system alerts and messages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={loading} className="rounded-lg h-10">
              <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <Card className="flex-1 border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search in notifications..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-slate-200 focus:ring-blue-500 rounded-lg w-full"
                />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto">
                <Button 
                  variant={filter === 'all' ? 'white' : 'ghost'} 
                  size="sm" 
                  onClick={() => setFilter('all')}
                  className={`flex-1 md:flex-none text-xs rounded-md ${filter === 'all' ? 'shadow-sm bg-white' : ''}`}
                >
                  All
                </Button>
                <Button 
                  variant={filter === 'unread' ? 'white' : 'ghost'} 
                  size="sm" 
                  onClick={() => setFilter('unread')}
                  className={`flex-1 md:flex-none text-xs rounded-md ${filter === 'unread' ? 'shadow-sm bg-white' : ''}`}
                >
                  Unread
                </Button>
                <Button 
                  variant={filter === 'read' ? 'white' : 'ghost'} 
                  size="sm" 
                  onClick={() => setFilter('read')}
                  className={`flex-1 md:flex-none text-xs rounded-md ${filter === 'read' ? 'shadow-sm bg-white' : ''}`}
                >
                  Read
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedIds.size > 0 && (
            <Card className="border-none shadow-md ring-1 ring-blue-200 bg-blue-50/50 animate-in zoom-in-95">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-600 h-6 px-2">{selectedIds.size} Selected</Badge>
                  <div className="h-4 w-px bg-blue-200" />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleBulkAction('read')}
                      disabled={isBulkLoading}
                      className="text-blue-700 hover:bg-blue-100 h-8"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Mark Read
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleBulkAction('delete')}
                      disabled={isBulkLoading}
                      className="text-red-600 hover:bg-red-100 h-8"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="h-8">Cancel</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notifications List */}
        <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-4">
            <Checkbox 
              checked={filteredNotifications.length > 0 && selectedIds.size === filteredNotifications.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-slate-600">
              Showing {filteredNotifications.length} notifications
            </span>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 animate-pulse">Loading your inbox...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No notifications found</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  {searchTerm ? `We couldn't find anything matching "${searchTerm}"` : "You're all caught up! There are no notifications to show right now."}
                </p>
                {searchTerm && (
                  <Button variant="outline" className="mt-6" onClick={() => setSearchTerm('')}>Clear Search</Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map((n) => (
                  <div 
                    key={n.notification_id}
                    className={`group flex items-start gap-4 p-4 transition-all hover:bg-slate-50/80 ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                  >
                    <div className="pt-1">
                      <Checkbox 
                        checked={selectedIds.has(n.notification_id)}
                        onCheckedChange={() => toggleSelect(n.notification_id)}
                      />
                    </div>
                    <div className="flex-shrink-0 pt-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        !n.is_read ? 'bg-blue-100 text-blue-600 shadow-sm shadow-blue-200/50' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {notificationService.getNotificationIcon(n.type) || '📢'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => markSingleAsRead(n.notification_id)}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h4 className={`text-base truncate ${!n.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {n.title}
                          {!n.is_read && <Badge className="ml-2 bg-blue-600 h-2 w-2 p-0 rounded-full border-none shadow-none" />}
                        </h4>
                        <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notificationService.formatNotificationTime(n.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${!n.is_read ? 'text-slate-700' : 'text-slate-500'}`}>
                        {n.message}
                      </p>
                      <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.is_read && (
                          <button 
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            onClick={(e) => { e.stopPropagation(); markSingleAsRead(n.notification_id); }}
                          >
                            <Check className="w-3 h-3" /> Mark as Read
                          </button>
                        )}
                        <button className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {filteredNotifications.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Page <span className="font-bold text-slate-900">1</span> of <span className="font-bold text-slate-900">1</span>
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0 rounded-md"><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0 rounded-md"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminNotificationsPage;
