import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LayoutDashboard,
  BarChart3,
  BedDouble,
  CalendarCheck,
  Calendar,
  X,
  Filter,
  CheckCircle,
  IdCard,
  ChevronDown,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookingSectionProps {
  bookings: any[];
  viewMode: "card" | "table";
  onToggleView: () => void;
  onUpdateStatus: (id: string | number, status: string) => void;
  onCompleteEarly: (id: string | number) => void;
  pagination?: { page: number; limit: number };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  selectedRows?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
  totalItems?: number;
  onAddNewBooking?: () => void;
}

interface WalkInForm {
  guestName: string;
  phoneNumber: string;
  packageId: string;
  checkIn?: string;
  checkOut?: string;
}

interface InlineMessage {
  bookingId: string | number;
  type: 'success' | 'error' | 'processing';
  message: string;
  timestamp: number;
}

const BookingCard = ({
  booking,
  onCompleteEarly,
  onViewId,
  isSelected = false,
  onToggleSelection,
  onUpdateStatus
}: {
  booking: any;
  onCompleteEarly: (id: string | number) => void;
  onViewId: (idUrl: string) => void;
  isSelected?: boolean;
  onToggleSelection?: (id: string | number) => void;
  onUpdateStatus: (id: string | number, status: string) => void;
}) => {
  const { t } = useLanguage();
  const roomInfo = booking.room_number || booking.room_name || booking.room_type || `${t.dashboard?.room || 'Room'} ${booking.room_id || 'N/A'}`;
  const bookingId = booking.id || booking.booking_id;

  return (
    <Card key={bookingId} className={`group border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden bg-white hover:scale-[1.02] relative ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <div className="absolute top-4 right-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection?.(bookingId)}
          className="h-5 w-5 bg-white/80 border-slate-300"
        />
      </div>
      <CardHeader className="relative pb-0">
        <div className="flex justify-between items-start mb-4 pr-8">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{booking.user_name || t.dashboard?.guest || "Guest"}</h3>
            {(booking.user_phone || booking.phone) && (
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {booking.user_phone || booking.phone}
              </p>
            )}
          </div>
          <Badge className={`${booking.status?.toLowerCase() === 'confirmed' ? 'bg-emerald-500 shadow-emerald-500/25' :
            booking.status?.toLowerCase() === 'completed' ? 'bg-blue-500 shadow-blue-500/25' :
            booking.status?.toLowerCase() === 'pending' ? 'bg-amber-500 shadow-amber-500/25' : 'bg-slate-500 shadow-slate-500/25'
            } text-white text-xs shadow-sm capitalize`}>
            {booking.status?.toLowerCase() === 'confirmed' ? (t.dashboard?.confirmedStays || 'Confirmed') :
              booking.status?.toLowerCase() === 'completed' ? (t.dashboard?.pastBookings || 'Completed') :
              booking.status?.toLowerCase() === 'pending' ? (t.dashboard?.pendingBookings || 'Pending') :
                (booking.status || 'N/A')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <BedDouble className="h-4 w-4" />
            {t.dashboard?.room || "Room"}
          </span>
          <span className="font-bold text-slate-900">{roomInfo}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            {t.dashboard?.checkIn || "Check-in"}
          </span>
          <span className="font-bold text-slate-900">{booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t.dashboard?.checkOut || "Check-out"}
          </span>
          <span className="font-bold text-slate-900">{booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
          <span className="text-sm font-bold text-emerald-700">{t.dashboard?.amount || "Total"}</span>
          <span className="font-bold text-emerald-700 text-lg">ETB {parseFloat(booking.total_price || 0).toLocaleString()}</span>
        </div>
        <div className="pt-2 border-t border-slate-100 mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors duration-200 rounded-xl h-11"
              >
                <span className="flex items-center gap-2 font-bold">
                  {t.dashboard?.actions || "Actions"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-xl border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
              {booking.id_document_url && (
                <DropdownMenuItem
                  onClick={() => onViewId(booking.id_document_url)}
                  className="flex items-center gap-2 p-3 cursor-pointer rounded-lg focus:bg-purple-50 focus:text-purple-600 transition-colors"
                >
                  <IdCard className="h-4 w-4" />
                  {t.dashboard?.viewId || "View ID"}
                </DropdownMenuItem>
              )}



              {booking.status?.toLowerCase() === 'confirmed' && (
                <DropdownMenuItem
                  onClick={() => onCompleteEarly(bookingId)}
                  className="flex items-center gap-2 p-3 cursor-pointer rounded-lg focus:bg-blue-50 focus:text-blue-600 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  {t.dashboard?.earlyCheckout || "Early Checkout"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export const BookingSection: React.FC<BookingSectionProps> = ({
  bookings = [],
  viewMode,
  onToggleView,
  onUpdateStatus,
  onCompleteEarly,
  pagination = { page: 1, limit: 10 },
  onPageChange,
  onLimitChange,
  selectedRows = [],
  onToggleSelection,
  onSelectAll,
  totalItems = 0,
  onAddNewBooking
}) => {
  const { t } = useLanguage();
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInForm, setWalkInForm] = useState<WalkInForm>({
    guestName: '',
    phoneNumber: '',
    packageId: ''
  });
  const [packages, setPackages] = useState<any[]>([]);
  const [inlineMessages, setInlineMessages] = useState<InlineMessage[]>([]);
  const [inlineMessagesEnabled] = useState(true);
  const [showEarlyCheckoutConfirm, setShowEarlyCheckoutConfirm] = useState(false);
  const [pendingEarlyCheckoutId, setPendingEarlyCheckoutId] = useState<string | number | null>(null);
  const [isProcessingEarlyCheckout, setIsProcessingEarlyCheckout] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [selectedIdUrl, setSelectedIdUrl] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'confirmed' | 'pending'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'specific'>('all');
  const [specificDate, setSpecificDate] = useState<string>('');

  const filteredBookings = bookings.filter(b => {
    // 1. Status Filter
    let passStatus = true;
    if (activeFilter === 'active') {
      passStatus = ['confirmed', 'pending'].includes(b.status?.toLowerCase());
    } else if (activeFilter !== 'all') {
      passStatus = b.status?.toLowerCase() === activeFilter;
    }

    if (!passStatus) return false;

    // 2. Date Filter
    if (dateFilter === 'all') return true;

    // Normalize check in/out dates to YYYY-MM-DD local
    const checkInDate = new Date(b.check_in_date);
    const checkOutDate = new Date(b.check_out_date);
    // Use local timezone strings
    const bCheckIn = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}-${String(checkInDate.getDate()).padStart(2, '0')}`;
    const bCheckOut = `${checkOutDate.getFullYear()}-${String(checkOutDate.getMonth() + 1).padStart(2, '0')}-${String(checkOutDate.getDate()).padStart(2, '0')}`;
    
    const todayObj = new Date();
    const today = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    if (dateFilter === 'today') {
      // Booking overlaps with today
      return bCheckIn <= today && bCheckOut >= today;
    }
    if (dateFilter === 'upcoming') {
      // Booking check-in is after today
      return bCheckIn > today;
    }
    if (dateFilter === 'specific' && specificDate) {
      // Booking overlaps with the specific date
      return bCheckIn <= specificDate && bCheckOut >= specificDate;
    }

    return true;
  });

  const totalPages = Math.ceil(totalItems / pagination.limit) || 1;

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  useEffect(() => {
    if (showEarlyCheckoutConfirm) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [showEarlyCheckoutConfirm]);

  const addMessage = (bookingId: string | number, type: 'success' | 'error' | 'processing', message: string) => {
    const newMessage: InlineMessage = {
      bookingId,
      type,
      message,
      timestamp: Date.now()
    };
    setInlineMessages(prev => [...prev.filter(msg => msg.bookingId !== bookingId), newMessage]);
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        setInlineMessages(prev => prev.filter(msg => msg.timestamp !== newMessage.timestamp));
      }, 5000);
    }
  };

  const clearMessage = (bookingId: string | number) => {
    setInlineMessages(prev => prev.filter(msg => msg.bookingId !== bookingId));
  };

  const InlineMessageComponent: React.FC<{ bookingId: string | number }> = ({ bookingId }) => {
    const message = inlineMessages.find(msg => msg.bookingId === bookingId);
    if (!message) return null;

    const getMessageStyles = () => {
      switch (message.type) {
        case 'success': return 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100/50';
        case 'error': return 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-200 text-rose-800 shadow-rose-100/50';
        case 'processing': return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-cyan-200 text-cyan-800 shadow-cyan-100/50';
        default: return 'bg-gradient-to-r from-gray-50 to-slate-50 border-slate-200 text-slate-800 shadow-slate-100/50';
      }
    };

    const getMessageIcon = () => {
      switch (message.type) {
        case 'success': return <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L9 7" /></svg>;
        case 'error': return <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
        case 'processing': return <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>;
        default: return null;
      }
    };

    return (
      <div className={`mt-2 p-3 rounded-lg border ${getMessageStyles()} flex items-center justify-between gap-3 animate-in fade-in-0 slide-in-from-top-1 duration-300 shadow-sm`}>
        <div className="flex items-center gap-3">
          {getMessageIcon()}
          <span className="text-sm font-medium">{message.message}</span>
        </div>
        {message.type !== 'processing' && (
          <button onClick={() => clearMessage(bookingId)} className="p-1 hover:bg-black/5 rounded">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const response = await fetch('http://localhost:3006/api/packages');
        const data = await response.json();
        if (data.success) setPackages(data.data || []);
      } catch (error) {
        console.error('Failed to load packages:', error);
      }
    };
    loadPackages();
  }, []);

  const handleWalkInSubmit = async () => {
    if (!walkInForm.guestName || !walkInForm.phoneNumber || !walkInForm.packageId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3006/api/bookings/walk-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          guestName: walkInForm.guestName,
          phoneNumber: walkInForm.phoneNumber,
          packageId: walkInForm.packageId,
          checkIn: walkInForm.checkIn,
          checkOut: walkInForm.checkOut
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowWalkInModal(false);
        setWalkInForm({ guestName: '', phoneNumber: '', packageId: '', checkIn: '', checkOut: '' });
        alert('Walk-in booking created successfully!');
      } else {
        alert('Failed to create booking: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating walk-in booking:', error);
      alert('Failed to create booking');
    }
  };

  const handleEarlyCheckoutWithMessages = async (bookingId: string | number) => {
    if (!inlineMessagesEnabled) {
      await onCompleteEarly(bookingId);
      return;
    }
    try {
      addMessage(bookingId, 'processing', 'Processing early checkout...');
      await onCompleteEarly(bookingId);
      addMessage(bookingId, 'success', 'Booking completed early. Room is now available.');
    } catch (error: any) {
      console.error('Early checkout error:', error);
      const errorMessage = error.message || 'Early checkout failed';
      if (errorMessage.includes('already completed')) {
        addMessage(bookingId, 'error', 'This booking is already completed.');
      } else if (errorMessage.includes('not found')) {
        addMessage(bookingId, 'error', 'Booking not found.');
      } else {
        addMessage(bookingId, 'error', 'Failed to complete early checkout. Please try again.');
      }
    }
  };

  const handleEarlyCheckoutClick = (bookingId: string | number) => {
    setPendingEarlyCheckoutId(bookingId);
    setShowEarlyCheckoutConfirm(true);
  };

  const handleViewId = (idUrl: string) => {
    setSelectedIdUrl(idUrl);
    setShowIdModal(true);
  };

  const getFullImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `http://localhost:3006${imagePath}`;
    return imagePath;
  };

  const selectedBookings = bookings.filter(b => selectedRows.includes(b.id || b.booking_id));


  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-white border border-slate-200 p-3 rounded-xl shadow-md flex flex-col xs:flex-row items-center justify-between gap-3 mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 w-full xs:w-auto">
            <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold shrink-0">
              {selectedRows.length} {t.dashboard?.selected || 'selected'}
            </Badge>
            <p className="text-sm font-medium text-slate-600 hidden sm:block truncate">{t.dashboard?.performActionsSelected || 'Perform actions on all selected bookings'}</p>
          </div>
          <div className="flex items-center gap-2 w-full xs:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 xs:flex-none text-slate-600 border-slate-200 font-bold hover:bg-slate-50 h-10"
              onClick={() => onSelectAll?.([])}
            >
              {t.dashboard?.clearSelection || 'Clear Selection'}
            </Button>


            <Button
              size="sm"
              className="flex-1 xs:flex-none bg-red-500 hover:bg-red-600 text-white font-bold shadow-sm h-10"
              onClick={() => setShowConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>{selectedRows.length === 1 ? (t.dashboard?.delete || 'Delete') : `${t.dashboard?.delete || 'Delete'} ${selectedRows.length}`}</span>
            </Button>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => {
          selectedRows.forEach(id => onUpdateStatus?.(id, 'deleted'));
          onSelectAll?.([]);
          setShowConfirmDelete(false);
        }}
        title={selectedRows.length === 1 ? (t.dashboard?.deleteBooking || "Delete Booking") : (t.dashboard?.deleteBookings || "Delete Bookings")}
        description={selectedRows.length === 1
          ? (t.dashboard?.confirmDeleteBookingSingleDescription || "Are you sure you want to permanently delete this booking record? This action cannot be reversed.")
          : (t.dashboard?.confirmDeleteBookingsMultipleDescription || `Are you sure you want to permanently delete these ${selectedRows.length} bookings? This action cannot be reversed.`)
        }
        itemCount={selectedRows.length}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 flex-1 sm:flex-initial">
            <Filter className="h-4 w-4 text-slate-500 shrink-0" />

            <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 rounded-lg border-none bg-transparent focus:ring-0 focus:ring-offset-0 font-semibold text-slate-700">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                {[
                  { id: 'all', label: t.dashboard?.allBookings || 'All Bookings', color: 'text-slate-600' },
                  { id: 'active', label: t.dashboard?.activeBookings || 'Active', color: 'text-blue-600' },
                  { id: 'pending', label: t.dashboard?.pendingBookings || 'Pending', color: 'text-amber-600' },
                  { id: 'confirmed', label: t.dashboard?.confirmedStays || 'Confirmed', color: 'text-emerald-600' },
                  { id: 'completed', label: t.dashboard?.pastBookings || 'Completed', color: 'text-indigo-600' }
                ].map((filter) => (
                  <SelectItem key={filter.id} value={filter.id} className="rounded-lg focus:bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${filter.id === 'all' ? 'bg-slate-400' :
                        filter.id === 'active' ? 'bg-blue-400' :
                        filter.id === 'pending' ? 'bg-amber-400' :
                          filter.id === 'confirmed' ? 'bg-emerald-400' : 'bg-indigo-400'
                        }`} />
                      <span className={`font-medium truncate ${filter.color}`}>
                        {filter.label}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 flex-1 sm:flex-initial">
            <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
            <Select value={dateFilter} onValueChange={(value) => {
              setDateFilter(value as any);
              if (value !== 'specific') setSpecificDate('');
            }}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 rounded-lg border-none bg-transparent focus:ring-0 focus:ring-offset-0 font-semibold text-slate-700">
                <SelectValue placeholder="Date filter" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <SelectItem value="all" className="rounded-lg focus:bg-slate-50 cursor-pointer">
                  <span className="font-medium text-slate-600">All Dates</span>
                </SelectItem>
                <SelectItem value="today" className="rounded-lg focus:bg-slate-50 cursor-pointer">
                  <span className="font-medium text-blue-600">Today</span>
                </SelectItem>
                <SelectItem value="upcoming" className="rounded-lg focus:bg-slate-50 cursor-pointer">
                  <span className="font-medium text-amber-600">Upcoming</span>
                </SelectItem>
                <SelectItem value="specific" className="rounded-lg focus:bg-slate-50 cursor-pointer">
                  <span className="font-medium text-emerald-600">Specific Date</span>
                </SelectItem>
              </SelectContent>
            </Select>
            {dateFilter === 'specific' && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="ml-1 h-9 rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                />
              </div>
            )}
          </div>

          {onAddNewBooking && (
            <Button
              onClick={onAddNewBooking}
              className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-bold flex-1 sm:flex-initial"
            >
              <Plus className="h-4 w-4" />
              <span>{t.dashboard?.newBooking || "New Booking"}</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl shadow-inner w-full sm:w-fit ml-auto">
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            onClick={onToggleView}
            className={`flex-1 sm:flex-initial gap-2 rounded-lg transition-all duration-300 ${viewMode === "card" ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-white hover:text-primary hover:shadow-md"
              }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            {t.dashboard?.cards || "Cards"}
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={onToggleView}
            className={`flex-1 sm:flex-initial gap-2 rounded-lg transition-all duration-300 ${viewMode === "table" ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-white hover:text-primary hover:shadow-md"
              }`}
          >
            <BarChart3 className="h-4 w-4" />
            {t.dashboard?.table || "Table"}
          </Button>
        </div>
      </div>

      {/* Cards View */}
      {
        viewMode === "card" && (
          <div className="grid gap-6 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id || booking.booking_id}
                booking={booking}
                onCompleteEarly={handleEarlyCheckoutClick}
                onViewId={handleViewId}
                isSelected={selectedRows.includes(booking.id || booking.booking_id)}
                onToggleSelection={onToggleSelection}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
            {filteredBookings.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-medium italic">{t.dashboard?.noBookingsFilter || "No bookings found for this filter."}</p>
              </div>
            )}
          </div>
        )
      }

      {/* Table View */}
      {
        viewMode === "table" && (
          <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white relative overflow-hidden">
            <CardContent className="p-0 relative">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <TableRow className="hover:bg-transparent border-slate-200">
                      <TableHead className="w-[50px] px-4">
                        <Checkbox
                          checked={bookings.length > 0 && selectedRows.length === bookings.length}
                          onCheckedChange={(checked) => {
                            if (checked) onSelectAll?.(bookings.map(b => b.id || b.booking_id));
                            else onSelectAll?.([]);
                          }}
                        />
                      </TableHead>
                      <TableHead className="text-slate-700 font-bold">{t.dashboard?.guest || "Guest"}</TableHead>
                      <TableHead className="text-slate-700 font-bold">{t.dashboard?.room || "Room"}</TableHead>
                      <TableHead className="text-slate-700 font-bold">{t.dashboard?.checkIn || "Check-in"}</TableHead>
                      <TableHead className="text-slate-700 font-bold">{t.dashboard?.checkOut || "Check-out"}</TableHead>
                      <TableHead className="text-slate-700 font-bold text-right">{t.dashboard?.amount || "Amount"}</TableHead>
                      <TableHead className="text-slate-700 font-bold">{t.dashboard?.status || "Status"}</TableHead>
                      <TableHead className="text-slate-700 font-bold">{t.dashboard?.actions || "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const bookingId = booking.id || booking.booking_id;
                      const roomInfo = booking.room_number || booking.room_name || booking.room_type || `${t.dashboard?.room || 'Room'} ${booking.room_id || 'N/A'}`;
                      return (
                        <TableRow key={bookingId} className={`hover:bg-blue-50/50 transition-colors group ${selectedRows.includes(bookingId) ? 'bg-blue-50/30' : ''}`}>
                          <TableCell className="px-4">
                            <Checkbox checked={selectedRows.includes(bookingId)} onCheckedChange={() => onToggleSelection?.(bookingId)} />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                {(booking.user_name || 'G').charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{booking.user_name || t.dashboard?.guest || 'Guest'}</p>
                                {(booking.user_phone || booking.phone) && (
                                  <p className="text-sm text-slate-500 flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    {booking.user_phone || booking.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="bg-slate-50 text-slate-700 font-medium border-slate-200">{roomInfo}</Badge></TableCell>
                          <TableCell className="text-slate-600">{booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell className="text-slate-600">{booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell className="text-right font-bold text-slate-900">ETB {(booking.total_price || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={`${booking.status?.toLowerCase() === 'confirmed' ? 'bg-emerald-500' :
                              booking.status?.toLowerCase() === 'completed' ? 'bg-blue-500' :
                              booking.status?.toLowerCase() === 'pending' ? 'bg-amber-500' : 'bg-slate-500'
                              } text-white border-none px-3 py-1 font-medium shadow-sm`}>
                              {booking.status?.toLowerCase() === 'confirmed' ? (t.dashboard?.confirmedStays || 'Confirmed') :
                                booking.status?.toLowerCase() === 'completed' ? (t.dashboard?.pastBookings || 'Completed') :
                                booking.status?.toLowerCase() === 'pending' ? (t.dashboard?.pendingBookings || 'Pending') :
                                  (booking.status || 'N/A')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-9 px-3 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors duration-200">
                                    <span className="text-xs font-bold">{t.dashboard?.actions || "Actions"}</span>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                                  {booking.id_document_url && (
                                    <DropdownMenuItem onClick={() => handleViewId(booking.id_document_url)} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-purple-50 focus:text-purple-600 transition-colors">
                                      <IdCard className="h-4 w-4" />{t.dashboard?.viewId || "View ID"}
                                    </DropdownMenuItem>
                                  )}
                                  {booking.status?.toLowerCase() === 'confirmed' && (
                                    <DropdownMenuItem onClick={() => handleEarlyCheckoutClick(bookingId)} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-blue-50 focus:text-blue-600 transition-colors">
                                      <CheckCircle className="h-4 w-4" />{t.dashboard?.completeEarly || "Complete Early"}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {filteredBookings.length === 0 && (
                <div className="py-20 text-center bg-white"><p className="text-slate-400 font-medium italic">{t.dashboard?.noBookingsFilter || "No bookings found for this filter."}</p></div>
              )}

              {/* Unified Pagination Footer */}
              <div className="p-3 sm:p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 gap-2 overflow-hidden">
                <div className="text-[10px] sm:text-sm font-bold text-slate-500 shrink-0">
                  <span className="hidden sm:inline">
                    {t.dashboard?.showingBookings ? (
                      t.dashboard.showingBookings.replace('{count}', String(bookings.length)).replace('{total}', String(totalItems))
                    ) : (
                      <>Showing <span className="text-slate-900">{bookings.length}</span> of <span className="text-slate-900">{totalItems}</span></>
                    )}
                  </span>
                  <span className="sm:hidden text-slate-900 font-extrabold">{bookings.length}/{totalItems}</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  <Select
                    value={String(pagination.limit)}
                    onValueChange={(val) => onLimitChange?.(parseInt(val))}
                  >
                    <SelectTrigger className="w-[65px] sm:w-[130px] h-8 sm:h-10 border-slate-200 rounded-lg text-slate-600 font-medium bg-white px-1 sm:px-3 text-[10px] sm:text-sm">
                      <div className="flex items-center justify-center w-full">
                        <span className="sm:hidden">{pagination.limit}/p</span>
                        <span className="hidden sm:inline">{pagination.limit} {t.dashboard?.perPage || "/ page"}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPageChange?.(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map(pageNum => (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? "default" : "ghost"}
                          onClick={() => onPageChange?.(pageNum)}
                          className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-sm transition-all duration-200 p-0 ${pagination.page === pageNum
                            ? "bg-[#F29F1F] text-slate-900 hover:bg-[#F29F1F]/90 shadow-md shadow-orange-200"
                            : "text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                          {pageNum}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPageChange?.(pagination.page + 1)}
                      disabled={pagination.page >= totalPages}
                      className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0"
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Inline Messages for Table View */}
      {
        viewMode === "table" && (
          <div className="space-y-2">
            {bookings.map((booking) => (
              <InlineMessageComponent key={`msg-${booking.id || booking.booking_id}`} bookingId={booking.id || booking.booking_id} />
            ))}
          </div>
        )
      }

      {/* Modals & Dialogs */}
      {
        showEarlyCheckoutConfirm && ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={() => setShowEarlyCheckoutConfirm(false)}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 mx-auto"><AlertCircle className="w-8 h-8 text-amber-600" /></div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">{t.dashboard?.confirmEarlyCheckout || "Confirm Early Checkout"}</h3>
              <p className="text-slate-600 text-center mb-8">{t.dashboard?.earlyCheckoutConfirmDescription || "Are you sure you want to complete this booking early and make the room available?"}</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setShowEarlyCheckoutConfirm(false)}>{t.dashboard?.cancel || "Cancel"}</Button>
                <Button className="flex-1 rounded-xl h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25" disabled={isProcessingEarlyCheckout} onClick={async () => {
                  if (pendingEarlyCheckoutId) {
                    setIsProcessingEarlyCheckout(true);
                    await handleEarlyCheckoutWithMessages(pendingEarlyCheckoutId);
                    setIsProcessingEarlyCheckout(false);
                    setShowEarlyCheckoutConfirm(false);
                  }
                }}>
                  {isProcessingEarlyCheckout ? (t.dashboard?.processing || 'Processing...') : (t.dashboard?.confirm || 'Confirm')}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {
        showIdModal && selectedIdUrl && ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowIdModal(false)}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-600"><IdCard className="h-5 w-5" /></div>
                  <h3 className="text-xl font-bold text-slate-900">{t.dashboard?.idDocument || "ID Document"}</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowIdModal(false)} className="rounded-xl"><X className="h-5 w-5" /></Button>
              </div>
              <div className="flex-1 overflow-auto p-8 bg-slate-50 flex items-center justify-center">
                <img src={getFullImageUrl(selectedIdUrl)} alt="ID Document" className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl border-4 border-white" />
              </div>
              <div className="p-6 border-t bg-white flex justify-end gap-3">
                <Button variant="outline" className="rounded-xl px-6" onClick={() => window.open(getFullImageUrl(selectedIdUrl), '_blank')}>{t.dashboard?.openFull || "Open Full"}</Button>
                <Button onClick={() => setShowIdModal(false)} className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700">{t.dashboard?.close || "Close"}</Button>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div >
  );
};
