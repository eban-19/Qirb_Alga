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
  BookingTrendsChart,
  ExpenseAllocationChart
} from './ReportCharts';
import {
  format,
  isWithinInterval,
  subDays,
  startOfToday,
  startOfWeek,
  startOfMonth,
  startOfYear,
  parseISO,
  isAfter,
  isBefore,
  isSameDay,
  differenceInDays,
  addDays,
  endOfDay
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

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date(NaN);
    try {
      // Try parseISO first (standard for modern APIs)
      const d = parseISO(dateStr);
      if (!isNaN(d.getTime())) return d;
      // Fallback to native Date constructor (supports more formats)
      const native = new Date(dateStr);
      if (!isNaN(native.getTime())) return native;
      return new Date(NaN);
    } catch (e) {
      return new Date(NaN);
    }
  };

  // --- FILTERING LOGIC ---
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
        start = subDays(now, 7);
        break;
      case 'month':
        start = subDays(now, 30);
        break;
      case 'year':
        start = subDays(now, 365);
        break;
      default:
        start = new Date(0);
        end = endOfDay(addDays(now, 3650));
    }

    const interval = { start, end };

    const filteredBookings = bookings.filter(b => {
      if (!b.check_in) return false;
      const date = parseDate(b.check_in);
      if (isNaN(date.getTime())) return false;
      return isWithinInterval(date, interval);
    });

    const filteredExpenses = expensesData.filter(e => {
      if (!e.expense_date) return false;
      const date = parseDate(e.expense_date);
      if (isNaN(date.getTime())) return false;
      return isWithinInterval(date, interval);
    });

    const filteredTransactions = transactions.filter(tr => {
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
  const profitMargin = filteredData.totalRevenue > 0 ? Math.round((netProfit / filteredData.totalRevenue) * 100) : 0;
  const adr = filteredData.bookings.length > 0 ? filteredData.totalRevenue / filteredData.bookings.length : 0;

  // Stays stats
  const activeBookings = bookings.filter(b => {
    if (!b.check_in || !b.check_out) return false;
    try {
      const checkIn = parseDate(b.check_in);
      const checkOut = parseDate(b.check_out);
      const today = new Date();
      return (b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'checked_in') && (isSameDay(today, checkIn) || isAfter(today, checkIn)) && isBefore(today, checkOut);
    } catch (err) { return false; }
  });

  // Dynamic Performance Metrics
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

  // Room Inventory stats
  const occupiedRoomsCount = roomsData.filter(r => r.availability_status?.toLowerCase() === 'occupied' || r.status?.toLowerCase() === 'occupied').length;
  const availableRoomsCount = roomsData.filter(r => r.availability_status?.toLowerCase() === 'available' || r.status?.toLowerCase() === 'available').length;
  const maintenanceRoomsCount = roomsData.filter(r => r.availability_status?.toLowerCase() === 'maintenance' || r.status?.toLowerCase() === 'maintenance').length;

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
      case 'inventory':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <MiniStat
              title="Total Inventory"
              value={roomsData.length}
              icon={<Hotel className="w-6 h-6 text-slate-800" />}
              bgColor="bg-slate-100"
              subtitle="Full property capacity"
            />
            <MiniStat
              title="Available (Free)"
              value={availableRoomsCount}
              icon={<Bed className="w-6 h-6 text-emerald-600" />}
              bgColor="bg-emerald-50"
              subtitle="Clean & ready for new guests"
            />
            <MiniStat
              title="Booked (Occupied)"
              value={occupiedRoomsCount}
              icon={<UserCheck className="w-6 h-6 text-rose-600" />}
              bgColor="bg-rose-50"
              subtitle="Currently being utilized"
            />
            <MiniStat
              title="Under Maintenance"
              value={maintenanceRoomsCount}
              icon={<RefreshCcw className="w-6 h-6 text-amber-600" />}
              bgColor="bg-amber-50"
              subtitle="Out of service for repair"
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
      case 'performance':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <KpiCard
              title="Avg Stay Duration"
              value={`${performanceMetrics.avgStay} Nights`}
              icon={<Calendar className="w-6 h-6 text-white" />}
              bgColor="bg-purple-50"
              iconBg="bg-purple-600"
              accentColor="text-purple-700"
              subtitle="Efficiency of room turnover"
            />

            <MiniStat
              title="Demand Rate"
              value={`${filteredData.bookings.length} Bookings`}
              icon={<TrendingUp className="w-6 h-6 text-indigo-600" />}
              bgColor="bg-indigo-50"
              subtitle="New reservations in current period"
            />

            <MiniStat
              title="Cancellation Rate"
              value={`${performanceMetrics.cancelRate}%`}
              icon={<ArrowDownRight className="w-6 h-6 text-rose-600" />}
              bgColor="bg-rose-50"
              subtitle="Lost opportunity metrics"
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

      {/* Cards above Category Selector */}
      {renderTopCards()}

      <Tabs value={reportTab} onValueChange={setReportTab} className="space-y-8">
        <TabsList className="bg-slate-100/50 p-2 rounded-[2.5rem] border border-slate-200/40 w-full lg:w-auto h-auto grid grid-cols-2 lg:flex gap-2">
          <TabsTrigger
            value="stays"
            className="rounded-[2rem] px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg font-black text-slate-500 transition-all duration-300"
          >
            <Users className="w-4 h-4 mr-2" />
            Live Stays
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="rounded-[2rem] px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg font-black text-slate-500 transition-all duration-300"
          >
            <Hotel className="w-4 h-4 mr-2" />
            Room Inventory
          </TabsTrigger>
          <TabsTrigger
            value="financials"
            className="rounded-[2rem] px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-lg font-black text-slate-500 transition-all duration-300"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Financials
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="rounded-[2rem] px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg font-black text-slate-500 transition-all duration-300"
          >
            <Activity className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="rounded-[2rem] px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-black text-slate-500 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Expenses
          </TabsTrigger>
        </TabsList>

        {/* --- LIVE STAYS TAB --- */}
        <TabsContent value="stays" className="space-y-8 mt-0 focus-visible:outline-none">
          <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="p-10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Active Room Occupants</CardTitle>
                </div>
                <p className="text-slate-400 text-sm font-bold ml-5">Detailed registry of guests currently residing in the property</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input placeholder="Search Guest Name..." className="h-11 pl-11 pr-4 rounded-xl bg-slate-50 border-none w-full md:w-64 font-bold text-sm" />
                </div>
                <Button variant="outline" className="h-11 rounded-xl border-slate-200">
                  <ListFilter className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader className="bg-slate-50/80 sticky top-0 z-10">
                    <TableRow className="border-b-2 border-slate-100">
                      <TableHead className="py-6 px-10 font-black text-slate-500 uppercase tracking-widest text-[10px]">Primary Guest</TableHead>
                      <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Room Assignment</TableHead>
                      <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Stay Interval</TableHead>
                      <TableHead className="py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Payment Status</TableHead>
                      <TableHead className="py-6 px-10 text-right font-black text-slate-500 uppercase tracking-widest text-[10px]">Total Bill</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBookings.map((b) => (
                      <TableRow key={b.id} className="hover:bg-blue-50/30 transition-colors group">
                        <TableCell className="py-6 px-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">
                              {b.guest_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 line-clamp-1">{b.guest_name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">ID: #{b.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">Room {b.room_number}</span>
                            <span className="text-[10px] font-bold text-slate-400">Superior Deluxe</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex items-center gap-2 text-slate-600 font-black text-xs">
                            <span className="text-slate-400">
                              {b.check_in ? (
                                (() => {
                                  try { return format(parseISO(b.check_in), 'MMM dd'); }
                                  catch (e) { return 'Invalid'; }
                                })()
                              ) : 'N/A'}
                            </span>
                            <ArrowDownRight className="w-3 h-3 text-slate-300" />
                            <span className="text-blue-600">
                              {b.check_out ? (
                                (() => {
                                  try { return format(parseISO(b.check_out), 'MMM dd'); }
                                  catch (e) { return 'Invalid'; }
                                })()
                              ) : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'checked_in' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                            <ShieldCheck className="w-3 h-3" />
                            {b.status || 'Confirmed'}
                          </span>
                        </TableCell>
                        <TableCell className="py-6 px-10 text-right">
                          <p className="font-black text-slate-900 text-lg">ETB {(b.total_price || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Inclusive of Tax</p>
                        </TableCell>
                      </TableRow>
                    ))}
                    {activeBookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-60 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-300">
                            <Users className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-black italic">No guests currently checked in</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ROOM INVENTORY TAB --- */}
        <TabsContent value="inventory" className="space-y-8 mt-0 focus-visible:outline-none">
          <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="p-10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
              <div>
                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Full Asset Inventory</CardTitle>
                <p className="text-slate-400 text-sm font-bold">Comprehensive management of all physical rooms and their configurations</p>
              </div>
              {/* Action buttons removed */}
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader className="bg-slate-50/80 sticky top-0 z-10">
                    <TableRow className="border-b-2 border-slate-100">
                      <TableHead className="py-6 px-10 font-extrabold text-slate-500 uppercase tracking-widest text-[10px]">Room Number</TableHead>
                      <TableHead className="py-6 font-extrabold text-slate-500 uppercase tracking-widest text-[10px]">Room Category</TableHead>
                      <TableHead className="py-6 font-extrabold text-slate-500 uppercase tracking-widest text-[10px]">Live Status</TableHead>
                      <TableHead className="py-6 font-extrabold text-slate-500 uppercase tracking-widest text-[10px]">Specifications</TableHead>
                      <TableHead className="py-6 px-10 text-right font-extrabold text-slate-500 uppercase tracking-widest text-[10px]">Base Rate (NIGHT)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomsData.map((r) => {
                      const status = (r.availability_status || r.status || 'available').toLowerCase();
                      const isBooked = status === 'occupied';
                      const isMaintenance = status === 'maintenance';

                      let statusStyles = "bg-emerald-100 text-emerald-600";
                      if (isBooked) statusStyles = "bg-rose-100 text-rose-600";
                      if (isMaintenance) statusStyles = "bg-amber-100 text-amber-600";

                      return (
                        <TableRow key={r.id} className="hover:bg-slate-50 transition-colors group">
                          <TableCell className="py-6 px-10 font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                            #{r.room_number}
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex items-center gap-2">
                              <Hotel className="w-4 h-4 text-slate-300" />
                              <span className="text-sm font-bold text-slate-700 tracking-tight">{r.room_type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${statusStyles}`}>
                              {status === 'occupied' ? 'Booked' : status === 'available' ? 'Available' : 'Maintenance'}
                            </span>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                <Bed className="w-3 h-3" /> {r.number_of_beds || r.capacity} Beds
                              </span>
                              <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                <Users className="w-3 h-3" /> {r.capacity} Guests
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-10 text-right">
                            <p className="font-black text-slate-900">ETB {(r.price_per_night || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 font-bold leading-none mt-1 uppercase tracking-widest">Standard Price</p>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- FINANCIALS TAB --- */}
        <TabsContent value="financials" className="space-y-8 mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 gap-8">
            <FinancialTrendChart
              bookings={filteredData.bookings}
              expenses={filteredData.expenses}
              transactions={filteredData.transactions}
              timeRange={timeRange}
            />
          </div>
        </TabsContent>

        {/* --- PERFORMANCE TAB --- */}
        <TabsContent value="performance" className="space-y-8 mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 gap-8">
            <BookingTrendsChart
              bookings={filteredData.bookings}
              allBookings={bookings}
              expenses={filteredData.expenses}
              transactions={filteredData.transactions}
              timeRange={timeRange}
            />
          </div>
        </TabsContent>

        {/* --- EXPENSES TAB --- */}
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
                        <div
                          className="h-full bg-amber-500 group-hover:bg-amber-600 transition-all duration-700"
                          style={{ width: `${(amount / (filteredData.totalExpenses || 1)) * 100}%` }}
                        />
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

/* --- SUB-COMPONENTS --- */

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
