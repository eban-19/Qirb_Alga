import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Eye, Edit, Trash2, Plus, MoreHorizontal, Calendar, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";

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

export default function DashboardBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock booking data
  const bookings: Booking[] = [
    {
      id: "BK001",
      propertyName: "Sunshine Pension",
      guestName: "Abebe Kebede",
      guestEmail: "abebe@email.com",
      guestPhone: "+251 911 234 567",
      checkIn: "2024-03-25",
      checkOut: "2024-03-28",
      totalPrice: 10500,
      status: "confirmed",
      paymentStatus: "paid",
      ownerName: "Sunshine Hospitality",
      createdAt: "2024-03-20"
    },
    {
      id: "BK002",
      propertyName: "Abyssinia Guest House",
      guestName: "Tigist Haile",
      guestEmail: "tigist@email.com",
      guestPhone: "+251 922 345 678",
      checkIn: "2024-03-26",
      checkOut: "2024-03-30",
      totalPrice: 14000,
      status: "pending",
      paymentStatus: "pending",
      ownerName: "Abyssinia Family",
      createdAt: "2024-03-21"
    }
  ];

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-2 border-green-300">✅ Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-2 border-yellow-300">⏳ Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-2 border-red-300">❌ Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-300">🎉 Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-2 border-green-300">💰 Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-2 border-yellow-300">⏳ Pending</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800 border-2 border-gray-300">💸 Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewBooking = (bookingId: string) => {
    console.log('View booking:', bookingId);
  };

  const handleEditBooking = (bookingId: string) => {
    console.log('Edit booking:', bookingId);
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      console.log('Delete booking:', bookingId);
    }
  };

  const handleStatusChange = (booking: Booking, newStatus: string) => {
    console.log('Change status:', booking.id, 'to', newStatus);
  };

  const handleCreateBooking = () => {
    console.log('Create new booking');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bookings Management</h1>
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

      {/* Search and Filter */}
      <Card className="border-2 border-slate-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search bookings by property, guest, or email..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-2 border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-200"
              />
            </div>
            <select 
              value={filterStatus} 
              onChange={(e: any) => setFilterStatus(e.target.value)}
              className="h-12 px-4 border-2 border-slate-200 rounded-lg focus:border-green-400 focus:ring-2 focus:ring-green-200 bg-white"
            >
              <option value="all">📋 All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="cancelled">❌ Cancelled</option>
              <option value="completed">🎉 Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="border-2 border-slate-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-slate-200">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-700" />
            Bookings Directory ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-2 border-slate-200">
                  <TableHead className="font-bold text-slate-900">Property</TableHead>
                  <TableHead className="font-bold text-slate-900">Guest</TableHead>
                  <TableHead className="font-bold text-slate-900">Dates</TableHead>
                  <TableHead className="font-bold text-slate-900">Price</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="font-bold text-slate-900">Payment</TableHead>
                  <TableHead className="font-bold text-slate-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="border-2 border-slate-100 hover:border-green-300 hover:bg-green-50 transition-all duration-300">
                    <TableCell className="font-medium text-slate-900">{booking.propertyName}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{booking.guestName}</div>
                        <div className="text-sm text-slate-600">{booking.guestEmail}</div>
                        <div className="text-sm text-slate-600">{booking.guestPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">{booking.checkIn}</div>
                        <div className="text-slate-600">to {booking.checkOut}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-700">{booking.totalPrice.toLocaleString()} ETB</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-green-50">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewBooking(booking.id)} className="hover:bg-green-50">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditBooking(booking.id)} className="hover:bg-blue-50">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Booking
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(booking, 'confirmed')} className="hover:bg-green-50">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(booking, 'cancelled')} className="hover:bg-red-50">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteBooking(booking.id)} className="hover:bg-red-50 text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
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
        </CardContent>
      </Card>
    </div>
  );
}
