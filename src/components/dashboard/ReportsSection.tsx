import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { 
  DollarSign, 
  CreditCard, 
  Target, 
  BarChart3, 
  TrendingUp, 
  ArrowDownRight,
  FileText,
  Plus
} from 'lucide-react';
import { Expense, Booking } from '../../types/dashboard';

interface ReportsSectionProps {
  totalRevenue: number;
  totalExpenses: number;
  bookings: Booking[];
  expensesData: Expense[];
  expensesByCategory: Record<string, number>;
  onAddExpense: (e: React.FormEvent<HTMLFormElement>) => void;
  occupancyMetrics: {
    currentOccupancy: number;
    totalRooms: number;
    availableRooms: number;
  };
  bookingTrends: {
    avgStayDuration: number;
    cancellationRate: number;
  };
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  totalRevenue,
  totalExpenses,
  bookings,
  expensesData,
  expensesByCategory,
  onAddExpense,
  occupancyMetrics,
  bookingTrends
}) => {
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  
  const confirmedRevenue = bookings
    .filter(b => b.status?.toLowerCase() === 'confirmed')
    .reduce((acc, b) => acc + (Number(b.total_price) || 0), 0);
    
  const pendingRevenue = bookings
    .filter(b => b.status?.toLowerCase() === 'pending')
    .reduce((acc, b) => acc + (Number(b.total_price) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-emerald-50 via-emerald-100 to-green-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-800">ETB {totalRevenue.toLocaleString()}</p>
                <span className="text-xs font-bold text-green-700">{bookings.length} bookings total</span>
              </div>
              <div className="rounded-2xl p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg text-white">
                <DollarSign className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-red-50 via-red-100 to-pink-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Total Expenses</p>
                <p className="text-3xl font-bold text-red-800">ETB {totalExpenses.toLocaleString()}</p>
                <span className="text-xs font-bold text-amber-700">{expensesData.length} entries logged</span>
              </div>
              <div className="rounded-2xl p-3 bg-gradient-to-br from-red-500 to-red-600 shadow-lg text-white">
                <CreditCard className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Net Profit</p>
                <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-800' : 'text-red-700'}`}>ETB {netProfit.toLocaleString()}</p>
                <span className={`text-xs font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{netProfit >= 0 ? 'Profitable' : 'Loss'}</span>
              </div>
              <div className="rounded-2xl p-3 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg text-white">
                <Target className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100 hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Profit Margin</p>
                <p className="text-3xl font-bold text-purple-800">{profitMargin}%</p>
                <span className="text-xs font-bold text-purple-700">Revenue vs Expenses</span>
              </div>
              <div className="rounded-2xl p-3 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg text-white">
                <BarChart3 className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50">
                <div>
                  <p className="font-bold text-emerald-700">Confirmed Bookings</p>
                  <p className="text-xs text-emerald-600">{bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length} bookings</p>
                </div>
                <p className="text-xl font-bold text-emerald-700">ETB {confirmedRevenue.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50">
                <div>
                  <p className="font-bold text-amber-700">Pending Bookings</p>
                  <p className="text-xs text-amber-600">{bookings.filter(b => b.status?.toLowerCase() === 'pending').length} bookings</p>
                </div>
                <p className="text-xl font-bold text-amber-700">ETB {pendingRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              Expense Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600 capitalize">{category}</span>
                  <span className="font-bold text-slate-900">ETB {amount.toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(expensesByCategory).length === 0 && (
                <div className="text-center py-6 text-slate-400">
                  <p className="text-sm">No expenses logged yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Form */}
      <Card className="border-none shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-amber-600" />
            Log New Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddExpense} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Category</Label>
              <select name="category" required className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm bg-white outline-none">
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
              <Input name="description" placeholder="E.g. Electricity bill" className="rounded-lg" />
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
    </div>
  );
};
