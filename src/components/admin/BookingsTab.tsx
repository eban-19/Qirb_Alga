import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Edit, Trash2, Plus, Calendar, DollarSign, Users, CheckCircle } from "lucide-react";
import { BookingForm } from "./BookingForm";

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

interface BookingsTabProps {
  bookings: Booking[];
  properties: string[];
  onBookingAction: (action: string, bookingId: string, booking?: Booking) => void;
}

export function BookingsTab({ bookings, properties, onBookingAction }: BookingsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();

  // Safe handling with fallbacks
  const safeBookings = bookings || [];
  const safeProperties = properties || [];

  // Filter bookings based on search and status
  const filteredBookings = safeBookings.filter(booking => {
    const matchesSearch = (booking.propertyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.guestName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.guestEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics with safe handling
  const totalRevenue = safeBookings.reduce((sum, b) => sum + (b?.totalPrice || 0), 0);
  const pendingBookings = safeBookings.filter(b => b?.status === 'pending').length;
  const confirmedBookings = safeBookings.filter(b => b?.status === 'confirmed').length;
  const completedBookings = safeBookings.filter(b => b?.status === 'completed').length;

  const handleCreateBooking = () => {
    setSelectedBooking(undefined);
    setShowForm(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowForm(true);
  };

  const handleSaveBooking = (booking: Booking) => {
    if (booking.id) {
      onBookingAction("update", booking.id, booking);
    } else {
      onBookingAction("create", "", booking);
    }
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      onBookingAction("delete", bookingId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with prominent CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Bookings Management</h2>
            <p className="text-slate-600">Manage guest bookings and reservations</p>
          </div>
        </div>
        
        <Button 
          onClick={handleCreateBooking}
          size="lg"
          className="
            relative
            overflow-hidden
            bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 
            hover:from-green-700 hover:via-green-800 hover:to-emerald-800 
            text-white 
            font-bold 
            px-8 
            py-4 
            text-lg
            shadow-xl 
            hover:shadow-2xl 
            transform 
            hover:scale-105 
            transition-all 
            duration-300
            border-2 
            border-green-800
            rounded-xl
            before:absolute
            before:inset-0
            before:bg-gradient-to-r
            before:from-white/20
            before:to-transparent
            before:opacity-0
            hover:before:opacity-100
            before:transition-opacity
            before:duration-300
            active:scale-95
            group
          "
        >
          <span className="relative z-10 flex items-center gap-3">
            <Plus className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" />
            <span>Add New Booking</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{safeBookings.length}</div>
            <div className="text-sm text-green-700">Total Bookings</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <Search className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-900">{pendingBookings}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{confirmedBookings}</div>
            <div className="text-sm text-blue-700">Confirmed</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">{totalRevenue.toLocaleString()} ETB</div>
            <div className="text-sm text-purple-700">Total Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-2 border-slate-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search bookings by property, guest, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-2 border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-200"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-64 h-12 text-base border-2 border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📋 All Status</SelectItem>
                <SelectItem value="pending">⏳ Pending</SelectItem>
                <SelectItem value="confirmed">✅ Confirmed</SelectItem>
                <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                <SelectItem value="completed">🎉 Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card className="border-2 border-slate-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-slate-200">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-700" />
            Bookings Directory ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="border-2 border-slate-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-bold text-lg text-slate-900">{booking.propertyName || 'Unknown Property'}</h3>
                        <Badge className={
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800 border-2 border-red-300' :
                          'bg-blue-100 text-blue-800 border-2 border-blue-300'
                        }>
                          {booking.status || 'Unknown'}
                        </Badge>
                        <Badge variant="outline" className="border-2 border-slate-300">
                          {booking.paymentStatus || 'Unknown'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Guest</p>
                          <p className="text-slate-900">{booking.guestName || 'N/A'}</p>
                          <p className="text-sm text-slate-600">{booking.guestEmail || 'N/A'}</p>
                          <p className="text-sm text-slate-600">{booking.guestPhone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Booking Details</p>
                          <p className="text-slate-900">Check-in: {booking.checkIn || 'N/A'}</p>
                          <p className="text-slate-900">Check-out: {booking.checkOut || 'N/A'}</p>
                          <p className="font-bold text-green-700">
                            {(booking.totalPrice || 0).toLocaleString()} ETB
                          </p>
                        </div>
                      </div>
                      
                      {booking.specialRequests && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-slate-700">Special Requests</p>
                          <p className="text-sm text-slate-600 italic">{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => console.log('View booking:', booking.id)} className="hover:bg-green-50 hover:border-green-300">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditBooking(booking)} className="hover:bg-blue-50 hover:border-blue-300">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteBooking(booking.id)} className="hover:bg-red-50 hover:border-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No bookings found</h3>
                <p className="text-slate-500 mb-4">Try adjusting your search or filter criteria</p>
                <Button onClick={handleCreateBooking} variant="outline" className="hover:bg-green-50 hover:border-green-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Booking
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking Form Modal */}
      <BookingForm
        booking={selectedBooking}
        properties={safeProperties}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveBooking}
      />
    </div>
  );
}
