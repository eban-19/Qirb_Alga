import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  Users, 
  Building, 
  Calendar,
  BarChart3,
  Activity,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from "lucide-react";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";

export default function DashboardAnalytics() {
  const {
    timeRange,
    setTimeRange,
    selectedMetric,
    analyticsData,
    topProperties,
    recentActivity,
    handleExportData,
    handleViewDetails
  } = useDashboardAnalytics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? 
      <ArrowUpRight className="w-4 h-4 text-green-600" /> : 
      <ArrowDownRight className="w-4 h-4 text-red-600" />;
  };

  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'registration':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'review':
        return <Eye className="w-4 h-4 text-yellow-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white shadow-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-600">Monitor performance and business insights</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 h-12 border-2 border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleExportData}
            size="lg"
            className="
              relative
              overflow-hidden
              bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 
              hover:from-indigo-700 hover:via-indigo-800 hover:to-purple-800 
              text-white 
              font-bold 
              px-8 
              py-4 
              text-lg
              shadow-xl 
              hover:shadow-2xl 
              transform 
              hover:scale-105 
              transition-all 
              duration-300
              border-2 
              border-indigo-800
              rounded-xl
              before:absolute
              before:inset-0
              before:bg-gradient-to-r
              before:from-white/20
              before:to-transparent
              before:opacity-0
              hover:before:opacity-100
              before:transition-opacity
              before:duration-300
              active:scale-95
              group
            "
          >
            <span className="relative z-10 flex items-center gap-3">
              <Download className="w-6 h-6 transform group-hover:translate-y-[-2px] transition-transform duration-300" />
              <span>Export Report</span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleViewDetails('revenue')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              {getTrendIcon(analyticsData.revenue.trend)}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-700">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(analyticsData.revenue.current)}</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.revenue.trend)}`}>
                  {analyticsData.revenue.change > 0 ? '+' : ''}{analyticsData.revenue.change}%
                </span>
                <span className="text-xs text-slate-600">vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleViewDetails('bookings')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              {getTrendIcon(analyticsData.bookings.trend)}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-700">Total Bookings</p>
              <p className="text-2xl font-bold text-blue-900">{analyticsData.bookings.current.toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.bookings.trend)}`}>
                  {analyticsData.bookings.change > 0 ? '+' : ''}{analyticsData.bookings.change}%
                </span>
                <span className="text-xs text-slate-600">vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleViewDetails('properties')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              {getTrendIcon(analyticsData.properties.trend)}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-700">Active Properties</p>
              <p className="text-2xl font-bold text-purple-900">{analyticsData.properties.current}</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.properties.trend)}`}>
                  {analyticsData.properties.change > 0 ? '+' : ''}{analyticsData.properties.change}%
                </span>
                <span className="text-xs text-slate-600">vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleViewDetails('users')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              {getTrendIcon(analyticsData.users.trend)}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-orange-700">Active Users</p>
              <p className="text-2xl font-bold text-orange-900">{analyticsData.users.current.toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.users.trend)}`}>
                  {analyticsData.users.change > 0 ? '+' : ''}{analyticsData.users.change}%
                </span>
                <span className="text-xs text-slate-600">vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Properties */}
        <Card className="border-2 border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b-2 border-slate-200">
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-700" />
              Top Performing Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {topProperties.map((property, index) => (
                <div key={property.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-700">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{property.name}</p>
                      <p className="text-sm text-slate-600">{property.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(property.revenue)}</p>
                    <p className="text-sm text-slate-600">{property.occupancyRate}% occupancy</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2 border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b-2 border-slate-200">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-700" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="p-2 bg-white rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{activity.description}</p>
                    <p className="text-sm text-slate-600">{activity.timestamp}</p>
                    {activity.amount && (
                      <p className="text-sm font-bold text-green-700">{formatCurrency(activity.amount)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
