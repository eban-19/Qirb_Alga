import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import apiService from "@/services/api";
import { PensionOwner, AdminBooking, SystemAlert, PlatformMetrics } from "@/types/admin";

export const useAdminDashboard = () => {
  const location = useLocation();
  
  // Get active tab from current route
  const getActiveTabFromPath = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/owners')) return 'owners';
    if (path.includes('/properties')) return 'properties';
    if (path.includes('/approvals')) return 'approvals';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/alerts')) return 'alerts';
    return 'overview';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOwner, setSelectedOwner] = useState<PensionOwner | null>(null);
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [owners, setOwners] = useState<PensionOwner[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [pensions, setPensions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalOwners: 0,
    totalProperties: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    pendingVerifications: 0,
    activeProperties: 0,
    averageRating: 0
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [getActiveTabFromPath]);

  // Separate function for creating notifications
  const createNotificationsForNewEntities = useCallback(async (owners: PensionOwner[], pensions: any[]) => {
    try {
      const existingNotificationIds = JSON.parse(localStorage.getItem('adminCreatedNotifications') || '[]');
      const readNotifications = JSON.parse(localStorage.getItem('adminReadNotifications') || '[]');
      
      const newOwnerNotifications: SystemAlert[] = owners
        .filter((owner: PensionOwner) => (owner.status === 'pending' || owner.status === 'verified'))
        .filter((owner: PensionOwner) => !existingNotificationIds.includes(`registration-${owner.id}`))
        .map((owner: PensionOwner) => ({
          id: `registration-${owner.id}`,
          type: "verification" as const,
          title: "New Pension Registration",
          message: `${owner.businessName} by ${owner.ownerName} is awaiting approval`,
          severity: owner.status === 'pending' ? "high" as const : "medium" as const,
          status: readNotifications.includes(`registration-${owner.id}`) ? "resolved" as const : "open" as const,
          createdAt: owner.registrationDate,
          relatedEntity: owner.id,
          entityType: "owner" as const
        }));
      
      const newPensionNotifications: SystemAlert[] = pensions
        .filter((pension: any) => !existingNotificationIds.includes(`pension-${pension.id}`))
        .map((pension: any) => ({
          id: `pension-${pension.id}`,
          type: "verification" as const,
          title: "New Pension Registered",
          message: `${pension.name} has been registered and is awaiting approval`,
          severity: "medium" as const,
          status: readNotifications.includes(`pension-${pension.id}`) ? "resolved" as const : "open" as const,
          createdAt: pension.createdAt || new Date().toISOString(),
          relatedEntity: pension.id,
          entityType: "property" as const
        }));
      
      const allNewNotifications = [...newOwnerNotifications, ...newPensionNotifications];
      
      if (allNewNotifications.length > 0) {
        setAlerts(prev => {
          const combined = [...prev, ...allNewNotifications];
          return combined.filter((alert, index, self) => 
            index === self.findIndex(a => a.id === alert.id)
          );
        });
        
        const newNotificationIds = allNewNotifications.map(n => n.id);
        const updatedNotificationIds = [...existingNotificationIds, ...newNotificationIds];
        localStorage.setItem('adminCreatedNotifications', JSON.stringify(updatedNotificationIds));
      }
    } catch (error) {
      console.error('Failed to create notifications:', error);
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [ownersRes, propertiesRes, bookingsRes, metricsRes, alertsRes, pensionsRes] = await Promise.all([
        apiService.getAllOwners().catch(() => ({ data: [] })),
        apiService.getAllProperties().catch(() => ({ data: [] })),
        apiService.getAllBookings().catch(() => ({ data: [] })),
        apiService.getAdminMetrics().catch(() => ({ data: null })),
        apiService.getSystemAlerts().catch(() => ({ data: [] })),
        fetch('http://localhost:3006/api/admin/pensions/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()).catch(() => ({ data: [] }))
      ]);

      const ownersData = ownersRes?.data || [];
      const propertiesData = propertiesRes?.data || [];
      const bookingsData = bookingsRes?.data || [];
      const alertsData = alertsRes?.data || [];
      const pensionsData = pensionsRes?.data || [];

      setOwners(ownersData);
      setProperties(propertiesData);
      setBookings(bookingsData);
      setMetrics(metricsRes?.data || {
        totalOwners: ownersData.length,
        totalProperties: propertiesData.length,
        totalBookings: bookingsData.length,
        monthlyRevenue: 0,
        occupancyRate: 0,
        pendingVerifications: ownersData.filter((o: PensionOwner) => o.status === 'pending').length,
        activeProperties: propertiesData.filter((p: any) => p.status === 'active').length,
        averageRating: 0
      });
      
      const readNotifications = JSON.parse(localStorage.getItem('adminReadNotifications') || '[]');
      setAlerts(alertsData.map((alert: SystemAlert) => ({
        ...alert,
        status: readNotifications.includes(alert.id) ? 'resolved' : alert.status
      })));
      
      setPensions(pensionsData);
      createNotificationsForNewEntities(ownersData, pensionsData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [createNotificationsForNewEntities]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleOwnerAction = async (ownerId: string, action: string, owner?: PensionOwner) => {
    try {
      switch (action) {
        case 'view':
          setSelectedOwner(owner || null);
          setShowOwnerDetails(true);
          return;
        case 'approve':
        case 'verify':
          await apiService.approveOwner(ownerId);
          break;
        case 'reject':
          await apiService.rejectOwner(ownerId);
          break;
        case 'suspend':
          await apiService.suspendOwner(ownerId);
          break;
        case 'reactivate':
          await apiService.approveOwner(ownerId);
          break;
        default:
          break;
      }
      fetchAdminData();
    } catch (error) {
      console.error('Failed to handle owner action:', error);
    }
  };

  const handleAlertAction = async (alertId: string, action: string) => {
    if (action === 'mark_as_read') {
      setAlerts(prev => prev.map((alert: SystemAlert) => 
        alert.id === alertId ? { ...alert, status: 'resolved' } : alert
      ));
      
      const readNotifications = JSON.parse(localStorage.getItem('adminReadNotifications') || '[]');
      if (!readNotifications.includes(alertId)) {
        readNotifications.push(alertId);
        localStorage.setItem('adminReadNotifications', JSON.stringify(readNotifications));
      }
    }
  };

  const handlePropertyAction = async (action: string, propertyId: string) => {
    if (action === 'view') {
      setSelectedPropertyId(propertyId);
      setIsPropertyModalOpen(true);
    }
  };

  const handleBookingAction = async (bookingId: string, action: string) => {
    console.log('Booking action:', action, 'for booking:', bookingId);
    // TODO: Implement booking actions in apiService
    fetchAdminData();
  };

  return {
    activeTab,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    selectedOwner,
    showOwnerDetails,
    setShowOwnerDetails,
    owners,
    selectedPropertyId,
    isPropertyModalOpen,
    setIsPropertyModalOpen,
    properties,
    bookings,
    metrics,
    alerts,
    loading,
    handleOwnerAction,
    handleAlertAction,
    handlePropertyAction,
    handleBookingAction,
    fetchAdminData
  };
};
