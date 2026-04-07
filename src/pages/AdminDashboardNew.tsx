import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Building, Users, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Calendar, Bell } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
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

// TypeScript Interfaces
interface PensionOwner {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessId: string;
  status: "pending" | "verified" | "rejected" | "suspended";
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
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);

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
      
      // Fetch all data in parallel
      const [ownersRes, propertiesRes, bookingsRes, metricsRes, alertsRes, pensionsRes] = await Promise.all([
        apiService.getAllOwners(),
        apiService.getAllProperties(),
        apiService.getAllBookings(),
        apiService.getAdminMetrics(),
        apiService.getSystemAlerts(),
        fetch('http://localhost:3005/api/admin-approvals/pensions/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
      ]);

      setOwners(ownersRes.data || []);
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

  // WebSocket integration for real-time updates
  const {
    isConnected,
    connectionStatus,
    subscribeToOwnerUpdates,
    subscribeToPropertyUpdates,
    subscribeToBookingUpdates,
    subscribeToAlertUpdates,
    subscribeToMetricsUpdates,
  } = useWebSocket('admin');

  useEffect(() => {
    if (isConnected) {
      // Subscribe to real-time updates
      subscribeToOwnerUpdates((data: any) => {
        setOwners(prev => prev.map(owner => 
          owner.id === data.id ? { ...owner, ...data } : owner
        ));
      });

      subscribeToPropertyUpdates((data: any) => {
        setProperties(prev => prev.map(property => 
          property.id === data.id ? { ...property, ...data } : property
        ));
      });

      subscribeToBookingUpdates((data: any) => {
        setBookings(prev => prev.map(booking => 
          booking.id === data.id ? { ...booking, ...data } : booking
        ));
      });

      subscribeToAlertUpdates((data: any) => {
        setAlerts(prev => prev.find(alert => alert.id === data.id) 
          ? prev.map(alert => alert.id === data.id ? { ...alert, ...data } : alert)
          : [data, ...prev]
        );
      });

      subscribeToMetricsUpdates((data: any) => {
        setMetrics(prev => ({ ...prev, ...data }));
      });
    }
  }, [isConnected]);

  const handleOwnerAction = async (ownerId: string, action: string, owner?: any) => {
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

  const getConnectionBadge = () => {
    const statusConfig = {
      connected: { color: 'bg-green-500', text: 'Connected', icon: CheckCircle },
      connecting: { color: 'bg-yellow-500', text: 'Connecting...', icon: AlertTriangle },
      disconnected: { color: 'bg-red-500', text: 'Disconnected', icon: AlertTriangle },
      error: { color: 'bg-red-500', text: 'Error', icon: AlertTriangle }
    };

    const config = statusConfig[connectionStatus as keyof typeof statusConfig] || statusConfig.disconnected;
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.color} bg-opacity-20 text-white`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{config.text}</span>
      </div>
    );
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
      <div className="mb-6">
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
            <p className="text-slate-600 mt-1">
              {activeTab === 'overview' ? 'System overview and key metrics' :
               activeTab === 'owners' ? 'Manage and monitor pension owners' :
               activeTab === 'properties' ? 'View and manage all properties' :
               activeTab === 'approvals' ? 'Review pending pension registrations' :
               activeTab === 'bookings' ? 'Monitor all booking activity' :
               activeTab === 'alerts' ? 'System alerts and notifications' : 'Admin Dashboard'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {getConnectionBadge()}
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchAdminData()}>
                Refresh
              </Button>
            </div>
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
      {showOwnerDetails && selectedOwner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Owner Details</h2>
                <button
                  onClick={() => setShowOwnerDetails(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Business Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-500">Business Name</label>
                      <p className="text-slate-900">{selectedOwner.businessName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Owner Name</label>
                      <p className="text-slate-900">{selectedOwner.ownerName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Business ID</label>
                      <p className="text-slate-900">{selectedOwner.businessId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-500">Email</label>
                      <p className="text-slate-900">{selectedOwner.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Phone</label>
                      <p className="text-slate-900">{selectedOwner.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Status</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          selectedOwner.status === 'verified' 
                            ? 'bg-green-100 text-green-800'
                            : selectedOwner.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedOwner.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {selectedOwner.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedOwner.totalProperties || 0}</div>
                    <div className="text-sm text-blue-600">Properties</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedOwner.totalRevenue || 0}</div>
                    <div className="text-sm text-green-600">Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{selectedOwner.rating || 0}</div>
                    <div className="text-sm text-yellow-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
