import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Eye, 
  CalendarCheck, 
  ChevronRight, 
  BarChart3, 
  Users, 
  BedDouble 
} from "lucide-react";
import { Transaction } from '../../data/types/dashboardTypes';

interface ActivityStatsCardsProps {
  recentTransactions: Transaction[];
  staffCount: number;
  availableRooms: number;
  activeBookings: number;
  guestsCount: number;
}

const ActivityStatsCards: React.FC<ActivityStatsCardsProps> = ({
  recentTransactions,
  staffCount,
  availableRooms,
  activeBookings,
  guestsCount
}) => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Activity Card */}
      <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-800">Recent Activity</span>
            </div>
            <Button variant="outline" size="sm" className="gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300">
              <Eye className="h-4 w-4" />
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-3">
            {recentTransactions.slice(0, 6).map((transaction) => (
              <div key={transaction.id} className="group/item flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.type === 'income' ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-red-500 shadow-red-500/25'
                  } shadow-sm group-hover/item:scale-125 transition-transform duration-300`} />
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 text-sm group-hover/item:text-blue-600 transition-colors">{transaction.description}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <CalendarCheck className="h-3.5 w-3.5" />
                      {transaction.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-sm ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}ETB {transaction.amount.toLocaleString()}
                  </p>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid Card */}
      <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover:shadow-purple-500/25 group-hover:scale-110 transition-all duration-300">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-800">Quick Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="group/stat text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 cursor-pointer hover:scale-105">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-blue-600 group-hover/stat:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{staffCount}</p>
              <p className="text-sm text-blue-600 font-medium">Total Staff</p>
            </div>
            <div className="group/stat text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300 cursor-pointer hover:scale-105">
              <div className="flex items-center justify-center mb-2">
                <BedDouble className="h-6 w-6 text-emerald-600 group-hover/stat:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-2xl font-bold text-emerald-700">{availableRooms}</p>
              <p className="text-sm text-emerald-600 font-medium">Available Rooms</p>
            </div>
            <div className="group/stat text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 cursor-pointer hover:scale-105">
              <div className="flex items-center justify-center mb-2">
                <CalendarCheck className="h-6 w-6 text-purple-600 group-hover/stat:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-2xl font-bold text-purple-700">{activeBookings}</p>
              <p className="text-sm text-purple-600 font-medium">Active Bookings</p>
            </div>
            <div className="group/stat text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-all duration-300 cursor-pointer hover:scale-105">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-amber-600 group-hover/stat:scale-110 transition-transform duration-300" />
              </div>
              <p className="text-2xl font-bold text-amber-700">{guestsCount}</p>
              <p className="text-sm text-amber-600 font-medium">Total Guests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityStatsCards;
