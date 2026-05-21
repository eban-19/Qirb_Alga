import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  DollarSign,
  Building,
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface Booking {
  id: string;
  propertyName: string;
  pensionId?: string | null;
  ownerId?: string | null;
  ownerName: string;
  ownerEmail?: string;
  guestName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface BookingsTabProps {
  bookings: Booking[];
  properties: string[];
  onBookingAction: (action: string, bookingId: string, booking?: any) => void;
}

interface PensionSummary {
  pensionName: string;
  bookings: number;
  confirmed: number;
  revenue: number;
}

interface OwnerSummary {
  ownerName: string;
  ownerId: string;
  pensions: Map<string, PensionSummary>;
  totalBookings: number;
  totalConfirmed: number;
  totalRevenue: number;
}

function OwnerRow({ summary }: { summary: OwnerSummary }) {
  const [expanded, setExpanded] = useState(false);
  const pensionList = Array.from(summary.pensions.values());

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-blue-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {summary.ownerName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">{summary.ownerName}</div>
              <div className="text-xs text-slate-400">{pensionList.length} pension{pensionList.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <span className="font-bold text-slate-800">{pensionList.length}</span>
        </TableCell>
        <TableCell className="text-center">
          <span className="font-bold text-slate-800">{summary.totalBookings}</span>
        </TableCell>
        <TableCell className="text-center">
          <span className="text-emerald-700 font-semibold text-sm">
            {summary.totalConfirmed}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <span className="font-bold text-slate-900">
            {summary.totalRevenue.toLocaleString()} ETB
          </span>
        </TableCell>
      </TableRow>

      {/* Expanded pension breakdown */}
      {expanded &&
        pensionList.map((p) => (
          <TableRow key={p.pensionName} className="bg-violet-50/60">
            <TableCell className="pl-16">
              <div className="flex items-center gap-2 text-sm text-violet-800">
                <Building className="w-3.5 h-3.5 text-violet-500" />
                <span className="font-medium">{p.pensionName}</span>
              </div>
            </TableCell>
            <TableCell className="text-center text-slate-400 text-xs">—</TableCell>
            <TableCell className="text-center">
              <span className="text-violet-700 font-semibold">{p.bookings}</span>
            </TableCell>
            <TableCell className="text-center">
              <span className="text-emerald-700 font-semibold">{p.confirmed}</span>
            </TableCell>
            <TableCell className="text-right">
              <span className="text-violet-700 font-semibold">
                {p.revenue.toLocaleString()} ETB
              </span>
            </TableCell>
          </TableRow>
        ))}
    </>
  );
}

export function BookingsTab({ bookings }: BookingsTabProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filterOwner, setFilterOwner] = useState("all");

  const safeBookings: Booking[] = bookings || [];

  // Aggregate totals
  const ownerSummaries = useMemo(() => {
    const map = new Map<string, OwnerSummary>();

    safeBookings.forEach((b) => {
      const ownerKey = b.ownerId || b.ownerName || "Unknown Owner";
      const ownerLabel = b.ownerName || "Unknown Owner";
      const pensionKey = b.propertyName || "Unknown Pension";
      const isConfirmed =
        b.status?.toLowerCase() === "confirmed";
      const price = Number(b.totalPrice || 0);

      if (!map.has(ownerKey)) {
        map.set(ownerKey, {
          ownerName: ownerLabel,
          ownerId: ownerKey,
          pensions: new Map(),
          totalBookings: 0,
          totalConfirmed: 0,
          totalRevenue: 0,
        });
      }

      const owner = map.get(ownerKey)!;
      owner.totalBookings++;
      if (isConfirmed) owner.totalConfirmed++;
      owner.totalRevenue += price;

      if (!owner.pensions.has(pensionKey)) {
        owner.pensions.set(pensionKey, {
          pensionName: pensionKey,
          bookings: 0,
          confirmed: 0,
          revenue: 0,
        });
      }
      const pension = owner.pensions.get(pensionKey)!;
      pension.bookings++;
      if (isConfirmed) pension.confirmed++;
      pension.revenue += price;
    });

    return Array.from(map.values());
  }, [safeBookings]);

  // Distinct owner list for filter
  const ownerList = useMemo(
    () => ownerSummaries.map((o) => ({ id: o.ownerId, name: o.ownerName })),
    [ownerSummaries]
  );

  // Apply filters
  const filtered = useMemo(() => {
    return ownerSummaries.filter((o) => {
      const matchOwner = filterOwner === "all" || o.ownerId === filterOwner;
      const matchSearch =
        !search ||
        o.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        Array.from(o.pensions.keys()).some((k) =>
          k.toLowerCase().includes(search.toLowerCase())
        );
      return matchOwner && matchSearch;
    });
  }, [ownerSummaries, filterOwner, search]);

  // Grand totals
  const totalBookings = safeBookings.length;
  const totalConfirmed = safeBookings.filter(
    (b) => b.status?.toLowerCase() === "confirmed"
  ).length;
  const totalRevenue = safeBookings.reduce(
    (s, b) => s + Number(b.totalPrice || 0),
    0
  );
  const totalPensions = new Set(safeBookings.map((b) => b.propertyName).filter(Boolean)).size;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 px-1">
        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white shadow-lg">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.adminTabs?.bookings?.title || "Bookings Overview"}</h2>
          <p className="text-slate-500 text-sm">
            {t.adminTabs?.bookings?.subtitle || "Aggregated totals by owner and pension"}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Bookings",
            value: totalBookings,
            icon: Calendar,
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-100",
          },
          {
            label: "Confirmed",
            value: totalConfirmed,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
          {
            label: "Pensions w/ Bookings",
            value: totalPensions,
            icon: Building,
            color: "text-violet-600",
            bg: "bg-violet-50",
            border: "border-violet-100",
          },
          {
            label: "Total Revenue",
            value: `${totalRevenue.toLocaleString()} ETB`,
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className={`border ${card.border} ${card.bg} shadow-sm`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/60`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{card.value}</div>
                  <div className="text-xs text-slate-500">{card.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder={t.adminTabs?.bookings?.searchPlaceholder || "Search by owner or pension name..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 border-slate-200"
            />
          </div>
          <Select value={filterOwner} onValueChange={setFilterOwner}>
            <SelectTrigger className="w-full sm:w-56 h-10 border-slate-200">
              <User className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="All Owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.adminTabs?.common?.all || "All Owners"}</SelectItem>
              {ownerList.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Aggregated Table */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-100 py-4 px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-emerald-600" />
            {t.adminTabs?.common?.customer || "Bookings by Owner → Pension"}
            <span className="ml-auto text-sm font-normal text-slate-500">
              {filtered.length} {t.adminTabs?.common?.owner?.toLowerCase() || "owner"}{filtered.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">{t.adminTabs?.common?.owner || "Owner"}</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">{t.adminTabs?.pensions?.title || "Pensions"}</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">{t.adminTabs?.bookings?.title || "Total Bookings"}</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">{t.adminTabs?.common?.status || "Confirmed"}</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">{t.adminTabs?.common?.revenue || "Revenue"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    {t.adminTabs?.common?.noResultsFound || "No bookings found matching the current filters"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((summary) => (
                  <OwnerRow key={summary.ownerId} summary={summary} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
