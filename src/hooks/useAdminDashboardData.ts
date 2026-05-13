import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import apiService from "@/services/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { PensionOwner, AdminBooking, SystemAlert, PlatformMetrics } from "@/types/admin";

export const useAdminDashboardData = () => {
  const location = useLocation();
  
  // Get active tab from current route
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/owners')) return 'owners';
    if (path.includes('/properties')) return 'properties';
    if (path.includes('/approvals')) return 'pension-approval';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/alerts')) return 'alerts';
    if (path.includes('/payments')) return 'payments';
    if (path.includes('/settings')) return 'settings';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [owners, setOwners] = useState<PensionOwner[]>([]);
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
  const [selectedOwner, setSelectedOwner] = useState<PensionOwner | null>(null);
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  // Fetch real data
  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [ownersRes, propertiesRes, bookingsRes, metricsRes, alertsRes, pensionsRes] = await Promise.all([
        apiService.getAllOwners(),
        apiService.getAllProperties(),
        apiService.getAllBookings(),
        apiService.getAdminMetrics(),
        apiService.getSystemAlerts(),
        fetch('http://localhost:3006/api/admin/pensions/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
      ]);

      setOwners(ownersRes.data || []);
      console.log('🔍 Admin Dashboard - Owners data loaded:', ownersRes.data);
      console.log('🔍 Admin Dashboard - Pending owners:', ownersRes.data?.filter((o: any) => o.status === 'pending' || o.documentStatus === 'pending'));

      setProperties(propertiesRes.data || []);
      setBookings(bookingsRes.data || []);
      setMetrics(metricsRes.data || metrics);
      setAlerts(alertsRes.data || []);
      setPensions(pensionsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // WebSocket integration for real-time updates
  const {
    isConnected,
    connectionStatus,
    lastUpdate,
    error,
    subscribeToOwnerUpdates,
    subscribeToPropertyUpdates,
    subscribeToBookingUpdates,
    subscribeToAlertUpdates,
    subscribeToMetricsUpdates,
    connect,
    disconnect
  } = useWebSocket({ autoConnect: true });

  // Subscribe to real-time updates
  useEffect(() => {
    // Subscribe to owner updates
    subscribeToOwnerUpdates((data) => {
      console.log('👥 Real-time owner update:', data);
      if (data) {
        setOwners(prev => {
          const current = prev || [];
          const index = current.findIndex(o => o.id === data.id);
          if (index !== -1) {
            const updated = [...current];
            updated[index] = { ...updated[index], ...data };
            return updated;
          } else {
            return [...current, data];
          }
        });
      }
    });

    // Subscribe to property updates
    subscribeToPropertyUpdates((data) => {
      console.log('🏠 Real-time property update:', data);
      if (data) {
        setProperties(prev => {
          const current = prev || [];
          const index = current.findIndex(p => p.id === data.id);
          if (index !== -1) {
            const updated = [...current];
            updated[index] = { ...updated[index], ...data };
            return updated;
          } else {
            return [...current, data];
          }
        });
      }
    });

    // Subscribe to booking updates
    subscribeToBookingUpdates((data) => {
      console.log('📅 Real-time booking update:', data);
      if (data) {
        setBookings(prev => {
          const current = prev || [];
          const index = current.findIndex(b => b.id === data.id);
          if (index !== -1) {
            const updated = [...current];
            updated[index] = { ...updated[index], ...data };
            return updated;
          } else {
            return [...current, data];
          }
        });
      }
    });

    // Subscribe to alert updates
    subscribeToAlertUpdates((data) => {
      console.log('🚨 Real-time alert update:', data);
      if (data) {
        setAlerts(prev => {
          const current = prev || [];
          const index = current.findIndex(a => a.id === data.id);
          if (index !== -1) {
            const updated = [...current];
            updated[index] = { ...updated[index], ...data };
            return updated;
          } else {
            return [data, ...current];
          }
        });
      }
    });

    // Subscribe to metrics updates
    subscribeToMetricsUpdates((data) => {
      console.log('📊 Real-time metrics update:', data);
      setMetrics(prev => ({ ...prev, ...data }));
    });
  }, [subscribeToOwnerUpdates, subscribeToPropertyUpdates, subscribeToBookingUpdates, subscribeToAlertUpdates, subscribeToMetricsUpdates]);

  const fetchPaymentData = async () => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [plansRes, subsRes, statsRes] = await Promise.all([
        fetch('http://localhost:3006/api/admin-payments/plans', { headers }).then(res => res.json()),
        fetch('http://localhost:3006/api/admin-payments/subscriptions', { headers }).then(res => res.json()),
        fetch('http://localhost:3006/api/admin-payments/stats', { headers }).then(res => res.json())
      ]);

      if (plansRes.success) setPlans(plansRes.data);
      if (subsRes.success) setSubscriptions(subsRes.data);
      if (statsRes.success) setPaymentStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPaymentData();
    }
  }, [activeTab]);

  return {
    activeTab, setActiveTab,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    owners, setOwners,
    properties, setProperties,
    bookings, setBookings,
    pensions, setPensions,
    metrics, setMetrics,
    alerts, setAlerts,
    loading, setLoading,
    selectedOwner, setSelectedOwner,
    showOwnerDetails, setShowOwnerDetails,
    plans, setPlans,
    subscriptions, setSubscriptions,
    paymentStats, setPaymentStats,
    paymentLoading, setPaymentLoading,
    connectionStatus,
    fetchAdminData,
    fetchPaymentData
  };
};
