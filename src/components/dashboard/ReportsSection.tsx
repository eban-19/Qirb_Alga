import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  DollarSign,
  CreditCard,
  Target,
  BarChart3,
  TrendingUp,
  ArrowDownRight,
  FileText,
  Plus,
  Download,
  Calendar,
  Filter,
  RefreshCcw,
  Zap,
  LayoutDashboard,
  Clock,
  PieChart as PieChartIcon,
  Bed,
  UserCheck,
  Search,
  ArrowUpRight,
  Users,
  Hotel,
  ShieldCheck,
  Activity,
  ListFilter
} from 'lucide-react';
import { Expense, Booking, Transaction, Room } from '../../types/dashboard';
import { useLanguage } from '../../hooks/use-language';
import {
  FinancialTrendChart,
  UnifiedBookingChart,
  ExpenseAllocationChart,
  RoomTypeDemandChart
} from './ReportCharts';
import {
  format,
  isWithinInterval,
  subDays,
  startOfToday,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  parseISO,
  isAfter,
  isBefore,
  isSameDay,
  differenceInDays,
  addDays,
  endOfDay,
  endOfMonth,
  endOfYear
} from 'date-fns';

export type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all';

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
  transactions: Transaction[];
  roomsData: Room[];
  timeRange: TimeRange;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  totalRevenue: initialRevenue,
  totalExpenses: initialExpenses,
  bookings,
  expensesData,
  expensesByCategory: initialExpensesByCategory,
  onAddExpense,
  occupancyMetrics,
  bookingTrends,
  transactions,
  roomsData,
  timeRange
}) => {
  const { t } = useLanguage();
  const [reportTab, setReportTab] = useState('stays');

  const parseDate = (dateStr: any) => {
    if (!dateStr) return new Date(NaN);
    if (dateStr instanceof Date) return dateStr;
    const s = String(dateStr).trim();

    try {
      const d = parseISO(s);
      if (!isNaN(d.getTime())) return d;

      const parts = s.split(/[\/\-\.]/);
      if (parts.length === 3) {
        if (parts[2].length === 4 && parts[0].length <= 2) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          const constructed = new Date(year, month, day);
          if (!isNaN(constructed.getTime())) return constructed;
        }
        if (parts[0].length === 4) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          const constructed = new Date(year, month, day);
          if (!isNaN(constructed.getTime())) return constructed;
        }
      }

      const native = new Date(s);
      return native;
    } catch (e) {
      return new Date(NaN);
    }
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(addDays(now, 365));

    switch (timeRange) {
      case 'today':
        start = startOfToday();
        end = endOfDay(now);
        break;
      case 'week':
        start = startOfDay(subDays(now, 7));
        end = endOfDay(now);
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = new Date(0);
        end = endOfDay(addDays(now, 3650));
    }

    const interval = { start, end };

    const filteredBookings = bookings.filter(b => {
      if (timeRange === 'all') return true;
      if (!b.check_in) return false;
      const date = parseDate(b.check_in);
      if (isNaN(date.getTime())) return false;
      return isWithinInterval(date, interval);
    });

    const filteredExpenses = expensesData.filter(e => {
      if (timeRange === 'all') return true;
      if (!e.expense_date) return false;
      const date = parseDate(e.expense_date);
      if (isNaN(date.getTime())) return false;
      return isWithinInterval(date, interval);
    });

    const filteredTransactions = transactions.filter(tr => {
      if (timeRange === 'all') return true;
      if (!tr.date) return false;
      const date = parseDate(tr.date);
      if (isNaN(date.getTime())) return false;
      return isWithinInterval(date, interval);
    });

    const revenue = filteredTransactions
      .filter(tr => tr.type?.toLowerCase() === 'income' || tr.type?.toLowerCase() === 'revenue')
      .reduce((sum, tr) => sum + Number(tr.amount), 0);

    const expenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const expByCategory: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      expByCategory[e.category] = (expByCategory[e.category] || 0) + Number(e.amount);
    });

    return {
      bookings: filteredBookings,
      expenses: filteredExpenses,
      transactions: filteredTransactions,
      totalRevenue: revenue,
      totalExpenses: expenses,
      expensesByCategory: expByCategory
    };
  }, [timeRange, bookings, expensesData, transactions]);

  const netProfit = filteredData.totalRevenue - filteredData.totalExpenses;
  const performanceMetrics = useMemo(() => {
    const validBookings = filteredData.bookings.filter(b => b.check_in && b.check_out);
    if (validBookings.length === 0) return { avgStay: "0", cancelRate: "0" };

    let totalNights = 0;
    let cancelled = 0;

    validBookings.forEach(b => {
      try {
        const checkIn = parseDate(b.check_in);
        const checkOut = parseDate(b.check_out);
        if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
          totalNights += Math.max(1, differenceInDays(checkOut, checkIn));
        }
        if (b.status?.toLowerCase() === 'cancelled') cancelled++;
      } catch (e) { }
    });

    return {
      avgStay: validBookings.length > 0 ? (totalNights / validBookings.length).toFixed(1) : "0",
      cancelRate: validBookings.length > 0 ? ((cancelled / validBookings.length) * 100).toFixed(1) : "0"
    };
  }, [filteredData.bookings]);

  const activeBookings = bookings.filter(b => {
    if (!b.check_in || !b.check_out) return false;
    try {
      const checkIn = parseDate(b.check_in);
      const checkOut = parseDate(b.check_out);
      const today = new Date();
      return (b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'checked_in') && (isSameDay(today, checkIn) || isAfter(today, checkIn)) && isBefore(today, checkOut);
    } catch (err) { return false; }
  });

  const getLocalizedCategoryName = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'staff salaries': return t.dashboard?.staffSalaries || "Staff Salaries";
      case 'utilities': return t.dashboard?.utilities || "Utilities";
      case 'maintenance': return t.dashboard?.maintenance || "Maintenance";
      case 'supplies': return t.dashboard?.supplies || "Supplies";
      case 'marketing': return t.dashboard?.marketing || "Marketing";
      case 'rent': return t.dashboard?.rent || "Rent";
      default: return t.dashboard?.other || "Other";
    }
  };

  const renderTopCards = () => {
    switch (reportTab) {
      case 'stays':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="col-span-1 md:col-span-2 lg:col-span-1 rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md ring-1 ring-white/30">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-white/60 font-black uppercase tracking-widest text-[10px]">Real-time Occupancy</p>
                  <h3 className="text-5xl font-black mt-1 leading-none">{occupancyMetrics.currentOccupancy}%</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-white/20 rounded-full overflow-hidden ring-1 ring-white/10">
                  <div className="h-full bg-white transition-all duration-1000" style={{ width: `${occupancyMetrics.currentOccupancy}%` }} />
                </div>
                <p className="text-xs font-bold text-white/80">{occupancyMetrics.availableRooms} rooms available for immediate check-in</p>
              </div>
            </Card>

            <MiniStat
              title="Guests In-House"
              value={activeBookings.length}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              bgColor="bg-blue-50"
              subtitle="Confirmed checked-in guests"
            />

            <MiniStat
              title="Arrivals Today"
              value={bookings.filter(b => {
                if (!b.check_in) return false;
                try {
                  const d = parseDate(b.check_in);
                  return !isNaN(d.getTime()) && isSameDay(new Date(), d) && b.status?.toLowerCase() === 'confirmed';
                } catch (e) { return false; }
              }).length}
              icon={<ArrowUpRight className="w-6 h-6 text-emerald-600" />}
              bgColor="bg-emerald-50"
              subtitle="Pending check-ins for today"
            />
          </div>
        );
      case 'bookings':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <MiniStat
              title="Volume"
              value={filteredData.bookings.length}
              icon={<Activity className="w-6 h-6 text-slate-800" />}
              bgColor="bg-slate-100"
              subtitle={`Total reservations in ${timeRange}`}
            />
            <MiniStat
              title="Success Rate"
              value={`${filteredData.bookings.length > 0 ? (100 - parseFloat(performanceMetrics.cancelRate)).toFixed(0) : 0}%`}
              icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
              bgColor="bg-emerald-50"
              subtitle="Completed & confirmed bookings"
            />
            <MiniStat
              title="Demand Factor"
              value={(filteredData.bookings.length / (roomsData.length || 1)).toFixed(1)}
              icon={<TrendingUp className="w-6 h-6 text-rose-600" />}
              bgColor="bg-rose-50"
              subtitle="Bookings per unit available"
            />
            <MiniStat
              title="Avg Duration"
              value={`${performanceMetrics.avgStay} nights`}
              icon={<Clock className="w-6 h-6 text-blue-600" />}
              bgColor="bg-blue-50"
              subtitle="Mean length of guest visits"
            />
          </div>
        );
      case 'financials':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <KpiCard
              title={t.dashboard?.revenue || "Revenue"}
              value={`ETB ${filteredData.totalRevenue.toLocaleString()}`}
              trend="+12.5%"
              isPositive={true}
              icon={<DollarSign className="w-6 h-6 text-white" />}
              bgColor="bg-emerald-50"
              iconBg="bg-emerald-500"
              accentColor="text-emerald-600"
              subtitle={`${filteredData.bookings.length} successful bookings in ${timeRange}`}
            />
            <KpiCard
              title={t.dashboard?.totalExpenses || "Expenses"}
              value={`ETB ${filteredData.totalExpenses.toLocaleString()}`}
              trend="-2.4%"
              isPositive={false}
              icon={<CreditCard className="w-6 h-6 text-white" />}
              bgColor="bg-rose-50"
              iconBg="bg-rose-500"
              accentColor="text-rose-600"
              subtitle={`${filteredData.expenses.length} operating costs logged`}
            />
            <KpiCard
              title={t.dashboard?.netProfit || "Net Profit"}
              value={`ETB ${netProfit.toLocaleString()}`}
              trend="+8.1%"
              isPositive={true}
              icon={<Zap className="w-6 h-6 text-white" />}
              bgColor="bg-indigo-50"
              iconBg="bg-indigo-500"
              accentColor="text-indigo-600"
              subtitle={netProfit >= 0 ? "Property is currently profitable" : "Property is running at loss"}
            />
          </div>
        );
      case 'expenses':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <KpiCard
              title="Total Expenses"
              value={`ETB ${filteredData.totalExpenses.toLocaleString()}`}
              icon={<CreditCard className="w-6 h-6 text-white" />}
              bgColor="bg-amber-50"
              iconBg="bg-amber-600"
              accentColor="text-amber-700"
              subtitle={`Logged across ${filteredData.expenses.length} entries`}
            />
            <MiniStat
              title="Avg. Expense"
              value={`ETB ${(filteredData.totalExpenses / (filteredData.expenses.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              icon={<DollarSign className="w-6 h-6 text-amber-600" />}
              bgColor="bg-slate-50"
              subtitle="Per recorded transaction"
            />
            <MiniStat
              title="Operational Drain"
              value={`${filteredData.totalRevenue > 0 ? ((filteredData.totalExpenses / filteredData.totalRevenue) * 100).toFixed(1) : 0}%`}
              icon={<ArrowDownRight className="w-6 h-6 text-rose-600" />}
              bgColor="bg-rose-50"
              subtitle="Percentage of revenue spent"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderTopCards()}

      <Tabs value={reportTab} onValueChange={setReportTab} className="space-y-8">
        <TabsList className="bg-slate-100/50 p-2 rounded-[2.5rem] border border-slate-200/40 w-full lg:w-auto h-auto grid grid-cols-2 lg:flex gap-2">
          <TabsTrigger value="stays" className="rounded-[2rem] px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg font-black text-slate-500 transition-all duration-300">
            <BarChart3 className="w-4 h-4 mr-2" />
            Category Analytics
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-[2rem] px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg font-black text-slate-500 transition-all duration-300">
            <PieChartIcon className="w-4 h-4 mr-2" />
            Booking Analytics
          </TabsTrigger>
          <TabsTrigger value="financials" className="rounded-[2rem] px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-lg font-black text-slate-500 transition-all duration-300">
            <DollarSign className="w-4 h-4 mr-2" />
            Financials
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-[2rem] px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-black text-slate-500 transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" />
            Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stays" className="space-y-8 mt-0 focus-visible:outline-none">
          <RoomTypeDemandChart bookings={filteredData.bookings} expenses={filteredData.expenses} transactions={filteredData.transactions} />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-8 mt-0 focus-visible:outline-none">
          <UnifiedBookingChart
            bookings={filteredData.bookings}
            allBookings={bookings}
            expenses={filteredData.expenses}
            transactions={filteredData.transactions}
            timeRange={timeRange}
          />
        </TabsContent>

        <TabsContent value="financials" className="space-y-8 mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 gap-8">
            <FinancialTrendChart bookings={filteredData.bookings} expenses={filteredData.expenses} transactions={filteredData.transactions} timeRange={timeRange} />
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-8 mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="rounded-[3rem] border-none shadow-xl bg-white overflow-hidden p-8">
              <CardTitle className="text-2xl font-black text-slate-800 mb-2">Cost Centers</CardTitle>
              <div className="space-y-8 mt-8">
                <div className="h-[220px]">
                  <ExpenseAllocationChart bookings={filteredData.bookings} expenses={filteredData.expenses} transactions={filteredData.transactions} />
                </div>
                <div className="space-y-5 pt-4 border-t border-slate-100">
                  {Object.entries(filteredData.expensesByCategory).map(([category, amount]) => (
                    <div key={category} className="group">
                      <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                        <span>{getLocalizedCategoryName(category)}</span>
                        <span className="text-slate-900">ETB {amount.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 group-hover:bg-amber-600 transition-all duration-700" style={{ width: `${(amount / (filteredData.totalExpenses || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="lg:col-span-2">
              <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white overflow-hidden">
                <CardHeader className="bg-amber-50 border-b border-amber-100/50 p-10">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-amber-600 text-white rounded-3xl shadow-xl shadow-amber-600/20">
                      <CreditCard className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-black text-slate-900">{t.dashboard?.logNewExpense || "Log New Expense"}</CardTitle>
                      <p className="text-amber-700/60 font-bold mt-1 uppercase tracking-widest text-[10px]">Financial Entry Record</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={onAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</Label>
                      <select name="category" required className="w-full h-14 rounded-2xl border border-slate-200 px-6 text-sm bg-slate-50 focus:ring-4 focus:ring-amber-500/10 focus:bg-white transition-all outline-none font-bold appearance-none cursor-pointer">
                        <option value="Staff Salaries">{t.dashboard?.staffSalaries || "Staff Salaries"}</option>
                        <option value="Utilities">{t.dashboard?.utilities || "Utilities"}</option>
                        <option value="Maintenance">{t.dashboard?.maintenance || "Maintenance"}</option>
                        <option value="Supplies">{t.dashboard?.supplies || "Supplies"}</option>
                        <option value="Marketing">{t.dashboard?.marketing || "Marketing"}</option>
                        <option value="Rent">{t.dashboard?.rent || "Rent"}</option>
                        <option value="Other">{t.dashboard?.other || "Other"}</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (ETB)</Label>
                      <Input name="amount" type="number" step="0.01" required placeholder="0.00" className="rounded-2xl h-14 px-6 bg-slate-50 focus:ring-4 focus:ring-amber-500/10 transition-all font-black text-lg text-slate-900" />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</Label>
                      <Input name="description" placeholder="E.g. Electricity bill for May 2024" className="rounded-2xl h-14 px-6 bg-slate-50 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold" />
                    </div>
                    <div className="md:col-span-2 pt-6">
                      <Button type="submit" className="w-full h-16 rounded-[2rem] bg-indigo-600 hover:bg-slate-900 text-white font-black text-xl shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-4">
                        Confirm & Log Entry
                        <TrendingUp className="w-6 h-6" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const KpiCard = ({ title, value, trend, isPositive, icon, bgColor, iconBg, accentColor, subtitle }: any) => (
  <Card className={`rounded-[3rem] border-none shadow-xl ${bgColor} group hover:shadow-2xl transition-all duration-500 relative overflow-hidden h-full`}>
    <CardContent className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 ${iconBg} rounded-3xl shadow-xl shadow-inherit/20 ring-8 ring-white/10`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isPositive ? 'bg-white/50 text-emerald-600' : 'bg-white/50 text-rose-600 shadow-sm'}`}>
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
        <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">{value}</h3>
        <p className="text-slate-500/70 text-xs font-bold leading-relaxed">{subtitle}</p>
      </div>
    </CardContent>
  </Card>
);

const MiniStat = ({ title, value, icon, bgColor, subtitle }: any) => (
  <Card className={`rounded-[2.5rem] border-none shadow-xl ${bgColor} p-8 flex flex-col justify-between h-full group hover:scale-[1.02] transition-transform duration-500`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-4 bg-white rounded-[1.5rem] shadow-sm text-slate-700 ring-1 ring-slate-100 group-hover:ring-primary/20 transition-all">
        {icon}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
      <p className="text-3xl font-black text-slate-900 leading-none mb-1">{value}</p>
      {subtitle && <p className="text-[10px] font-medium text-slate-400 italic line-clamp-1">{subtitle}</p>}
    </div>
  </Card>
);
