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
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [owners, setOwners] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pensions, setPensions] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOwners: 0,
    totalProperties: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    pendingVerifications: 0,
    activeProperties: 0,
    averageRating: 0
  });
  const [alerts, setAlerts] = useState([]);
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
          return { data: [] };
        }),
        apiService.getAllProperties().catch(err => {
          console.error('Properties API error:', err);
          return { data: [] };
        }),
        apiService.getAllBookings().catch(err => {
          console.error('Bookings API error:', err);
          return { data: [] };
        }),
        apiService.getAdminMetrics().catch(err => {
          console.error('Metrics API error:', err);
          return { data: metrics };
        }),
        apiService.getSystemAlerts().catch(err => {
          console.error('Alerts API error:', err);
          return { data: [] };
        }),
        fetch('http://localhost:3005/api/admin-approvals/pensions/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()).catch(err => {
          console.error('Pensions API error:', err);
          return { data: [] };
        })
      ]);

      console.log('API Responses:', {
        owners: ownersRes.data?.length || 0,
        properties: propertiesRes.data?.length || 0,
        bookings: bookingsRes.data?.length || 0,
        alerts: alertsRes.data?.length || 0,
        pensions: pensionsRes.data?.length || 0
      });

      setOwners(ownersRes.data || []);
      setProperties(propertiesRes.data || []);
      setBookings(bookingsRes.data || []);
      setMetrics(metricsRes.data || {
        totalOwners: ownersRes.data?.length || 0,
        totalProperties: propertiesRes.data?.length || 0,
        totalBookings: bookingsRes.data?.length || 0,
        monthlyRevenue: 0,
        occupancyRate: 0,
        pendingVerifications: ownersRes.data?.filter(o => o.status === 'pending').length || 0,
        activeProperties: propertiesRes.data?.filter(p => p.status === 'active').length || 0,
        averageRating: 0
      });
      setAlerts(alertsRes.data || []);
      setPensions(pensionsRes.data || []);

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      // Don't reset to empty arrays - keep whatever data we successfully fetched
      // The individual API calls have their own error handling with fallbacks
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerAction = async (ownerId: string, action: string, owner?: any) => {
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
          setSelectedOwner(owner);
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
          break;
        default:
          console.log('Unknown action:', action);
          console.log('Available actions: view, approve, verify, reject, suspend, delete, update');
          break;
      }
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Failed to update owner:', error);
    }
  };

  const handlePropertyAction = async (propertyId: string, action: string) => {
    try {
      // Property action methods not implemented in apiService yet
      console.log('Property action:', action, 'for property:', propertyId);
      // TODO: Implement property action methods in apiService
      // await apiService.updatePropertyStatus(propertyId, action);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Failed to update property:', error);
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
      console.error('Failed to update booking:', error);
    }
  };

  const handleAlertAction = async (alertId: string, action: string) => {
    try {
      // Alert action methods not implemented in apiService yet
      console.log('Alert action:', action, 'for alert:', alertId);
      // TODO: Implement alert action methods in apiService
      // await apiService.updateAlertStatus(alertId, action);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Failed to update alert:', error);
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
        return <OverviewTab metrics={metrics} owners={owners} properties={properties} bookings={bookings} />;
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
        return <PropertiesTab properties={properties} onPropertyAction={handlePropertyAction} />;
      case 'approvals':
        return <PensionApprovalInline pensions={pensions} />;
      case 'bookings':
        return <BookingsTab bookings={bookings} properties={properties} onBookingAction={handleBookingAction} />;
      case 'alerts':
        return <AlertsTab alerts={alerts} onAlertAction={handleAlertAction} />;
      default:
        return <OverviewTab metrics={metrics} owners={owners} properties={properties} bookings={bookings} />;
    }
  };

  return (
    <AdminDashboardLayout>
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
    </AdminDashboardLayout>
  );
}
