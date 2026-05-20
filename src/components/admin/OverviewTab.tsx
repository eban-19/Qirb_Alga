import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Settings,
  Bell,
  ArrowUpRight,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";
import { PlatformMetrics, SystemAlert } from "@/types/admin";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { useLanguage } from "@/hooks/use-language";

interface PensionOwner {
  id: string;
  businessName: string;
  ownerName: string;
  status: "pending" | "verified" | "approved" | "rejected" | "suspended";
  registrationDate: string;
  totalProperties?: number;
  totalRevenue?: number;
}

interface OverviewTabProps {
  recentOwners: PensionOwner[];
  metrics?: PlatformMetrics;
  alerts?: SystemAlert[];
}

const QUICK_LINKS = [
  {
    label: "Approve Owners",
    description: "Review pending owner verifications",
    icon: Users,
    href: "/dashboard/admin/owners",
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-200",
  },
  {
    label: "Pension Approvals",
    description: "Review newly registered pensions",
    icon: Building,
    href: "/dashboard/admin/approvals",
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-purple-200",
  },
  {
    label: "Manage Bookings",
    description: "View and manage all bookings",
    icon: Calendar,
    href: "/dashboard/admin/bookings",
    gradient: "from-emerald-500 to-green-600",
    shadow: "shadow-green-200",
  },
  {
    label: "Platform Financials",
    description: "Subscriptions, plans & payments",
    icon: CreditCard,
    href: "/dashboard/admin/payments",
    gradient: "from-orange-500 to-amber-600",
    shadow: "shadow-orange-200",
  },
  // {
  //   label: "System Alerts",
  //   description: "Check active system alerts",
  //   icon: Bell,
  //   href: "/dashboard/admin/alerts",
  //   gradient: "from-red-500 to-rose-600",
  //   shadow: "shadow-red-200",
  // },
  {
    label: "App Settings",
    description: "Configure global platform settings",
    icon: Settings,
    href: "/dashboard/admin/settings/account",
    gradient: "from-slate-500 to-slate-600",
    shadow: "shadow-slate-200",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "verified":
    case "approved":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "rejected":
      return "bg-red-100 text-red-800 border border-red-200";
    case "suspended":
      return "bg-slate-100 text-slate-700 border border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "verified":
    case "approved":
      return <CheckCircle className="w-3 h-3" />;
    case "pending":
      return <Clock className="w-3 h-3" />;
    case "rejected":
      return <AlertTriangle className="w-3 h-3" />;
    case "suspended":
      return <Shield className="w-3 h-3" />;
    default:
      return null;
  }
};

export function OverviewTab({ recentOwners, metrics, alerts }: OverviewTabProps) {
  const navigate = useNavigate();
  const ui = useAdminDashboardData();
  const { t } = useLanguage();

  const liveMetrics = ui.metrics;

  const statCards = [
    {
      label: t.adminDetails?.totalUsers || "Total Users",
      value: liveMetrics.totalUsers ?? 0,
      icon: Users,
      gradient: "from-blue-600 to-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-100",
      iconBg: "bg-blue-500",
      badge: null,
    },
    {
      label: t.adminDetails?.totalBookings || "Total Bookings",
      value: liveMetrics.totalBookings,
      icon: Calendar,
      gradient: "from-emerald-600 to-green-500",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      iconBg: "bg-emerald-500",
      badge: null,
    },
    {
      label: t.adminDetails?.registeredPensions || "Registered Pensions",
      value: liveMetrics.totalProperties,
      icon: Building,
      gradient: "from-violet-600 to-purple-500",
      bg: "bg-violet-50",
      border: "border-violet-100",
      iconBg: "bg-violet-500",
      badge:
        (liveMetrics.pendingPensions ?? 0) > 0
          ? `${liveMetrics.pendingPensions} pending`
          : null,
    },
    {
      label: t.adminDetails?.totalOwners || "Total Owners",
      value: liveMetrics.totalOwners,
      icon: Shield,
      gradient: "from-orange-600 to-amber-500",
      bg: "bg-orange-50",
      border: "border-orange-100",
      iconBg: "bg-orange-500",
      badge:
        liveMetrics.pendingVerifications > 0
          ? `${liveMetrics.pendingVerifications} pending`
          : null,
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      {/* <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white blur-2xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative z-10">
          <p className="text-indigo-200 text-sm font-medium mb-1 uppercase tracking-wider">Admin Dashboard</p>
          <h1 className="text-3xl font-bold mb-2">Welcome back, Admin 👋</h1>
          <p className="text-indigo-100 text-sm">
            Here's a live snapshot of the Qirb Alga platform — real data, no refresh needed.
          </p>
        </div>
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className={`border ${card.border} ${card.bg} shadow-sm hover:shadow-md transition-all duration-300 group`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.iconBg} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <div className="text-3xl font-black text-slate-900 mb-1">
                  {card.value.toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-slate-600 mb-2">{card.label}</div>
                {card.badge && (
                  <Badge className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5">
                    ⚠ {card.badge}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-800">{t.adminDetails?.quickActions || "Quick Actions"}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.href)}
                className="group flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${link.gradient} text-white mb-3 shadow-md group-hover:scale-110 group-hover:shadow-lg ${link.shadow} transition-all duration-300`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 leading-tight mb-1">
                  {t.adminDetails?.[link.label.replace(/ & /g, '').replace(/ /g, '').replace(/^./, str => str.toLowerCase()) as keyof typeof t.adminDetails] || link.label}
                </span>
                <span className="text-xs text-slate-400 leading-tight hidden sm:block">
                  {t.adminDetails?.[`${link.label.replace(/ & /g, '').replace(/ /g, '').replace(/^./, str => str.toLowerCase())}Desc` as keyof typeof t.adminDetails] || link.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Owner Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="lg:col-span-2 border border-slate-100 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100 rounded-t-xl">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                <div className="p-1.5 bg-blue-500 rounded-lg text-white">
                  <Users className="w-4 h-4" />
                </div>
                {t.adminDetails?.recentRegistrations || "Recent Owner Registrations"}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/admin/owners")}
                className="text-xs h-8"
              >
                {t.adminDetails?.viewAll || "View All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {(recentOwners || []).length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">{t.adminDetails?.noRecentRegistrations || "No recent registrations"}</p>
            ) : (
              (recentOwners || []).slice(0, 5).map((owner) => (
                <div
                  key={owner.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200 cursor-pointer group"
                  onClick={() => navigate("/dashboard/admin/owners")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 ring-2 ring-slate-200 group-hover:ring-blue-300 transition-all duration-200 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                        {(owner.ownerName || "UO")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                        {owner.businessName || "Unknown Business"}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{owner.ownerName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-semibold text-slate-700">
                        {owner.totalProperties ?? 0} pensions
                      </div>
                    </div>
                    <Badge className={`flex items-center gap-1 text-xs px-2 py-0.5 ${getStatusColor(owner.status)}`}>
                      {getStatusIcon(owner.status)}
                      {owner.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Alerts Sidebar Panel */}
        {/* <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100 rounded-t-xl">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                <div className="p-1.5 bg-red-500 rounded-lg text-white">
                  <Bell className="w-4 h-4" />
                </div>
                System Alerts
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/admin/alerts")}
                className="text-xs h-8"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {(alerts || []).length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">All clear! No active alerts.</p>
              </div>
            ) : (
              (alerts || []).slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border-l-4 text-xs ${alert.severity === "high" || alert.severity === "critical"
                    ? "bg-red-50 border-red-400"
                    : alert.severity === "medium"
                      ? "bg-yellow-50 border-yellow-400"
                      : "bg-slate-50 border-slate-300"
                    }`}
                >
                  <div className="font-semibold text-slate-800 mb-0.5">{alert.title}</div>
                  <div className="text-slate-500 line-clamp-2">{alert.message}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
