import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent } from '../components/ui/tabs';
import { StaffSection } from '../components/dashboard/StaffSection';
import { BookingSection } from '../components/dashboard/BookingSection';
import { RoomsSection } from '../components/dashboard/RoomsSection';
import { GuestsSection } from '../components/dashboard/GuestsSection';
import { TransactionsSection } from '../components/dashboard/TransactionsSection';
import { BulkUploadModal } from '../components/dashboard/BulkUploadModal';
import StatsCards from '../components/dashboard/StatsCards';
import PropertyInfoCard from '../components/dashboard/PropertyInfoCard';
import ActivityStatsCards from '../components/dashboard/ActivityStatsCards';
import { useDashboard } from '../hooks/useDashboard';
import { sidebarLinks, getIcon } from '../data/mock/sidebarData';
import { 
  Users, 
  Bed, 
  Calendar, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  Home,
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  BarChart3,
  Settings,
  Save,
  Download,
  Upload,
  Edit,
  Trash2,
  Target,
  ChevronDown,
  ChevronRight,
  Building,
  User,
  Shield,
  ShieldCheck,
  FileText,
  CheckCircle,
  RefreshCcw,
  MessageSquare,
  Eye,
  Mail,
  Phone,
  MapPin,
  Hash,
  Package,
  Image,
  Info,
  Check,
  Plus,
  Edit2,
  Trash2 as TrashIcon,
  Star
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isPensionOwner, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  // All state must be declared before any early returns (React hooks rule)
  const [showCreatePension, setShowCreatePension] = useState(false);
  const [newPension, setNewPension] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    capacity: ''
  });
  const [pensions, setPensions] = useState<any[]>([]);
  const [userPension, setUserPension] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsData, setRoomsData] = useState<any[]>([
    { id: 101, type: 'Single', status: 'Available', price: 1000, capacity: 1 },
    { id: 102, type: 'Double', status: 'Occupied', price: 1500, capacity: 2 },
    { id: 103, type: 'Suite', status: 'Available', price: 2500, capacity: 3 },
    { id: 104, type: 'Single', status: 'Maintenance', price: 1000, capacity: 1 },
    { id: 105, type: 'Double', status: 'Available', price: 1500, capacity: 2 }
  ]);
  const [packages, setPackageList] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [staffData, setStaffData] = useState<any[]>([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [newStaff, setNewStaff] = useState({
    full_name: '',
    role: '',
    phone: '',
    salary: '',
    pension_id: '',
    owner_id: '',
    department: '',
    email: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Show loading while checking authentication (AFTER all hooks)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle pension creation
  const handleCreatePension = async () => {
    try {
      const response = await apiService.createPension(newPension);
      if (response.success) {
        setShowCreatePension(false);
        setNewPension({ name: '', description: '', address: '', phone: '', email: '', capacity: '' });
        loadRealData(); // Refresh data
      }
    } catch (error) {
      console.error('Error creating pension:', error);
    }
  };


  // Derived Real Statistics
  const totalRevenue = bookings.reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);
  const totalBookings = bookings.length;
  const activePensions = pensions.filter(p => p.status === 'active' || p.status === 'Approved').length;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length 
    : 0;

  // Additional Real Stats for Reports
  const currentOccupancy = roomsData.length > 0 
    ? Math.round((bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length / roomsData.length) * 100) 
    : 0;

  const avgStayDuration = bookings.length > 0
    ? (bookings.reduce((sum, b) => {
        const start = new Date(b.check_in_date).getTime();
        const end = new Date(b.check_out_date).getTime();
        return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      }, 0) / bookings.length).toFixed(1)
    : "0";

  // Financial Reports - All Real
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";
  const cancelledBookings = bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length;
  const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : "0";
  const confirmedRevenue = bookings.filter(b => b.status?.toLowerCase() === 'confirmed').reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
  const pendingRevenue = bookings.filter(b => b.status?.toLowerCase() === 'pending').reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
  
  // Expense breakdown by category
  const expensesByCategory = expensesData.reduce((acc: any, exp: any) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (parseFloat(exp.amount) || 0);
    return acc;
  }, {});

  // Derive Guests and Transactions from Bookings
  const guestsData = bookings.map(b => ({
    id: b.id,
    name: b.user_name || 'Guest',
    email: b.user_email || '',
    phone: b.user_phone || '',
    checkIn: b.check_in_date,
    checkOut: b.check_out_date,
    room: b.room_name || 'N/A',
    status: b.status,
    nationality: 'Ethiopian',
    roomId: b.room_name || 'N/A',
    totalBookings: 1,
    totalSpent: parseFloat(b.total_price) || 0
  }));

  const recentTransactions = bookings.map(b => ({
    id: b.id,
    date: new Date(b.created_at || Date.now()).toISOString().split('T')[0],
    description: `Booking - ${b.user_name || 'Guest'} (${b.room_name || 'Room'})`,
    type: b.type || 'income',
    amount: parseFloat(b.total_price) || 0,
    status: b.status === 'confirmed' ? 'completed' : b.status
  }));

  const loadRealData = async () => {
    // Only load data if user is authenticated
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // 1. Initial batch load
      const [
        bookingsResponse,
        pensionsResponse,
        reviewsResponse
      ] = await Promise.all([
        apiService.getBookings(),
        apiService.getPensions(),
        apiService.getMyReviews()
      ]);

      // Update basic state
      setBookings(bookingsResponse?.data?.items || []);
      const pensionsData = pensionsResponse?.data?.items || pensionsResponse?.data || [];
      const pensionsArray = Array.isArray(pensionsData) ? pensionsData : [];
      setPensions(pensionsArray);
      setReviews(reviewsResponse?.data?.items || []);

      // 2. Find user's pension
      const userId = user?.id;
      const foundUserPension = pensionsArray.find(p => 
        p.owner_id === userId || 
        p.owner_id?.toString() === userId?.toString()
      );

      if (foundUserPension) {
        setUserPension(foundUserPension);
        const pensionId = foundUserPension.id || foundUserPension.pension_id;

        // 3. Second batch load for pension-specific data
        const [
          staffResponse,
          roomsResponse,
          packagesResponse
        ] = await Promise.all([
          apiService.getStaff(pensionId),
          apiService.getRooms(pensionId),
          apiService.getPackages(pensionId)
        ]);

        // Update staff data
        if (staffResponse?.data) {
          const normalizedStaff = staffResponse.data.map((member: any) => ({
            ...member,
            id: (member.id || member.staff_id || '').toString(),
            status: (member.status || 'active').toLowerCase()
          }));
          setStaffData(normalizedStaff);
        }

        // Update rooms data
        if (roomsResponse?.data?.items) {
          const normalizedRooms = roomsResponse.data.items.map((room: any) => ({
            ...room,
            id: room.id || room.room_id,
            status: room.is_available ? 'Available' : 'Occupied',
            price: room.price_per_night,
            type: room.type.charAt(0).toUpperCase() + room.type.slice(1)
          }));
          setRoomsData(normalizedRooms);
        }

        // Update packages
        if (packagesResponse?.data) {
          setPackageList(packagesResponse.data);
        }

        // Load expenses
        try {
          const expensesResponse = await apiService.getExpenses(pensionId);
          if (expensesResponse?.data) {
            setExpensesData(expensesResponse.data.items || []);
            setTotalExpenses(expensesResponse.data.totalExpenses || 0);
          }
        } catch (expErr) {
          // No expenses data yet
        }
      }

    } catch (error) {
      console.error('Error loading real data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, [activeTab, isAuthenticated, user, pensions.length]);

  // Type for property settings
  interface PropertySettings {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    ownerInfo: string;
    roomDetails: string;
    capacity: number;
    amenities: string[];
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
  }

  // Settings states
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    id: '',
    type: '',
    floor: '',
    price: '',
    status: 'Available',
    capacity: '',
    package: 'Standard',
    customPackageName: '',
    customPackagePrice: '',
    imageType: 'Normal',
    images: []
  });

  // Package management states
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [newPackage, setNewPackage] = useState({
    name: '',
    price: '',
    description: '',
    services: ['WiFi', 'Clean Room', 'Basic Amenities'],
    availableRooms: 1,
    isMostPopular: false,
    image: ''
  });
  
  const [propertySettings, setPropertySettings] = useState<PropertySettings>({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    ownerInfo: "",
    roomDetails: "",
    capacity: 0,
    amenities: [],
    checkInTime: "12:00",
    checkOutTime: "10:00",
    cancellationPolicy: "Flexible"
  });

  const [actualRoomStats, setActualRoomStats] = useState({
    totalRooms: 0,
    availableRooms: 0
  });

  // Fetch actual room statistics
  const fetchRoomStats = async (pensionId: string) => {
    try {
      const response = await fetch(`http://localhost:3005/api/rooms/stats/${pensionId}`);
      const data = await response.json();
      if (data.success) {
        setActualRoomStats({
          totalRooms: data.data.totalRooms,
          availableRooms: data.data.availableRooms
        });
      }
    } catch (error) {
      console.error('Error fetching room stats:', error);
    }
  };

  // Load pension data when component mounts or pensions change
  useEffect(() => {
    if (pensions.length > 0) {
      // Find the pension that belongs to this user
      const foundPension = pensions.find(p => 
        p.owner_id === user?.id
      );
      
      setUserPension(foundPension || null); // Set the state variable

      if (foundPension) {
        setPropertySettings({
          name: foundPension.name || "",
          address: foundPension.address || "",
          phone: foundPension.phone || "",
          email: foundPension.email || "",
          website: "",
          description: foundPension.description || "",
          ownerInfo: foundPension.owner_info || `Managed by ${user?.full_name || 'Property Owner'}`,
          roomDetails: foundPension.room_details || "",
          capacity: foundPension.capacity || 0,
          amenities: [],
          checkInTime: "12:00",
          checkOutTime: "10:00",
          cancellationPolicy: "Flexible"
        });
        
        // Fetch actual room statistics
        fetchRoomStats(foundPension.pension_id || foundPension.id);
      } else {
        // No pension belongs to this user, use default values
        setPropertySettings({
          name: "",
          address: "",
          phone: "",
          email: "",
          website: "",
          description: "",
          ownerInfo: "",
          roomDetails: "",
          capacity: 0,
          amenities: [],
          checkInTime: "12:00",
          checkOutTime: "10:00",
          cancellationPolicy: "Flexible"
        });
      }
    } else {
      // No pensions at all, use default values
      setUserPension(null); // Ensure userPension is null if no pensions
      setPropertySettings({
        name: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        description: "",
        ownerInfo: "",
        roomDetails: "",
        capacity: 0,
        amenities: [],
        checkInTime: "12:00",
        checkOutTime: "10:00",
        cancellationPolicy: "Flexible"
      });
    }
  }, [pensions, user]);

  // Load staff data
  useEffect(() => {
    const fetchStaff = async () => {
      if (activeTab === 'staff' && userPension && userPension.pension_id) { // Added null check
        setIsStaffLoading(true);
        try {
          const response = await apiService.getStaff(userPension.pension_id);
          const mappedStaff = response.data.map((s: any) => ({
            ...s,
            id: (s.id || s.staff_id).toString(),
            status: s.status === 'active' ? 'Active' : s.status === 'inactive' ? 'Inactive' : 'On Leave'
          }));
          setStaffData(mappedStaff);
        } catch (error) {
          console.error('Failed to fetch staff:', error);
        } finally {
          setIsStaffLoading(false);
        }
      }
    };
    fetchStaff();
  }, [activeTab, userPension]); // Added userPension to dependencies

  const handleEditStaff = (member: any) => {
    setEditingStaff(member);
    setNewStaff({
      full_name: member.full_name || '',
      role: member.role || '',
      department: member.department || '',
      email: member.email || '',
      phone: member.phone || '',
      salary: member.salary ? member.salary.toString() : '',
      status: member.status ? member.status.toLowerCase() : 'active'
    });
    setShowAddStaffModal(true);
  };

  const handleSaveStaff = async () => {
    const foundPension = pensions.find(p => p.owner_id === user?.id);
    if (!foundPension) {
      alert('Please create a pension first!');
      return;
    }
    
    try {
      // Prepare staff data with required fields
      const staffData = {
        ...newStaff,
        pension_id: foundPension.pension_id || foundPension.id,
        owner_id: user?.id
      };

      if (editingStaff) {
        await apiService.updateStaff(parseInt(editingStaff.id), staffData);
      } else {
        await apiService.addStaff(foundPension.pension_id || foundPension.id, staffData);
      }
      setShowAddStaffModal(false);
      setNewStaff({ 
        full_name: '',    // matches database column
        role: '', 
        phone: '',
        salary: '',
        pension_id: '',   // will be set dynamically
        owner_id: '',     // will be set dynamically
        department: '',    // reset department
        email: '',        // reset email
        status: 'active'  // reset status
      });
      setEditingStaff(null);
      // Refresh staff list
      const response = await apiService.getStaff(foundPension.pension_id || foundPension.id);
      const mappedStaff = response.data.map((s: any) => ({
        ...s,
        id: (s.id || s.staff_id).toString(),
        status: s.status === 'active' ? 'Active' : s.status === 'inactive' ? 'Inactive' : 'On Leave'
      }));
      setStaffData(mappedStaff);
    } catch (error) {
      console.error('Failed to save staff:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await apiService.deleteStaff(parseInt(id));
      const foundPension = pensions.find(p => p.owner_id === user?.id);
      if (foundPension) {
        const response = await apiService.getStaff(foundPension.pension_id || foundPension.id);
        const mappedStaff = response.data.map((s: any) => ({
          ...s,
          id: (s.id || s.staff_id).toString(),
          status: s.status === 'active' ? 'Active' : s.status === 'inactive' ? 'Inactive' : 'On Leave'
        }));
        setStaffData(mappedStaff);
      }
    } catch (error) {
      console.error('Failed to delete staff:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handlePackageImageUpload = async (file: File) => {
    try {
      const response = await apiService.uploadImage(file);
      if (response.success && editingPackage) {
        setEditingPackage({ ...editingPackage, image: response.data.url });
      } else if (response.success) {
        setNewPackage({ ...newPackage, image: response.data.url } as any);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true
  });

  const [complianceSettings, setComplianceSettings] = useState({
    licenseNumber: "BUS-2024-8892",
    expiryDate: "2024-12-31",
    status: "Active",
    insurancePolicy: "Comprehensive Business Insurance - Policy #INS-2024-4567",
    lastTaxClearance: "2024-03-15",
    safetyCertificate: "Valid until 2024-06-30"
  });

  // Settings handlers
  const handleSavePropertySettings = async () => {
    try {
      setIsUpdating(true);
      
      // Check if user has their own pension
      const foundPension = pensions.find(p => 
        p.owner_id === user?.id
      );
      
      setUserPension(foundPension);

      if (foundPension) {
        // Update existing pension
        const pensionId = foundPension.pension_id || foundPension.id;
        
        await apiService.updatePension(pensionId, {
          name: propertySettings.name,
          address: propertySettings.address,
          phone: propertySettings.phone,
          email: propertySettings.email,
          description: propertySettings.description,
          owner_info: propertySettings.ownerInfo,
          room_details: propertySettings.roomDetails,
          capacity: propertySettings.capacity
        });
        
      } else if (pensions.length === 0) {
        // No pensions exist - create first pension for this user
        
        const newPension = await apiService.createPension({
          name: propertySettings.name || "New Pension",
          address: propertySettings.address || "New Address",
          description: propertySettings.description || "New pension description",
          capacity: 5
        });
        
        alert('New pension created successfully!');
        
      } else {
        // Pensions exist but none belong to this user
        alert('Creating new pension for this owner...');
        
        const newPension = await apiService.createPension({
          name: propertySettings.name || "Owner's Pension",
          address: propertySettings.address || "Owner's Address",
          description: propertySettings.description || "Owner's pension description",
          capacity: 5
        });
        
        alert('Owner pension created successfully!');
      }
      
      // Refresh data
      loadRealData();
      
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error in handleSavePropertySettings:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveSecuritySettings = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
    setSecuritySettings({ ...securitySettings, currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSaveComplianceSettings = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Package management functions
  const handleAddPackage = async () => {
    try {
      if (newPackage.name && newPackage.price && newPackage.description) {
        // Get user's pension ID
        const foundPension = pensions.find(p => 
          p.owner_id === user?.id
        );
        
        if (foundPension) {
          const packageData = {
            name: newPackage.name,
            price: parseInt(newPackage.price),
            description: newPackage.description,
            services: newPackage.services,
            availableRooms: newPackage.availableRooms,
            image: (newPackage as any).image || ''
          };

          if (editingPackage) {
            // Update existing package
            await apiService.updatePackage(foundPension.pension_id || foundPension.id, parseInt(editingPackage.id), packageData);
            const updatedPackages = packages.map(pkg => pkg.id === editingPackage.id ? { ...packageData, id: editingPackage.id, isMostPopular: pkg.isMostPopular } : pkg);
            setPackageList(updatedPackages);
            setPackages(updatedPackages);
            setEditingPackage(null);
          } else {
            // Create new package
            const response = await apiService.createPackage(foundPension.pension_id || foundPension.id, packageData);
            const newPkg = { ...packageData, id: response.data?.package?.id || Date.now().toString(), isMostPopular: false };
            const updatedPackages = [...packages, newPkg];
            setPackageList(updatedPackages);
            setPackages(updatedPackages);
          }
          
          setNewPackage({ name: '', price: '', description: '', services: ['WiFi', 'Clean Room', 'Basic Amenities'], availableRooms: 1, isMostPopular: false, image: '' });
          setShowAddPackageModal(false);
          setShowSaveSuccess(true);
          setTimeout(() => setShowSaveSuccess(false), 3000);
        } else {
          alert('Please create a pension first before adding packages!');
          return;
        }
      }
    } catch (error) {
      console.error('Error saving package:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditPackage = (pkg: any) => {
    setEditingPackage(pkg);
    setNewPackage({
      name: pkg.name,
      price: pkg.price.toString(),
      description: pkg.description,
      services: pkg.services || ['WiFi', 'Clean Room', 'Basic Amenities'],
      availableRooms: pkg.availableRooms || 1,
      isMostPopular: pkg.isMostPopular,
      image: pkg.image || ''
    });
    setShowAddPackageModal(true);
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      // Get user's pension ID
      const foundPension = pensions.find(p => 
        p.owner_id === user?.id
      );
      
      if (foundPension) {
        await apiService.deletePackage(foundPension.pension_id || foundPension.id, parseInt(packageId));
        const updatedPackages = packages.filter(pkg => pkg.id !== packageId);
        setPackageList(updatedPackages);
        setPackages(updatedPackages);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      } else {
        alert('No pension found!');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleToggleMostPopular = async (packageId: string) => {
    try {
      // Find the package to toggle
      const packageToToggle = packages.find(pkg => pkg.id === packageId);
      if (!packageToToggle) return;

      // Get user's pension ID
      const foundPension = pensions.find(p => 
        p.owner_id === user?.id
      );
      
      if (foundPension) {
        const newPopularStatus = !packageToToggle.isMostPopular;
        
        // Update backend
        await apiService.updatePackage(foundPension.pension_id || foundPension.id, parseInt(packageId), {
          isMostPopular: newPopularStatus
        });
        
        // Update frontend state
        const updatedPackages = packages.map(pkg => ({
          ...pkg,
          isMostPopular: pkg.id === packageId ? newPopularStatus : (newPopularStatus ? false : pkg.isMostPopular)
        }));
        setPackages(updatedPackages);
        if (currentPension) {
          setPackageList(updatedPackages);
        }
      }
    } catch (error) {
      console.error('Failed to update popular status:', error);
    }
  };

  const handleToggleTwoFactor = () => {
    setSecuritySettings({ ...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled });
  };

  const handleUpdateBookingStatus = async (bookingId: string | number, newStatus: string) => {
    try {
      const response = await apiService.updateBookingStatus(bookingId, newStatus);
      if (response.success) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        // Refresh data to update room availability and reports
        loadRealData();
      } else {
        alert(`Failed to update booking: ${response.message}`);
      }
    } catch (error: any) {
      console.error('Update booking status error:', error);
      alert('Error updating booking status.');
    }
  };

  const handleCompleteBookingEarly = async (bookingId: string | number) => {
    try {
      const response = await apiService.completeBookingEarly(bookingId);
      if (response.success) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'completed' } : b));
        // Refresh data to update room availability and reports
        loadRealData();
        alert('Booking completed early. Room is now available.');
      } else {
        alert(`Failed to complete booking early: ${response.message}`);
      }
    } catch (error: any) {
      console.error('Complete booking early error:', error);
      alert('Error completing booking early.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const {
    viewModes,
    showStaffBulkUploadModal,
    staffBulkUpload,
    showRoomsBulkUploadModal,
    roomsBulkUpload,
    toggleViewMode,
    setShowStaffBulkUploadModal,
    setShowRoomsBulkUploadModal,
    handleStaffBulkFileUpload,
    handleStaffBulkUploadConfirm,
    handleRoomsBulkFileUpload,
    handleRoomsBulkUploadConfirm,
    downloadStaffTemplate,
    downloadRoomsTemplate
  } = useDashboard();

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 border-r bg-white shadow-sm z-50 transform transition-transform duration-300 ease-in-out flex-shrink-0 overflow-hidden ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:sticky lg:top-0`}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Home className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">PensionHub</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-3 py-6">
            {sidebarLinks.map((link) => {
              const Icon = getIcon(link.icon);
              const isActive = activeTab === link.id || (link.id === "settings" && activeTab.startsWith("settings-")) || 
                     (link.id === "settings" && link.sublinks && activeTab === `settings-${link.sublinks.find((sub: any) => sub.id === activeTab.split("-")[1])?.id}`);

              if (link.id === "settings" && link.sublinks) {
                return (
                  <div key={link.id} className="space-y-1">
                    <button
                      onClick={() => {
                        setSettingsExpanded(!settingsExpanded);
                        if (!settingsExpanded) {
                          setActiveTab("settings-pension-profile");
                        }
                        if (window.innerWidth < 1024) setMobileSidebarOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                      <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${settingsExpanded ? "rotate-180" : ""}`} />
                    </button>
                    
                    {settingsExpanded && (
                      <div className="ml-2 space-y-0.5">
                        {link.sublinks.map((sub) => {
                          const SubIcon = getIcon(sub.icon);
                          const isSubActive = activeTab === `settings-${sub.id}`;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setActiveTab(`settings-${sub.id}`);
                                if (window.innerWidth < 1024) setMobileSidebarOpen(false);
                              }}
                              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 text-[13px] font-bold transition-all duration-200 ${isSubActive
                                ? "text-primary bg-primary/10"
                                : "text-slate-600 hover:bg-white hover:text-primary"
                                }`}
                            >
                              <SubIcon className="h-3.5 w-3.5" />
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setSettingsExpanded(false);
                    if (window.innerWidth < 1024) setMobileSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-600 hover:bg-white hover:text-primary transition-colors font-medium text-sm"
              onClick={() => {
                navigate("/");
                if (window.innerWidth < 1024) {
                  setMobileSidebarOpen(false);
                }
              }}
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white/80 backdrop-blur-md px-4 lg:px-8 shadow-sm overflow-hidden">
          {isSearchOpenMobile ? (
            <div className="flex items-center w-full gap-3 animate-in slide-in-from-right-4 duration-300">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setIsSearchOpenMobile(false)}
              >
                <X className="h-5 w-5 text-slate-500" />
              </Button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  autoFocus
                  type="search"
                  placeholder="Search bookings, rooms, guests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-slate-100 pl-10 h-10 rounded-full focus-visible:ring-primary focus-visible:bg-white transition-all shadow-none"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 text-slate-500 hover:text-primary transition-colors rounded-full bg-slate-50"
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                >
                  {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                <h1 className="text-lg font-bold lg:text-xl capitalize text-slate-900 truncate">
                  {activeTab === "staff" ? "Staff & HR Management" : 
                   activeTab === "overview" ? "Dashboard Overview" : 
                   activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Search Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex h-9 w-9 text-slate-500 hover:text-primary transition-colors rounded-full bg-slate-50"
                  onClick={() => setIsSearchOpenMobile(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 text-slate-500 hover:text-primary transition-colors rounded-full bg-slate-50"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Avatar */}
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user?.full_name || 'Admin User'}</p>
                    <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
                  </div>
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'AU'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </>
          )}
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          {/* Section Headers - Only show when not overview */}
          {activeTab !== "overview" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {activeTab === "staff" ? "Staff & HR Management" : 
                   activeTab === "bookings" ? "Bookings Management" :
                   activeTab === "rooms" ? "Rooms Management" :
                   activeTab === "guests" ? "Guests Management" :
                   activeTab === "transactions" ? "Transactions" :
                   activeTab === "reports" ? "Reports & Analytics" :
                   activeTab.startsWith("settings-") ? "Settings" :
                   "Dashboard Overview"}
                </h2>
                <p className="text-slate-500 mt-1">
                  {activeTab === "staff" ? "Manage your team, roles, and payroll information." :
                   activeTab === "bookings" ? "Manage all room bookings and reservations." :
                   activeTab === "rooms" ? "Manage all rooms and their availability." :
                   activeTab === "guests" ? "Manage guest information and booking history." :
                   activeTab === "transactions" ? "View all financial transactions." :
                   activeTab === "reports" ? "Generate detailed reports and insights." :
                   activeTab.startsWith("settings-") ? "Manage your account settings." :
                   "Welcome back! Here's what's happening with your property today."}
                </p>
              </div>
              {activeTab === "bookings" && (
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Calendar className="h-4 w-4" />
                  New Booking
                </Button>
              )}
              {activeTab === "staff" && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2 hover:bg-emerald-50 hover:text-emerald-600"
                    onClick={() => setShowStaffBulkUploadModal(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Bulk Upload
                  </Button>
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <Users className="h-4 w-4" />
                    Add Staff Member
                  </Button>
                </div>
              )}
              {activeTab === "rooms" && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2 hover:bg-emerald-50 hover:text-emerald-600"
                    onClick={() => setShowRoomsBulkUploadModal(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Bulk Upload
                  </Button>
                  <Button 
                    onClick={() => setShowAddRoomModal(true)}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Bed className="h-4 w-4" />
                    Add Room
                  </Button>
                </div>
              )}
              {activeTab === "guests" && (
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Users className="h-4 w-4" />
                  Add Guest
                </Button>
              )}
              {activeTab === "transactions" && (
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
              {activeTab === "reports" && (
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <BarChart3 className="h-4 w-4" />
                  Generate Report
                </Button>
              )}
              {activeTab.startsWith("settings-") && (
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              )}
            </div>
          )}

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading dashboard data...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800">
                  <p className="font-semibold">Error loading data</p>
                  <p className="text-sm">{error}</p>
                  <Button 
                    onClick={loadRealData} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Overview Section */}
            {activeTab === "overview" && !loading && !error && (
              <>
                {/* Add Create Pension Button */}
                {isPensionOwner && (
                  <div className="mb-6">
                    <Button 
                      onClick={() => setShowCreatePension(true)}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      + Create New Pension
                    </Button>
                  </div>
                )}

                {/* Create Pension Modal */}
                {showCreatePension && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                      <CardHeader>
                        <CardTitle>Create New Pension</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="name">Pension Name *</Label>
                          <Input
                            id="name"
                            value={newPension.name}
                            onChange={(e) => setNewPension({...newPension, name: e.target.value})}
                            placeholder="Enter pension name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address *</Label>
                          <Input
                            id="address"
                            value={newPension.address}
                            onChange={(e) => setNewPension({...newPension, address: e.target.value})}
                            placeholder="Enter address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={newPension.description}
                            onChange={(e) => setNewPension({...newPension, description: e.target.value})}
                            placeholder="Enter description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={newPension.phone}
                            onChange={(e) => setNewPension({...newPension, phone: e.target.value})}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newPension.email}
                            onChange={(e) => setNewPension({...newPension, email: e.target.value})}
                            placeholder="Enter email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="capacity">Capacity</Label>
                          <Input
                            id="capacity"
                            type="number"
                            value={newPension.capacity}
                            onChange={(e) => setNewPension({...newPension, capacity: e.target.value})}
                            placeholder="Enter capacity"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button 
                            onClick={handleCreatePension}
                            disabled={!newPension.name || !newPension.address}
                            className="flex-1"
                          >
                            Create Pension
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowCreatePension(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Stats Cards */}
                <StatsCards 
                  staffCount={staffData.length}
                  availableRooms={actualRoomStats.availableRooms}
                  activeBookings={bookings.length}
                  totalRevenue={totalRevenue}
                />

                {/* Property Info Card */}
                <PropertyInfoCard 
                  propertySettings={{
                    ...propertySettings,
                    capacity: propertySettings.capacity?.toString() || '0'
                  }} 
                />

                <ActivityStatsCards 
                  recentTransactions={recentTransactions}
                  staffCount={staffData.length}
                  availableRooms={actualRoomStats.availableRooms}
                  activeBookings={bookings.length}
                  guestsCount={guestsData.length}
                />
              </>
            )}

            {/* Staff Section */}
            {activeTab === "staff" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ring-1 ring-slate-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Staff Management</h2>
                      <p className="text-xs text-slate-500 font-medium">Manage your employees and payroll</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setShowStaffBulkUploadModal(true)}
                      className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
                    <Button 
                      onClick={() => {
                        setEditingStaff(null);
                        setNewStaff({
                          full_name: '',
                          role: '',
                          department: '',
                          email: '',
                          phone: '',
                          salary: '',
                          status: 'active'
                        });
                        setShowAddStaffModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Staff Member
                    </Button>
                  </div>
                </div>

                <StaffSection
                  staff={staffData}
                  viewMode={viewModes.staff}
                  onToggleView={() => toggleViewMode('staff')}
                  onEditStaff={(id) => handleEditStaff(staffData.find(s => s.id === id))}
                  onDeleteStaff={(id) => handleDeleteStaff(id)}
                  downloadTemplate={downloadStaffTemplate}
                />
              </div>
            )}

            {/* Bookings Section */}
            {activeTab === "bookings" && (
              <BookingSection 
                bookings={bookings}
                viewMode={viewModes.bookings}
                onToggleView={() => toggleViewMode('bookings')}
                onUpdateStatus={handleUpdateBookingStatus}
                onCompleteEarly={handleCompleteBookingEarly}
              />
            )}

            {/* Rooms Section */}
            {activeTab === "rooms" && (
              <RoomsSection 
                rooms={roomsData}
                viewMode={viewModes.rooms}
                onToggleView={() => toggleViewMode('rooms')}
              />
            )}

            {/* Guests Section */}
            {activeTab === "guests" && (
              <GuestsSection 
                guests={guestsData}
                viewMode={viewModes.guests}
                onToggleView={() => toggleViewMode('guests')}
              />
            )}

            {/* Transactions Section */}
            {activeTab === "transactions" && (
              <TransactionsSection transactions={recentTransactions} />
            )}

            {/* Reports Section */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                {/* Financial Overview Cards */}
                <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-emerald-50 via-emerald-100 to-green-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Total Revenue</p>
                          </div>
                          <p className="text-3xl font-bold text-emerald-800 group-hover:text-emerald-900 transition-colors">ETB {totalRevenue.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-2 p-2 bg-green-100/50 rounded-lg">
                            <CalendarCheck className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-bold text-green-700">{totalBookings} bookings total</span>
                          </div>
                        </div>
                        <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:shadow-emerald-500/25">
                          <DollarSign className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-red-50 via-red-100 to-pink-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Total Expenses</p>
                          </div>
                          <p className="text-3xl font-bold text-red-800 group-hover:text-red-900 transition-colors">ETB {totalExpenses.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-2 p-2 bg-amber-100/50 rounded-lg">
                            <FileText className="h-4 w-4 text-amber-600" />
                            <span className="text-xs font-bold text-amber-700">{expensesData.length} entries logged</span>
                          </div>
                        </div>
                        <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-red-500/25">
                          <CreditCard className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Net Profit</p>
                          </div>
                          <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-800' : 'text-red-700'} group-hover:text-blue-900 transition-colors`}>ETB {netProfit.toLocaleString()}</p>
                          <div className={`flex items-center gap-2 mt-2 p-2 rounded-lg ${netProfit >= 0 ? 'bg-green-100/50' : 'bg-red-100/50'}`}>
                            {netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <ArrowDownRight className="h-4 w-4 text-red-600" />}
                            <span className={`text-xs font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{netProfit >= 0 ? 'Profitable' : 'Operating at loss'}</span>
                          </div>
                        </div>
                        <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-blue-500/25">
                          <Target className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Profit Margin</p>
                          </div>
                          <p className="text-3xl font-bold text-purple-800 group-hover:text-purple-900 transition-colors">{profitMargin}%</p>
                          <div className="flex items-center gap-2 mt-2 p-2 bg-purple-100/50 rounded-lg">
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-bold text-purple-700">Revenue vs Expenses ratio</span>
                          </div>
                        </div>
                        <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-purple-500/25">
                          <BarChart3 className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Analytics */}
                <div className="grid gap-6 lg:grid-cols-3">
                  <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden lg:col-span-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg group-hover:shadow-emerald-500/25 group-hover:scale-110 transition-all duration-300">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold text-slate-800">Revenue Breakdown</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-emerald-500/25"></div>
                            <div>
                              <p className="font-bold text-emerald-700">Confirmed Bookings</p>
                              <p className="text-xs text-emerald-600">{bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length} bookings</p>
                            </div>
                          </div>
                          <p className="text-xl font-bold text-emerald-700">ETB {confirmedRevenue.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-amber-500/25"></div>
                            <div>
                              <p className="font-bold text-amber-700">Pending Bookings</p>
                              <p className="text-xs text-amber-600">{bookings.filter(b => b.status?.toLowerCase() === 'pending').length} bookings</p>
                            </div>
                          </div>
                          <p className="text-xl font-bold text-amber-700">ETB {pendingRevenue.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-red-500/25"></div>
                            <div>
                              <p className="font-bold text-red-700">Cancelled</p>
                              <p className="text-xs text-red-600">{cancelledBookings} bookings</p>
                            </div>
                          </div>
                          <p className="text-xl font-bold text-red-700">{cancellationRate}% rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg group-hover:shadow-red-500/25 group-hover:scale-110 transition-all duration-300">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold text-slate-800">Expense Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-4">
                        {Object.keys(expensesByCategory).length > 0 ? (
                          Object.entries(expensesByCategory).map(([category, amount]: [string, any]) => (
                            <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <span className="text-sm text-slate-600 capitalize">{category}</span>
                              </div>
                              <span className="font-bold text-slate-900">ETB {amount.toLocaleString()}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-400">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No expenses logged yet</p>
                            <p className="text-xs mt-1">Add expenses using the form below</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Add Expense Form */}
                <Card className="border-none shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
                        <Plus className="h-5 w-5" />
                      </div>
                      <span className="text-lg font-bold text-slate-800">Log New Expense</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const formData = new FormData(form);
                      const pensionId = pensions[0]?.pension_id;
                      if (!pensionId) return;
                      try {
                        await apiService.addExpense(pensionId, {
                          category: formData.get('category'),
                          description: formData.get('description'),
                          amount: parseFloat(formData.get('amount') as string),
                          expense_date: formData.get('expense_date')
                        });
                        const resp = await apiService.getExpenses(pensionId);
                        if (resp?.data) {
                          setExpensesData(resp.data.items || []);
                          setTotalExpenses(resp.data.totalExpenses || 0);
                        }
                        form.reset();
                      } catch (err) {
                        console.error('Add expense error:', err);
                      }
                    }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                      <div>
                        <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Category</Label>
                        <select name="category" required className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                          <option value="Staff Salaries">Staff Salaries</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Supplies">Supplies</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Rent">Rent</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Description</Label>
                        <Input name="description" placeholder="E.g. Monthly electricity bill" className="rounded-lg" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Amount (ETB)</Label>
                        <Input name="amount" type="number" step="0.01" required placeholder="0.00" className="rounded-lg" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Date</Label>
                        <Input name="expense_date" type="date" required className="rounded-lg" />
                      </div>
                      <div className="flex items-end">
                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg rounded-lg">
                          <Plus className="h-4 w-4 mr-1.5" /> Add Expense
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <div className="grid gap-6 lg:grid-cols-3">
                  <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover:shadow-purple-500/25 group-hover:scale-110 transition-all duration-300">
                          <BedDouble className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold text-slate-800">Occupancy Metrics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-4">
                        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100">
                          <p className="text-3xl font-bold text-purple-700">{currentOccupancy}%</p>
                          <p className="text-sm text-purple-600 font-medium">Current Occupancy</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100">
                          <p className="text-3xl font-bold text-amber-700">{roomsData.length}</p>
                          <p className="text-sm text-amber-600 font-medium">Total Rooms</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                          <p className="text-3xl font-bold text-blue-700">{roomsData.filter(r => r.status === 'Available').length}</p>
                          <p className="text-sm text-blue-600 font-medium">Available Now</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
                          <CalendarCheck className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold text-slate-800">Booking Trends</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <span className="text-sm text-slate-600">Avg. Stay Duration</span>
                          <span className="font-bold text-slate-900">{avgStayDuration} nights</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <span className="text-sm text-slate-600">Confirmed Bookings</span>
                          <span className="font-bold text-emerald-600">{bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <span className="text-sm text-slate-600">Cancellation Rate</span>
                          <span className="font-bold text-red-600">{cancellationRate}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg group-hover:shadow-emerald-500/25 group-hover:scale-110 transition-all duration-300">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold text-slate-800">Key Metrics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <span className="text-sm text-slate-600">Total Rooms</span>
                          <span className="font-bold text-slate-900">{roomsData.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <span className="text-sm text-slate-600">Total Bookings</span>
                          <span className="font-bold text-slate-900">{totalBookings}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <span className="text-sm text-slate-600">Avg Revenue / Booking</span>
                          <span className="font-bold text-emerald-600">ETB {totalBookings > 0 ? Math.round(totalRevenue / totalBookings).toLocaleString() : 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Settings Sections */}
            {activeTab.startsWith("settings-") && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 capitalize">
                      {activeTab === "settings-legal" ? "Legal Settings" :
                       activeTab === "settings-billing" ? "Billing Settings" :
                       activeTab === "settings-pension" ? "Pension Profile" :
                       "Security Settings"}
                    </h2>
                    <p className="text-slate-500 text-sm">Configure your property and account preferences.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 rounded-lg text-xs font-bold ${activeTab === 'settings-legal' ? 'bg-amber-600 text-white hover:bg-amber-600 shadow-sm' : 'text-slate-500'}`}
                      onClick={() => setActiveTab('settings-legal')}
                    >
                      Legal
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 rounded-lg text-xs font-bold ${activeTab === 'settings-billing' ? 'bg-blue-600 text-white hover:bg-blue-600 shadow-sm' : 'text-slate-500'}`}
                      onClick={() => setActiveTab('settings-billing')}
                    >
                      Billing
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 rounded-lg text-xs font-bold ${activeTab === 'settings-pension' ? 'bg-purple-600 text-white hover:bg-purple-600 shadow-sm' : 'text-slate-500'}`}
                      onClick={() => setActiveTab('settings-pension')}
                    >
                      Pension Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 rounded-lg text-xs font-bold ${activeTab === 'settings-security' ? 'bg-slate-900 text-white hover:bg-slate-900 shadow-sm' : 'text-slate-500'}`}
                      onClick={() => setActiveTab('settings-security')}
                    >
                      Security
                    </Button>
                  </div>
                </div>

                {/* Success Message */}
                {showSaveSuccess && (
                  <div className="group p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-sm relative">Settings saved successfully! Your changes are now live.</span>
                  </div>
                )}

                <Tabs value={activeTab} className="w-full">
                  {/* Legal Settings */}
                  <TabsContent value="settings-legal" className="mt-0">
                    <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden ring-1 ring-slate-100 hover:scale-[1.01]">
                      <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
                      <CardHeader className="pb-4">
                        <CardTitle className="lg:text-2xl font-bold flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors duration-300 hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-amber-500/25">
                            <FileText className="h-6 w-6 hover:rotate-12 transition-transform duration-500" />
                          </div>
                          <span className="hover:text-amber-600 transition-colors duration-300">Legal & Compliance</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <Card className="group border border-slate-200 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                            <CardContent className="p-6 relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="h-6 w-6 text-emerald-600 group-hover:rotate-12 transition-transform duration-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Business License</p>
                                  </div>
                                </div>
                                <Badge className="bg-emerald-500 text-[10px] shadow-emerald-500/25 shadow-sm">Active</Badge>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">{complianceSettings.licenseNumber}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                  <CalendarCheck className="h-3.5 w-3.5" />
                                  Expires: {complianceSettings.expiryDate}
                                </div>
                              </div>
                              <div className="pt-2">
                                <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105" onClick={handleSaveComplianceSettings}>
                                  <RefreshCcw className="h-4 w-4 mr-2" />
                                  Renew Status
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="group border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                            <CardContent className="p-6 relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
                                    <Shield className="h-6 w-6 text-blue-600 group-hover:rotate-12 transition-transform duration-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Insurance</p>
                                  </div>
                                </div>
                                <Badge className="bg-blue-500 text-[10px] shadow-blue-500/25 shadow-sm">Valid</Badge>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">{complianceSettings.insurancePolicy}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                  <CalendarCheck className="h-3.5 w-3.5" />
                                  Valid until 2024-12-31
                                </div>
                              </div>
                              <div className="pt-2">
                                <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Policy
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="group border border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                            <CardContent className="p-6 relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
                                    <ShieldCheck className="h-6 w-6 text-purple-600 group-hover:rotate-12 transition-transform duration-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Tax Clearance</p>
                                  </div>
                                </div>
                                <Badge className="bg-purple-500 text-[10px] shadow-purple-500/25 shadow-sm">Current</Badge>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors duration-300">{complianceSettings.lastTaxClearance}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                  <CalendarCheck className="h-3.5 w-3.5" />
                                  Last filed: 2024-03-15
                                </div>
                              </div>
                              <div className="pt-2">
                                <Button className="w-full h-11 bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Certificate
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="group border border-slate-200 bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                            <CardContent className="p-6 relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle className="h-6 w-6 text-amber-600 group-hover:rotate-12 transition-transform duration-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Safety Certificate</p>
                                  </div>
                                </div>
                                <Badge className="bg-amber-500 text-[10px] shadow-amber-500/25 shadow-sm">Valid</Badge>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors duration-300">{complianceSettings.safetyCertificate}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                  <CalendarCheck className="h-3.5 w-3.5" />
                                  Valid until 2024-06-30
                                </div>
                              </div>
                              <div className="pt-2">
                                <Button className="w-full h-11 bg-amber-600 hover:bg-amber-700 shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Certificate
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Billing Settings */}
                  <TabsContent value="settings-billing" className="mt-0">
                    <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden ring-1 ring-slate-100 hover:scale-[1.01]">
                      <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400" />
                      <CardHeader className="pb-4">
                        <CardTitle className="lg:text-2xl font-bold flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-300 hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-blue-500/25">
                            <CreditCard className="h-6 w-6 hover:rotate-12 transition-transform duration-500" />
                          </div>
                          <span className="hover:text-blue-600 transition-colors duration-300">Billing & Payments</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <Card className="group border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                            <CardContent className="p-6 relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
                                    <DollarSign className="h-6 w-6 text-blue-600 group-hover:rotate-12 transition-transform duration-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Current Plan</p>
                                  </div>
                                </div>
                                <Badge className="bg-blue-500 text-[10px] shadow-blue-500/25 shadow-sm">Premium</Badge>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">ETB 2,999/month</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                  <CalendarCheck className="h-3.5 w-3.5" />
                                  Billed monthly
                                </div>
                              </div>
                              <div className="pt-2">
                                <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                                  <Target className="h-4 w-4 mr-2" />
                                  Upgrade Plan
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="group border border-slate-200 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                            <CardContent className="p-6 relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
                                    <CreditCard className="h-6 w-6 text-emerald-600 group-hover:rotate-12 transition-transform duration-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Payment Method</p>
                                  </div>
                                </div>
                                <Badge className="bg-emerald-500 text-[10px] shadow-emerald-500/25 shadow-sm">Active</Badge>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">••••• •••• •••• •••• ••••</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Visa ending in 4242
                                </div>
                              </div>
                              <div className="pt-2">
                                <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Update Payment Method
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="group border border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                            <CardContent className="p-6 relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="h-6 w-6 text-purple-600 group-hover:rotate-12 transition-transform duration-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Billing History</p>
                                  </div>
                                </div>
                                <Badge className="bg-purple-500 text-[10px] shadow-purple-500/25 shadow-sm">12 Invoices</Badge>
                                <div>
                                  <p className="text-xs">Due: Dec 15, 2024</p>
                                </div>
                            </div>
                            <div className="pt-2">
                              <Button 
                                onClick={() => {
                                  handleSavePropertySettings();
                                }}  
                                disabled={isUpdating || !pensions.length}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-purple-600 hover:border-purple-700 shadow-lg hover:shadow-purple-600/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUpdating ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <Building className="h-4 w-4 mr-2" />
                                    Update Pension Profile
                                  </>
                                )}
                              </Button>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="group border border-slate-200 bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                            <CardContent className="p-6 relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="h-6 w-6 text-amber-600 group-hover:rotate-12 transition-transform duration-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Usage Stats</p>
                                  </div>
                                </div>
                                <Badge className="bg-amber-500 text-[10px] shadow-amber-500/25 shadow-sm">This Month</Badge>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors duration-300">ETB 2,999</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                  <BarChart3 className="h-3.5 w-3.5" />
                                  85% of plan used
                                </div>
                              </div>
                              <div className="pt-2">
                                <Button className="w-full h-11 bg-amber-600 hover:bg-amber-700 shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105">
                                  <BarChart3 className="h-4 w-4 mr-2" />
                                  View Detailed Usage
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-slate-50 group hover:bg-slate-100 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse group-hover:scale-150 transition-transform duration-300"></div>
                              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide group-hover:text-blue-800 transition-colors duration-300">Auto-Renewal</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300">Next billing date: Dec 31, 2024</p>
                              <Button className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg hover:scale-105 transition-all duration-300 hover:shadow-blue-500/25 shadow-sm">
                                Manage Auto-Renewal
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Pension Profile */}
                  <TabsContent value="settings-pension-profile" className="mt-0">
                    <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden ring-1 ring-slate-100 hover:scale-[1.01] relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="h-2 w-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>
                      <CardHeader className="pb-4 relative">
                        <CardTitle className="lg:text-2xl font-bold flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-purple-500/25">
                            <Building className="h-6 w-6 text-purple-600 group-hover:rotate-12 transition-transform duration-500" />
                          </div>
                          <span className="group-hover:text-purple-600 transition-colors duration-300">Pension Profile</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-4 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Building className="h-4 w-4 text-purple-600" />
                              Pension Name
                            </Label>
                            <Input
                              value={propertySettings.name}
                              onChange={(e) => setPropertySettings({ ...propertySettings, name: e.target.value })}
                              placeholder="e.g., Sunshine Pension"
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-purple-600" />
                              Location
                            </Label>
                            <Input
                              value={propertySettings.address}
                              onChange={(e) => setPropertySettings({ ...propertySettings, address: e.target.value })}
                              placeholder="e.g., Bole, Addis Ababa, Ethiopia"
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Phone className="h-4 w-4 text-purple-600" />
                              Contact Phone
                            </Label>
                            <Input
                              value={propertySettings.phone}
                              onChange={(e) => setPropertySettings({ ...propertySettings, phone: e.target.value })}
                              placeholder="+251 911 234 567"
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Mail className="h-4 w-4 text-purple-600" />
                              Contact Email
                            </Label>
                            <Input
                              value={propertySettings.email}
                              onChange={(e) => setPropertySettings({ ...propertySettings, email: e.target.value })}
                              placeholder="info@sunshinepension.com"
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-purple-600" />
                            About Description
                          </Label>
                          <textarea
                            value={propertySettings.description}
                            onChange={(e) => setPropertySettings({ ...propertySettings, description: e.target.value })}
                            placeholder="Describe your pension for customers..."
                            rows={4}
                            className="w-full border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-2 transition-all duration-300 resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            Owner Information
                          </Label>
                          <textarea
                            value={propertySettings.ownerInfo}
                            onChange={(e) => setPropertySettings({ ...propertySettings, ownerInfo: e.target.value })}
                            placeholder="Describe the owner/management company..."
                            rows={2}
                            className="w-full border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-2 transition-all duration-300 resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <BedDouble className="h-4 w-4 text-purple-600" />
                            Room Details
                          </Label>
                          <textarea
                            value={propertySettings.roomDetails}
                            onChange={(e) => setPropertySettings({ ...propertySettings, roomDetails: e.target.value })}
                            placeholder="Describe your room types and features..."
                            rows={2}
                            className="w-full border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-2 transition-all duration-300 resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Package className="h-4 w-4 text-purple-600" />
                            Package Tiers
                          </Label>
                          <div className="space-y-4">
                            {packages.map((pkg: any) => (
                              <div key={pkg.id || pkg.package_id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-purple-300 transition-all duration-300">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-bold text-purple-700">{pkg.name}</h4>
                                    {pkg.isMostPopular && (
                                      <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">Most Popular</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600 mb-2">{pkg.description}</p>
                                  {pkg.services && pkg.services.length > 0 && (
                                    <div className="mb-2">
                                      <div className="flex flex-wrap gap-1">
                                        {pkg.services.map((service: string, index: number) => (
                                          <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            {service}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <p className="text-lg font-bold text-purple-600">ETB {pkg.price.toLocaleString()}/night</p>
                                    {pkg.availableRooms !== undefined && (
                                      <p className="text-xs text-slate-500">
                                        {pkg.availableRooms} room{pkg.availableRooms !== 1 ? 's' : ''} available
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleMostPopular(pkg.id)}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                      pkg.isMostPopular 
                                        ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                    title={pkg.isMostPopular ? 'Remove Most Popular' : 'Set as Most Popular'}
                                  >
                                    <Star className={`h-4 w-4 ${pkg.isMostPopular ? 'fill-current' : ''}`} />
                                  </button>
                                  <button
                                    onClick={() => handleEditPackage(pkg)}
                                    className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200"
                                    title="Edit Package"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePackage(pkg.id)}
                                    disabled={packages.length <= 1}
                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete Package"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                setEditingPackage(null);
                                setNewPackage({ name: '', price: '', description: '', services: ['WiFi', 'Clean Room', 'Basic Amenities'], availableRooms: 1, isMostPopular: false, image: '' });
                                setShowAddPackageModal(true);
                              }}
                              className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50 hover:bg-purple-100 transition-all duration-300 flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700"
                            >
                              <Plus className="h-5 w-5" />
                              <span className="font-semibold">Add New Package</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end pt-6 border-t">
                          <Button
                            className="h-11 px-8 bg-purple-600 hover:bg-purple-700 text-white shadow-xl hover:shadow-purple-500/25 rounded-xl font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => {
                              handleSavePropertySettings();
                            }}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                <Building className="h-4 w-4 mr-2" />
                                Update Pension Profile
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Security Settings */}
                  <TabsContent value="settings-security" className="mt-0">
                    <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden ring-1 ring-slate-100 hover:scale-[1.01]">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="h-2 w-full bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400" />
                      <CardHeader className="pb-4 relative">
                        <CardTitle className="lg:text-2xl font-bold flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-slate-500/25">
                            <Shield className="h-6 w-6 group-hover:rotate-12 transition-transform duration-500" />
                          </div>
                          <span className="group-hover:text-slate-700 transition-colors duration-300">Security Settings</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-4 relative">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Shield className="h-4 w-4 text-slate-600" />
                              Current Password
                            </Label>
                            <Input
                              type="password"
                              value={securitySettings.currentPassword}
                              onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-slate-500/20 hover:border-slate-400 transition-all duration-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-slate-600" />
                              New Password
                            </Label>
                            <Input
                              type="password"
                              value={securitySettings.newPassword}
                              onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-slate-500/20 hover:border-slate-400 transition-all duration-300"
                            />
                          </div>
                        </div>

                        <div className="p-6 rounded-2xl border-2 border-dashed border-red-100 bg-red-50/30 group hover:bg-red-50/50 transition-all duration-300">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-red-600 group-hover:rotate-12 transition-transform duration-500" />
                                <h4 className="font-bold text-red-900">Two-Factor Authentication (2FA)</h4>
                              </div>
                              <p className="text-xs text-red-700/80">Add an extra layer of security to your account</p>
                            </div>
                            <Button
                              variant={securitySettings.twoFactorEnabled ? "default" : "outline"}
                              className={`h-11 px-8 rounded-xl font-black transition-all duration-300 hover:scale-105 ${
                                securitySettings.twoFactorEnabled
                                  ? "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-500/25"
                                  : "border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                              }`}
                              onClick={handleToggleTwoFactor}
                            >
                              {securitySettings.twoFactorEnabled ? "Disable" : "Enable"} 2FA
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end pt-6 border-t">
                          <Button
                            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-xl hover:shadow-slate-500/25 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                            onClick={handleSaveSecuritySettings}
                            disabled={!securitySettings.currentPassword || !securitySettings.newPassword}
                          >
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Update Security Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Pension Profile */}
                  <TabsContent value="settings-pension" className="mt-0">
                    <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden ring-1 ring-slate-100 hover:scale-[1.01] relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500" />
                      <CardHeader className="pb-4 relative">
                        <CardTitle className="lg:text-2xl font-bold flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-purple-500/25">
                            <Building className="h-6 w-6 text-purple-600 group-hover:rotate-12 transition-transform duration-500" />
                          </div>
                          <span className="group-hover:text-purple-600 transition-colors duration-300">Public Pension Profile</span>
                        </CardTitle>
                        <p className="text-slate-600">Manage how your pension appears to customers on the public site</p>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-4 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Building className="h-4 w-4 text-purple-600" />
                              Pension Name
                            </Label>
                            <Input
                              value={propertySettings.name}
                              onChange={(e) => setPropertySettings({ ...propertySettings, name: e.target.value })}
                              placeholder="e.g., Sunshine Pension"
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-purple-600" />
                              Location
                            </Label>
                            <Input
                              value={propertySettings.address}
                              onChange={(e) => setPropertySettings({ ...propertySettings, address: e.target.value })}
                              placeholder="e.g., Bole, Addis Ababa, Ethiopia"
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Phone className="h-4 w-4 text-purple-600" />
                              Contact Phone
                            </Label>
                            <Input
                              value={propertySettings.phone}
                              onChange={(e) => setPropertySettings({ ...propertySettings, phone: e.target.value })}
                              placeholder="+251 911 234 567"
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Mail className="h-4 w-4 text-purple-600" />
                              Contact Email
                            </Label>
                            <Input
                              value={propertySettings.email}
                              onChange={(e) => setPropertySettings({ ...propertySettings, email: e.target.value })}
                              placeholder="info@sunshinepension.com"
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-purple-600" />
                            About Description
                          </Label>
                          <textarea
                            value={propertySettings.description}
                            onChange={(e) => setPropertySettings({ ...propertySettings, description: e.target.value })}
                            placeholder="Describe your pension for customers..."
                            rows={4}
                            className="w-full border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-2 transition-all duration-300 resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            Owner Information
                          </Label>
                          <textarea
                            value={propertySettings.ownerInfo}
                            onChange={(e) => setPropertySettings({ ...propertySettings, ownerInfo: e.target.value })}
                            placeholder="Describe the owner/management company..."
                            rows={2}
                            className="w-full border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-2 transition-all duration-300 resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <BedDouble className="h-4 w-4 text-purple-600" />
                            Room Details
                          </Label>
                          <textarea
                            value={propertySettings.roomDetails}
                            onChange={(e) => setPropertySettings({ ...propertySettings, roomDetails: e.target.value })}
                            placeholder="Describe your room types and features..."
                            rows={2}
                            className="w-full border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-2 transition-all duration-300 resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Package className="h-4 w-4 text-purple-600" />
                            Package Tiers
                          </Label>
                          <div className="space-y-4">
                            {packages.map((pkg: any) => (
                              <div key={pkg.id || pkg.package_id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-purple-300 transition-all duration-300">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-bold text-purple-700">{pkg.name}</h4>
                                    {pkg.isMostPopular && (
                                      <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">Most Popular</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600 mb-2">{pkg.description}</p>
                                  {pkg.services && pkg.services.length > 0 && (
                                    <div className="mb-2">
                                      <div className="flex flex-wrap gap-1">
                                        {pkg.services.map((service: string, index: number) => (
                                          <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            {service}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <p className="text-lg font-bold text-purple-600">ETB {pkg.price.toLocaleString()}/night</p>
                                    {pkg.availableRooms !== undefined && (
                                      <p className="text-xs text-slate-500">
                                        {pkg.availableRooms} room{pkg.availableRooms !== 1 ? 's' : ''} available
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleMostPopular(pkg.id)}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                      pkg.isMostPopular 
                                        ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                    title={pkg.isMostPopular ? 'Remove Most Popular' : 'Set as Most Popular'}
                                  >
                                    <Star className={`h-4 w-4 ${pkg.isMostPopular ? 'fill-current' : ''}`} />
                                  </button>
                                  <button
                                    onClick={() => handleEditPackage(pkg)}
                                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200"
                                    title="Edit Package"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePackage(pkg.id)}
                                    disabled={packages.length <= 1}
                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete Package"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                setEditingPackage(null);
                                setNewPackage({ name: '', price: '', description: '', services: ['WiFi', 'Clean Room', 'Basic Amenities'], availableRooms: 1, isMostPopular: false, image: '' });
                                setShowAddPackageModal(true);
                              }}
                              className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50 hover:bg-purple-100 transition-all duration-300 flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700"
                            >
                              <Plus className="h-5 w-5" />
                              <span className="font-semibold">Add New Package</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end pt-6 border-t">
                          <Button
                            className="h-11 px-8 bg-purple-600 hover:bg-purple-700 text-white shadow-xl hover:shadow-purple-500/25 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                            onClick={handleSavePropertySettings}
                          >
                            <Building className="h-4 w-4 mr-2" />
                            Update Public Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bulk Upload Modals */}
      <BulkUploadModal
        isOpen={showStaffBulkUploadModal}
        onClose={() => setShowStaffBulkUploadModal(false)}
        title="Bulk Upload Staff Members"
        description="Upload multiple staff members at once using a CSV file."
        uploadData={staffBulkUpload}
        onFileUpload={handleStaffBulkFileUpload}
        onConfirm={handleStaffBulkUploadConfirm}
        onDownloadTemplate={downloadStaffTemplate}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'role', label: 'Role' },
          { key: 'department', label: 'Department' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'salary', label: 'Salary' },
          { key: 'status', label: 'Status' }
        ]}
      />

      <BulkUploadModal
        isOpen={showRoomsBulkUploadModal}
        onClose={() => setShowRoomsBulkUploadModal(false)}
        title="Bulk Upload Rooms"
        description="Upload multiple rooms at once using a CSV file."
        uploadData={roomsBulkUpload}
        onFileUpload={handleRoomsBulkFileUpload}
        onConfirm={handleRoomsBulkUploadConfirm}
        onDownloadTemplate={downloadRoomsTemplate}
        columns={[
          { key: 'id', label: 'Room ID' },
          { key: 'type', label: 'Type' },
          { key: 'floor', label: 'Floor' },
          { key: 'price', label: 'Price' },
          { key: 'status', label: 'Status' },
          { key: 'capacity', label: 'Capacity' }
        ]}
      />

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden border-none shadow-2xl bg-white ring-1 ring-slate-200">
            <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shadow-lg">
                    <Bed className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Add New Room</h2>
                    <p className="text-sm text-slate-500 mt-1">Enter room details</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAddRoomModal(false)}
                  className="h-8 w-8 rounded-full hover:bg-slate-100 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] px-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Hash className="h-4 w-4 text-primary" />
                      Room ID
                    </Label>
                    <Input
                      value={newRoom.id}
                      onChange={(e) => setNewRoom({ ...newRoom, id: e.target.value })}
                      placeholder="e.g., 101"
                      className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-primary" />
                      Type
                    </Label>
                    <Input
                      value={newRoom.type}
                      onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                      placeholder="e.g., Single, Double, Suite"
                      className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary" />
                      Floor
                    </Label>
                    <Input
                      value={newRoom.floor}
                      onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                      placeholder="e.g., 1"
                      className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Price (ETB)
                    </Label>
                    <Input
                      value={newRoom.price}
                      onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                      placeholder="e.g., 1500"
                      type="number"
                      className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Status
                    </Label>
                    <select
                      value={newRoom.status}
                      onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
                      className="h-10 w-full border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 rounded-lg px-3 transition-all duration-300"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Capacity
                    </Label>
                    <Input
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                      placeholder="e.g., 2"
                      type="number"
                      className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Package Section - Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Room Package
                </Label>
                <select
                  value={newRoom.package}
                  onChange={(e) => setNewRoom({ ...newRoom, package: e.target.value })}
                  className="h-10 w-full border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 rounded-lg px-3 transition-all duration-300"
                >
                  <option value="Basic">Basic - ETB 1,000 (WiFi, Basic amenities)</option>
                  <option value="Standard">Standard - ETB 1,500 (WiFi, TV, Mini-fridge, Basic amenities)</option>
                  <option value="Premium">Premium - ETB 2,500 (WiFi, TV, Mini-fridge, Balcony, Premium amenities)</option>
                  <option value="custom">Custom Package - Define your own</option>
                </select>
                
                {newRoom.package === 'custom' && (
                  <div className="mt-2 space-y-2">
                    <Input
                      value={newRoom.customPackageName || ''}
                      onChange={(e) => setNewRoom({ ...newRoom, customPackageName: e.target.value })}
                      placeholder="Enter custom package name"
                      className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                    />
                    <Input
                      value={newRoom.customPackagePrice || ''}
                      onChange={(e) => setNewRoom({ ...newRoom, customPackagePrice: e.target.value })}
                      placeholder="Enter package price (ETB)"
                      type="number"
                      className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                    />
                  </div>
                )}
              </div>

              {/* Images Section */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Image className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-800">Room Images</h3>
                </div>

                {/* Image Type Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Image Type</Label>
                  <div className="flex gap-3">
                    {['Normal', '3D'].map((type) => (
                      <button
                        key={type}
                        className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                          newRoom.imageType === type
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'
                        }`}
                        onClick={() => setNewRoom({ ...newRoom, imageType: type })}
                      >
                        {type === '3D' ? '3D Tour' : 'Normal Images'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload Area */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">
                    Upload {newRoom.imageType === '3D' ? '3D Tour Files' : 'Room Images'}
                  </Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white hover:border-purple-400 transition-all duration-300 cursor-pointer">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <div className="p-2 rounded-full bg-purple-100">
                        <Upload className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-sm">Click to upload or drag and drop</span>
                        <p className="text-xs mt-1">
                          {newRoom.imageType === '3D' 
                            ? '3D files (GLB, GLTF, OBJ) - Max 50MB' 
                            : 'PNG, JPG, GIF up to 10MB each'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Uploaded Images Preview */}
                {newRoom.images.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Uploaded Files</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {newRoom.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
                            <Image className="h-6 w-6 text-slate-400" />
                          </div>
                          <button
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => {
                              setNewRoom({
                                ...newRoom,
                                images: newRoom.images.filter((_, i) => i !== idx)
                              });
                            }}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddRoomModal(false)}
                  className="flex-1 h-11 hover:bg-slate-100 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Here you would typically add the room to your data
                    setShowAddRoomModal(false);
                    // Reset form
                    setNewRoom({
                      id: '',
                      type: '',
                      floor: '',
                      price: '',
                      status: 'Available',
                      capacity: '',
                      package: 'Standard',
                      imageType: 'Normal',
                      images: [],
                      customPackageName: '',
                      customPackagePrice: ''
                    });
                  }}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  Add Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Package Modal */}
      {showAddPackageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[85vh] border-none shadow-2xl bg-white ring-1 ring-slate-200 overflow-y-auto">
            <div className="h-2 w-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600 shadow-lg">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {editingPackage ? 'Edit Package' : 'Add New Package'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {editingPackage ? 'Update package details' : 'Create a new package tier'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAddPackageModal(false)}
                  className="h-8 w-8 rounded-full hover:bg-slate-100 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Package Name</Label>
                <Input
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                  placeholder="e.g., Economy, Business, Luxury"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Price (ETB)</Label>
                <Input
                  value={newPackage.price}
                  onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                  placeholder="e.g., 3000"
                  type="number"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Description</Label>
                <textarea
                  value={newPackage.description}
                  onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                  placeholder="Describe what's included in this package..."
                  rows={3}
                  className="w-full border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-2 transition-all duration-300 resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Services (comma-separated)</Label>
                <Input
                  value={newPackage.services.join(', ')}
                  onChange={(e) => setNewPackage({ ...newPackage, services: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  placeholder="e.g., WiFi, Clean Room, Basic Amenities"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Image className="h-4 w-4 text-purple-600" />
                  Package Image
                </Label>
                <div className="flex items-center gap-4">
                  {(editingPackage?.image || (newPackage as any).image) && (
                    <div className="h-16 w-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      <img src={editingPackage?.image || (newPackage as any).image} alt="Package" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePackageImageUpload(file);
                      }}
                      className="cursor-pointer h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Available Rooms</Label>
                <Input
                  value={newPackage.availableRooms}
                  onChange={(e) => setNewPackage({ ...newPackage, availableRooms: parseInt(e.target.value) || 1 })}
                  placeholder="Number of rooms available"
                  type="number"
                  min="1"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isMostPopular"
                  checked={newPackage.isMostPopular}
                  onChange={(e) => setNewPackage({ ...newPackage, isMostPopular: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <Label htmlFor="isMostPopular" className="text-sm font-medium text-slate-700">
                  Mark as "Most Popular"
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddPackageModal(false)}
                  className="flex-1 h-10 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddPackage}
                  disabled={!newPackage.name || !newPackage.price || !newPackage.description}
                  className="flex-1 h-10 bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50"
                >
                  {editingPackage ? 'Update Package' : 'Add Package'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl bg-white ring-1 ring-slate-200">
            <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shadow-lg">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {editingStaff ? 'Update employee details' : 'Register a new employee'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAddStaffModal(false)}
                  className="h-8 w-8 rounded-full hover:bg-slate-100 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Full Name</Label>
                <Input
                  value={newStaff.full_name}
                  onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                  placeholder="e.g., Abebe Daniel"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Role</Label>
                  <Input
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    placeholder="e.g., Manager"
                    className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Department</Label>
                  <Input
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    placeholder="e.g., Front Desk"
                    className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Email Address</Label>
                <Input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="name@email.com"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Phone Number</Label>
                <Input
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="+251 ..."
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Salary (ETB)</Label>
                  <Input
                    type="number"
                    value={newStaff.salary}
                    onChange={(e) => setNewStaff({ ...newStaff, salary: e.target.value })}
                    placeholder="e.g., 5000"
                    className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Status</Label>
                  <select
                    value={newStaff.status}
                    onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                    className="w-full h-10 border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 rounded-lg px-3 py-2 transition-all duration-300 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on leave">On Leave</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 h-10 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveStaff}
                  disabled={!newStaff.full_name || !newStaff.role || !newStaff.email}
                  className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50"
                >
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
