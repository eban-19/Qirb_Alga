import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { Booking, Expense, Transaction } from '../../types/dashboard';
import { format, subDays, startOfDay, isSameDay, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all';

interface ChartProps {
    bookings: Booking[];
    expenses: Expense[];
    transactions: Transaction[];
    timeRange?: TimeRange;
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export const FinancialTrendChart: React.FC<ChartProps> = ({ transactions, timeRange = 'month' }) => {
    const data = useMemo(() => {
        let days = 30;
        if (timeRange === 'today') days = 1;
        if (timeRange === 'week') days = 7;
        if (timeRange === 'year') days = 365;
        if (timeRange === 'all') days = 365;

        const rangeData = Array.from({ length: days }, (_, i) => {
            const date = subDays(new Date(), (days - 1) - i);
            return {
                date: format(date, days > 31 ? 'MMM dd' : 'MMM dd'),
                fullDate: startOfDay(date),
                revenue: 0,
                expenses: 0
            };
        });

        transactions.forEach(t => {
            if (!t.date) return;
            const tDate = startOfDay(new Date(t.date));
            const dayData = rangeData.find(d => isSameDay(d.fullDate, tDate));
            if (dayData) {
                if (t.type?.toLowerCase() === 'income' || t.type?.toLowerCase() === 'revenue') {
                    dayData.revenue += Number(t.amount);
                } else {
                    dayData.expenses += Number(t.amount);
                }
            }
        });

        return rangeData;
    }, [transactions, timeRange]);

    const title = useMemo(() => {
        switch (timeRange) {
            case 'today': return "Revenue vs Expenses (Today)";
            case 'week': return "Revenue vs Expenses (Last 7 Days)";
            case 'year': return "Revenue vs Expenses (Last 365 Days)";
            default: return "Revenue vs Expenses (Last 30 Days)";
        }
    }, [timeRange]);

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                <span>{title}</span>
                <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Financial Trend</span>
            </h3>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
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

export const BookingTrendsChart: React.FC<ChartProps & { allBookings?: Booking[] }> = ({ bookings, allBookings, timeRange = 'month' }) => {
    const data = useMemo(() => {
        const sourceData = allBookings || bookings;

        let days = 14;
        if (timeRange === 'today') days = 1;
        if (timeRange === 'week') days = 7;
        if (timeRange === 'month') days = 30;
        if (timeRange === 'year' || timeRange === 'all') days = 365;

        // For "Today", show last 7 days to give context, unless we want hourly
        const lookbackDays = timeRange === 'today' ? 1 : days;

        const rangeData = Array.from({ length: lookbackDays }, (_, i) => {
            const date = subDays(new Date(), (lookbackDays - 1) - i);
            return {
                date: format(date, lookbackDays > 31 ? 'MMM dd' : 'MMM dd'),
                fullDate: startOfDay(date),
                count: 0
            };
        });

        sourceData.forEach(b => {
            if (!b.check_in) return;
            try {
                const bDate = startOfDay(parseISO(b.check_in));
                const dayData = rangeData.find(d => isSameDay(d.fullDate, bDate));
                if (dayData) dayData.count += 1;
            } catch (e) {
                console.error("Error parsing date for chart:", b.check_in);
            }
        });

        return rangeData;
    }, [bookings, allBookings, timeRange]);

    const title = useMemo(() => {
        switch (timeRange) {
            case 'today': return "Booking Volume (Today)";
            case 'week': return "Booking Volume (This Week)";
            case 'month': return "Booking Volume (This Month)";
            case 'year': return "Booking Volume (This Year)";
            case 'all': return "Booking Volume (All Time)";
            default: return "Booking Volume";
        }
    }, [timeRange]);

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                <span>{title}</span>
                <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Demand Tracker</span>
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            interval={data.length > 31 ? 30 : 0}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const ExpenseAllocationChart: React.FC<ChartProps> = ({ expenses }) => {
    const data = useMemo(() => {
        const categories: Record<string, number> = {};
        expenses.forEach(e => { categories[e.category] = (categories[e.category] || 0) + Number(e.amount); });
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full transition-all hover:shadow-md">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                <span>Expense Allocation</span>
                <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Cost Centers</span>
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                            {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const ReportCharts: React.FC<ChartProps & { allBookings?: Booking[] }> = (props) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <FinancialTrendChart {...props} />
            <BookingTrendsChart {...props} />
            <ExpenseAllocationChart {...props} />
        </div>
    );
};
