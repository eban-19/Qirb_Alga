import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { User, Pension, Package, Room, Staff } from '../types/dashboard';

export const useDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth() as { logout: () => Promise<void>, user: User };

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  type ViewMode = 'card' | 'table';
  const [viewModes, setViewModes] = useState<Record<string, ViewMode>>({
    rooms: 'card',
    bookings: 'card',
    guests: 'card',
    transactions: 'card',
    staff: 'card'
  });

  // --- MODAL STATES ---
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showCreatePension, setShowCreatePension] = useState(false);
  const [showRoomsBulkUploadModal, setShowRoomsBulkUploadModal] = useState(false);
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
    room_details: '', room_details_en: '', room_details_am: '', room_details_om: ''
  });

  const [walkInForm, setWalkInForm] = useState({
    guestName: '', phoneNumber: '', checkIn: '', checkOut: '', packageId: ''
  });

  // Bulk upload states
  const [roomsBulkUpload, setRoomsBulkUpload] = useState({ file: null as File | null, data: [] as unknown[], preview: [] as unknown[] });
  const [staffBulkUpload, setStaffBulkUpload] = useState({ file: null as File | null, data: [] as unknown[], preview: [] as unknown[] });

  // Settings states
  const [propertySettings, setPropertySettings] = useState({
    name: '', address: '', phone: '', email: '', description: '',
    imageUrl: '', ownerInfo: '', roomDetails: '', capacity: '',
    amenities: [] as string[]
  });
  const [businessProfile, setBusinessProfile] = useState({
    businessName: '', businessEmail: '', businessPhone: ''
  });
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '', newPassword: '', twoFactorEnabled: false
  });

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

    // Modal States
    showAddRoomModal, setShowAddRoomModal,
    showAddPackageModal, setShowAddPackageModal,
    showAddStaffModal, setShowAddStaffModal,
    showWalkInModal, setShowWalkInModal,
    showCreatePension, setShowCreatePension,
    showRoomsBulkUploadModal, setShowRoomsBulkUploadModal,
    showStaffBulkUploadModal, setShowStaffBulkUploadModal,

    // Form States
    editingStaff, setEditingStaff,
    newStaff, setNewStaff,
    editingPackage, setEditingPackage,
    newPackage, setNewPackage,
    newRoom, setNewRoom,
    newPension, setNewPension,
    walkInForm, setWalkInForm,
    roomsBulkUpload, setRoomsBulkUpload,
    staffBulkUpload, setStaffBulkUpload,
    propertySettings, setPropertySettings,
    businessProfile, setBusinessProfile,
    securitySettings, setSecuritySettings,

    // Handlers
    handleLogout,
    showSuccess
  };
};
