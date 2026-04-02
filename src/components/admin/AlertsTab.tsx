import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Bell, AlertTriangle, CheckCircle, Clock, Archive, Plus } from "lucide-react";
import { AlertCard } from "./AlertCard";
import { AlertDetailModal } from "./AlertDetailModal";

interface SystemAlert {
  id: string;
  type: "verification" | "payment" | "complaint" | "system";
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "resolved" | "investigating";
  createdAt: string;
  relatedEntity?: string;
  entityType?: "owner" | "property" | "booking" | "guest";
}

interface AlertsTabProps {
  alerts: SystemAlert[];
}

export function AlertsTab({ alerts }: AlertsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Safe handling with fallbacks
  const safeAlerts = alerts || [];

  // Filter alerts based on search and filters
  const filteredAlerts = safeAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Calculate statistics
  const openAlerts = safeAlerts.filter(a => a?.status === 'open').length;
  const criticalAlerts = safeAlerts.filter(a => a?.severity === 'critical').length;
  const investigatingAlerts = safeAlerts.filter(a => a?.status === 'investigating').length;
  const resolvedAlerts = safeAlerts.filter(a => a?.status === 'resolved').length;

  // const handleCreateAlert = () => {
  //   // TODO: Implement alert creation modal
  //   console.log("Create new alert");
  // };

  const handleArchiveAll = () => {
    if (confirm("Archive all resolved alerts?")) {
      console.log("Archive all resolved alerts");
    }
  };

  const handleViewAlert = (alert: SystemAlert) => {
    setSelectedAlert(alert);
    setIsDetailModalOpen(true);
  };

  const handleInvestigateAlert = (alert: SystemAlert) => {
    // Update alert status to investigating
    alert.status = 'investigating';
    console.log("Investigating alert:", alert.id);
    // In a real app, you would make an API call here
    setSelectedAlert(alert);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAlert(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-lg sm:ml-4">
            <Bell className="w-6 h-6" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900">System Alerts</h2>
            <p className="text-slate-600">Monitor and manage system notifications</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* <Button 
            onClick={handleCreateAlert}
            size="lg"
            className="
              relative
              overflow-hidden
              bg-gradient-to-r from-red-600 via-red-700 to-pink-700 
              hover:from-red-700 hover:via-red-800 hover:to-pink-800 
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
              border-red-800
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
              <Plus className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" />
              <span>Create Alert</span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </span>
          </Button> */}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mx-4 sm:mx-6 md:mx-8">
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <Bell className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-900">{openAlerts}</div>
            <div className="text-sm text-red-700">Open Alerts</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">{criticalAlerts}</div>
            <div className="text-sm text-purple-700">Critical</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{investigatingAlerts}</div>
            <div className="text-sm text-blue-700">Investigating</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{resolvedAlerts}</div>
            <div className="text-sm text-green-700">Resolved</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-2 border-slate-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search alerts by title or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-2 border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-200"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full lg:w-48 h-12 text-base border-2 border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-200">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🔔 All Severity</SelectItem>
                <SelectItem value="critical">🚨 Critical</SelectItem>
                <SelectItem value="high">⚠️ High</SelectItem>
                <SelectItem value="medium">📋 Medium</SelectItem>
                <SelectItem value="low">ℹ️ Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-48 h-12 text-base border-2 border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📋 All Status</SelectItem>
                <SelectItem value="open">🔴 Open</SelectItem>
                <SelectItem value="investigating">🟡 Investigating</SelectItem>
                <SelectItem value="resolved">🟢 Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card className="border-2 border-slate-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b-2 border-slate-200">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-700" />
            Alerts Directory ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertCard 
                key={alert.id} 
                alert={alert}
                onView={handleViewAlert}
                onInvestigate={handleInvestigateAlert}
              />
            ))}
            {/* {filteredAlerts.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No alerts found</h3>
                <p className="text-slate-500 mb-4">Try adjusting your search or filter criteria</p>
                <Button onClick={handleCreateAlert} variant="outline" className="hover:bg-red-50 hover:border-red-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Alert
                </Button>
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        onInvestigate={handleInvestigateAlert}
      />
    </div>
  );
}
