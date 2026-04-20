import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Building, Users, DollarSign, TrendingUp, AlertTriangle, Calendar, Bell } from "lucide-react";
import apiService from "@/services/api";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

// Import admin components
import { MetricCard } from "@/components/admin/MetricCard";
import { OwnerCard } from "@/components/admin/OwnerCard";
import { PropertyCard } from "@/components/admin/PropertyCard";
import { AlertCard } from "@/components/admin/AlertCard";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { OwnersTab } from "@/components/admin/OwnersTab";
import { PropertiesTab } from "@/components/admin/PropertiesTab";
import PensionApprovalInline from "@/components/admin/PensionApprovalInline";
import { AlertsTab } from "@/components/admin/AlertsTab";
import { BookingsTab } from "@/components/admin/BookingsTab";
import { OwnerDetailsModal } from "@/components/admin/OwnerDetailsModal";
import PropertyDetailsModal from "@/components/admin/PropertyDetailsModal";

// TypeScript Interfaces
interface PensionOwner {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessId: string;
  status: "pending" | "verified" | "approved" | "rejected" | "suspended";
  registrationDate: string;
  totalProperties: number;
  totalRevenue: number;
  rating: number;
  documentStatus: "pending" | "approved" | "rejected";
  lastActive: string;
}

interface Booking {
  id: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded";
  ownerName: string;
  specialRequests?: string;
  createdAt: string;
}

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

interface PlatformMetrics {
  totalOwners: number;
  totalProperties: number;
  totalBookings: number;
  monthlyRevenue: number;
  occupancyRate: number;
  pendingVerifications: number;
  activeProperties: number;
  averageRating: number;
}

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get active tab from current route
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/owners')) return 'owners';
    if (path.includes('/properties')) return 'properties';
    if (path.includes('/approvals')) return 'approvals';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/alerts')) return 'alerts';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOwner, setSelectedOwner] = useState<PensionOwner | null>(null);
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [owners, setOwners] = useState<PensionOwner[]>([]);
  
  // Property details modal state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]); // TODO: Replace with proper Property interface
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pensions, setPensions] = useState<any[]>([]); // TODO: Replace with proper Pension interface
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
  }, [location.pathname]);

  // Fetch real data
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      console.log('=== DEBUGGING fetchAdminData ===');
      console.log('Token exists:', !!localStorage.getItem('token'));
      console.log('Token value:', localStorage.getItem('token')?.substring(0, 20) + '...');
      
      // Fetch all data in parallel
      const [ownersRes, propertiesRes, bookingsRes, metricsRes, alertsRes, pensionsRes] = await Promise.all([
        apiService.getAllOwners().catch(err => {
          console.error('Owners API error:', err);
          return { data: [] as PensionOwner[] };
        }),
        apiService.getAllProperties().catch(err => {
          console.error('Properties API error:', err);
          return { data: [] as any[] };
        }),
        apiService.getAllBookings().catch(err => {
          console.error('Bookings API error:', err);
          return { data: [] as Booking[] };
        }),
        apiService.getAdminMetrics().catch(err => {
          console.error('Metrics API error:', err);
          return { data: metrics };
        }),
        apiService.getSystemAlerts().catch(err => {
          console.error('Alerts API error:', err);
          return { data: [] as SystemAlert[] };
        }),
        fetch('http://localhost:3005/api/admin/pensions/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()).catch(err => {
          console.error('Pensions API error:', err);
          return { data: [] as any[] };
        })
      ]);

      // Safe access to API response data with proper fallbacks
      const ownersData = ownersRes?.data || [];
      const propertiesData = propertiesRes?.data || [];
      const bookingsData = bookingsRes?.data || [];
      const alertsData = alertsRes?.data || [];
      const pensionsData = pensionsRes?.data || [];

      console.log('API Responses:', {
        owners: ownersData.length,
        properties: propertiesData.length,
        bookings: bookingsData.length,
        alerts: alertsData.length,
        pensions: pensionsData.length
      });

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
      
      // Apply read status from localStorage to maintain persistence
      const readNotifications = JSON.parse(localStorage.getItem('adminReadNotifications') || '[]');
      const alertsWithReadStatus = alertsData.map((alert: SystemAlert) => ({
        ...alert,
        status: readNotifications.includes(alert.id) ? 'resolved' as const : alert.status
      }));
      
      setAlerts(alertsWithReadStatus);
      setPensions(pensionsData);

      // Create notifications for new entities (only if they haven't been created before)
      createNotificationsForNewEntities(ownersData, pensionsData);

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      // Don't reset to empty arrays - keep whatever data we successfully fetched
      // The individual API calls have their own error handling with fallbacks
    }

    setLoading(false);
  };

  // Separate function for creating notifications - only runs when new entities are detected
  const createNotificationsForNewEntities = async (owners: PensionOwner[], pensions: any[]) => {
    try {
      console.log('=== CHECKING FOR NEW ENTITIES TO CREATE NOTIFICATIONS ===');
      
      // Get existing notification IDs from localStorage to prevent duplicates
      const existingNotificationIds = JSON.parse(localStorage.getItem('adminCreatedNotifications') || '[]');
      const readNotifications = JSON.parse(localStorage.getItem('adminReadNotifications') || '[]');
      
      // Create notifications for new pending/verified owners
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
      
      // Create notifications for new pensions
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
        console.log(`Creating ${allNewNotifications.length} new notifications`);
        
        // Update existing notifications list with new ones
        setAlerts(prev => {
          const combined = [...prev, ...allNewNotifications];
          // Remove duplicates by ID
          const unique = combined.filter((alert, index, self) => 
            index === self.findIndex(a => a.id === alert.id)
          );
          return unique;
        });
        
        // Store the notification IDs we've created to prevent recreation
        const newNotificationIds = allNewNotifications.map(n => n.id);
        const updatedNotificationIds = [...existingNotificationIds, ...newNotificationIds];
        localStorage.setItem('adminCreatedNotifications', JSON.stringify(updatedNotificationIds));
      } else {
        console.log('No new entities found for notification creation');
      }
      
    } catch (error) {
      console.error('Failed to create notifications for new entities:', error);
    }
  };

  const handleOwnerAction = async (ownerId: string, action: string, owner?: PensionOwner) => {
    console.log('=== DEBUGGING handleOwnerAction ===');
    console.log('Action:', action);
    console.log('Action type:', typeof action);
    console.log('OwnerId:', ownerId);
    console.log('Owner data:', owner);
    
    try {
      switch (action) {
        case 'view':
          // Show owner details modal or navigate to details page
          console.log('View owner details:', owner);
          setSelectedOwner(owner || null);
          setShowOwnerDetails(true);
          return; // Don't refresh data for view action
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
          await apiService.approveOwner(ownerId); // Use approveOwner to reactivate
          break;
        case 'delete':
          // Delete owner from database
          console.log('Delete owner:', ownerId);
          // TODO: Implement delete API call
          break;
        case 'update':
          // For update actions, we might need to implement this method
          console.log('Update action not implemented in apiService');
          return; // Add return statement here
        default:
          console.log('Unknown action:', action);
          console.log('Available actions: view, approve, verify, reject, suspend, delete, update');
          break;
      }
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Failed to handle owner action:', error);
    }
  };

  const handleAlertClick = (alertId: string) => {
    console.log('Alert clicked:', alertId);
    // Mark alert as read
    handleAlertAction(alertId, 'mark_as_read');
  };

  const handleAlertAction = async (alertId: string, action: string) => {
    console.log('Alert action:', alertId, action);
    
    if (action === 'mark_as_read') {
      // Update alert status to 'resolved' immediately
      setAlerts(prev => prev.map((alert: SystemAlert) => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' as const }
          : alert
      ));
      
      // Persist read status in localStorage
      const readNotifications = JSON.parse(localStorage.getItem('adminReadNotifications') || '[]');
      if (!readNotifications.includes(alertId)) {
        readNotifications.push(alertId);
        localStorage.setItem('adminReadNotifications', JSON.stringify(readNotifications));
      }
    }
  };

  const handlePropertyDetailsAction = async (action: string, propertyId: string) => {
    console.log('=== DEBUGGING handlePropertyAction ===');
    console.log('Action:', action);
    console.log('PropertyId:', propertyId);
    
    switch (action) {
      case 'view':
        setSelectedPropertyId(propertyId);
        setIsPropertyModalOpen(true);
        break;
      default:
        console.log('Unknown property action:', action);
        break;
    }
  };

  const handleBookingAction = async (bookingId: string, action: string) => {
    try {
      // Booking action methods not implemented in apiService yet
      console.log('Booking action:', action, 'for booking:', bookingId);
      // TODO: Implement booking action methods in apiService
      // await apiService.updateBookingStatus(bookingId, action);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Failed to handle booking action:', error);
    }
  };
  
  // Render content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab metrics={metrics} recentOwners={owners.slice(0, 5)} alerts={alerts} />;
      case 'owners':
        return <OwnersTab 
          owners={owners} 
          onOwnerAction={handleOwnerAction}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterStatus}
        />;
      case 'properties':
        return <PropertiesTab properties={properties} onPropertyAction={handlePropertyDetailsAction} />;
      case 'approvals':
        return <PensionApprovalInline />;
      case 'bookings':
        return <BookingsTab bookings={bookings} properties={properties} onBookingAction={handleBookingAction} />;
      case 'alerts':
        return <AlertsTab alerts={alerts} />;
      default:
        return <OverviewTab metrics={metrics} recentOwners={owners.slice(0, 5)} alerts={alerts} />;
    }
  };

  return (
    <AdminDashboardLayout alerts={alerts} onAlertClick={handleAlertClick}>
      {/* Page Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 capitalize">
              {activeTab === 'overview' ? 'Dashboard Overview' : 
               activeTab === 'owners' ? 'Pension Owners' :
               activeTab === 'properties' ? 'Properties' :
               activeTab === 'approvals' ? 'Pension Approvals' :
               activeTab === 'bookings' ? 'Bookings' :
               activeTab === 'alerts' ? 'System Alerts' : 'Admin Dashboard'}
            </h1>
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        renderContent()
      )}
      
      {/* Owner Details Modal */}
      <OwnerDetailsModal
        owner={selectedOwner}
        isOpen={showOwnerDetails}
        onClose={() => setShowOwnerDetails(false)}
        onVerify={(ownerId) => handleOwnerAction(ownerId, "verify", selectedOwner)}
        onReject={(ownerId) => handleOwnerAction(ownerId, "reject")}
      />
      
      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={properties.find(p => p.id === selectedPropertyId) || null}
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
      />
    </AdminDashboardLayout>
  );
}
