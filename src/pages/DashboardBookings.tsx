import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Eye, Edit, Trash2, Plus, MoreHorizontal, Calendar, DollarSign, CheckCircle, Clock, XCircle, ArrowLeft, ArrowRight, User, MapPin, CreditCard, Home } from "lucide-react";
import { useDashboardBookings } from "@/hooks/useDashboardBookings";

export default function DashboardBookings() {
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    showBookingModal,
    setShowBookingModal,
    currentStep,
    bookingData,
    filteredBookings,
    handleViewBooking,
    handleEditBooking,
    handleDeleteBooking,
    handleStatusChange,
    handleCreateBooking,
    handleNextStep,
    handlePrevStep,
    handleBookingSubmit,
    updateBookingData,
    isStepValid
  } = useDashboardBookings();

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

      {/* Multi-Step Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Create New Booking
            </DialogTitle>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-green-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Guest Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Guest Name *</label>
                    <Input
                      value={bookingData.guestName}
                      onChange={(e) => updateBookingData('guestName', e.target.value)}
                      placeholder="Enter guest name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                    <Input
                      type="email"
                      value={bookingData.guestEmail}
                      onChange={(e) => updateBookingData('guestEmail', e.target.value)}
                      placeholder="guest@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                    <Input
                      value={bookingData.guestPhone}
                      onChange={(e) => updateBookingData('guestPhone', e.target.value)}
                      placeholder="+251 9XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <Input
                      value={bookingData.guestAddress}
                      onChange={(e) => updateBookingData('guestAddress', e.target.value)}
                      placeholder="Guest address (optional)"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Property & Dates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Property *</label>
                    <select
                      value={bookingData.propertyName}
                      onChange={(e) => updateBookingData('propertyName', e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Property</option>
                      <option value="Sunshine Pension">Sunshine Pension</option>
                      <option value="Abyssinia Guest House">Abyssinia Guest House</option>
                      <option value="Lalibela Lodge">Lalibela Lodge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label>
                    <select
                      value={bookingData.roomType}
                      onChange={(e) => updateBookingData('roomType', e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Room Type</option>
                      <option value="Single">Single Room</option>
                      <option value="Double">Double Room</option>
                      <option value="Suite">Suite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Check-in Date *</label>
                    <Input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => updateBookingData('checkIn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Check-out Date *</label>
                    <Input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => updateBookingData('checkOut', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Payment & Additional Info</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Price (ETB) *</label>
                    <Input
                      type="number"
                      value={bookingData.totalPrice}
                      onChange={(e) => updateBookingData('totalPrice', parseInt(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method *</label>
                    <select
                      value={bookingData.paymentMethod}
                      onChange={(e) => updateBookingData('paymentMethod', e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Payment">Mobile Payment</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Special Requests</label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => updateBookingData('specialRequests', e.target.value)}
                      placeholder="Any special requests or notes..."
                      className="w-full h-20 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Booking Summary</h3>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-slate-600">Guest Name:</span>
                      <p className="font-medium">{bookingData.guestName || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Email:</span>
                      <p className="font-medium">{bookingData.guestEmail || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Phone:</span>
                      <p className="font-medium">{bookingData.guestPhone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Property:</span>
                      <p className="font-medium">{bookingData.propertyName || 'Not selected'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Room Type:</span>
                      <p className="font-medium">{bookingData.roomType || 'Not selected'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Dates:</span>
                      <p className="font-medium">
                        {bookingData.checkIn && bookingData.checkOut 
                          ? `${bookingData.checkIn} to ${bookingData.checkOut}`
                          : 'Not selected'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Total Price:</span>
                      <p className="font-medium text-green-600">
                        {bookingData.totalPrice ? `${bookingData.totalPrice} ETB` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Payment Method:</span>
                      <p className="font-medium">{bookingData.paymentMethod || 'Not selected'}</p>
                    </div>
                  </div>
                  {bookingData.specialRequests && (
                    <div>
                      <span className="text-sm text-slate-600">Special Requests:</span>
                      <p className="font-medium">{bookingData.specialRequests}</p>
                    </div>
                  )}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    <strong>Please review all information before submitting the booking.</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < 4 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={!isStepValid()}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleBookingSubmit}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  disabled={!isStepValid()}
                >
                  <CheckCircle className="h-4 w-4" />
                  Create Booking
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
