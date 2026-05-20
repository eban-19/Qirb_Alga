import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye, Search, Clock, User, Building, Calendar, MessageSquare } from "lucide-react";
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

interface AlertDetailModalProps {
  alert: SystemAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onInvestigate?: (alert: SystemAlert) => void;
}

export function AlertDetailModal({ alert, isOpen, onClose, onInvestigate }: AlertDetailModalProps) {
  const { t } = useLanguage();
  if (!alert) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'verification': return <User className="w-5 h-5" />;
      case 'payment': return <Building className="w-5 h-5" />;
      case 'complaint': return <MessageSquare className="w-5 h-5" />;
      case 'system': return <AlertTriangle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className={`p-2 rounded-lg ${
              alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
              alert.severity === 'high' ? 'bg-orange-100 text-orange-600' :
              alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {getTypeIcon(alert.type)}
            </div>
            {alert.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alert Header */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={`px-3 py-1 font-semibold ${getSeverityColor(alert.severity)}`}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {alert.severity.toUpperCase()}
            </Badge>
            <Badge className={`px-3 py-1 font-semibold ${getStatusColor(alert.status)}`}>
              {alert.status.toUpperCase()}
            </Badge>
            <Badge className="px-3 py-1 bg-slate-100 text-slate-800 border-slate-200">
              {alert.type.toUpperCase()}
            </Badge>
          </div>

          {/* Alert Message */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">{t.adminDetails?.alertDetails || "Alert Details"}</h3>
            <p className="text-slate-700 leading-relaxed">{alert.message}</p>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <h4 className="font-semibold text-slate-900">{t.adminDetails?.timestamp || "Timestamp"}</h4>
              </div>
              <p className="text-slate-700">{alert.createdAt}</p>
            </div>

            {alert.relatedEntity && (
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  <h4 className="font-semibold text-slate-900">{t.adminDetails?.relatedEntity || "Related Entity"}</h4>
                </div>
                <p className="text-slate-700">{alert.relatedEntity}</p>
                {alert.entityType && (
                  <p className="text-sm text-slate-500 mt-1">{t.adminDetails?.type || "Type"}: {alert.entityType}</p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-sm text-slate-500">
              {t.adminDetails?.alertId || "Alert ID"}: {alert.id}
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 transition-colors duration-200 border-2 border-slate-300"
              >
                {t.adminDetails?.close || "Close"}
              </Button>
              
              {alert.status === 'open' && (
                <Button 
                  onClick={() => {
                    onInvestigate?.(alert);
                    onClose();
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {t.adminDetails?.resolveAlert || "Start Investigation"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
