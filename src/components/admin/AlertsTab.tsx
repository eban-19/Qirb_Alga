import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Bell, Archive } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

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
  onAlertAction: (action: string, alertId: string) => void;
}

export function AlertsTab({ alerts, onAlertAction }: AlertsTabProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  // Safe handling with fallbacks
  const safeAlerts = alerts || [];

  // Filter alerts based on search only
  const filteredAlerts = safeAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate essential statistics
  const openAlerts = safeAlerts.filter(a => a?.status === 'open').length;

  const handleArchiveAll = () => {
    if (confirm("Archive all resolved alerts?")) {
      console.log("Archive all resolved alerts");
    }
  };

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-lg">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t.adminTabs?.alerts?.title || "System Alerts"}</h2>
            <p className="text-slate-600">{openAlerts} {t.adminTabs?.alerts?.subtitle?.replace('Monitor ', '') || "open alerts"}</p>
          </div>
        </div>
        
        <Button 
          onClick={handleArchiveAll}
          variant="outline"
          className="border-red-200 hover:bg-red-50"
        >
          <Archive className="w-4 h-4 mr-2" />
          {t.adminTabs?.alerts?.archiveAll || "Archive Resolved"}
        </Button>
      </div>

      {/* Simple Search */}
      <Card className="border-2 border-slate-200 shadow-md">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder={t.adminTabs?.alerts?.searchPlaceholder || "Search alerts..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-2 border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Simple Alerts List */}
      <Card className="border-2 border-slate-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b-2 border-slate-200">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-700" />
            {t.adminTabs?.common?.properties ? t.adminTabs.alerts.title : "Alerts"} ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">{alert.title}</h3>
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 
                               alert.severity === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                      <Badge 
                        variant={alert.status === 'open' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {t.adminTabs?.common?.[alert.status] || alert.status}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-sm mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-slate-400 text-xs">{alert.createdAt}</p>
                      {alert.status !== 'resolved' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-[10px] text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => onAlertAction('resolve', alert.id)}
                          >
                            {t.adminTabs?.alerts?.markResolved || "Mark Resolved"}
                          </Button>
                          {alert.status === 'open' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => onAlertAction('investigate', alert.id)}
                            >
                              {t.adminTabs?.alerts?.investigate || "Investigate"}
                            </Button>
                          )}
                        </div>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                        onClick={() => onAlertAction('delete', alert.id)}
                      >
                        {t.adminTabs?.common?.delete || "Delete"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredAlerts.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">{t.adminTabs?.common?.noResultsFound || "No alerts found"}</h3>
                <p className="text-slate-500">{t.adminTabs?.common?.adjustSearch || "Try adjusting your search criteria"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
