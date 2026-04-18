import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/use-language';
import { TranslationText } from '@/components/TranslationText';
import apiService from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
import NotificationBell from '../components/NotificationBell';
import { BulkUploadModal } from '../components/dashboard/BulkUploadModal';
import StatsCards from '../components/dashboard/StatsCards';
import PropertyInfoCard from '../components/dashboard/PropertyInfoCard';
import ActivityStatsCards from '../components/dashboard/ActivityStatsCards';
import { useDashboard } from '../hooks/useDashboard';
import { useRefreshPackages } from "@/hooks/use-rooms";
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
  AlertCircle,
  RefreshCcw,
  MessageSquare,
  Eye,
  Mail,
  Phone,
  MapPin,
  Hash,
  Package,
  Image as ImageIcon,
  Info,
  Check,
  Plus,
  Edit2,
  Trash2 as TrashIcon,
  Star
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { refreshAllPackages } = useRefreshPackages();
  const { user, logout, isAdmin, isPensionOwner, isAuthenticated } = useAuth();
  const { language } = useLanguage();
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
    capacity: '',
    owner_info: '',
    room_details: '',
    image_url: ''
  });
  const [pensionImageFile, setPensionImageFile] = useState<File | null>(null);
  const [pensions, setPensions] = useState<any[]>([]);
  const [selectedPensionId, setSelectedPensionId] = useState<string>('');
  const [userPension, setUserPension] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsData, setRoomsData] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
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
  
  // Walk-In Booking Modal State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    guestName: '',
    phoneNumber: '',
    packageId: ''
  });
  const [walkInPackages, setWalkInPackages] = useState<any[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Load packages for walk-in booking
  useEffect(() => {
    const loadWalkInPackages = async () => {
      if (userPension) {
        try {
          const response = await apiService.getPackages(userPension.pension_id || userPension.id);
          if (response.data) {
            setWalkInPackages(response.data);
          }
        } catch (error) {
          console.error('Failed to load packages for walk-in booking:', error);
        }
      }
    };
    loadWalkInPackages();
  }, [userPension]);

  // Walk-In booking handler
  const handleWalkInSubmit = async () => {
    if (!walkInForm.guestName || !walkInForm.phoneNumber || !walkInForm.packageId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const selectedPackage = walkInPackages.find(pkg => pkg.package_id === walkInForm.packageId);
      if (!selectedPackage) {
        alert('Please select a valid package');
        return;
      }

      const response = await fetch('http://localhost:3005/api/public/walk-in-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pensionId: userPension.pension_id || userPension.id,
          packageName: selectedPackage.name,
          guestName: walkInForm.guestName,
          phoneNumber: walkInForm.phoneNumber,
          checkIn: new Date().toISOString().split('T')[0], // Today
          checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowWalkInModal(false);
        setWalkInForm({ guestName: '', phoneNumber: '', packageId: '' });
        alert('Walk-in booking created successfully!');
        // Refresh bookings
        if (userPension) {
          const allBookingsResponse = await apiService.getBookings();
          const allBookings = allBookingsResponse?.data?.items || [];
          const filteredBookings = allBookings.filter(booking => 
            booking.pension_id === (userPension.pension_id || userPension.id)
          );
          setBookings(filteredBookings);
        }
      } else {
        alert('Failed to create booking: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating walk-in booking:', error);
      alert('Failed to create booking');
    }
  };

  // Check owner approval status
  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (isAuthenticated && isPensionOwner() && !isAdmin()) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('No token found, skipping approval check');
            return;
          }

          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              console.log('Unauthorized, token may be expired');
              return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.log('Non-JSON response received, skipping approval check');
            return;
          }
          
          const data = await response.json();
          
          // If owner is not approved, redirect to pending approval page (case-insensitive)
          if (data.success && data.data?.approved !== 1) {
            navigate('/pending-approval');
            return;
          }
        } catch (error) {
          console.error('Error checking approval status:', error);
          // Don't show error to user, just let them continue
        }
      }
    };

    checkApprovalStatus();
  }, [isAuthenticated, isPensionOwner, isAdmin, navigate]);

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

  // Handle pension selection change
  const handlePensionSelectionChange = async (selectedPensionId: string) => {
    console.log('🔄 Dropdown selection changed to:', selectedPensionId);
    
    const selectedPension = pensions.find(p => String(p.pension_id || p.id) === String(selectedPensionId));
    
    if (!selectedPension) {
      console.log('🔄 Selected pension not found, skipping update');
      return;
    }
    
    console.log('🔄 Switching to pension:', selectedPension.name);
    
    // Update the selected pension states
    setSelectedPensionId(selectedPensionId);
    setUserPension(selectedPension);
    
    // Load data for the new pension
    try {
      const pensionId = selectedPension.pension_id || selectedPension.id;
      
      // Load pension-specific data
      const [
        staffResponse,
        roomsResponse,
        packagesResponse
      ] = await Promise.all([
        apiService.getStaff(pensionId),
        apiService.getRooms(pensionId, { language }),
        apiService.getPackages(pensionId, { language })
      ]);
      
      // Update staff data
      const mappedStaff = (staffResponse.data || []).map((s: any) => ({
        ...s,
        id: (s.id || s.staff_id).toString(),
        role: s.role || 'staff',
        status: s.status || 'active'
      }));
      setStaffData(mappedStaff);
      
      // Update rooms data
      const roomsData = roomsResponse.data?.items || roomsResponse.data || [];
      setRoomsData(Array.isArray(roomsData) ? roomsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      
      // Update packages data
      const packagesData = packagesResponse.data || [];
      setPackages(packagesData);
      
      // Update room statistics
      fetchRoomStats(pensionId);
      
      // Load expenses for the new pension
      try {
        const expensesResponse = await apiService.getExpenses(pensionId);
        if (expensesResponse?.data) {
          setExpensesData(expensesResponse.data.items || []);
          setTotalExpenses(expensesResponse.data.totalExpenses || 0);
        }
      } catch (error) {
        console.error('Error loading expenses:', error);
      }
      
      // Update bookings for the selected pension
      const allBookingsResponse = await apiService.getBookings();
      const allBookings = allBookingsResponse?.data?.items || [];
      const filteredBookings = allBookings.filter(booking => 
        booking.pension_id === pensionId
      );
      setBookings(filteredBookings);
      
      console.log('✅ Successfully switched to pension:', selectedPension.name);
      
    } catch (error) {
      console.error('Error loading pension data:', error);
    }
  };

  // Handle pension creation
  const handleCreatePension = async () => {
    try {
      let imageUrl = '';
      
      // Upload image if selected
      if (pensionImageFile) {
        const formData = new FormData();
        formData.append('image', pensionImageFile);
        
        try {
          const token = localStorage.getItem('token');
          const uploadResponse = await fetch('http://localhost:3005/api/uploads/single', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            imageUrl = uploadResult.data?.url || '';
          } else {
            console.error('Image upload failed');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
        }
      }
      
      // Create pension with image URL
      const pensionData = {
        ...newPension,
        image_url: imageUrl
      };
      
      const response = await apiService.createPension(pensionData);
      if (response.success) {
        setShowCreatePension(false);
        setNewPension({ name: '', description: '', address: '', phone: '', email: '', capacity: '', owner_info: '', room_details: '', image_url: '' });
        setPensionImageFile(null);
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
    room: b.room_number || b.room_name || 'N/A',
    status: b.status,
    nationality: 'Ethiopian',
    roomId: b.room_number || b.room_name || 'N/A',
    room_number: b.room_number, // Add room_number field
    totalBookings: 1,
    totalSpent: parseFloat(b.total_price) || 0
  }));

  const recentTransactions = bookings.map(b => ({
    id: b.id,
    date: new Date(b.created_at || Date.now()).toISOString().split('T')[0],
    description: `Booking - ${b.user_name || 'Guest'} (${b.room_name || 'Room'})`,
    type: b.type || 'income',
    amount: parseFloat(b.total_price) || 0,
    status: b.status // Keep original booking status, don't auto-convert
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
        apiService.getPensions({ language }),
        apiService.getMyReviews()
      ]);

      // Debug: Check bookings response
      console.log('🔍 Bookings API response:', bookingsResponse);
      console.log('🔍 Bookings data being set:', bookingsResponse?.data?.items || []);
      
      // Log detailed booking structure
      if (bookingsResponse?.data?.items && bookingsResponse.data.items.length > 0) {
        console.log('🔍 First booking object structure:', bookingsResponse.data.items[0]);
        console.log('🔍 First booking room fields:', {
          room_number: bookingsResponse.data.items[0].room_number,
          room_id: bookingsResponse.data.items[0].room_id,
          room_type: bookingsResponse.data.items[0].room_type,
          room_name: bookingsResponse.data.items[0].room_name
        });
      }
      
      // Update basic state
      setBookings(bookingsResponse?.data?.items || []);
      const pensionsData = pensionsResponse?.data?.items || pensionsResponse?.data || [];
      const pensionsArray = Array.isArray(pensionsData) ? pensionsData : [];
      
      // 2. Find user's pension
      const userId = user?.id || user?.user_id || user?.userId;
      
      const foundUserPension = pensionsArray.find(p => 
        p.owner_id === userId || 
        p.owner_id === parseInt(userId) ||
        p.owner_id === userId?.toString()
      );
      
      console.log('🔍 Found pension:', foundUserPension ? foundUserPension.name : 'None');
      
      setPensions(pensionsArray);
      setReviews(reviewsResponse?.data?.items || []);

      // Initialize pension selection for owners
      if (isPensionOwner()) {
        const ownerPensions = pensionsArray.filter(p => 
          p.owner_id === userId || 
          p.owner_id === parseInt(userId) ||
          p.owner_id === userId?.toString()
        );
        
        // If no pension is selected yet, select the first active one
        if (!selectedPensionId && ownerPensions.length > 0) {
          const firstActivePension = ownerPensions.find(p => 
            p.status === 'active' || p.status === 'Approved'
          ) || ownerPensions[0];
          
          setSelectedPensionId(String(firstActivePension.pension_id || firstActivePension.id));
          setUserPension(firstActivePension);
          console.log('🔄 Auto-selected pension:', firstActivePension.name);
        }
      }

      // Use the currently selected pension from dropdown or auto-found pension
      const currentPension = selectedPensionId 
        ? pensionsArray.find(p => String(p.pension_id || p.id) === String(selectedPensionId))
        : foundUserPension;

      console.log('🔄 Loading data for pension:', currentPension ? currentPension.name : 'None');

      // Now filter bookings by selected pension
      const allBookings = bookingsResponse?.data?.items || [];
      const filteredBookings = currentPension 
        ? allBookings.filter(booking => 
            booking.pension_id === currentPension.pension_id || 
            booking.pension_id === currentPension.id
          )
        : allBookings;
      setBookings(filteredBookings); // Update with filtered bookings

      if (currentPension) {
        const pensionId = currentPension.pension_id || currentPension.id;
        const [
          staffResponse,
          roomsResponse,
          packagesResponse
        ] = await Promise.all([
          apiService.getStaff(pensionId),
          apiService.getRooms(pensionId, { language }),
          apiService.getPackages(pensionId, { language })
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
          setRoomsData(Array.isArray(normalizedRooms) ? normalizedRooms : []);
          setRooms(Array.isArray(normalizedRooms) ? normalizedRooms : []); // Also update rooms state
        } else {
          // Ensure roomsData is always an array even if no rooms data
          setRoomsData([]);
          setRooms([]);
        }

        // Update packages
        if (packagesResponse?.data) {
          console.log('🔍 Packages received from backend:', packagesResponse.data.map(p => ({
            package_id: p.package_id,
            name: p.name,
            is_most_popular: p.is_most_popular,
            isMostPopular: p.isMostPopular
          })));
          
          // Map backend field names to frontend field names
          const mappedPackages = packagesResponse.data.map(p => ({
            ...p,
            id: p.package_id || p.id,
            isMostPopular: p.is_most_popular === 1 || p.is_most_popular === true
          }));
          
          console.log('🔍 Packages after field mapping:', mappedPackages.map(p => ({
            id: p.id,
            name: p.name,
            isMostPopular: p.isMostPopular
          })));
          
          setPackages(mappedPackages);
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

        // Refresh room statistics to update available rooms count
        if (currentPension) {
          fetchRoomStats(currentPension.pension_id || currentPension.id);
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
    loadBusinessProfile();
  }, [activeTab, isAuthenticated, user, pensions.length, selectedPensionId]);

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
    imageUrl?: string;
  }

  // Settings states
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    type: '',
    floor: '',
    price: '',
    status: 'Available',
    capacity: '',
    numberOfBeds: '',
    numberOfRooms: '1',
    package: '',
    roomNumbers: '',  // NEW: For entering room numbers like "201, 202, 203"
    imageType: 'Normal',
    images: [],
    customPackageName: '',
    customPackagePrice: ''
  });

  // Package management states
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [newPackage, setNewPackage] = useState({
    name: '',
    name_en: '',
    name_am: '',
    name_om: '',
    price: '',
    description: '',
    description_en: '',
    description_am: '',
    description_om: '',
    services: ['WiFi', 'Clean Room', 'Basic Amenities'],
    isMostPopular: false,
    image: '',
    customService: '',
    imageType: 'Normal'
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
    cancellationPolicy: "Flexible",
    imageUrl: ""
  });
  const [pensionProfileImageFile, setPensionProfileImageFile] = useState<File | null>(null);

  // Calculate available rooms dynamically based on actual room data
  const calculateAvailableRooms = (packageId: string) => {
    const packageRooms = rooms.filter(room => room.package_id === packageId);
    return packageRooms.filter(room => room.status === 'Available' || room.is_available !== false).length;
  };

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
    const currentPension = selectedPensionId 
      ? pensions.find(p => String(p.pension_id || p.id) === String(selectedPensionId))
      : null;
    
    if (currentPension) {
      setPropertySettings({
        name: currentPension.name || "",
        address: currentPension.address || "",
        phone: currentPension.phone || "",
        email: currentPension.email || "",
        website: "",
        description: currentPension.description || "",
        ownerInfo: currentPension.owner_info || `Managed by ${user?.full_name || 'Property Owner'}`,
        roomDetails: currentPension.room_details || "",
        capacity: currentPension.capacity || 0,
        amenities: [],
        checkInTime: "12:00",
        checkOutTime: "10:00",
        cancellationPolicy: "Flexible",
        imageUrl: currentPension.image_url || ""
      });
      
      // Fetch actual room statistics
      fetchRoomStats(currentPension.pension_id || currentPension.id);
    } else if (pensions.length > 0) {
      // If no pension is selected but pensions exist, use default values
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
        cancellationPolicy: "Flexible",
        imageUrl: ""
      });
    }
  }, [pensions, user, selectedPensionId]);

  // Load staff data
  useEffect(() => {
    const fetchStaff = async () => {
      const currentPension = selectedPensionId 
        ? pensions.find(p => String(p.pension_id || p.id) === String(selectedPensionId))
        : userPension;
      
      if (activeTab === 'staff' && currentPension && (currentPension.pension_id || currentPension.id)) {
        setIsStaffLoading(true);
        try {
          const response = await apiService.getStaff(currentPension.pension_id || currentPension.id);
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
  }, [activeTab, selectedPensionId, userPension, pensions]); // Updated dependencies

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
    const currentPension = selectedPensionId 
      ? pensions.find(p => String(p.pension_id || p.id) === String(selectedPensionId))
      : pensions.find(p => p.owner_id === (user?.id || user?.user_id));
      
    if (!currentPension) {
      alert('Please create a pension first!');
      return;
    }
    
    try {
      // Prepare staff data with required fields
      const staffData = {
        ...newStaff,
        pension_id: currentPension.pension_id || currentPension.id,
        owner_id: user?.id || user?.user_id
      };

      if (editingStaff) {
        await apiService.updateStaff(parseInt(editingStaff.id), staffData);
      } else {
        await apiService.addStaff(currentPension.pension_id || currentPension.id, staffData);
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
      const response = await apiService.getStaff(currentPension.pension_id || currentPension.id);
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
      const currentPension = selectedPensionId 
        ? pensions.find(p => String(p.pension_id || p.id) === String(selectedPensionId))
        : pensions.find(p => p.owner_id === (user?.id || user?.user_id));
      if (currentPension) {
        const response = await apiService.getStaff(currentPension.pension_id || currentPension.id);
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
      console.log('📸 Package image upload started for file:', file.name);
      console.log('📸 User authenticated:', !!localStorage.getItem('token'));
      
      if (!localStorage.getItem('token')) {
        throw new Error('User not authenticated');
      }

      const response = await apiService.uploadImage(file);
      
      if (response.success && editingPackage) {
        console.log('📸 Updating existing package with image:', response.data.url);
        setEditingPackage({ ...editingPackage, image: response.data.url });
      } else if (response.success) {
        console.log('📸 Setting new package image:', response.data.url);
        console.log('📸 Current newPackage before image:', newPackage);
        setNewPackage({ ...newPackage, image: response.data.url } as any);
        console.log('📸 New package after image set:', { ...newPackage, image: response.data.url });
      } else {
        console.error('📸 Upload failed:', response.message);
        console.error('📸 Full response:', response);
        alert(`Image upload failed: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('📸 Upload failed:', error);
      alert(`Image upload failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRoomImageUpload = async (file: File) => {
    try {
      console.log('📸 Room image upload started for file:', file.name);
      console.log('📸 User authenticated:', !!localStorage.getItem('token'));
      
      if (!localStorage.getItem('token')) {
        throw new Error('User not authenticated');
      }

      const response = await apiService.uploadImage(file);
      
      if (response.success) {
        console.log('📸 Room image uploaded successfully:', response.data.url);
        setNewRoom(prev => ({
          ...prev,
          images: [...prev.images, response.data.url]
        }));
      } else {
        console.error('📸 Upload failed:', response.message);
        console.error('📸 Full response:', response);
        alert(`Image upload failed: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('📸 Upload failed:', error);
      alert(`Image upload failed: ${error.message || 'Unknown error'}`);
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

  const [businessProfile, setBusinessProfile] = useState({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    licenseNumber: "",
    licenseDocument: null
  });

  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string>('');

  // Settings handlers
  const handleSavePropertySettings = async () => {
    try {
      setIsUpdating(true);
      
      // Debug logging
      console.log('🔍 Update pension profile - Full user object:', user);
      console.log('🔍 Update pension profile - Looking for pension with userId:', user?.id || user?.user_id, 'type:', typeof (user?.id || user?.user_id));
      console.log('🔍 Update pension profile - Available pensions:', pensions.map(p => ({ 
        id: p.id, 
        pension_id: p.pension_id, 
        owner_id: p.owner_id, 
        name: p.name,
        owner_id_type: typeof p.owner_id
      })));
      
      // Check if user has their own pension
      const foundPension = pensions.find(p => 
        p.owner_id === (user?.id || user?.user_id)
      );
      
      console.log('🔍 Update pension profile - Found pension:', foundPension ? foundPension.name : 'None');
      
      setUserPension(foundPension);

      if (foundPension) {
        // Update existing pension
        const pensionId = foundPension.pension_id || foundPension.id;
        
        let imageUrl = propertySettings.imageUrl || '';
        
        // Upload new image if selected
        if (pensionProfileImageFile) {
          const formData = new FormData();
          formData.append('image', pensionProfileImageFile);
          
          try {
            const token = localStorage.getItem('token');
            const uploadResponse = await fetch('http://localhost:3005/api/uploads/single', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: formData,
            });
            
            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              imageUrl = uploadResult.data?.url || '';
            } else {
              console.error('Image upload failed');
            }
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
          }
        }
        
        await apiService.updatePension(pensionId, {
          name: propertySettings.name,
          address: propertySettings.address,
          phone: propertySettings.phone,
          email: propertySettings.email,
          description: propertySettings.description,
          owner_info: propertySettings.ownerInfo,
          room_details: propertySettings.roomDetails,
          capacity: propertySettings.capacity,
          image_url: imageUrl
        });
        
      } else if (pensions.length === 0) {
        // No pensions exist - create first pension for this user
        
        const newPension = await apiService.createPension({
          name: propertySettings.name || "New Pension",
          address: propertySettings.address || "New Address",
          description: propertySettings.description || "New pension description",
          capacity: 5,
          owner_info: "Experienced property manager dedicated to providing comfortable and safe accommodation.",
          room_details: "Well-maintained rooms with modern amenities, clean facilities, and comfortable furnishings for a pleasant stay."
        });
        
        alert('New pension created successfully!');
        
      } else {
        // Pensions exist but none belong to this user
        alert('Creating new pension for this owner...');
        
        const newPension = await apiService.createPension({
          name: propertySettings.name || "Owner's Pension",
          address: propertySettings.address || "Owner's Address",
          description: propertySettings.description || "Owner's pension description",
          capacity: 5,
          owner_info: "Professional property owner with years of hospitality experience, committed to excellent guest service.",
          room_details: "Comfortable and clean rooms equipped with essential amenities, ensuring a relaxing and enjoyable stay for all guests."
        });
        
        alert('Owner pension created successfully!');
      }
      
      // Refresh data
      loadRealData();
      
      // Reset image file state
      setPensionProfileImageFile(null);
      
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error in handleSavePropertySettings:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveBusinessProfile = async () => {
    try {
      setIsUpdating(true);
      
      let documentUrl = businessProfile.licenseDocument || '';
      
      // Upload new license document if selected
      if (businessLicenseFile) {
        const formData = new FormData();
        formData.append('image', businessLicenseFile);
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${this.baseURL}/uploads/single`, {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
          });
          
          const result = await response.json();
          console.log('Document upload response:', result);
          
          if (result.success) {
            documentUrl = result.data?.url || '';
            console.log('Document uploaded successfully:', documentUrl);
          } else {
            const errorData = result;
            console.error('Document upload failed:', errorData);
            alert(`Document upload failed: ${errorData.message || errorData.error || 'Unknown error'}`);
            return;
          }
        } catch (uploadError) {
          console.error('Error uploading document:', uploadError);
          alert(`Error uploading document: ${uploadError.message || 'Network error'}`);
          return;
        }
      }
      
      // Update business profile in backend
      const response = await apiService.updateUserProfile(user?.id || user?.user_id, {
        businessName: businessProfile.businessName,
        businessEmail: businessProfile.businessEmail,
        businessPhone: businessProfile.businessPhone,
        licenseNumber: businessProfile.licenseNumber,
        licenseDocument: documentUrl
      });
      
      // Reset file state
      setBusinessLicenseFile(null);
      
      // Show appropriate message based on status change
      if (response.statusChanged) {
        console.log('🔍 Business profile updated - status changed to pending');
        alert('Business profile updated successfully! Your changes are pending admin review.');
      } else {
        console.log('🔍 Business profile updated - no status change');
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      }
      
      // Reload data to get updated status
      loadBusinessProfile();
      
    } catch (error) {
      console.error('Error in handleSaveBusinessProfile:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const loadBusinessProfile = async () => {
    try {
      const response = await apiService.getProfile();
      console.log('🔍 Loading business profile - API response:', response);
      if (response.success && response.data) {
        const userData = response.data.user;
        const ownerData = response.data.ownerProfile;
        console.log('🔍 Loading business profile - Owner data:', ownerData);
        
        // Update business profile state
        setBusinessProfile({
          businessName: ownerData?.business_name || '',
          businessEmail: ownerData?.business_email || '',
          businessPhone: ownerData?.business_phone || '',
          licenseNumber: ownerData?.license_number || '',
          licenseDocument: ownerData?.id_document_url || ''
        });
        
        // Update approval status
        const status = ownerData?.approval_status || 'Pending';
        setApprovalStatus(status);
        console.log('🔍 Loading business profile - Approval status set to:', status);
        
        // Update compliance settings
        setComplianceSettings({
          ...complianceSettings,
          licenseNumber: ownerData?.license_number || '',
          expiryDate: ownerData?.expiry_date || complianceSettings.expiryDate
        });
      }
    } catch (error) {
      console.error('Error loading business profile:', error);
    }
  };

  const handleSaveSecuritySettings = async () => {
    try {
      setIsUpdating(true);
      
      if (!securitySettings.currentPassword || !securitySettings.newPassword) {
        alert('Please enter both current and new passwords');
        return;
      }
      
      // Call the change password API
      const response = await fetch('http://localhost:3005/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: securitySettings.currentPassword,
          newPassword: securitySettings.newPassword
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
        setSecuritySettings({ ...securitySettings, currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(result.message || 'Failed to update password');
      }
      
    } catch (error) {
      console.error('Error updating security settings:', error);
      alert('Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveComplianceSettings = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Package management functions
  const handleAddPackage = async () => {
    try {
      if (newPackage.name && newPackage.price && newPackage.description) {
        // Debug logging
        console.log('🔍 Package creation - Full user object:', user);
        console.log('🔍 Package creation - Looking for pension with userId:', user?.id || user?.user_id, 'type:', typeof (user?.id || user?.user_id));
        console.log('🔍 Package creation - Available pensions:', pensions.map(p => ({ 
          id: p.id, 
          pension_id: p.pension_id, 
          owner_id: p.owner_id, 
          name: p.name,
          owner_id_type: typeof p.owner_id
        })));
        
        // Get the currently selected pension
        const currentPension = selectedPensionId 
          ? pensions.find(p => String(p.pension_id || p.id) === String(selectedPensionId))
          : pensions.find(p => p.owner_id === (user?.id || user?.user_id));
        
        console.log('🔍 Package creation - Found pension:', currentPension ? currentPension.name : 'None');
        
        if (currentPension) {
          // Wait a moment for image state to update if needed
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Construct multilingual JSON objects
          const name_ml = {
            en: newPackage.name_en || newPackage.name,
            am: newPackage.name_am,
            om: newPackage.name_om
          };
          
          const description_ml = {
            en: newPackage.description_en || newPackage.description,
            am: newPackage.description_am,
            om: newPackage.description_om
          };
          
          const packageData = {
            name: newPackage.name_en || newPackage.name,
            price: parseInt(newPackage.price),
            description: newPackage.description_en || newPackage.description,
            name_ml,
            description_ml,
            services: newPackage.services,
            image: (newPackage as any).image || (editingPackage as any).image || '',
            customService: newPackage.customService,
            imageType: newPackage.imageType
          };

          console.log('📦 Package data being sent to backend:', packageData);
          console.log('📦 newPackage object:', newPackage);
          console.log('📦 newPackage.image:', (newPackage as any).image);

          if (editingPackage) {
            // Update existing package
            const packageId = parseInt(editingPackage.id || editingPackage.package_id);
            console.log('🔍 Updating package with ID:', packageId, 'from editingPackage.id:', editingPackage.id, 'or package_id:', editingPackage.package_id);
            
            if (isNaN(packageId)) {
              console.error('❌ Invalid package ID:', editingPackage.id);
              alert('Error: Invalid package ID');
              return;
            }
            
            await apiService.updatePackage(currentPension.pension_id || currentPension.id, packageId, packageData);
            const updatedPackages = packages.map(pkg => {
          const pkgId = editingPackage.id || editingPackage.package_id;
          return pkg.id === pkgId || pkg.package_id === pkgId ? { ...packageData, id: editingPackage.id || editingPackage.package_id, isMostPopular: pkg.isMostPopular } : pkg;
        });
            setPackages(updatedPackages);
            setEditingPackage(null);
          } else {
            // Create new package
            const response = await apiService.createPackage(currentPension.pension_id || currentPension.id, packageData);
            const newPkg = { ...packageData, id: response.data?.package?.id || Date.now().toString(), isMostPopular: false };
            const updatedPackages = [...packages, newPkg];
            setPackages(updatedPackages);
          }
          
          setNewPackage({ name: '', price: '', description: '', services: ['WiFi', 'Clean Room', 'Basic Amenities'], isMostPopular: false, image: '', customService: '', imageType: 'Normal' });
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
    console.log('🔍 Editing package object:', pkg);
    console.log('🔍 Package ID type:', typeof pkg.id, 'value:', pkg.id);
    setEditingPackage(pkg);
    setNewPackage({
      name: pkg.name,
      name_en: pkg.name_ml?.en || pkg.name || '',
      name_am: pkg.name_ml?.am || '',
      name_om: pkg.name_ml?.om || '',
      price: pkg.price.toString(),
      description: pkg.description,
      description_en: pkg.description_ml?.en || pkg.description || '',
      description_am: pkg.description_ml?.am || '',
      description_om: pkg.description_ml?.om || '',
      services: pkg.services || ['WiFi', 'Clean Room', 'Basic Amenities'],
      isMostPopular: pkg.isMostPopular,
      image: pkg.image || '',
      customService: pkg.customService || '',
      imageType: pkg.imageType || 'Normal'
    });
    setShowAddPackageModal(true);
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      console.log('🗑️ Delete package attempt:', packageId);
      console.log('🔍 Available packages:', packages.map(p => ({ id: p.id, name: p.name })));
      
      // Get the currently selected pension
      const currentPension = selectedPensionId 
        ? pensions.find(p => String(p.pension_id || p.id) === String(selectedPensionId))
        : pensions.find(p => p.owner_id === (user?.id || user?.user_id));
      
      console.log('🔍 Found pension:', currentPension ? currentPension.name : 'None');
      
      if (currentPension) {
        console.log('🚀 Deleting package:', packageId, 'for pension:', currentPension.pension_id);
        await apiService.deletePackage(currentPension.pension_id || currentPension.id, parseInt(packageId));
        
        const updatedPackages = packages.filter(pkg => pkg.id !== packageId);
        console.log('✅ Updated packages after delete:', updatedPackages.map(p => ({ id: p.id, name: p.name })));
        setPackages(updatedPackages);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      } else {
        console.error('❌ No pension found for delete operation');
        alert('No pension found!');
      }
    } catch (error) {
      console.error('❌ Error deleting package:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Room management handlers
  const handleDeleteRoom = async (roomId: string | number) => {
    console.log('🔍 Delete room clicked:', roomId);
    
    // Find the room to check its status
    const roomToDelete = roomsData.find(room => room.id === roomId || room.room_id === roomId);
    
    if (!roomToDelete) {
      alert('Room not found!');
      return;
    }
    
    // Don't allow deletion of occupied rooms
    if (roomToDelete.status === 'Occupied') {
      alert('Cannot delete occupied room!');
      return;
    }
    
    // Show confirmation dialog
    if (confirm(`Are you sure you want to delete room ${roomId}?`)) {
      try {
        const response = await apiService.deleteRoom(parseInt(roomId));
        
        if (response.success) {
          // Remove the room from local state
          const updatedRooms = roomsData.filter(room => 
            room.id !== roomId && room.room_id !== roomId
          );
          setRoomsData(updatedRooms);
          
          alert('Room deleted successfully!');
          console.log('✅ Room deleted:', roomId);
        } else {
          alert('Failed to delete room: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        alert(`Error deleting room: ${error.message}`);
      }
    }
  };

  const handleToggleMostPopular = async (packageId: string) => {
    try {
      // Find the package to toggle (check both id and package_id)
      const packageToToggle = packages.find(pkg => pkg.id === packageId || pkg.package_id === packageId);
      
      console.log('🔍 Toggle Most Popular clicked:', {
        packageId,
        packageToToggle,
        currentStatus: packageToToggle?.isMostPopular,
        availablePackages: packages.map(p => ({ id: p.id, package_id: p.package_id, name: p.name }))
      });
      
      if (!packageToToggle) {
        console.error('❌ Package not found:', packageId);
        return;
      }
      
      // Get user's pension (same logic as other functions)
      console.log('🔍 Toggle Most Popular - Full user object:', user);
      console.log('🔍 Toggle Most Popular - Looking for pension with userId:', user?.id || user?.user_id, 'type:', typeof (user?.id || user?.user_id));
      console.log('🔍 Toggle Most Popular - Available pensions:', pensions.map(p => ({ 
        id: p.id, 
        pension_id: p.pension_id, 
        owner_id: p.owner_id, 
        name: p.name,
        owner_id_type: typeof p.owner_id
      })));
      
      const foundPension = pensions.find(p => 
        p.owner_id === (user?.id || user?.user_id)
      );
      
      console.log('🔍 Toggle Most Popular - Found pension:', foundPension ? foundPension.name : 'None');
      
      if (foundPension) {
        const newPopularStatus = !packageToToggle.isMostPopular;
        
        console.log('🔍 Updating package popularity:', {
          packageId,
          oldStatus: packageToToggle.isMostPopular,
          newStatus: newPopularStatus,
          actualPackageId: packageToToggle.id || packageToToggle.package_id
        });
        
        // Use the actual package ID (either id or package_id)
        const actualPackageId = packageToToggle.id || packageToToggle.package_id;
        
        // Update backend
        const response = await apiService.updatePackage(foundPension.pension_id || foundPension.id, parseInt(actualPackageId), {
          isMostPopular: newPopularStatus
        });
        
        console.log('🔍 Backend response:', response);
        
        // Update frontend state
        const updatedPackages = packages.map(pkg => ({
          ...pkg,
          isMostPopular: (pkg.id === packageId || pkg.package_id === packageId) ? newPopularStatus : (newPopularStatus ? false : pkg.isMostPopular)
        }));
        setPackages(updatedPackages);
        
        console.log('🔍 Frontend packages updated:', updatedPackages.map(p => ({ id: p.id, package_id: p.package_id, name: p.name, isMostPopular: p.isMostPopular })));
      } else {
        console.error('❌ No pension found for most popular toggle');
      }
    } catch (error) {
      console.error('❌ Error toggling most popular:', error);
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
    // Force refresh booking data first to get latest status
    await loadRealData();
    
    // Find the booking to check current status after refresh
    const booking = bookings.find(b => (b.id || b.booking_id) === bookingId);
    if (booking?.status === 'Completed') {
      // This will be handled by the inline message system in BookingSection
      throw new Error('Booking is already completed');
    }

    try {
      const response = await apiService.completeBookingEarly(bookingId);
      if (response.success) {
        // Refresh data to get updated booking status from backend
        await loadRealData();
        // Success message will be handled by BookingSection
      } else {
        throw new Error(response.message || 'Failed to complete booking early');
      }
    } catch (error: any) {
      console.error("Frontend error:", error);
      // Error message will be handled by BookingSection
      throw error;
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

          {/* Pension Selection - Sidebar Top */}
          {isPensionOwner() && pensions.filter(p => p.owner_id === (user?.id || user?.user_id)).length > 1 && (
            <div className="px-4 py-3 border-b border-slate-100">
              <Select value={selectedPensionId} onValueChange={handlePensionSelectionChange}>
                <SelectTrigger className="w-full h-9 bg-slate-50 border-slate-200 hover:bg-white focus:ring-2 focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Select Pension" />
                </SelectTrigger>
                <SelectContent className="w-64 max-h-60 overflow-y-auto">
                  {pensions
                    .filter(p => p.owner_id === (user?.id || user?.user_id))
                    .map((pension) => (
                      <SelectItem 
                        key={pension.pension_id || pension.id} 
                        value={String(pension.pension_id || pension.id)}
                      >
                        <div className="flex items-center gap-2 py-1">
                          <Building className="h-4 w-4 text-slate-500" />
                          <div className="flex-1 min-w-0">
                            <span className="truncate text-sm font-medium">{pension.name}</span>
                            <div className="text-xs text-slate-500">
                              {pension.address || 'Main Location'}
                            </div>
                          </div>
                          {pension.status === 'active' || pension.status === 'Approved' ? (
                            <Building className="h-3 w-3 text-green-600 ml-2" />
                          ) : (
                            <Building className="h-3 w-3 text-slate-400 ml-2" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                        // Don't close sidebar for settings dropdown - keep it open for sub-navigation
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
                                setMobileSidebarOpen(false);
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
                    // Close sidebar for regular navigation items
                    setMobileSidebarOpen(false);
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
                // Close sidebar when navigating back to home
                setMobileSidebarOpen(false);
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
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white/80 backdrop-blur-md px-4 lg:px-8 shadow-sm">
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
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 flex-1 lg:flex-1 min-w-0">
                {/* Top row for mobile - Menu and Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Mobile Menu Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-9 w-9 text-slate-500 hover:text-primary transition-colors rounded-full bg-slate-50 flex-shrink-0"
                    onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                  >
                    {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>

                  {/* Page Title */}
                  <h1 className="text-lg font-bold lg:text-xl capitalize text-slate-900 truncate">
                    {activeTab === "staff" ? <TranslationText text="Staff & HR Management" language={language} /> : 
                     activeTab === "overview" ? <TranslationText text="Dashboard Overview" language={language} /> : 
                     activeTab === "availability" ? <TranslationText text="Availability Management" language={language} /> :
                     activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h1>
                </div>
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
                <NotificationBell />

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
                   activeTab === "pension-profile" ? "Pension Profile Management" :
                   activeTab === "availability" ? "Availability Management" :
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
                   activeTab === "pension-profile" ? "Manage your pension details, packages, and property information." :
                   activeTab === "transactions" ? "View all financial transactions." :
                   activeTab === "reports" ? "Generate detailed reports and insights." :
                   activeTab.startsWith("settings-") ? "Manage your account settings." :
                   "Welcome back! Here's what's happening with your property today."}
                </p>
              </div>
              {activeTab === "bookings" && (
                <Button 
                  className="gap-2 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    console.log('New Booking button clicked!');
                    setShowWalkInModal(true);
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  New Booking
                </Button>
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
                    onClick={() => {
                      if (packages.length === 0) {
                        alert('❌ Please create at least one package before adding rooms!');
                        return;
                      }
                      setShowAddRoomModal(true);
                    }}
                    disabled={packages.length === 0}
                    className={`gap-2 ${
                      packages.length === 0 
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    <Bed className="h-4 w-4" />
                    Add Room
                    {packages.length === 0 && (
                      <span className="text-xs ml-1">(No packages)</span>
                    )}
                  </Button>
                </div>
              )}
                            {activeTab === "pension-profile" && (
                <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                  <Building className="h-4 w-4" />
                  Manage Packages
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
                    <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Create New Pension</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-3">
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
                          <Label htmlFor="image">Pension Image</Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPensionImageFile(file);
                                setNewPension({...newPension, image_url: file.name});
                              }
                            }}
                            className="cursor-pointer"
                          />
                          {pensionImageFile && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Selected: {pensionImageFile.name}
                            </p>
                          )}
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
                        <div>
                          <Label htmlFor="owner_info">Owner Information</Label>
                          <textarea
                            id="owner_info"
                            value={newPension.owner_info}
                            onChange={(e) => setNewPension({...newPension, owner_info: e.target.value})}
                            placeholder="Tell customers about yourself, your experience, and what makes your pension special"
                            className="w-full h-16 px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md resize-none"
                          />
                        </div>
                        <div>
                          <Label htmlFor="room_details">Room Details</Label>
                          <textarea
                            id="room_details"
                            value={newPension.room_details}
                            onChange={(e) => setNewPension({...newPension, room_details: e.target.value})}
                            placeholder="Describe your rooms, amenities, facilities, and what guests can expect"
                            className="w-full h-16 px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md resize-none"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            onClick={handleCreatePension}
                            disabled={!newPension.name || !newPension.address}
                            className="flex-1"
                          >
                            Create Pension
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowCreatePension(false);
                              setNewPension({ name: '', description: '', address: '', phone: '', email: '', capacity: '', owner_info: '', room_details: '', image_url: '' });
                              setPensionImageFile(null);
                            }}
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
              (() => {
                console.log('🔍 About to render BookingSection with bookings:', bookings);
                return (
                  <BookingSection 
                    bookings={bookings}
                    viewMode={viewModes.bookings}
                    onToggleView={() => toggleViewMode('bookings')}
                    onUpdateStatus={handleUpdateBookingStatus}
                    onCompleteEarly={handleCompleteBookingEarly}
                  />
                );
              })()
            )}

            {/* Rooms Section */}
            {activeTab === "rooms" && (
              <RoomsSection 
                rooms={roomsData}
                viewMode={viewModes.rooms}
                onToggleView={() => toggleViewMode('rooms')}
                onDeleteRoom={handleDeleteRoom}
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

            {/* Pension Profile Section */}
            {activeTab === "pension-profile" && (
              <div className="space-y-6">
                {/* Success Message */}
                {showSaveSuccess && (
                  <div className="group p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-sm relative">Pension profile updated successfully!</span>
                  </div>
                )}

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
                        <ImageIcon className="h-4 w-4 text-purple-600" />
                        Pension Image
                      </Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPensionProfileImageFile(file);
                            setPropertySettings({ ...propertySettings, imageUrl: file.name });
                          }
                        }}
                        className="cursor-pointer border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                      />
                      {(pensionProfileImageFile || propertySettings.imageUrl) && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          {propertySettings.imageUrl && !pensionProfileImageFile && (
                            <span>Current image: {propertySettings.imageUrl}</span>
                          )}
                          {pensionProfileImageFile && (
                            <span>New: {pensionProfileImageFile.name}</span>
                          )}
                        </div>
                      )}
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
                                {pkg.imageType === '3D' && (
                                  <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">3D Tour</span>
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
                                    {calculateAvailableRooms(pkg.id || pkg.package_id)} room{calculateAvailableRooms(pkg.id || pkg.package_id) !== 1 ? 's' : ''} available
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleMostPopular(pkg.id || pkg.package_id)}
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
                            setNewPackage({ 
                              name: '', 
                              name_en: '', 
                              name_am: '', 
                              name_om: '', 
                              price: '', 
                              description: '', 
                              description_en: '', 
                              description_am: '', 
                              description_om: '', 
                              services: ['WiFi', 'Clean Room', 'Basic Amenities'], 
                              isMostPopular: false, 
                              image: '', 
                              customService: '', 
                              imageType: 'Normal' 
                            });
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
              </div>
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
                      {activeTab === "settings-business-profile" ? "Business Profile Settings" :
                       "Security Settings"}
                    </h2>
                    <p className="text-slate-500 text-sm">Configure your property and account preferences.</p>
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
                  {/* Business Profile Settings */}
                  <TabsContent value="settings-business-profile" className="mt-0">
                    <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden ring-1 ring-slate-100 hover:scale-[1.01]">
                      <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400" />
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="lg:text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-300 hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-blue-500/25">
                              <Building className="h-6 w-6 hover:rotate-12 transition-transform duration-500" />
                            </div>
                            <span className="hover:text-blue-600 transition-colors duration-300">Business Profile</span>
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              approvalStatus === 'Approved' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {approvalStatus === 'Approved' ? '✓ Approved' : '⏳ Pending Review'}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Business Name</Label>
                            <Input
                              value={businessProfile.businessName}
                              onChange={(e) => setBusinessProfile({ ...businessProfile, businessName: e.target.value })}
                              placeholder="Enter your business name"
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Business Email</Label>
                            <Input
                              type="email"
                              value={businessProfile.businessEmail}
                              onChange={(e) => setBusinessProfile({ ...businessProfile, businessEmail: e.target.value })}
                              placeholder="business@example.com"
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">Business Phone</Label>
                            <Input
                              value={businessProfile.businessPhone}
                              onChange={(e) => setBusinessProfile({ ...businessProfile, businessPhone: e.target.value })}
                              placeholder="+251 911 234 567"
                              className="h-11 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                      </div>
                      
                      {/* Business Profile Approval Status */}
                      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className={`h-5 w-5 ${businessProfile.approvalStatus === 'Approved' ? 'text-green-600' : 'text-yellow-600'}`} />
                            <span className="text-sm font-medium">
                              Business Profile Status: <span className={`font-bold ${businessProfile.approvalStatus === 'Approved' ? 'text-green-600' : 'text-yellow-600'}`}>{businessProfile.approvalStatus || 'Pending'}</span>
                            </span>
                          </div>
                          {businessProfile.approvalStatus === 'Pending' && (
                            <span className="text-xs text-slate-500">Waiting for admin approval</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Update Button */}
                      <div className="mt-6 flex justify-end">
                        <Button 
                          onClick={handleSaveBusinessProfile}
                          disabled={isUpdating}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
                        >
                          {isUpdating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Update Business Profile
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
              {/* Package Selection - Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Select Package
                  {packages.length === 0 && (
                    <span className="text-red-500 text-xs font-normal ml-2">(No packages available)</span>
                  )}
                </Label>
                <select
                  value={newRoom.package}
                  onChange={(e) => {
                    const selectedPackage = packages.find(p => p.id === e.target.value);
                    setNewRoom({ 
                      ...newRoom, 
                      package: e.target.value,
                      // Auto-fill fields from selected package
                      type: selectedPackage?.name || '',
                      capacity: selectedPackage?.services?.length ? '2' : '1', // Approximate capacity based on services
                      numberOfBeds: selectedPackage?.name?.includes('Double') ? '2' : selectedPackage?.name?.includes('Suite') ? '3' : '1'
                    });
                  }}
                  disabled={packages.length === 0}
                  className={`h-10 w-full border rounded-lg px-3 transition-all duration-300 ${
                    packages.length === 0 
                      ? 'border-red-200 bg-red-50 cursor-not-allowed' 
                      : 'border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50'
                  }`}
                >
                  <option value="">
                    {packages.length === 0 ? 'Create packages first' : 'Select a package'}
                  </option>
                  {packages.map(pkg => (
                    <option key={pkg.id || pkg.package_id} value={pkg.id || pkg.package_id}>
                      {pkg.name} - ETB {pkg.price}/night
                    </option>
                  ))}
                </select>
                {packages.length === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">
                      <strong>No packages available!</strong> Please create at least one package before adding rooms.
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Packages define room types, pricing, and amenities.
                    </p>
                  </div>
                )}
              </div>

              {/* Room Details Fields */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  Room Type (auto-filled from package)
                </Label>
                <Input
                  value={newRoom.type || ''}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  placeholder="e.g., Double, Single, Suite"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                />
              </div>

              {/* Room Numbers Field */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  Room Numbers (comma-separated)
                </Label>
                <Input
                  value={newRoom.roomNumbers || ''}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumbers: e.target.value })}
                  placeholder="e.g., 201, 202, 203, 205, 207"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                />
                <p className="text-xs text-slate-500">Enter the actual room numbers as they exist in your building</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Number of Beds (auto-filled from package)</Label>
                  <Input
                    value={newRoom.numberOfBeds || ''}
                    onChange={(e) => setNewRoom({ ...newRoom, numberOfBeds: e.target.value })}
                    placeholder="e.g., 2"
                    type="number"
                    className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Capacity (auto-filled from package)
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

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Status (default: Available)</Label>
                <select
                  value={newRoom.status}
                  onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
                  className="h-10 w-full border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 rounded-lg px-3 transition-all duration-300"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Number of Rooms (for bulk insertion)</Label>
                <Input
                  value={newRoom.numberOfRooms || '1'}
                  onChange={(e) => setNewRoom({ ...newRoom, numberOfRooms: e.target.value })}
                  placeholder="Number of rooms to create"
                  type="number"
                  min="1"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                />
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
                  onClick={async () => {
                    try {
                      // Debug logging
                      console.log('🔍 Room creation - Full user object:', user);
                      console.log('🔍 Room creation - userPension:', userPension);
                      console.log('🔍 Room creation - Available pensions:', pensions.map(p => ({ 
                        id: p.id, 
                        pension_id: p.pension_id, 
                        owner_id: p.owner_id, 
                        name: p.name,
                        owner_id_type: typeof p.owner_id
                      })));
                      console.log('🔍 Room creation - Looking for pension with userId:', user?.id || user?.user_id, 'type:', typeof (user?.id || user?.user_id));
                      
                      // Get the selected pension
                      const currentPension = selectedPensionId 
                        ? pensions.find(p => String(p.pension_id || p.id) === String(selectedPensionId))
                        : pensions.find(p => p.pension_id === userPension?.pension_id || userPension?.id);
                      
                      console.log('🔍 Room creation - Found pension:', currentPension ? currentPension.name : 'None');
                      
                      if (currentPension) {
                        // Enhanced package validation
                        if (packages.length === 0) {
                          alert('❌ No packages found! Please create at least one package before adding rooms.');
                          return;
                        }
                        
                        // Check if a package is selected
                        if (!newRoom.package || newRoom.package === '') {
                          alert('❌ Please select a package for the room!');
                          return;
                        }
                        
                        // Verify the selected package exists
                        const selectedPackage = packages.find(p => 
                          String(p.id) === String(newRoom.package) || 
                          String(p.package_id) === String(newRoom.package)
                        );
                        
                        if (!selectedPackage) {
                          alert('❌ Selected package not found! Please select a valid package.');
                          return;
                        }
                        
                        // Validate required room fields
                        if (!newRoom.type || newRoom.type.trim() === '') {
                          alert('❌ Please enter a room type!');
                          return;
                        }
                        
                        if (!newRoom.roomNumbers || newRoom.roomNumbers.trim() === '') {
                          alert('❌ Please enter at least one room number!');
                          return;
                        }
                        
                        console.log('✅ All validations passed, proceeding with room creation');
                        
                        // Prepare room data for API
                        console.log('📦 Available packages:', packages);
                        console.log('📦 Selected package ID:', newRoom.package, 'type:', typeof newRoom.package);
                        console.log('📦 Package details:', packages.map(p => ({ id: p.id, package_id: p.package_id, name: p.name, idType: typeof p.id })));
                        const roomData = {
                          pension_id: currentPension.pension_id || currentPension.id,
                          package_id: newRoom.package,
                          room_type: selectedPackage ? selectedPackage.name : 'Standard',
                          capacity: parseInt(newRoom.capacity) || 1,
                          price_per_night: parseFloat(selectedPackage ? selectedPackage.price : 0),
                          number_of_beds: parseInt(newRoom.numberOfBeds) || 1,
                          availability_status: newRoom.status,
                          packageId: newRoom.package
                        };

                        console.log('🏠 Creating room with data:', roomData);
                        console.log('📦 Selected package:', selectedPackage);
                        console.log('📦 Package price:', selectedPackage?.price);
                        console.log('📤 Sending roomData to API:', JSON.stringify(roomData, null, 2));

                        // Create the room(s) via API
                        // Parse room numbers and create rooms
                        const roomNumbersList = newRoom.roomNumbers
                          .split(',')
                          .map(num => num.trim())
                          .filter(num => num.length > 0);
                        
                        let createdRooms = [];
                        
                        console.log('🔍 Room numbers to create:', roomNumbersList);
                        
                        for (const roomNumber of roomNumbersList) {
                          const roomDataWithNumber = {
                            ...roomData,
                            room_number: roomNumber  // Add room number to each room
                          };
                          
                          console.log(`🏠 Creating room ${roomNumber} with data:`, roomDataWithNumber);

                          const response = await apiService.createRoom(roomDataWithNumber);
                          
                          if (response.success) {
                            createdRooms.push({ ...response.data, room_number: roomNumber });
                          } else {
                            console.error(`Failed to create room ${roomNumber}:`, response.message);
                          }
                        }

                        if (createdRooms.length > 0) {
                          console.log(`✅ Successfully created ${createdRooms.length} rooms`);
                          setShowAddRoomModal(false);
                          // Reset form
                          setNewRoom({
                            type: '',
                            price: '',
                            status: 'Available',
                            capacity: '',
                            numberOfBeds: '',
                            numberOfRooms: '1',
                            package: '',
                            roomNumbers: '',  // Reset room numbers
                            imageType: 'Normal',
                            images: [],
                            customPackageName: '',
                            customPackagePrice: ''
                          });
                          
                          // Refresh rooms list
                          console.log('🔍 Refreshing rooms for pension:', currentPension.pension_id || currentPension.id);
                          const roomsResponse = await apiService.getRooms(currentPension.pension_id || currentPension.id, { language });
                          console.log('🔍 Rooms API response:', roomsResponse);
                          if (roomsResponse.success) {
                            console.log('🔍 Setting rooms state with:', roomsResponse.data);
                            const roomsData = roomsResponse.data?.items || roomsResponse.data || [];
                            setRooms(Array.isArray(roomsData) ? roomsData : []);
                            setRoomsData(Array.isArray(roomsData) ? roomsData : []); // Also update roomsData for UI
                            
                            // Update packages with correct available rooms count
                            const updatedPackages = packages.map(pkg => ({
                              ...pkg,
                              availableRooms: calculateAvailableRooms(pkg.id || pkg.package_id)
                            }));
                            setPackages(updatedPackages);
                            
                            // Refresh all packages globally
                            if (currentPension) {
                              await refreshAllPackages(currentPension.pension_id || currentPension.id);
                            }
                          }
                        } else {
                          alert('Failed to create any rooms. Please check the console for details.');
                        }
                      } else {
                        console.error('❌ No pension found for room creation!');
                        console.log('🔍 Debug info:', {
                          user: user,
                          userPension: userPension,
                          pensions: pensions
                        });
                        alert('Please create a pension first before adding rooms!');
                      }
                    } catch (error) {
                      console.error('Error creating room:', error);
                      alert(`Error creating room: ${error.message}`);
                    }
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
                <Label className="text-sm font-bold text-slate-700">Package Name (English)</Label>
                <Input
                  value={newPackage.name_en}
                  onChange={(e) => setNewPackage({ ...newPackage, name_en: e.target.value, name: e.target.value })}
                  placeholder="e.g., Luxury Double, Luxury Family, Economy Single"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Package Name (Amharic)</Label>
                <Input
                  value={newPackage.name_am}
                  onChange={(e) => setNewPackage({ ...newPackage, name_am: e.target.value })}
                  placeholder="ጥቅል ስም (አማርኛ)"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Package Name (Afaan Oromo)</Label>
                <Input
                  value={newPackage.name_om}
                  onChange={(e) => setNewPackage({ ...newPackage, name_om: e.target.value })}
                  placeholder="Maqaan Qabxii (Afaan Oromoo)"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Price per Night (ETB)</Label>
                <Input
                  value={newPackage.price}
                  onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                  placeholder="e.g., 5000"
                  type="number"
                  className="h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Description (English)</Label>
                <textarea
                  value={newPackage.description_en}
                  onChange={(e) => setNewPackage({ ...newPackage, description_en: e.target.value, description: e.target.value })}
                  placeholder="Describe what's included in this package..."
                  rows={2}
                  className="w-full border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-2 transition-all duration-300 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Description (Amharic)</Label>
                <textarea
                  value={newPackage.description_am}
                  onChange={(e) => setNewPackage({ ...newPackage, description_am: e.target.value })}
                  placeholder="ትዕርር ያካትታል (አማርኛ)"
                  rows={2}
                  className="w-full border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-2 transition-all duration-300 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Description (Afaan Oromo)</Label>
                <textarea
                  value={newPackage.description_om}
                  onChange={(e) => setNewPackage({ ...newPackage, description_om: e.target.value })}
                  placeholder="Ibsa (Afaan Oromoo)"
                  rows={2}
                  className="w-full border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-2 transition-all duration-300 resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Services</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['WiFi', 'Breakfast', 'TV', 'Mini-fridge', 'Balcony', 'Air Conditioning', 'Parking', 'Pool Access'].map(service => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPackage.services.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewPackage({ ...newPackage, services: [...newPackage.services, service] });
                          } else {
                            setNewPackage({ ...newPackage, services: newPackage.services.filter(s => s !== service) });
                          }
                        }}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">{service}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Add Custom Service</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newPackage.customService || ''}
                      onChange={(e) => setNewPackage({ ...newPackage, customService: e.target.value })}
                      placeholder="Enter custom service name"
                      className="flex-1 h-10 border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newPackage.customService && newPackage.customService.trim()) {
                          setNewPackage({ 
                            ...newPackage, 
                            services: [...newPackage.services, newPackage.customService.trim()],
                            customService: ''
                          });
                        }
                      }}
                      disabled={!newPackage.customService || !newPackage.customService.trim()}
                      className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Package Image (required for customer display)</Label>
                
                {/* Image Type Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Image Type</Label>
                  <div className="flex gap-3">
                    {['Normal', '3D'].map((type) => (
                      <button
                        key={type}
                        className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                          newPackage.imageType === type
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'
                        }`}
                        onClick={() => setNewPackage({ ...newPackage, imageType: type })}
                      >
                        {type === '3D' ? '3D Tour' : 'Normal Images'}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Image Upload Area */}
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white hover:border-purple-400 transition-all duration-300">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <div className="p-2 rounded-full bg-purple-100">
                      <Upload className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <span className="font-semibold text-sm">Click to upload {newPackage.imageType === '3D' ? '3D tour files' : 'package image'}</span>
                      <p className="text-xs mt-1">
                        {newPackage.imageType === '3D' 
                          ? '3D files (GLB, GLTF, OBJ) - Max 50MB' 
                          : 'PNG, JPG, GIF up to 10MB'
                        }
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept={newPackage.imageType === '3D' ? "model/*" : "image/*"}
                    multiple={false}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePackageImageUpload(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                {(newPackage as any).image && (
                  <div className="mt-2">
                    {newPackage.imageType === '3D' ? (
                      <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="p-2 rounded-full bg-purple-100 inline-block mb-2">
                            <Upload className="h-4 w-4 text-purple-600" />
                          </div>
                          <p className="text-sm text-slate-600">3D Tour File Uploaded</p>
                          <p className="text-xs text-slate-500 mt-1">{(newPackage as any).image.split('/').pop()}</p>
                        </div>
                      </div>
                    ) : (
                      <img src={(newPackage as any).image} alt="Package preview" className="w-full h-32 object-cover rounded-lg" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(newPackage as any).isMostPopular || false}
                    onChange={(e) => setNewPackage({ ...newPackage, isMostPopular: e.target.checked } as any)}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-bold text-slate-700">Mark as Most Popular</span>
                </label>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Walk-In Booking Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Walk-In Booking</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowWalkInModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Guest Name</label>
                <input
                  type="text"
                  value={walkInForm.guestName}
                  onChange={(e) => setWalkInForm(prev => ({ ...prev, guestName: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter guest name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={walkInForm.phoneNumber}
                  onChange={(e) => setWalkInForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Package</label>
                <select
                  value={walkInForm.packageId}
                  onChange={(e) => setWalkInForm(prev => ({ ...prev, packageId: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a package</option>
                  {walkInPackages.map(pkg => (
                    <option key={pkg.package_id} value={pkg.package_id}>
                      {pkg.name} - ETB {pkg.price_per_night}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowWalkInModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleWalkInSubmit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Create Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
