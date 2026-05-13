import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  LayoutDashboard, 
  BarChart3, 
  Mail, 
  BedDouble, 
  CalendarCheck, 
  Calendar, 
  X, 
  TrashIcon, 
  Search,
  CheckCircle,
  Plus,
  IdCard,
  MoreVertical,
  Eye,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { TranslationText } from "@/components/TranslationText";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Filter, ChevronDown } from "lucide-react";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";


interface BookingSectionProps {
  bookings: any[];
  viewMode: "card" | "table";
  onToggleView: () => void;
  onUpdateStatus: (id: string | number, status: string) => void;
  onCompleteEarly: (id: string | number) => void;
  pagination?: { page: number; limit: number };
  onPageChange?: (page: number) => void;
  selectedRows?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
  totalItems?: number;
  language?: any;
}

interface WalkInForm {
  guestName: string;
  phoneNumber: string;
  packageId: string;
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
  language, 
  onViewId,
  isSelected = false,
  onToggleSelection,
  onUpdateStatus
}: { 
  booking: any; 
  onCompleteEarly: (id: string) => void; 
  language: any; 
  onViewId: (idUrl: string) => void;
  isSelected?: boolean;
  onToggleSelection?: (id: string | number) => void;
  onUpdateStatus: (id: string | number, status: string) => void;
}) => {
  // Try different possible room fields
  const roomInfo = booking.room_number || booking.room_name || booking.room_type || `Room ${booking.room_id || 'N/A'}`;
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
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{booking.user_name || <TranslationText text="Guest" language={language} />}</h3>
            {(booking.user_email || booking.user_phone || booking.phone) && (
              <p className="text-sm text-slate-600 flex items-center gap-1">
                {booking.user_email ? (
                  <>
                    <Mail className="h-3 w-3" />
                    {booking.user_email}
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {booking.user_phone || booking.phone}
                  </>
                )}
              </p>
            )}
          </div>
          <Badge className={`${
            booking.status?.toLowerCase() === 'confirmed' ? 'bg-emerald-500 shadow-emerald-500/25' :
            booking.status?.toLowerCase() === 'pending' ? 'bg-amber-500 shadow-amber-500/25' : 'bg-red-500 shadow-red-500/25'
          } text-white text-xs shadow-sm capitalize`}>
            <TranslationText text={booking.status} language={language} />
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <BedDouble className="h-4 w-4" />
            <TranslationText text="Room" language={language} />
          </span>
          <span className="font-bold text-slate-900">{roomInfo}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            <TranslationText text="Check-in" language={language} />
          </span>
          <span className="font-bold text-slate-900">{booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <TranslationText text="Check-out" language={language} />
          </span>
          <span className="font-bold text-slate-900">{booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
          <span className="text-sm font-bold text-emerald-700"><TranslationText text="Total" language={language} /></span>
          <span className="font-bold text-emerald-700 text-lg">ETB {parseFloat(booking.total_price || 0).toLocaleString()}</span>
        </div>
        <div className="pt-2 border-t border-slate-100 mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary transition-all duration-300 rounded-xl h-11"
              >
                <span className="flex items-center gap-2 font-bold">
                  <TranslationText text="Actions" language={language} />
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              {booking.id_document_url && (
                <DropdownMenuItem 
                  onClick={() => onViewId(booking.id_document_url)}
                  className="flex items-center gap-2 p-3 cursor-pointer rounded-lg focus:bg-purple-50 focus:text-purple-600 transition-colors"
                >
                  <IdCard className="h-4 w-4" />
                  <TranslationText text="View ID" language={language} />
                </DropdownMenuItem>
              )}
              
              {booking.status?.toLowerCase() === 'pending' && (
                <DropdownMenuItem 
                  onClick={() => onUpdateStatus(bookingId, 'Confirmed')}
                  className="flex items-center gap-2 p-3 cursor-pointer rounded-lg focus:bg-emerald-50 focus:text-emerald-600 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <TranslationText text="Approve" language={language} />
                </DropdownMenuItem>
              )}

              {booking.status?.toLowerCase() === 'confirmed' && (
                <DropdownMenuItem 
                  onClick={() => onCompleteEarly(bookingId)}
                  className="flex items-center gap-2 p-3 cursor-pointer rounded-lg focus:bg-blue-50 focus:text-blue-600 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <TranslationText text="Early Checkout" language={language} />
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-slate-100" />
              
              <DropdownMenuItem 
                onClick={() => onUpdateStatus(bookingId, 'cancelled')}
                className="flex items-center gap-2 p-3 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600 text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
                <TranslationText text="Cancel Booking" language={language} />
              </DropdownMenuItem>
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
  selectedRows = [],
  onToggleSelection,
  onSelectAll,
  totalItems = 0,
  language: propLanguage
}) => {
  const { language: hookLanguage } = useLanguage();
  const language = propLanguage || hookLanguage;
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInForm, setWalkInForm] = useState<WalkInForm>({
    guestName: '',
    phoneNumber: '',
    packageId: ''
  });
  const [packages, setPackages] = useState<any[]>([]);
  const [inlineMessages, setInlineMessages] = useState<InlineMessage[]>([]);
  const [inlineMessagesEnabled, setInlineMessagesEnabled] = useState(true);
  const [showEarlyCheckoutConfirm, setShowEarlyCheckoutConfirm] = useState(false);
  const [pendingEarlyCheckoutId, setPendingEarlyCheckoutId] = useState<string | number | null>(null);
  const [isProcessingEarlyCheckout, setIsProcessingEarlyCheckout] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [selectedIdUrl, setSelectedIdUrl] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'pending' | 'confirmed'>('all');

  // Filter bookings based on active filter
  const filteredBookings = bookings.filter(b => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'pending';
    return b.status?.toLowerCase() === activeFilter;
  });

  // Scroll lock when modal is open
  useEffect(() => {
    if (showEarlyCheckoutConfirm) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [showEarlyCheckoutConfirm]);

  // Message management functions
  const addMessage = (bookingId: string | number, type: 'success' | 'error' | 'processing', message: string) => {
    const newMessage: InlineMessage = {
      bookingId,
      type,
      message,
      timestamp: Date.now()
    };
    setInlineMessages(prev => [...prev.filter(msg => msg.bookingId !== bookingId), newMessage]);
    
    // Auto-remove success and error messages after 5 seconds
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        setInlineMessages(prev => prev.filter(msg => msg.timestamp !== newMessage.timestamp));
      }, 5000);
    }
  };

  const clearMessage = (bookingId: string | number) => {
    setInlineMessages(prev => prev.filter(msg => msg.bookingId !== bookingId));
  };

  // Inline Message Component
  const InlineMessageComponent: React.FC<{ bookingId: string | number }> = ({ bookingId }) => {
    const message = inlineMessages.find(msg => msg.bookingId === bookingId);
    
    if (!message) return null;

    const getMessageStyles = () => {
      switch (message.type) {
        case 'success':
          return 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100/50';
        case 'error':
          return 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-200 text-rose-800 shadow-rose-100/50';
        case 'processing':
          return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-cyan-200 text-cyan-800 shadow-cyan-100/50';
        default:
          return 'bg-gradient-to-r from-gray-50 to-slate-50 border-slate-200 text-slate-800 shadow-slate-100/50';
      }
    };

    const getMessageIcon = () => {
      switch (message.type) {
        case 'success':
          return (
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L9 7" />
            </svg>
          );
        case 'error':
          return (
            <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          );
        case 'processing':
          return (
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          );
        default:
          return null;
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

  // Load packages for walk-in booking
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const response = await fetch('http://localhost:3006/api/packages');
        const data = await response.json();
        if (data.success) {
          setPackages(data.data || []);
        }
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
      const response = await fetch('http://localhost:3006/api/walk-in-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName: walkInForm.guestName,
          phoneNumber: walkInForm.phoneNumber,
          packageId: walkInForm.packageId,
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

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-blue-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-none px-3 py-1 font-bold">
              {selectedRows.length} Selected
            </Badge>
            <p className="text-sm font-medium hidden sm:block">Perform actions on all selected bookings</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/10 font-bold"
              onClick={() => onSelectAll?.([])}
            >
              Clear Selection
            </Button>
            <Button 
              size="sm" 
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-md"
              onClick={() => {
                selectedRows.forEach(id => onUpdateStatus(id, 'Confirmed'));
                onSelectAll?.([]);
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Bulk Approve
            </Button>
          </div>
        </div>
      )}

        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">Filter by Status:</span>
              <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
                <SelectTrigger className="w-[160px] h-9 rounded-lg border-none bg-transparent focus:ring-0 focus:ring-offset-0 font-semibold text-slate-700">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  {[
                    { id: 'all', label: 'All Bookings', color: 'text-slate-600' },
                    { id: 'active', label: 'Active Bookings', color: 'text-blue-600' },
                    { id: 'pending', label: 'Pending Approval', color: 'text-amber-600' },
                    { id: 'confirmed', label: 'Confirmed Stays', color: 'text-emerald-600' },
                    { id: 'completed', label: 'Past Bookings', color: 'text-indigo-600' }
                  ].map((filter) => (
                    <SelectItem 
                      key={filter.id} 
                      value={filter.id}
                      className="rounded-lg focus:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          filter.id === 'all' ? 'bg-slate-400' :
                          filter.id === 'active' ? 'bg-blue-400' :
                          filter.id === 'pending' ? 'bg-amber-400' :
                          filter.id === 'confirmed' ? 'bg-emerald-400' :
                          'bg-indigo-400'
                        }`} />
                        <span className={`font-medium ${filter.color}`}>
                          <TranslationText text={filter.label} language={language} />
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl shadow-inner w-fit ml-auto">
        <Button
          variant={viewMode === "card" ? "default" : "ghost"}
          size="sm"
          onClick={onToggleView}
          className={`gap-2 rounded-lg transition-all duration-300 ${
            viewMode === "card" 
              ? "bg-primary text-white shadow-lg shadow-primary/25" 
              : "hover:bg-white hover:text-primary hover:shadow-md"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <TranslationText text="Cards" language={language} />
        </Button>
        <Button
          variant={viewMode === "table" ? "default" : "ghost"}
          size="sm"
          onClick={onToggleView}
          className={`gap-2 rounded-lg transition-all duration-300 ${
            viewMode === "table" 
              ? "bg-primary text-white shadow-lg shadow-primary/25" 
              : "hover:bg-white hover:text-primary hover:shadow-md"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <TranslationText text="Table" language={language} />
        </Button>
      </div>
    </div>
      
      {/* Cards View */}
      {viewMode === "card" && (
        <div className="grid gap-6 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => (
            <BookingCard 
              key={booking.id || booking.booking_id} 
              booking={booking} 
              onCompleteEarly={handleEarlyCheckoutClick}
              onViewId={handleViewId}
              language={language}
              isSelected={selectedRows.includes(booking.id || booking.booking_id)}
              onToggleSelection={onToggleSelection}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
          {filteredBookings.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-medium italic">No bookings found for this filter.</p>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
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
                          if (checked) {
                            onSelectAll?.(bookings.map(b => b.id || b.booking_id));
                          } else {
                            onSelectAll?.([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="text-slate-700 font-bold">Guest</TableHead>
                    <TableHead className="text-slate-700 font-bold">Room</TableHead>
                    <TableHead className="text-slate-700 font-bold">Check-in</TableHead>
                    <TableHead className="text-slate-700 font-bold">Check-out</TableHead>
                    <TableHead className="text-slate-700 font-bold text-right">Amount</TableHead>
                    <TableHead className="text-slate-700 font-bold">Status</TableHead>
                    <TableHead className="text-slate-700 font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const bookingId = booking.id || booking.booking_id;
                    const roomInfo = booking.room_number || booking.room_name || booking.room_type || `Room ${booking.room_id || 'N/A'}`;
                    
                    return (
                    <TableRow key={bookingId} className={`hover:bg-blue-50/50 transition-colors group ${selectedRows.includes(bookingId) ? 'bg-blue-50/30' : ''}`}>
                      <TableCell className="px-4">
                        <Checkbox 
                          checked={selectedRows.includes(bookingId)}
                          onCheckedChange={() => onToggleSelection?.(bookingId)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            {(booking.user_name || 'G').charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{booking.user_name || 'Guest'}</p>
                            {(booking.user_email || booking.user_phone || booking.phone) && (
                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                {booking.user_email ? (
                                  <>
                                    <Mail className="h-3 w-3" />
                                    {booking.user_email}
                                  </>
                                ) : (
                                  <>
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {booking.user_phone || booking.phone}
                                  </>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 font-medium border-slate-200">
                          {roomInfo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="text-right font-bold text-slate-900">
                        ETB {(booking.total_price || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${
                          booking.status?.toLowerCase() === 'confirmed' ? 'bg-emerald-500 shadow-emerald-500/25' :
                          booking.status?.toLowerCase() === 'pending' ? 'bg-amber-500 shadow-amber-500/25' :
                          booking.status?.toLowerCase() === 'completed' ? 'bg-blue-500 shadow-blue-500/25' :
                          'bg-slate-500'
                        } text-white border-none px-3 py-1 font-medium shadow-sm`}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-9 px-3 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all duration-300"
                            >
                              <span className="text-xs font-bold"><TranslationText text="Actions" language={language} /></span>
                              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                            {booking.status?.toLowerCase() === 'pending' && (
                              <DropdownMenuItem 
                                onClick={() => onUpdateStatus(bookingId, 'Confirmed')}
                                className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-emerald-50 focus:text-emerald-600 transition-colors"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <TranslationText text="Approve" language={language} />
                              </DropdownMenuItem>
                            )}
                            
                            {booking.id_document_url && (
                              <DropdownMenuItem 
                                onClick={() => handleViewId(booking.id_document_url)}
                                className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-purple-50 focus:text-purple-600 transition-colors"
                              >
                                <IdCard className="h-4 w-4" />
                                <TranslationText text="View ID" language={language} />
                              </DropdownMenuItem>
                            )}

                            {booking.status?.toLowerCase() === 'confirmed' && (
                              <DropdownMenuItem 
                                onClick={() => handleEarlyCheckoutClick(bookingId)}
                                className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-blue-50 focus:text-blue-600 transition-colors"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <TranslationText text="Complete Early" language={language} />
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-slate-100" />
                            
                            <DropdownMenuItem 
                              onClick={() => onUpdateStatus(bookingId, 'cancelled')}
                              className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600 text-red-500 transition-colors"
                            >
                              <X className="h-4 w-4" />
                              <TranslationText text="Cancel Booking" language={language} />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {filteredBookings.length === 0 && (
              <div className="py-20 text-center bg-white">
                <p className="text-slate-400 font-medium italic">No bookings found for this filter.</p>
              </div>
            )}

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-900">{bookings.length}</span> of <span className="font-semibold text-slate-900">{totalItems}</span> bookings
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="h-9 px-3 rounded-xl border-slate-200 hover:bg-white transition-all shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="flex items-center px-4 h-9 bg-white border border-slate-200 rounded-xl text-sm font-medium shadow-sm">
                  Page {pagination.page} of {Math.ceil(totalItems / pagination.limit) || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.page + 1)}
                  disabled={pagination.page >= (Math.ceil(totalItems / pagination.limit) || 1)}
                  className="h-9 px-3 rounded-xl border-slate-200 hover:bg-white transition-all shadow-sm"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inline Messages for Table View */}
      {viewMode === "table" && (
        <div className="space-y-2">
          {bookings.map((booking) => (
            <InlineMessageComponent key={`msg-${booking.id || booking.booking_id}`} bookingId={booking.id || booking.booking_id} />
          ))}
        </div>
      )}

      {/* Modals & Dialogs */}
      {showEarlyCheckoutConfirm && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={() => setShowEarlyCheckoutConfirm(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Confirm Early Checkout</h3>
            <p className="text-slate-600 text-center mb-8">Are you sure you want to complete this booking early and make the room available?</p>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setShowEarlyCheckoutConfirm(false)}>Cancel</Button>
              <Button 
                className="flex-1 rounded-xl h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                disabled={isProcessingEarlyCheckout}
                onClick={async () => {
                  if (pendingEarlyCheckoutId) {
                    setIsProcessingEarlyCheckout(true);
                    await handleEarlyCheckoutWithMessages(pendingEarlyCheckoutId);
                    setIsProcessingEarlyCheckout(false);
                    setShowEarlyCheckoutConfirm(false);
                  }
                }}
              >
                {isProcessingEarlyCheckout ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showIdModal && selectedIdUrl && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowIdModal(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                  <IdCard className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">ID Document</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowIdModal(false)} className="rounded-xl"><X className="h-5 w-5" /></Button>
            </div>
            
            <div className="flex-1 overflow-auto p-8 bg-slate-50 flex items-center justify-center">
              <img 
                src={getFullImageUrl(selectedIdUrl)} 
                alt="ID Document" 
                className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl border-4 border-white"
              />
            </div>
            
            <div className="p-6 border-t bg-white flex justify-end gap-3">
              <Button variant="outline" className="rounded-xl px-6" onClick={() => window.open(getFullImageUrl(selectedIdUrl), '_blank')}>Open Full</Button>
              <Button className="rounded-xl px-8 bg-slate-900 text-white" onClick={() => setShowIdModal(false)}>Close</Button>
            </div>
          </div>
        </div>,
        document.body
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
                {packages.map(pkg => (
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
