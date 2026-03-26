import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  CreditCard, 
  Target, 
  BarChart3, 
  TrendingUp, 
  ArrowDownRight, 
  CalendarCheck,
  FileText,
  BedDouble,
  Plus
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReportSectionProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: string;
  totalBookings: number;
  expensesData: any[];
  confirmedRevenue: number;
  pendingRevenue: number;
  cancelledBookings: number;
  cancellationRate: string;
  expensesByCategory: Record<string, number>;
  currentOccupancy: string;
  roomsData: any[];
  avgStayDuration: number;
  bookings: any[];
  pensions: any[];
  onAddExpense: (expense: any) => Promise<void>;
}

const ReportsSection: React.FC<ReportSectionProps> = ({
  totalRevenue,
  totalExpenses,
  netProfit,
  profitMargin,
  totalBookings,
  expensesData,
  confirmedRevenue,
  pendingRevenue,
  cancelledBookings,
  cancellationRate,
  expensesByCategory,
  currentOccupancy,
  roomsData,
  avgStayDuration,
  bookings,
  pensions,
  onAddExpense
}) => {
  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-emerald-50 via-emerald-100 to-green-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Total Revenue</p>
                </div>
                <p className="text-3xl font-bold text-emerald-800 group-hover:text-emerald-900 transition-colors">ETB {totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2 p-2 bg-green-100/50 rounded-lg">
                  <CalendarCheck className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-bold text-green-700">{totalBookings} bookings total</span>
                </div>
              </div>
              <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:shadow-emerald-500/25">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-red-50 via-red-100 to-pink-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Total Expenses</p>
                </div>
                <p className="text-3xl font-bold text-red-800 group-hover:text-red-900 transition-colors">ETB {totalExpenses.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2 p-2 bg-amber-100/50 rounded-lg">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700">{expensesData.length} entries logged</span>
                </div>
              </div>
              <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-red-500/25">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Net Profit</p>
                </div>
                <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-800' : 'text-red-700'} group-hover:text-blue-900 transition-colors`}>ETB {netProfit.toLocaleString()}</p>
                <div className={`flex items-center gap-2 mt-2 p-2 rounded-lg ${netProfit >= 0 ? 'bg-green-100/50' : 'bg-red-100/50'}`}>
                  {netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <ArrowDownRight className="h-4 w-4 text-red-600" />}
                  <span className={`text-xs font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{netProfit >= 0 ? 'Profitable' : 'Operating at loss'}</span>
                </div>
              </div>
              <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-blue-500/25">
                <Target className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Profit Margin</p>
                </div>
                <p className="text-3xl font-bold text-purple-800 group-hover:text-purple-900 transition-colors">{profitMargin}%</p>
                <div className="flex items-center gap-2 mt-2 p-2 bg-purple-100/50 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-bold text-purple-700">Revenue vs Expenses ratio</span>
                </div>
              </div>
              <div className="group-hover:rotate-12 transition-transform duration-500 rounded-2xl p-3 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-purple-500/25">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden lg:col-span-2">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg group-hover:shadow-emerald-500/25 group-hover:scale-110 transition-all duration-300">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-800">Revenue Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-emerald-500/25"></div>
                  <div>
                    <p className="font-bold text-emerald-700">Confirmed Bookings</p>
                    <p className="text-xs text-emerald-600">{bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length} bookings</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-emerald-700">ETB {confirmedRevenue.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-amber-500/25"></div>
                  <div>
                    <p className="font-bold text-amber-700">Pending Bookings</p>
                    <p className="text-xs text-amber-600">{bookings.filter(b => b.status?.toLowerCase() === 'pending').length} bookings</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-amber-700">ETB {pendingRevenue.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-red-500/25"></div>
                  <div>
                    <p className="font-bold text-red-700">Cancelled</p>
                    <p className="text-xs text-red-600">{cancelledBookings} bookings</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-red-700">{cancellationRate}% rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg group-hover:shadow-red-500/25 group-hover:scale-110 transition-all duration-300">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-800">Expense Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              {Object.keys(expensesByCategory).length > 0 ? (
                Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <span className="text-sm text-slate-600 capitalize">{category}</span>
                    </div>
                    <span className="font-bold text-slate-900">ETB {amount.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No expenses logged yet</p>
                  <p className="text-xs mt-1">Add expenses using the form below</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Form */}
      <Card className="border-none shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-800">Log New Expense</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const pensionId = pensions[0]?.pension_id;
            if (!pensionId) return;
            
            await onAddExpense({
              category: formData.get('category'),
              description: formData.get('description'),
              amount: parseFloat(formData.get('amount') as string),
              expense_date: formData.get('expense_date')
            });
            form.reset();
          }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Category</Label>
              <select name="category" required className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                <option value="Staff Salaries">Staff Salaries</option>
                <option value="Utilities">Utilities</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Supplies">Supplies</option>
                <option value="Marketing">Marketing</option>
                <option value="Rent">Rent</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Description</Label>
              <Input name="description" placeholder="E.g. Monthly electricity bill" className="rounded-lg" />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Amount (ETB)</Label>
              <Input name="amount" type="number" step="0.01" required placeholder="0.00" className="rounded-lg" />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Date</Label>
              <Input name="expense_date" type="date" required className="rounded-lg" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg rounded-lg">
                <Plus className="h-4 w-4 mr-1.5" /> Add Expense
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover:shadow-purple-500/25 group-hover:scale-110 transition-all duration-300">
                <BedDouble className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-800">Occupancy Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100">
                <p className="text-3xl font-bold text-purple-700">{currentOccupancy}%</p>
                <p className="text-sm text-purple-600 font-medium">Current Occupancy</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100">
                <p className="text-3xl font-bold text-amber-700">{roomsData.length}</p>
                <p className="text-sm text-amber-600 font-medium">Total Rooms</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                <p className="text-3xl font-bold text-blue-700">{roomsData.filter(r => r.status === 'Available').length}</p>
                <p className="text-sm text-blue-600 font-medium">Available Now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-800">Booking Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="text-sm text-slate-600">Avg. Stay Duration</span>
                <span className="font-bold text-slate-900">{avgStayDuration} nights</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="text-sm text-slate-600">Confirmed Bookings</span>
                <span className="font-bold text-emerald-600">{bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="text-sm text-slate-600">Cancellation Rate</span>
                <span className="font-bold text-red-600">{cancellationRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg group-hover:shadow-emerald-500/25 group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-800">Key Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="text-sm text-slate-600">Total Rooms</span>
                <span className="font-bold text-slate-900">{roomsData.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="text-sm text-slate-600">Total Bookings</span>
                <span className="font-bold text-slate-900">{totalBookings}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="text-sm text-slate-600">Avg Revenue / Booking</span>
                <span className="font-bold text-emerald-600">ETB {totalBookings > 0 ? Math.round(totalRevenue / totalBookings).toLocaleString() : 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsSection;
