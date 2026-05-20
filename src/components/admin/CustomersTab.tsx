import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Mail, Phone, Calendar, X, Loader2, Info, CalendarDays, CalendarRange, Building2, CreditCard, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";
import apiService from "@/services/api";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  totalBookings: number;
  joinedAt: string;
}

interface CustomersTabProps {
  customers: Customer[];
}

export function CustomersTab({ customers = [] }: CustomersTabProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [errorBookings, setErrorBookings] = useState<string | null>(null);

  const handleViewBookings = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setBookings([]);
    setLoadingBookings(true);
    setErrorBookings(null);
    try {
      const res = await apiService.getCustomerBookingsForAdmin(customer.id);
      if (res.success && res.data) {
        setBookings(res.data);
      } else {
        setErrorBookings("Failed to load customer bookings.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorBookings(err.message || "Failed to load customer bookings.");
    } finally {
      setLoadingBookings(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    return customers.filter(c => 
      c.name?.toLowerCase().includes(search.toLowerCase()) || 
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    );
  }, [customers, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg sm:ml-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t.adminTabs?.customers?.title || "Customers Management"}</h2>
            <p className="text-slate-600">{t.adminTabs?.customers?.subtitle || "View and manage registered customers"}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-slate-700 mb-0.5">{customers.length}</div>
            <div className="text-xs text-slate-500 font-medium">{t.adminTabs?.common?.totalResults || "Total Customers"}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-blue-700 mb-0.5">
              {customers.filter(c => c.totalBookings > 0).length}
            </div>
            <div className="text-xs text-slate-500 font-medium">{t.adminTabs?.common?.customer || "Active Bookers"}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-emerald-700 mb-0.5">
              {customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0)}
            </div>
            <div className="text-xs text-slate-500 font-medium">{t.adminTabs?.common?.amount || "Total Bookings Made"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder={t.adminTabs?.customers?.searchPlaceholder || "Search by name, email or phone..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-3xl opacity-50"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-2xl p-6 sm:p-8">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-slate-200">
                    <TableHead className="font-bold text-slate-900 py-4 px-6">{t.adminTabs?.common?.customer || "Customer"}</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6">{t.adminTabs?.common?.contact || "Contact"}</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6 text-center">{t.adminTabs?.bookings?.title || "Total Bookings"}</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6 text-center">{t.adminTabs?.common?.status || "Status"}</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6 text-center">{t.adminTabs?.common?.date || "Joined"}</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6 text-right">{t.adminTabs?.common?.actions || "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <div className="text-slate-500 text-lg font-medium">{t.adminTabs?.common?.noResultsFound || "No customers found"}</div>
                        <div className="text-slate-400 text-sm mt-1">{t.adminTabs?.common?.adjustSearch || "Try adjusting your search filters."}</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-slate-50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                              {customer.name?.substring(0, 2).toUpperCase() || 'CU'}
                            </div>
                            <span className="font-semibold text-slate-900">{customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold">
                            {customer.totalBookings}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Badge className={`${
                            customer.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-100'
                          }`}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center text-sm text-slate-500">
                          <div className="flex items-center justify-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(customer.joinedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewBookings(customer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors border border-blue-100 shadow-sm"
                          >
                            <CalendarRange className="w-3.5 h-3.5" />
                            View Bookings
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <CustomerBookingsModal
          customer={selectedCustomer}
          bookings={bookings}
          loading={loadingBookings}
          error={errorBookings}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

interface CustomerBookingsModalProps {
  customer: Customer;
  bookings: any[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export function CustomerBookingsModal({
  customer,
  bookings,
  loading,
  error,
  onClose
}: CustomerBookingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg text-white">
                {customer.name?.substring(0, 2).toUpperCase() || 'CU'}
              </div>
              <div>
                <h3 className="text-xl font-bold">{customer.name}</h3>
                <div className="text-blue-100 text-xs flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                  <span>{customer.email}</span>
                  {customer.phone && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-blue-300 hidden sm:inline"></span>
                      <span>{customer.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-500 font-medium text-sm">Loading bookings list...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-slate-700 font-semibold">{error}</p>
              <p className="text-slate-500 text-sm mt-1">Please try again later or contact support.</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarRange className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">No booking history</p>
              <p className="text-slate-400 text-sm mt-1">This customer hasn't made any bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-500 mb-2">
                Booking History ({bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'})
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((booking) => {
                  const checkInDate = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A';
                  const checkOutDate = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A';
                  const isWalkIn = booking.isWalkIn || booking.bookingSource === 'Walk_In';
                  
                  return (
                    <div 
                      key={booking.id} 
                      className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-200 hover:shadow-md transition-all p-5 flex flex-col md:flex-row gap-5"
                    >
                      {/* Property & Room Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pension</span>
                            <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                              {booking.propertyName}
                            </h4>
                          </div>
                          
                          {/* Booking Status Badge */}
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            booking.status === 'Confirmed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : booking.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : booking.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {booking.status}
                          </span>
                        </div>

                        {/* Room & Passcode details */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl text-xs">
                          <div>
                            <span className="text-slate-400 font-medium block">Room Number</span>
                            <span className="text-slate-700 font-bold">{booking.roomNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Passcode</span>
                            <span className="text-slate-700 font-mono font-bold tracking-wider">{booking.passCode || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Room Availability Status details */}
                        {booking.roomStatus && (
                          <div className="bg-blue-50/40 border border-blue-100/50 p-3 rounded-xl text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Room Current Status</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                booking.roomStatus.currentStatus === 'Available'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : booking.roomStatus.currentStatus === 'Occupied'
                                  ? 'bg-amber-100 text-amber-800'
                                  : booking.roomStatus.currentStatus === 'Maintenance'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}>
                                {booking.roomStatus.currentStatus || 'Available'}
                              </span>
                            </div>
                            {booking.roomStatus.lastChangedBy ? (
                              <div className="pt-1.5 border-t border-blue-100/30 flex flex-col gap-0.5 text-slate-500 text-[10px]">
                                <div>
                                  Status updated by: <strong className="text-slate-700">{booking.roomStatus.lastChangedBy}</strong>
                                </div>
                                {booking.roomStatus.lastChangedAt && (
                                  <div>
                                    Updated at: <strong className="text-slate-700">{new Date(booking.roomStatus.lastChangedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="pt-1.5 border-t border-blue-100/30 text-slate-400 text-[10px] italic">
                                Status remains at its default state.
                              </div>
                            )}
                          </div>
                        )}

                        {/* Stay Dates */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                            <span>Check-in: <strong className="text-slate-800">{checkInDate}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Check-out: <strong className="text-slate-800">{checkOutDate}</strong></span>
                          </div>
                        </div>

                        {/* Booking source and date */}
                        <div className="flex items-center gap-4 text-[11px] text-slate-400">
                          <span>Source: <strong className="text-slate-600">{isWalkIn ? 'Walk-in' : 'App'}</strong></span>
                          <span>Booked on: <strong className="text-slate-600">{new Date(booking.createdAt).toLocaleDateString()}</strong></span>
                        </div>

                        {/* Notes */}
                        {booking.notes && (
                          <div className="text-xs bg-slate-50/60 p-2.5 rounded-lg border border-dashed border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Notes / Special Requests</span>
                            <p className="text-slate-600 italic">"{booking.notes}"</p>
                          </div>
                        )}
                      </div>

                      {/* Payment & Price Summary */}
                      <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Price</span>
                            <span className="text-lg font-black text-slate-900">
                              {Number(booking.totalPrice || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">ETB</span>
                            </span>
                          </div>

                          {/* Payment status and reference */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Payment Details</span>
                            {booking.payment ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className={`text-xs font-bold ${
                                    booking.payment.status === 'PAID'
                                      ? 'text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded'
                                      : booking.payment.status === 'FAILED'
                                      ? 'text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded'
                                      : 'text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded'
                                  }`}>
                                    {booking.payment.status}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 break-all bg-slate-50 p-1.5 rounded font-mono">
                                  Ref: {booking.payment.reference}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No payment record found</span>
                            )}
                          </div>
                        </div>

                        {/* Owner / Support details */}
                        <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                          <span className="font-bold text-slate-700 block mb-0.5">Owner Contact:</span>
                          <span className="block truncate">{booking.ownerName}</span>
                          <span className="block text-slate-400 truncate">{booking.ownerEmail}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 flex justify-end border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
