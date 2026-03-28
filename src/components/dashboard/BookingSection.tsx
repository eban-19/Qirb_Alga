import React from 'react';
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
  CheckCircle
} from "lucide-react";

interface BookingSectionProps {
  bookings: any[];
  viewMode: 'card' | 'table';
  onToggleView: () => void;
  onUpdateStatus: (id: string | number, status: string) => void;
  onCompleteEarly: (id: string | number) => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  bookings,
  viewMode,
  onToggleView,
  onUpdateStatus,
  onCompleteEarly
}) => {
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
                  <span className="font-bold text-slate-900">{booking.room_name || 'N/A'}</span>
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
                  {booking.status?.toLowerCase() === 'confirmed' && (
                    <Button size="sm" variant="outline" onClick={() => onCompleteEarly(booking.id || booking.booking_id)} className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all">
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
                  {bookings.map((booking) => (
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
                          <span className="font-medium">{booking.room_name || 'N/A'}</span>
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
                           {booking.status?.toLowerCase() === 'confirmed' && (
                             <Button variant="outline" size="sm" onClick={() => onCompleteEarly(booking.id || booking.booking_id)} title="Complete Early" className="hover:bg-blue-50 hover:border-blue-300 border-blue-200 text-blue-600 transition-all duration-300 px-2">
                               <CheckCircle className="h-4 w-4" />
                             </Button>
                           )}
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
