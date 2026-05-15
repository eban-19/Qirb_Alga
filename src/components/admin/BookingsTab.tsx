import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, DollarSign, Users, CheckCircle, Mail, Phone } from "lucide-react";

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
  const [filterProperty, setFilterProperty] = useState("all");

  // Safe handling with fallbacks
  const safeBookings = bookings || [];
  const safeProperties = properties || [];

  // Filter bookings based on search, status, and property
  const filteredBookings = safeBookings.filter(booking => {
    const matchesSearch = (booking.propertyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.guestName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.guestEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    const matchesProperty = filterProperty === "all" || booking.propertyName === filterProperty;
    return matchesSearch && matchesStatus && matchesProperty;
  });

  // Statistics
  const totalBookings = safeBookings.length;
  const pendingBookings = safeBookings.filter(b => b?.status === 'pending').length;
  const confirmedBookings = safeBookings.filter(b => b?.status === 'confirmed').length;
  const completedBookings = safeBookings.filter(b => b?.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header with prominent CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-lg sm:ml-4">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900">Bookings Management</h2>
            <p className="text-slate-600">Manage guest bookings and reservations</p>
          </div>
        </div>
        
              </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mx-4 sm:mx-6 md:mx-8">
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
            <div className="text-2xl font-bold text-purple-900">0 ETB</div>
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
            <Select value={filterProperty} onValueChange={setFilterProperty}>
              <SelectTrigger className="w-full lg:w-64 h-12 text-base border-2 border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-200">
                <SelectValue placeholder="Filter by property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🏢 All Properties</SelectItem>
                {safeProperties.map((property) => {
                  const propertyName = typeof property === 'string' ? property : (property.name || String(property));
                  const propertyKey = typeof property === 'string' ? property : (property.id || property.name || String(property));
                  return (
                    <SelectItem key={propertyKey} value={propertyName}>
                      {propertyName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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
            Bookings Directory 
            {filterProperty !== "all" && (
              <span className="text-sm font-normal text-green-600">
                - {filterProperty}
              </span>
            )}
            {filterStatus !== "all" && (
              <span className="text-sm font-normal text-green-600">
                - {filterStatus}
              </span>
            )}
            <span className="ml-auto text-sm font-normal text-green-700">
              ({filteredBookings.length} bookings)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{booking.guestName}</h3>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'success' as any : 
                          booking.status === 'cancelled' ? 'destructive' : 
                          booking.status === 'completed' ? 'secondary' : 'outline'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {booking.guestEmail}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {booking.guestPhone}</span>
                        <span className="flex items-center gap-1 font-semibold text-blue-600">🏢 {booking.propertyName}</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-400 flex items-center gap-4">
                        <span>Check-in: <b>{new Date(booking.checkIn).toLocaleDateString()}</b></span>
                        <span>Check-out: <b>{new Date(booking.checkOut).toLocaleDateString()}</b></span>
                        <span className="text-slate-900 font-bold ml-auto">{booking.totalPrice} ETB</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                      {booking.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => onBookingAction('confirm', booking.id)}
                          className="bg-green-600 hover:bg-green-700 text-white h-9 rounded-lg px-4"
                        >
                          Confirm
                        </Button>
                      )}
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onBookingAction('cancel', booking.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 h-9 rounded-lg px-4"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => onBookingAction('delete', booking.id)}
                        className="text-slate-400 hover:text-red-600 h-9 rounded-lg"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredBookings.length === 0 && (
              <div className="mt-6">
                <p className="text-slate-500 mb-4">No bookings found for the current criteria</p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
