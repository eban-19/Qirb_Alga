import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, BedDouble, CalendarCheck, DollarSign } from "lucide-react";

interface StatsCardsProps {
  staffCount: number;
  availableRooms: number;
  activeBookings: number;
  totalRevenue: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  staffCount, 
  availableRooms, 
  activeBookings, 
  totalRevenue 
}) => {
  return (
    <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Staff */}
      <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 ease-out bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Staff</p>
              </div>
              <p className="text-3xl font-bold text-blue-800 group-hover:text-blue-900 transition-colors">{staffCount}</p>
              <div className="flex items-center gap-2 mt-2 p-2 bg-green-100/50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-bold text-green-700">+2 from last month</span>
              </div>
            </div>
            <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-blue-500/25">
              <Users className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rooms */}
      <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 ease-out bg-gradient-to-br from-emerald-50 via-emerald-100 to-green-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Available Rooms</p>
              </div>
              <p className="text-3xl font-bold text-emerald-800 group-hover:text-emerald-900 transition-colors">
                {availableRooms}
              </p>
              <div className="flex items-center gap-2 mt-2 p-2 bg-green-100/50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-bold text-green-700">+5 from yesterday</span>
              </div>
            </div>
            <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:shadow-emerald-500/25">
              <BedDouble className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Bookings */}
      <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 ease-out bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Active Bookings</p>
              </div>
              <p className="text-3xl font-bold text-purple-800 group-hover:text-purple-900 transition-colors">{activeBookings}</p>
              <div className="flex items-center gap-2 mt-2 p-2 bg-red-100/50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-red-600" />
                <span className="text-xs font-bold text-red-700">-1 from yesterday</span>
              </div>
            </div>
            <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-purple-500/25">
              <CalendarCheck className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 ease-out bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Total Revenue</p>
              </div>
              <p className="text-3xl font-bold text-amber-800 group-hover:text-amber-900 transition-colors">ETB {totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-2 p-2 bg-green-100/50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-bold text-green-700">+12% from last month</span>
              </div>
            </div>
            <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg group-hover:shadow-amber-500/25">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
