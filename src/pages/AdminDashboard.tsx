import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Shield, Building, Users, DollarSign, TrendingUp, Wifi, WifiOff } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/services/api";

// Import admin components
import { MetricCard } from "@/components/admin/MetricCard";
import { OwnerCard } from "@/components/admin/OwnerCard";
import { PropertyCard } from "@/components/admin/PropertyCard";
import { AlertCard } from "@/components/admin/AlertCard";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { OwnersTab } from "@/components/admin/OwnersTab";
import { PropertiesTab } from "@/components/admin/PropertiesTab";
import { AlertsTab } from "@/components/admin/AlertsTab";
import { BookingsTab } from "@/components/admin/BookingsTab";
import { OwnerDetailsModal } from "@/components/admin/OwnerDetailsModal";
import { Room } from "@/lib/rooms";

// TypeScript Interfaces
interface PensionOwner {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessEmail?: string;
  businessPhone?: string;
  businessId: string;
  status: "pending" | "verified" | "rejected" | "suspended";
  registrationDate: string;
  totalProperties: number;
  totalRevenue: number;
  rating: number;
  documentStatus: "pending" | "approved" | "rejected";
  lastActive: string;
  licenseNumber?: string;
  idDocumentUrl?: string;
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
  const navigate = useNavigate();
  const { user, logout, isAdmin, isPensionOwner, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [owners, setOwners] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
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

  // Fetch real data
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [ownersRes, propertiesRes, bookingsRes, metricsRes, alertsRes] = await Promise.all([
        apiService.getAllOwners(),
        apiService.getAllProperties(),
        apiService.getAllBookings(),
        apiService.getAdminMetrics(),
        apiService.getSystemAlerts()
      ]);

      setOwners(ownersRes.data || []);
      setProperties(propertiesRes.data || []);
      setBookings(bookingsRes.data || []);
      setMetrics(metricsRes.data || metrics);
      setAlerts(alertsRes.data || []);
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

  // CRUD Handlers for Owners
  const handleOwnerAction = (action: string, ownerId: string, owner?: any) => {
    switch (action) {
      case "create":
        const newOwner = { ...owner, id: `OWN${Date.now()}`, registrationDate: new Date().toISOString().split('T')[0] };
        setOwners(prev => [...prev, newOwner]);
        console.log("Created owner:", newOwner);
        break;
      case "update":
        setOwners(prev => prev.map(o => o.id === ownerId ? { ...owner, id: ownerId } : o));
        console.log("Updated owner:", ownerId);
        break;
      case "delete":
        setOwners(prev => prev.filter(o => o.id !== ownerId));
        console.log("Deleted owner:", ownerId);
        break;
      case "view":
        // Show owner details in modal
        const ownerToView = owners.find(o => o.id === ownerId);
        
        if (ownerToView) {
          setSelectedOwner(ownerToView);
          setIsOwnerModalOpen(true);
        }
        break;
      case "verify":
        // Call API to approve owner
        apiService.approveOwner(ownerId).then(response => {
          if (response.success) {
            setOwners(prev => prev.map(o => o.id === ownerId ? { ...o, status: "verified" as const } : o));
            console.log("✅ Owner approved successfully:", ownerId);
          } else {
            console.error("❌ Failed to approve owner:", response.message);
          }
        }).catch(error => {
          console.error("❌ Error approving owner:", error);
        });
        break;
      case "reject":
        // Call API to reject owner
        apiService.rejectOwner(ownerId).then(response => {
          if (response.success) {
            setOwners(prev => prev.map(o => o.id === ownerId ? { ...o, status: "rejected" as const } : o));
            console.log("✅ Owner rejected successfully:", ownerId);
          } else {
            console.error("❌ Failed to reject owner:", response.message);
          }
        }).catch(error => {
          console.error("❌ Error rejecting owner:", error);
        });
        break;
      default:
        console.log(`Admin action: ${action} for owner ${ownerId}`);
    }
  };

  // CRUD Handlers for Properties
  const handlePropertyAction = (action: string, propertyId: string, property?: any) => {
    switch (action) {
      case "create":
        const newProperty = { ...property, id: `PROP${Date.now()}` };
        setProperties(prev => [...prev, newProperty]);
        console.log("Created property:", newProperty);
        break;
      case "update":
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...property, id: propertyId } : p));
        console.log("Updated property:", propertyId);
        break;
      case "delete":
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        console.log("Deleted property:", propertyId);
        break;
      default:
        console.log(`Admin action: ${action} for property ${propertyId}`);
    }
  };

  // CRUD Handlers for Bookings
  const handleBookingAction = (action: string, bookingId: string, booking?: any) => {
    switch (action) {
      case "create":
        const newBooking = { ...booking, id: `BK${Date.now()}`, createdAt: new Date().toISOString() };
        setBookings(prev => [...prev, newBooking]);
        console.log("Created booking:", newBooking);
        break;
      case "update":
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...booking, id: bookingId } : b));
        console.log("Updated booking:", bookingId);
        break;
      case "delete":
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        console.log("Deleted booking:", bookingId);
        break;
      default:
        console.log(`Admin action: ${action} for booking ${bookingId}`);
    }
  };

  // Get property names for booking form
  const propertyNames = properties.map(p => p.name);

  // Connection status indicator
  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-green-500 text-white flex items-center gap-2">
            <Wifi className="w-3 h-3" />
            Live Updates
          </Badge>
        );
      case 'connecting':
        return (
          <Badge className="bg-yellow-500 text-white flex items-center gap-2">
            <Wifi className="w-3 h-3 animate-pulse" />
            Connecting...
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500 text-white flex items-center gap-2">
            <WifiOff className="w-3 h-3" />
            Connection Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 text-white flex items-center gap-2">
            <WifiOff className="w-3 h-3" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pension Platform Admin</h1>
              <p className="text-blue-200">Manage Ethiopian Pension Properties Network</p>
              {lastUpdate && (
                <p className="text-xs text-blue-300 mt-1">
                  Last update: {new Date(lastUpdate).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-blue-200 mb-1">Real-time Connection</p>
              {getConnectionBadge()}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Properties"
          value={metrics.totalProperties.toString()}
          change={8}
          icon={<Building className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50"
        />
        <MetricCard
          title="Active Owners"
          value={metrics.totalOwners.toString()}
          change={12}
          icon={<Users className="w-6 h-6 text-green-600" />}
          color="bg-green-50"
        />
        <MetricCard
          title="Total Bookings"
          value={bookings.length.toString()}
          change={15}
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50"
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${metrics.occupancyRate}%`}
          change={3}
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-2xl opacity-50"></div>
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/50 shadow-xl">
            <TabsList className="flex flex-wrap items-center justify-center gap-4 bg-transparent border-0 p-0">
              <TabsTrigger 
                value="overview" 
                className="
                  group relative overflow-hidden
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 
                  data-[state=active]:text-white 
                  data-[state=active]:border-2 data-[state=active]:border-slate-900
                  bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300
                  hover:from-slate-200 hover:via-slate-300 hover:to-slate-400
                  text-slate-700 hover:text-slate-900
                  font-bold 
                  px-6 py-3 text-base
                  shadow-md hover:shadow-lg
                  transform hover:scale-105
                  transition-all duration-300
                  border-2 border-slate-300
                  rounded-xl
                  before:absolute before:inset-0
                  before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/10
                  before:opacity-0 hover:before:opacity-100
                  before:transition-opacity before:duration-300
                  active:scale-95
                "
              >
                <span className="relative z-10 flex items-center gap-3">
                  <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
                    <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:from-slate-700 group-hover:to-slate-900 transition-all duration-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="font-bold">Overview</span>
                </span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="owners" 
                className="
                  group relative overflow-hidden
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 
                  data-[state=active]:text-white 
                  data-[state=active]:border-2 data-[state=active]:border-slate-900
                  bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300
                  hover:from-slate-200 hover:via-slate-300 hover:to-slate-400
                  text-slate-700 hover:text-slate-900
                  font-bold 
                  px-6 py-3 text-base
                  shadow-md hover:shadow-lg
                  transform hover:scale-105
                  transition-all duration-300
                  border-2 border-slate-300
                  rounded-xl
                  before:absolute before:inset-0
                  before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/10
                  before:opacity-0 hover:before:opacity-100
                  before:transition-opacity before:duration-300
                  active:scale-95
                "
              >
                <span className="relative z-10 flex items-center gap-3">
                  <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
                    <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:from-slate-700 group-hover:to-slate-900 transition-all duration-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="font-bold">Owners</span>
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black px-2 py-1 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-md">
                    {owners.filter(o => o.status === 'pending').length}
                  </div>
                </span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="properties" 
                className="
                  group relative overflow-hidden
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 
                  data-[state=active]:text-white 
                  data-[state=active]:border-2 data-[state=active]:border-slate-900
                  bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300
                  hover:from-slate-200 hover:via-slate-300 hover:to-slate-400
                  text-slate-700 hover:text-slate-900
                  font-bold 
                  px-6 py-3 text-base
                  shadow-md hover:shadow-lg
                  transform hover:scale-105
                  transition-all duration-300
                  border-2 border-slate-300
                  rounded-xl
                  before:absolute before:inset-0
                  before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/10
                  before:opacity-0 hover:before:opacity-100
                  before:transition-opacity before:duration-300
                  active:scale-95
                "
              >
                <span className="relative z-10 flex items-center gap-3">
                  <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
                    <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:from-slate-700 group-hover:to-slate-900 transition-all duration-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="font-bold">Properties</span>
                </span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="bookings" 
                className="
                  group relative overflow-hidden
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 
                  data-[state=active]:text-white 
                  data-[state=active]:border-2 data-[state=active]:border-slate-900
                  bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300
                  hover:from-slate-200 hover:via-slate-300 hover:to-slate-400
                  text-slate-700 hover:text-slate-900
                  font-bold 
                  px-6 py-3 text-base
                  shadow-md hover:shadow-lg
                  transform hover:scale-105
                  transition-all duration-300
                  border-2 border-slate-300
                  rounded-xl
                  before:absolute before:inset-0
                  before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/10
                  before:opacity-0 hover:before:opacity-100
                  before:transition-opacity before:duration-300
                  active:scale-95
                "
              >
                <span className="relative z-10 flex items-center gap-3">
                  <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
                    <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:from-slate-700 group-hover:to-slate-900 transition-all duration-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="font-bold">Bookings</span>
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-2 py-1 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-md">
                    {bookings.filter(b => b.status === 'pending').length}
                  </div>
                </span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="alerts" 
                className="
                  group relative overflow-hidden
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 
                  data-[state=active]:text-white 
                  data-[state=active]:border-2 data-[state=active]:border-slate-900
                  bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300
                  hover:from-slate-200 hover:via-slate-300 hover:to-slate-400
                  text-slate-700 hover:text-slate-900
                  font-bold 
                  px-6 py-3 text-base
                  shadow-md hover:shadow-lg
                  transform hover:scale-105
                  transition-all duration-300
                  border-2 border-slate-300
                  rounded-xl
                  before:absolute before:inset-0
                  before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/10
                  before:opacity-0 hover:before:opacity-100
                  before:transition-opacity before:duration-300
                  active:scale-95
                "
              >
                <span className="relative z-10 flex items-center gap-3">
                  <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
                    <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:from-slate-700 group-hover:to-slate-900 transition-all duration-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="font-bold">Alerts</span>
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black px-2 py-1 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-md">
                    {alerts.filter(a => a.status === 'open').length}
                  </div>
                </span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <OverviewTab 
            recentOwners={owners} 
            metrics={metrics}
            alerts={alerts}
          />
        </TabsContent>

        {/* Owners Tab */}
        <TabsContent value="owners">
          <OwnersTab
            owners={owners}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onSearchChange={setSearchTerm}
            onFilterChange={setFilterStatus}
            onOwnerAction={handleOwnerAction}
          />
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties">
          <PropertiesTab 
            properties={properties}
            onPropertyAction={handlePropertyAction}
          />
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <BookingsTab
            bookings={bookings}
            properties={propertyNames}
            onBookingAction={handleBookingAction}
          />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <AlertsTab alerts={alerts} />
        </TabsContent>
      </Tabs>

      {/* Owner Details Modal */}
      <OwnerDetailsModal
        owner={selectedOwner}
        isOpen={isOwnerModalOpen}
        onClose={() => {
          setIsOwnerModalOpen(false);
          setSelectedOwner(null);
        }}
        onVerify={(ownerId) => {
          handleOwnerAction("verify", ownerId);
          setIsOwnerModalOpen(false);
          setSelectedOwner(null);
        }}
        onReject={(ownerId) => {
          handleOwnerAction("reject", ownerId);
          setIsOwnerModalOpen(false);
          setSelectedOwner(null);
        }}
      />
    </div>
  );
}
