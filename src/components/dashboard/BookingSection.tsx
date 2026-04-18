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
  Plus
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { TranslationText } from "@/components/TranslationText";

interface BookingSectionProps {
  bookings: any[];
  viewMode: 'card' | 'table';
  onToggleView: () => void;
  onUpdateStatus: (id: string | number, status: string) => void;
  onCompleteEarly: (id: string | number) => void;
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

const BookingCard = ({ booking, onCompleteEarly, language }: { booking: any; onCompleteEarly: (id: string) => void; language: any }) => {
  // Debug: Log booking data to see available fields
  console.log('🔍 Owner Dashboard Booking data:', booking);
  console.log('🔍 Room fields available:', {
    room_number: booking.room_number,
    room_id: booking.room_id,
    room_type: booking.room_type,
    room_name: booking.room_name
  });
  
  // Try different possible room fields
  const roomInfo = booking.room_number || booking.room_name || booking.room_type || `Room ${booking.room_id || 'N/A'}`;
  
  console.log('🔍 Final roomInfo:', roomInfo);
  
  return (
    <Card key={booking.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden bg-white hover:scale-[1.02] relative">
      <CardHeader className="relative pb-0">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{booking.user_name || <TranslationText text="Guest" language={language} />}</h3>
            <p className="text-sm text-slate-600 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {booking.user_email}
            </p>
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
          <span className="font-bold text-slate-900">{new Date(booking.check_in_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <TranslationText text="Check-out" language={language} />
          </span>
          <span className="font-bold text-slate-900">{new Date(booking.check_out_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
          <span className="text-sm font-bold text-emerald-700"><TranslationText text="Total" language={language} /></span>
          <span className="font-bold text-emerald-700 text-lg">ETB {parseFloat(booking.total_price).toLocaleString()}</span>
        </div>
        <div className="flex gap-2 pt-2 border-t border-slate-100 mt-2">
          {(() => {
            const status = booking.status?.toLowerCase();
            const showButton = status === 'confirmed' && status !== 'completed';
            console.log(`BOOKING ${booking.id || booking.booking_id} STATUS: ${status}, SHOW BUTTON: ${showButton}`);
            return showButton;
          })() && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onCompleteEarly(booking.id || booking.booking_id)} 
              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              <CheckCircle className="h-4 w-4 mr-1.5" /> <TranslationText text="Early Checkout" language={language} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const BookingSection: React.FC<BookingSectionProps> = ({
  bookings,
  viewMode,
  onToggleView,
  onUpdateStatus,
  onCompleteEarly
}) => {
  const { language } = useLanguage();
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L6 11l-4 4m0 6l4-4m0 6" />
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
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin">
              <div className="h-2 w-2 border-2 border-cyan-600 border-t-transparent rounded-full mt-1"></div>
            </div>
          );
        default:
          return (
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1 4h-1v4M8 12h8v8H8" />
            </svg>
          );
      }
    };

    return (
      <div className={`mt-3 p-4 rounded-xl border ${getMessageStyles()} flex items-start gap-3 animate-in fade-in-0 slide-in-from-top-2 duration-500 shadow-lg transform transition-all duration-300 hover:scale-[1.02]`}>
        {/* Icon with subtle animation */}
        <div className="flex items-start gap-3 flex-1">
          <div className={`flex-shrink-0 mt-0.5 transition-transform duration-300 ${message.type === 'success' ? 'animate-bounce' : message.type === 'error' ? 'animate-pulse' : ''}`}>
            {getMessageIcon()}
          </div>
          
          {/* Content with better typography */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`text-sm font-bold tracking-wide ${message.type === 'success' ? 'text-emerald-700' : message.type === 'error' ? 'text-rose-700' : message.type === 'processing' ? 'text-cyan-700' : 'text-slate-700'}`}>
                {message.type === 'success' && '✓'}
                {message.type === 'error' && '⚠'}
                {message.type === 'processing' && '⟳'}
              </div>
              <div className={`text-sm font-semibold ${message.type === 'success' ? 'text-emerald-800' : message.type === 'error' ? 'text-rose-800' : message.type === 'processing' ? 'text-cyan-800' : 'text-slate-800'}`}>
                {message.type === 'success' && 'Success'}
                {message.type === 'error' && 'Error'}
                {message.type === 'processing' && 'Processing'}
              </div>
            </div>
            
            {/* Message description with better spacing */}
            <div className={`text-sm leading-relaxed ${message.type === 'success' ? 'text-emerald-600' : message.type === 'error' ? 'text-rose-600' : message.type === 'processing' ? 'text-cyan-600' : 'text-slate-600'}`}>
              {message.message}
            </div>
          </div>
        </div>
        
        {/* Enhanced dismiss button with hover effects */}
        {message.type !== 'processing' && (
          <button
            onClick={() => clearMessage(bookingId)}
            className="ml-auto flex-shrink-0 p-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 hover:shadow-md border border-current/20 hover:border-current/30 text-current/70 hover:text-current/90 group"
            title={`Dismiss ${message.type} message`}
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="ml-2 text-xs font-medium">ESC</span>
          </button>
        )}
      </div>
    );
  };

  // Load packages for walk-in booking
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/packages');
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
      const response = await fetch('http://localhost:3005/api/walk-in-bookings', {
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
        setWalkInForm({ guestName: '', phoneNumber: '', packageId: '' });
        alert('Walk-in booking created successfully!');
        // You might want to refresh bookings list here
      } else {
        alert('Failed to create booking: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating walk-in booking:', error);
      alert('Failed to create booking');
    }
  };

  // Wrapper function for early checkout with message handling
  const handleEarlyCheckoutWithMessages = async (bookingId: string | number) => {
    // Only show messages if enabled
    if (!inlineMessagesEnabled) {
      await onCompleteEarly(bookingId);
      return;
    }

    try {
      // Show processing message
      addMessage(bookingId, 'processing', 'Processing early checkout...');
      
      // Call the original early checkout handler
      await onCompleteEarly(bookingId);
      
      // Show success message
      addMessage(bookingId, 'success', 'Booking completed early. Room is now available.');
      
    } catch (error: any) {
      console.error('Early checkout error:', error);
      
      // Show appropriate error message
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

  // Early Checkout Confirmation Dialog Component
  const EarlyCheckoutConfirmDialog = () => {
    if (!showEarlyCheckoutConfirm) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowEarlyCheckoutConfirm(false);
        setPendingEarlyCheckoutId(null);
        setIsProcessingEarlyCheckout(false);
      }
    };

    return ReactDOM.createPortal(
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v-6h6a3 3 0 0 6 12v6a3 3 0 0 6 12z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900"><TranslationText text="Confirm Early Checkout" language={language} /></h3>
              <p className="text-sm text-slate-600 mt-2">
                <TranslationText text="Are you sure you want to complete this booking early and make the room available?" language={language} />
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowEarlyCheckoutConfirm(false);
                setPendingEarlyCheckoutId(null);
                setIsProcessingEarlyCheckout(false);
              }}
              disabled={isProcessingEarlyCheckout}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (pendingEarlyCheckoutId) {
                  setIsProcessingEarlyCheckout(true);
                  await handleEarlyCheckoutWithMessages(pendingEarlyCheckoutId);
                }
                setShowEarlyCheckoutConfirm(false);
                setPendingEarlyCheckoutId(null);
                setIsProcessingEarlyCheckout(false);
              }}
              disabled={isProcessingEarlyCheckout}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessingEarlyCheckout ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // Handler to show confirmation dialog
  const handleEarlyCheckoutClick = (bookingId: string | number) => {
    setPendingEarlyCheckoutId(bookingId);
    setShowEarlyCheckoutConfirm(true);
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl shadow-inner w-fit">
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
      
      {/* Cards View */}
      {viewMode === "card" && (
        <div className="grid gap-6 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              onCompleteEarly={handleEarlyCheckoutClick}
              language={language}
            />
          ))}
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
                  {bookings.map((booking) => {
                    // Debug: Log booking data to see available fields
                    console.log('🔍 Table booking data:', booking);
                    
                    // Try different possible room fields
                    const roomInfo = booking.room_number || booking.room_name || booking.room_type || `Room ${booking.room_id || 'N/A'}`;
                    
                    return (
                    <TableRow key={booking.id} className="hover:bg-blue-50/50 transition-colors group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            {(booking.user_name || 'G').charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{booking.user_name || 'Guest'}</p>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {booking.user_email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                          <BedDouble className="h-4 w-4 text-slate-600" />
                          <span className="font-medium">{roomInfo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                          <CalendarCheck className="h-4 w-4 text-slate-600" />
                          {new Date(booking.check_in_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                          <Calendar className="h-4 w-4 text-slate-600" />
                          {new Date(booking.check_out_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 inline-block">
                          <p className="font-bold text-emerald-700">ETB {parseFloat(booking.total_price).toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${
                          booking.status?.toLowerCase() === 'confirmed' ? 'bg-emerald-500' :
                          booking.status?.toLowerCase() === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                        } text-white text-xs capitalize shadow-sm`}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <Button variant="outline" size="sm" onClick={() => onUpdateStatus(booking.id || booking.booking_id, 'cancelled')} title="Cancel Booking" className="hover:bg-red-50 hover:border-red-300 border-red-200 text-red-600 transition-all duration-300 px-2">
                             <X className="h-4 w-4" />
                           </Button>
                           {(() => {
                             const status = booking.status?.toLowerCase();
                             const showButton = status === 'confirmed' && status !== 'completed';
                             console.log(`HEADER BOOKING ${booking.id || booking.booking_id} STATUS: ${status}, SHOW BUTTON: ${showButton}`);
                             return showButton;
                           })() && (
                             <Button 
                               variant="outline" 
                               size="sm" 
                               onClick={() => handleEarlyCheckoutClick(booking.id || booking.booking_id)} 
                               title="Complete Early" 
                               className="hover:bg-blue-50 hover:border-blue-300 border-blue-200 text-blue-600 transition-all duration-300 px-2"
                             >
                               <CheckCircle className="h-4 w-4" />
                             </Button>
                           )}
                         </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inline Messages for Table View */}
      {viewMode === "table" && (
        <div className="space-y-2">
          {bookings.map((booking) => (
            <InlineMessageComponent key={`msg-${booking.id}`} bookingId={booking.id || booking.booking_id} />
          ))}
        </div>
      )}

      {/* Early Checkout Confirmation Dialog */}
      <EarlyCheckoutConfirmDialog />

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
