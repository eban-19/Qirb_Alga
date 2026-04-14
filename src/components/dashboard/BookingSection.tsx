import React, { useState, useEffect } from 'react';
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

const BookingCard = ({ booking, onCompleteEarly }: { booking: any; onCompleteEarly: (id: string) => void }) => {
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
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{booking.user_name || 'Guest'}</h3>
            <p className="text-sm text-slate-600 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {booking.user_email}
            </p>
          </div>
          <Badge className={`${
            booking.status?.toLowerCase() === 'confirmed' ? 'bg-emerald-500 shadow-emerald-500/25' :
            booking.status?.toLowerCase() === 'pending' ? 'bg-amber-500 shadow-amber-500/25' : 'bg-red-500 shadow-red-500/25'
          } text-white text-xs shadow-sm capitalize`}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <BedDouble className="h-4 w-4" />
            Room
          </span>
          <span className="font-bold text-slate-900">{roomInfo}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Check-in
          </span>
          <span className="font-bold text-slate-900">{new Date(booking.check_in_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Check-out
          </span>
          <span className="font-bold text-slate-900">{new Date(booking.check_out_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
          <span className="text-sm font-bold text-emerald-700">Total</span>
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
              <CheckCircle className="h-4 w-4 mr-1.5" /> Early Checkout
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
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInForm, setWalkInForm] = useState<WalkInForm>({
    guestName: '',
    phoneNumber: '',
    packageId: ''
  });
  const [packages, setPackages] = useState<any[]>([]);

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
          Cards
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
          Table
        </Button>
      </div>

      
      {/* Cards View */}
      {viewMode === "card" && (
        <div className="grid gap-6 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden bg-white hover:scale-[1.02] relative">
              <CardHeader className="relative pb-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{booking.user_name || 'Guest'}</h3>
                      {booking.booking_source === 'Walk-In' && (
                        <Badge className="bg-blue-600 text-white text-xs shadow-sm">
                          Walk-In
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {booking.user_email}
                    </p>
                  </div>
                  <Badge className={`${
                    booking.status?.toLowerCase() === 'confirmed' ? 'bg-emerald-500 shadow-emerald-500/25' :
                    booking.status?.toLowerCase() === 'pending' ? 'bg-amber-500 shadow-amber-500/25' : 'bg-red-500 shadow-red-500/25'
                  } text-white text-xs shadow-sm capitalize`}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <BedDouble className="h-4 w-4" />
                    Room
                  </span>
                  <span className="font-bold text-slate-900">{booking.room_number || booking.room_name || booking.room_type || `Room ${booking.room_id || 'N/A'}`}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4" />
                    Check-in
                  </span>
                  <span className="font-bold text-slate-900">{new Date(booking.check_in_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Check-out
                  </span>
                  <span className="font-bold text-slate-900">{new Date(booking.check_out_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
                  <span className="text-sm font-bold text-emerald-700">Total</span>
                  <span className="font-bold text-emerald-700 text-lg">ETB {parseFloat(booking.total_price).toLocaleString()}</span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100 mt-2">
                  {(() => {
                    const status = booking.status?.toLowerCase();
                    const showButton = status === 'confirmed' && status !== 'completed';
                    console.log(`TABLE BOOKING ${booking.id || booking.booking_id} STATUS: ${status}, SHOW BUTTON: ${showButton}`);
                    return showButton;
                  })() && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onCompleteEarly(booking.id || booking.booking_id)} 
                      className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all"
                    >
                      <CheckCircle className="h-4 w-4 mr-1.5" /> Early Checkout
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
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
                               onClick={() => onCompleteEarly(booking.id || booking.booking_id)} 
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
