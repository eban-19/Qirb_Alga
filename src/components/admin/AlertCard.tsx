import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye, Search } from "lucide-react";

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

interface AlertCardProps {
  alert: SystemAlert;
  onView?: (alert: SystemAlert) => void;
  onInvestigate?: (alert: SystemAlert) => void;
}

export function AlertCard({ alert, onView, onInvestigate }: AlertCardProps) {
  return (
    <Card className={`border-l-4 ${
      alert.severity === 'critical' ? 'border-l-red-500' :
      alert.severity === 'high' ? 'border-l-orange-500' :
      alert.severity === 'medium' ? 'border-l-yellow-500' :
      'border-l-blue-500'
    } hover:shadow-lg transition-shadow duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`w-4 h-4 ${
                alert.severity === 'critical' ? 'text-red-500' :
                alert.severity === 'high' ? 'text-orange-500' :
                alert.severity === 'medium' ? 'text-yellow-500' :
                'text-blue-500'
              }`} />
              <span className="font-semibold text-slate-900">{alert.title}</span>
              <Badge className={
                alert.status === 'open' ? 'bg-red-100 text-red-800' :
                alert.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }>
                {alert.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Severity: {alert.severity}</span>
              <span>Created: {alert.createdAt}</span>
              {alert.relatedEntity && <span>Entity: {alert.relatedEntity}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onView?.(alert)}
              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            {alert.status === 'open' && (
              <Button 
                size="sm"
                onClick={() => onInvestigate?.(alert)}
                className="hover:bg-orange-600 hover:text-white transition-colors duration-200"
              >
                <Search className="w-3 h-3 mr-1" />
                Investigate
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
