import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { User, Pension, Package, Room, Staff } from '../types/dashboard';

export const useDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth() as { logout: () => Promise<void>, user: User };

  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/staff')) return 'staff';
    if (path.includes('/dashboard/bookings')) return 'bookings';
    if (path.includes('/dashboard/rooms/') && path.endsWith('/calendar')) return 'room-calendar';
    if (path.includes('/dashboard/rooms')) return 'rooms';
    if (path.includes('/dashboard/guests')) return 'guests';
    if (path.includes('/dashboard/transactions')) return 'transactions';
    if (path.includes('/dashboard/pension-profile')) return 'pension-profile';
    if (path.includes('/dashboard/packages')) return 'packages';
    if (path.includes('/dashboard/pricing-policies')) return 'pricing-policies';
    if (path.includes('/dashboard/booking-policies')) return 'booking-policies';
    if (path.includes('/dashboard/promotions')) return 'promotions';
    if (path.includes('/dashboard/reports')) return 'reports';
    if (path.includes('/dashboard/subscription')) return 'subscription';
    if (path.includes('/dashboard/settings/business-profile')) return 'settings-business-profile';
    if (path.includes('/dashboard/settings/security')) return 'settings-security';
    if (path.includes('/dashboard/settings/bank-settings')) return 'settings-bank-settings';
    if (path.includes('/dashboard/settings/compliance')) return 'settings-compliance';
    if (path.includes('/dashboard/settings')) return 'settings-business-profile';
    return 'overview';
  };

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  type ViewMode = 'card' | 'table';
  const [viewModes, setViewModes] = useState<Record<string, ViewMode>>({
    rooms: 'table',
    bookings: 'table',
    guests: 'table',
    transactions: 'table',
    staff: 'table'
  });

  // --- PAGINATION & SELECTION STATE ---
  const [pagination, setPagination] = useState<Record<string, { page: number, limit: number }>>({
    rooms: { page: 1, limit: 10 },
    bookings: { page: 1, limit: 10 },
    guests: { page: 1, limit: 10 },
    transactions: { page: 1, limit: 10 },
    staff: { page: 1, limit: 10 },
    packages: { page: 1, limit: 10 }
  });

  const [selectedRows, setSelectedRows] = useState<Record<string, (string | number)[]>>({
    rooms: [],
    bookings: [],
    guests: [],
    staff: [],
    packages: []
  });

  // --- MODAL STATES ---
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showCreatePension, setShowCreatePension] = useState(false);
  const [showStaffBulkUploadModal, setShowStaffBulkUploadModal] = useState(false);

  // --- FORM STATES ---
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [newStaff, setNewStaff] = useState({
    full_name: '', role: '', phone: '', salary: '', pension_id: '',
    owner_id: '', department: '', email: '', status: 'active'
  });

  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [newPackage, setNewPackage] = useState({
    name: '', name_en: '', name_am: '', name_om: '', price: '',
    description: '', description_en: '', description_am: '', description_om: '',
    services: ['WiFi', 'Clean Room', 'Basic Amenities'],
    isMostPopular: false, image: '', customService: '', imageType: 'Normal'
  });

  const [newRoom, setNewRoom] = useState({
    type: '', floor: '', price: '', status: 'Available', capacity: '',
    numberOfBeds: '', numberOfRooms: '1', package: '', roomNumbers: '',
    imageType: 'Normal', images: [], customPackageName: '', customPackagePrice: ''
  });

  const [newPension, setNewPension] = useState({
    name: '', name_en: '', name_am: '', name_om: '',
    description: '', description_en: '', description_am: '', description_om: '',
    address: '', address_en: '', address_am: '', address_om: '',
    phone: '', email: '', capacity: '', image_url: '',
    owner_info: '', owner_info_en: '', owner_info_am: '', owner_info_om: '',
    room_details: '', room_details_en: '', room_details_am: '', room_details_om: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  });

  const [walkInForm, setWalkInForm] = useState({
    guestName: '',
    phoneNumber: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    packageId: ''
  });

  // Bulk upload states
  const [roomsBulkUpload, setRoomsBulkUpload] = useState({ file: null as File | null, data: [] as unknown[], preview: [] as unknown[] });
  const [staffBulkUpload, setStaffBulkUpload] = useState({ file: null as File | null, data: [] as unknown[], preview: [] as unknown[] });

  // Settings states
  const [propertySettings, setPropertySettings] = useState({
    name: '', address: '', phone: '', email: '', description: '',
    imageUrl: '', ownerInfo: '', roomDetails: '', capacity: '',
    amenities: [] as string[],
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  });
  const [businessProfile, setBusinessProfile] = useState({
    businessName: '', businessEmail: '', businessPhone: ''
  });
  const [bankSettings, setBankSettings] = useState({
    bankId: '', bankName: '', accountName: '', accountNumber: '', chapaSubaccountId: ''
  });
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '', newPassword: '', twoFactorEnabled: false
  });
  const [transactionCategory, setTransactionCategory] = useState('all');

  // Image file states
  const [pensionImageFile, setPensionImageFile] = useState<File | null>(null);
  const [packageImageFile, setPackageImageFile] = useState<File | null>(null);
  const [pensionProfileImageFile, setPensionProfileImageFile] = useState<File | null>(null);

  // --- ACTIONS ---
  const toggleViewMode = (section: keyof typeof viewModes) => {
    setViewModes(prev => ({
      ...prev,
      [section]: prev[section] === 'card' ? 'table' : 'card'
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const showSuccess = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  return {
    // State
    activeTab, setActiveTab,
    mobileSidebarOpen, setMobileSidebarOpen,
    settingsExpanded, setSettingsExpanded,
    isSearchOpenMobile, setIsSearchOpenMobile,
    searchQuery, setSearchQuery,
    showSaveSuccess,
    isUpdating, setIsUpdating,
    viewModes, toggleViewMode,
    transactionCategory, setTransactionCategory,

    // Modal States
    showAddRoomModal, setShowAddRoomModal,
    showAddPackageModal, setShowAddPackageModal,
    showAddStaffModal, setShowAddStaffModal,
    showWalkInModal, setShowWalkInModal,
    showCreatePension, setShowCreatePension,
    showStaffBulkUploadModal, setShowStaffBulkUploadModal,

    // Form States
    editingStaff, setEditingStaff,
    newStaff, setNewStaff,
    editingPackage, setEditingPackage,
    newPackage, setNewPackage,
    newRoom, setNewRoom,
    newPension, setNewPension,
    walkInForm, setWalkInForm,
    staffBulkUpload, setStaffBulkUpload,
    propertySettings, setPropertySettings,
    businessProfile, setBusinessProfile,
    bankSettings, setBankSettings,
    securitySettings, setSecuritySettings,
    pensionImageFile, setPensionImageFile,
    packageImageFile, setPackageImageFile,
    pensionProfileImageFile, setPensionProfileImageFile,
    errorMessage,
    setErrorMessage,
    pagination,
    setPagination,
    selectedRows,
    setSelectedRows,
    toggleSelection: (section: string, id: string | number) => {
      setSelectedRows(prev => {
        const current = prev[section] || [];
        const exists = current.includes(id);
        return {
          ...prev,
          [section]: exists ? current.filter(i => i !== id) : [...current, id]
        };
      });
    },
    clearSelection: (section: string) => {
      setSelectedRows(prev => ({ ...prev, [section]: [] }));
    },

    // Handlers
    handleLogout,
    showSuccess
  };
};
