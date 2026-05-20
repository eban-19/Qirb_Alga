import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Building,
  Search,
  CheckCircle,
  PauseCircle,
  Clock,
  XCircle,
  MapPin,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";

interface Pension {
  id?: string;
  pension_id?: number;
  name: string;
  address?: string;
  description?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  status: "pending" | "active" | "inactive" | string;
  roomsCount?: number;
  registeredDate?: string;
  created_at?: string;
  rejectionReason?: string | null;
}

interface PensionsTabProps {
  pensions: Pension[];
  onRefresh?: () => void;
  onRefresh?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pending",
    cls: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    icon: <Clock className="w-3 h-3" />,
  },
  active: {
    label: "Active",
    cls: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  inactive: {
    label: "Suspended",
    cls: "bg-red-100 text-red-800 border border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
};

export function PensionsTab({ pensions, onRefresh }: PensionsTabProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const safePensions: Pension[] = pensions || [];

  const filtered = useMemo(() => {
    return safePensions.filter((p) => {
      const matchSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
        p.address?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [safePensions, search, filterStatus]);

  const counts = useMemo(() => ({
    total: safePensions.length,
    pending: safePensions.filter((p) => p.status === "pending").length,
    active: safePensions.filter((p) => p.status === "active").length,
    suspended: safePensions.filter((p) => p.status === "inactive").length,
  }), [safePensions]);

  const getId = (p: Pension) =>
    p.pension_id ?? (p.id ? parseInt(p.id) : 0);

  const handleApprove = async (pension: Pension) => {
    const id = getId(pension);
    const key = `approve-${id}`;
    try {
      setActionLoading(key);
      const res = await fetch(`http://localhost:3006/api/admin/pensions/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${pension.name}" approved successfully`);
        onRefresh?.();
      } else {
        toast.error(data.message || "Failed to approve pension");
      }
    } catch {
      toast.error("Network error approving pension");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (pension: Pension) => {
    const id = getId(pension);
    const key = `suspend-${id}`;
    try {
      setActionLoading(key);
      const res = await fetch(`http://localhost:3006/api/admin/pensions/${id}/suspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${pension.name}" suspended`);
        onRefresh?.();
      } else {
        toast.error(data.message || "Failed to suspend pension");
      }
    } catch {
      toast.error("Network error suspending pension");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 px-1">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white shadow-lg">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.adminTabs?.pensions?.title || "Pensions Management"}</h2>
          <p className="text-slate-500 text-sm">{t.adminTabs?.pensions?.subtitle || "Approve or suspend registered pension properties"}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t.adminTabs?.common?.properties || "Total Pensions", value: counts.total, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-100" },
          { label: t.adminTabs?.common?.pending || "Pending Approval", value: counts.pending, color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-100" },
          { label: t.adminTabs?.common?.verified || "Active", value: counts.active, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: t.adminTabs?.common?.suspended || "Suspended", value: counts.suspended, color: "text-red-700", bg: "bg-red-50", border: "border-red-100" },
        ].map((c) => (
          <Card key={c.label} className={`border ${c.border} ${c.bg} shadow-sm`}>
            <CardContent className="p-4">
              <div className={`text-2xl font-black ${c.color} mb-0.5`}>{c.value}</div>
              <div className="text-xs text-slate-500 font-medium">{c.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder={t.adminTabs?.pensions?.searchPlaceholder || "Search by name, owner or address..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 border-slate-200"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-44 h-10 border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.adminTabs?.common?.all || "All Statuses"}</SelectItem>
              <SelectItem value="pending">{t.adminTabs?.common?.pending || "Pending"}</SelectItem>
              <SelectItem value="active">{t.adminTabs?.common?.verified || "Active"}</SelectItem>
              <SelectItem value="inactive">{t.adminTabs?.common?.suspended || "Suspended"}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-100 py-4 px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building className="w-4 h-4 text-violet-600" />
            {t.adminTabs?.common?.properties || "All Registered Pensions"}
            <span className="ml-auto text-sm font-normal text-slate-500">
              {filtered.length} {t.adminTabs?.common?.properties?.toLowerCase() || "pensions"}
            </span>
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">{t.adminTabs?.common?.name || "Pension Name"}</TableHead>
                <TableHead className="font-semibold text-slate-700">{t.adminTabs?.common?.owner || "Owner"}</TableHead>
                <TableHead className="font-semibold text-slate-700">{t.adminTabs?.common?.contact || "Address"}</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">{t.adminTabs?.common?.room || "Rooms"}</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">{t.adminTabs?.common?.status || "Status"}</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">{t.adminTabs?.common?.date || "Registered"}</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">{t.adminTabs?.common?.actions || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-slate-400">
                    <Building className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    {t.adminTabs?.common?.noResultsFound || "No pensions found matching the current filters"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((pension) => {
                  const id = getId(pension);
                  const statusCfg = STATUS_CONFIG[pension.status] || STATUS_CONFIG.pending;
                  const regDate = pension.registeredDate || pension.created_at;
                  return (
                    <TableRow key={id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-slate-900">{pension.name}</div>
                        {pension.description && (
                          <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {pension.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {pension.ownerName || "—"}
                        </div>
                        {pension.ownerEmail && (
                          <div className="text-xs text-slate-400 mt-0.5">{pension.ownerEmail}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {pension.address ? (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="line-clamp-1">{pension.address}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-slate-700">{pension.roomsCount ?? "—"}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`flex items-center gap-1 justify-center w-fit mx-auto text-xs px-2 py-0.5 ${statusCfg.cls}`}>
                          {statusCfg.icon}
                          {t.adminTabs?.common?.[pension.status] || statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs text-slate-500">
                        {regDate ? new Date(regDate).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {pension.status === "pending" && (
                            <Button
                              size="sm"
                              className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                              disabled={actionLoading === `approve-${id}`}
                              onClick={() => handleApprove(pension)}
                            >
                              {actionLoading === `approve-${id}` ? "..." : (t.adminTabs?.common?.approve || "Approve")}
                            </Button>
                          )}
                          {pension.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs text-orange-600 border-orange-200 hover:bg-orange-50 rounded-lg"
                              disabled={actionLoading === `suspend-${id}`}
                              onClick={() => handleSuspend(pension)}
                            >
                              {actionLoading === `suspend-${id}` ? "..." : (t.adminTabs?.common?.suspend || "Suspend")}
                            </Button>
                          )}
                          {pension.status === "inactive" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg"
                              disabled={actionLoading === `approve-${id}`}
                              onClick={() => handleApprove(pension)}
                            >
                              {actionLoading === `approve-${id}` ? "..." : (t.adminTabs?.common?.reactivate || "Reactivate")}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
