import React, { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';
import { Booking, Expense, Transaction } from '../../types/dashboard';
import { format, subDays, addDays, isSameDay, isAfter, parseISO, startOfDay } from 'date-fns';
import {
    Activity,
    PieChart as PieChartIcon,
    TrendingUp,
    Calendar,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3
} from 'lucide-react';

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
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
            if (parts[0].length === 4) {
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
        }
        return new Date(s);
    } catch (e) { return new Date(NaN); }
};

interface ChartProps {
    bookings: Booking[];
    expenses: Expense[];
    transactions: Transaction[];
    timeRange?: 'today' | 'week' | 'month' | 'year' | 'all';
}

export const FinancialTrendChart: React.FC<ChartProps> = ({ transactions, expenses, timeRange = 'month' }) => {
    const data = useMemo(() => {
        let days = 14;
        if (timeRange === 'today') days = 1;
        if (timeRange === 'week') days = 7;
        if (timeRange === 'month') days = 30;
        if (timeRange === 'year' || timeRange === 'all') days = 365;

        // For "Today", show last 7 days to give context
        const lookbackDays = timeRange === 'today' ? 7 : days;

        const rangeData = Array.from({ length: lookbackDays }, (_, i) => {
            const date = subDays(new Date(), (lookbackDays - 1) - i);
            return {
                date: format(date, lookbackDays > 31 ? 'MMM dd' : 'MMM dd'),
                fullDate: startOfDay(date),
                revenue: 0,
                expenses: 0
            };
        });

        transactions.forEach(tr => {
            if (tr.type?.toLowerCase() === 'income' || tr.type?.toLowerCase() === 'revenue') {
                const trDate = startOfDay(parseDate(tr.date));
                const dayData = rangeData.find(d => isSameDay(d.fullDate, trDate));
                if (dayData) dayData.revenue += Number(tr.amount);
            }
        });

        expenses.forEach(ex => {
            const exDate = startOfDay(parseDate(ex.expense_date));
            const dayData = rangeData.find(d => isSameDay(d.fullDate, exDate));
            if (dayData) dayData.expenses += Number(ex.amount);
        });

        return rangeData;
    }, [transactions, expenses, timeRange]);

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl h-full transition-all hover:shadow-2xl">
            <h3 className="text-xl font-black mb-6 flex items-center justify-between">
                <span>Revenue vs Expenses</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Financial Velocity</span>
            </h3>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            interval={timeRange === 'year' || timeRange === 'all' ? 30 : 0}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `ETB ${v}`} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                        <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const UnifiedBookingChart: React.FC<ChartProps & { allBookings?: Booking[] }> = ({ bookings, allBookings, timeRange = 'month' }) => {
    const data = useMemo(() => {
        const sourceData = allBookings || bookings;

        let days = 14;
        if (timeRange === 'today') days = 1;
        if (timeRange === 'week') days = 7;
        if (timeRange === 'month') days = 30;
        if (timeRange === 'year' || timeRange === 'all') days = 365;

        // Show window: Past 'days' + Next 7 days for Upcoming visibility
        const pastDays = days;
        const futureDays = timeRange === 'today' || timeRange === 'week' || timeRange === 'month' ? 14 : 0;
        const totalWindow = pastDays + (futureDays || 0);

        const rangeData = Array.from({ length: totalWindow }, (_, i) => {
            const date = subDays(addDays(new Date(), (futureDays || 0)), (totalWindow - 1) - i);
            return {
                date: format(date, totalWindow > 31 ? 'MMM dd' : 'MMM dd'),
                fullDate: startOfDay(date),
                newBookings: 0,
                completed: 0
            };
        });

        sourceData.forEach(b => {
            try {
                // 1. Track New Bookings by Creation Date
                const createdAt = b.created_at || b.created_at_date;
                if (createdAt) {
                    const createDate = startOfDay(parseDate(createdAt));
                    const createDayData = rangeData.find(d => isSameDay(d.fullDate, createDate));
                    if (createDayData) createDayData.newBookings += 1;
                }

                // 2. Track Completed Stays by Check-in Date
                const status = String(b.status || '').toLowerCase();
                if ((status === 'completed' || status === 'checked_out') && b.check_in) {
                    const checkIn = startOfDay(parseDate(b.check_in));
                    const completeDayData = rangeData.find(d => isSameDay(d.fullDate, checkIn));
                    if (completeDayData) completeDayData.completed += 1;
                }
            } catch (e) { }
        });

        return rangeData;
    }, [bookings, allBookings, timeRange]);

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl h-full transition-all hover:shadow-2xl">
            <h3 className="text-xl font-black mb-6 flex items-center justify-between">
                <span>Unified Booking Analytics</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-right leading-tight">
                    Volume & Distribution <br /> Over {timeRange}
                </span>
            </h3>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            interval={data.length > 31 ? 30 : 0}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontWeight: 'bold' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                        <Area
                            type="monotone"
                            dataKey="newBookings"
                            name="New Bookings"
                            stroke="#6366f1"
                            fillOpacity={1}
                            fill="url(#colorConfirmed)"
                            strokeWidth={3}
                            stackId="1"
                        />
                        <Area
                            type="monotone"
                            dataKey="completed"
                            name="Completed Stays"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorCompleted)"
                            strokeWidth={3}
                            stackId="1"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const ExpenseAllocationChart: React.FC<ChartProps> = ({ expenses }) => {
    const data = useMemo(() => {
        const categories: Record<string, number> = {};
        expenses.forEach(ex => {
            categories[ex.category] = (categories[ex.category] || 0) + Number(ex.amount);
        });
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export const RoomTypeDemandChart: React.FC<ChartProps> = ({ bookings }) => {
    const data = useMemo(() => {
        const types: Record<string, number> = {};
        bookings.forEach(b => {
            const type = b.room_number?.includes('Deluxe') ? 'Deluxe' : (b.room_number?.includes('Suite') ? 'Suite' : 'Standard');
            const actualType = (b as any).room?.room_type || (b as any).type || type;
            types[actualType] = (types[actualType] || 0) + 1;
        });
        return Object.entries(types)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [bookings]);

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl h-full transition-all hover:shadow-2xl">
            <div className="mb-8">
                <h3 className="text-xl font-black flex items-center justify-between">
                    <span>Room Category Demand</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-right">Service Type <br /> Engagement</span>
                </h3>
            </div>
            <div className="h-[350px] w-full">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontWeight: 'bold' }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#6366f1"
                                radius={[12, 12, 0, 0]}
                                barSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <BarChart3 className="w-12 h-12 opacity-20 mb-4" />
                        <p className="text-lg font-black italic text-slate-400">No category data</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ReportCharts: React.FC<ChartProps & { allBookings?: Booking[] }> = (props) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <FinancialTrendChart {...props} />
            <UnifiedBookingChart {...props} />
            <ExpenseAllocationChart {...props} />
            <RoomTypeDemandChart {...props} />
        </div>
    );
};
