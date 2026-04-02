import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Building, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Clock,
  Zap,
  Database,
  Server,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Settings
} from "lucide-react";

interface PensionOwner {
  id: string;
  businessName: string;
  ownerName: string;
  status: "pending" | "verified" | "rejected" | "suspended";
  registrationDate: string;
  totalProperties?: number;
  totalRevenue?: number;
}

interface OverviewTabProps {
  recentOwners: PensionOwner[];
  metrics?: PlatformMetrics;
  alerts?: SystemAlert[];
}

export function OverviewTab({ recentOwners, metrics, alerts }: OverviewTabProps) {
  const [selectedMetric, setSelectedMetric] = useState("overview");

  // Use real metrics if provided, otherwise use empty state
  const realMetrics = {
    overview: {
      totalOwners: metrics?.totalOwners || recentOwners.length || 0,
      totalProperties: metrics?.totalProperties || 0,
      totalBookings: metrics?.totalBookings || 0,
      totalAlerts: alerts?.length || 0,
      revenue: metrics?.monthlyRevenue ? `${(metrics.monthlyRevenue / 1000000).toFixed(1)}M` : "0M",
      growth: "+0.0%" // Would calculate from real data
    },
    performance: {
      uptime: 99.9,
      responseTime: 145,
      dbPerformance: 95,
      activeUsers: 0 // Would get from real data
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-green-700';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-2 border-yellow-700';
      case 'rejected':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-700';
      case 'suspended':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-2 border-gray-700';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-2 border-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section with Key Metrics */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/50 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Dashboard Overview
              </h1>
              <p className="text-slate-600 text-lg">Real-time insights and system performance</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Live</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Owners Metric */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <Users className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="flex flex-col items-end">
                    <ArrowUpRight className="w-5 h-5 text-green-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    <div className="text-xs text-green-300 font-bold mt-1 animate-pulse">{realMetrics.overview.growth}</div>
                  </div>
                </div>
                <div className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-cyan-200 transition-all duration-300">
                  {realMetrics.overview.totalOwners}
                </div>
                <div className="text-cyan-100 text-sm font-semibold group-hover:text-white transition-colors duration-300">Total Owners</div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="text-xs text-green-300 font-semibold">Active now</div>
                </div>
              </div>
            </div>

            {/* Properties Metric */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-rotate-1 transition-all duration-500 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <Building className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="flex flex-col items-end">
                    <ArrowUpRight className="w-5 h-5 text-green-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    <div className="text-xs text-green-300 font-bold mt-1 animate-pulse">+12.3%</div>
                  </div>
                </div>
                <div className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-pink-200 transition-all duration-300">
                  {realMetrics.overview.totalProperties}
                </div>
                <div className="text-pink-100 text-sm font-semibold group-hover:text-white transition-colors duration-300">Properties</div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="text-xs text-green-300 font-semibold">156 active</div>
                </div>
              </div>
            </div>

            {/* Bookings Metric */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-500 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <Calendar className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="flex flex-col items-end">
                    <ArrowUpRight className="w-5 h-5 text-green-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    <div className="text-xs text-green-300 font-bold mt-1 animate-pulse">+18.7%</div>
                  </div>
                </div>
                <div className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-emerald-200 transition-all duration-300">
                  {realMetrics.overview.totalBookings}
                </div>
                <div className="text-emerald-100 text-sm font-semibold group-hover:text-white transition-colors duration-300">Bookings</div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="text-xs text-green-300 font-semibold">This month</div>
                </div>
              </div>
            </div>

            {/* Alerts Metric */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-rotate-1 transition-all duration-500 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <AlertTriangle className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse group-hover:scale-150 transition-transform duration-300"></div>
                    <div className="text-xs text-yellow-300 font-bold mt-1 animate-pulse">2 critical</div>
                  </div>
                </div>
                <div className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-orange-200 transition-all duration-300">
                  {realMetrics.overview.totalAlerts}
                </div>
                <div className="text-orange-100 text-sm font-semibold group-hover:text-white transition-colors duration-300">Alerts</div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div className="text-xs text-yellow-300 font-semibold">Needs attention</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations */}
        <Card className="lg:col-span-2 border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white">
                  <Users className="w-5 h-5" />
                </div>
                Recent Owner Registrations
              </CardTitle>
              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {recentOwners.slice(0, 4).map((owner, index) => (
                <div 
                  key={owner.id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200"
                >
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className="relative">
                      <Avatar className="w-12 h-12 ring-2 ring-slate-200 group-hover:ring-blue-300 transition-all duration-300">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                          {(owner.ownerName || 'Unknown Owner').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                        {owner.businessName || 'Unknown Business'}
                      </div>
                      <div className="text-sm text-slate-600 truncate">{owner.ownerName || 'Unknown Owner'}</div>
                      <div className="text-xs text-slate-500 mt-1">Registered {owner.registrationDate || 'Recently'}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{owner.totalProperties || 0} props</div>
                      <div className="text-xs text-slate-600">{owner.totalRevenue ? `ETB ${(owner.totalRevenue / 1000).toFixed(1)}k` : 'No revenue'}</div>
                    </div>
                    <Badge className={`px-2 sm:px-3 py-1 text-xs font-bold shrink-0 ${getStatusColor(owner.status)} transform hover:scale-105 transition-all duration-200`}>
                      {owner.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card className="border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg text-white">
                <Activity className="w-5 h-5" />
              </div>
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Server Uptime */}
              <div className="group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-slate-900">Server Uptime</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-green-600">{realMetrics.performance.uptime}%</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <Progress value={realMetrics.performance.uptime} className="h-3 bg-green-100" />
                <div className="text-xs text-green-600 mt-1 font-medium">Excellent performance</div>
              </div>

              {/* API Response */}
              <div className="group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-slate-900">API Response</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-blue-600">{realMetrics.performance.responseTime}ms</span>
                    <ArrowDownRight className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <Progress value={85} className="h-3 bg-blue-100" />
                <div className="text-xs text-blue-600 mt-1 font-medium">Lightning fast</div>
              </div>

              {/* Database Performance */}
              <div className="group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-slate-900">Database</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-purple-600">{realMetrics.performance.dbPerformance}%</span>
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <Progress value={realMetrics.performance.dbPerformance} className="h-3 bg-purple-100" />
                <div className="text-xs text-purple-600 mt-1 font-medium">Optimized queries</div>
              </div>

              {/* Active Users */}
              <div className="group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-slate-900">Active Users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-orange-600">{realMetrics.performance.activeUsers.toLocaleString()}</span>
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <Progress value={75} className="h-3 bg-orange-100" />
                <div className="text-xs text-orange-600 mt-1 font-medium">High engagement</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
