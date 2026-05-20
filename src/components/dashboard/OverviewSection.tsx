import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Users, 
  Bed, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Plus,
  MapPin,
  LayoutDashboard
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface OverviewSectionProps {
  stats: {
    staffCount: number;
    availableRooms: number;
    activeBookings: number;
    totalRevenue: number;
  };
  propertySettings: any;
  recentTransactions: any[];
  guestsCount: number;
  onCreatePension?: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  stats,
  propertySettings,
  recentTransactions = [],
  guestsCount,
  onCreatePension
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Action */}
      <div className="flex justify-start px-2">
        <Button 
          onClick={onCreatePension}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          {t.dashboard?.createNewPension || "Create New Pension"}
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Staff */}
        <Card className="border shadow-sm bg-gradient-to-br from-blue-50 to-white relative overflow-hidden group transition-all duration-300 cursor-default">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {t.dashboard?.totalStaff || "Total Staff"}
              </span>
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-slate-900">{stats.staffCount}</h3>
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                <TrendingUp className="h-3 w-3" />
                <span>{t.dashboard?.statsStaffChange || "+2 from last month"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Rooms */}
        <Card className="border shadow-sm bg-gradient-to-br from-emerald-50 to-white relative overflow-hidden group transition-all duration-300 cursor-default">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                {t.dashboard?.availableRooms || "Available Rooms"}
              </span>
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                <Bed className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-slate-900">{stats.availableRooms}</h3>
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                <TrendingUp className="h-3 w-3" />
                <span>{t.dashboard?.statsRoomsChange || "+5 from yesterday"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Bookings */}
        <Card className="border shadow-sm bg-gradient-to-br from-purple-50 to-white relative overflow-hidden group transition-all duration-300 cursor-default">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
                {t.dashboard?.activeBookings || "Active Bookings"}
              </span>
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600 shadow-inner group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-slate-900">{stats.activeBookings}</h3>
              <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
                <TrendingDown className="h-3 w-3" />
                <span>{t.dashboard?.statsBookingsChange || "-1 from yesterday"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="border shadow-sm bg-gradient-to-br from-amber-50 to-white relative overflow-hidden group transition-all duration-300 cursor-default">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                {t.dashboard?.totalRevenue || "Total Revenue"}
              </span>
              <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shadow-inner group-hover:scale-110 transition-transform">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-slate-900">ETB {stats.totalRevenue.toLocaleString()}</h3>
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                <TrendingUp className="h-3 w-3" />
                <span>{t.dashboard?.statsRevenueChange || "+12% from last month"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-1">
        {/* Property Information Card */}
        <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100 hover:shadow-2xl transition-all duration-500">
          <CardContent className="p-0">
            <div className="p-6 bg-slate-50/50 border-b flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600 shadow-sm">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t.dashboard?.propertyInformation || "Property Information"}</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{propertySettings.name || t.dashboard?.pension || 'Pension'}</p>
              </div>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-10">
              {/* Left Column */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard?.ownerPropertyInfo || "Owner / Property Info"}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 text-slate-700 font-medium border border-slate-100 min-h-[60px]">
                    {propertySettings.description || (t.dashboard?.noInfoProvided || 'No information provided')}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard?.location || "Location"}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 text-slate-700 font-medium border border-slate-100">
                    {propertySettings.address || (t.dashboard?.locationNotSet || 'Location not set')}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Bed className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard?.roomDetails || "Room Details"}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 text-slate-700 font-medium border border-slate-100 min-h-[60px]">
                    {propertySettings.roomDetails || (t.dashboard?.standardRoomAvailability || 'Standard room availability')}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard?.capacity || "Capacity"}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 text-slate-700 font-medium border border-slate-100">
                    {propertySettings.capacity || '0'} {t.dashboard?.rooms || 'rooms'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Activity Card */}
        <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100 hover:shadow-2xl transition-all duration-500">
          <CardContent className="p-0">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-800">{t.dashboard?.recentActivity || "Recent Activity"}</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500 hover:text-blue-600">
                {t.dashboard?.viewAll || "View All"}
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {recentTransactions.slice(0, 3).map((trans, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {trans.description}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">{trans.date}</p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-600 text-sm">
                    +ETB {trans.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="py-12 text-center text-slate-400 italic text-sm">
                  {t.dashboard?.noRecentActivity || "No recent activity to show"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100 hover:shadow-2xl transition-all duration-500">
          <CardContent className="p-0">
            <div className="p-6 border-b flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">{t.dashboard?.quickStats || "Quick Stats"}</h3>
            </div>
            <div className="p-8 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 transition-transform duration-300">
                <Users className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-black text-blue-700">{stats.staffCount}</span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">{t.dashboard?.totalStaff || "Total Staff"}</span>
              </div>
              <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 transition-transform duration-300">
                <Bed className="h-6 w-6 text-emerald-500" />
                <span className="text-xl font-black text-emerald-700">{stats.availableRooms}</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">{t.dashboard?.availableRooms || "Available Rooms"}</span>
              </div>
              <div className="p-6 rounded-3xl bg-purple-50/50 border border-purple-100 flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-purple-500" />
                <span className="text-xl font-black text-purple-700">{stats.activeBookings}</span>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter">{t.dashboard?.activeBookings || "Active Bookings"}</span>
              </div>
              <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100 flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 transition-transform duration-300">
                <Users className="h-6 w-6 text-amber-500" />
                <span className="text-xl font-black text-amber-700">{guestsCount}</span>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tighter">{t.dashboard?.totalGuests || "Total Guests"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
