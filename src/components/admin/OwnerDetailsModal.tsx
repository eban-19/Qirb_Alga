import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Mail, Phone, Building, Calendar, CheckCircle, Clock, XCircle, FileText, Shield, User } from "lucide-react";

interface PensionOwner {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessEmail?: string;
  businessPhone?: string;
  businessId: string;
  status: "pending" | "verified" | "rejected" | "suspended";
  registrationDate: string;
  totalProperties: number;
  totalRevenue: number;
  rating: number;
  documentStatus: "pending" | "approved" | "rejected";
  lastActive: string;
  licenseNumber?: string;
  documentUrl?: string;
}

interface OwnerDetailsModalProps {
  owner: PensionOwner | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify?: (ownerId: string) => void;
  onReject?: (ownerId: string) => void;
}

export function OwnerDetailsModal({ 
  owner, 
  isOpen, 
  onClose, 
  onVerify, 
  onReject 
}: OwnerDetailsModalProps) {
  if (!owner) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'suspended':
        return <Shield className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Business Details
            </DialogTitle>
            <DialogDescription>
              View and manage business owner details and verification status
            </DialogDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Business Overview */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg">
                  <Building className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {owner.businessName || 'Unknown Business'}
                  </h3>
                  <p className="text-slate-600 mb-3">
                    Owned by {owner.ownerName || 'Unknown Owner'}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(owner.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(owner.status)}
                        <span className="font-semibold capitalize">{owner.status}</span>
                      </div>
                    </Badge>
                    <Badge className={getDocumentStatusColor(owner.documentStatus)}>
                      <FileText className="w-3 h-3 mr-1" />
                      <span className="font-semibold capitalize">{owner.documentStatus}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Business Email</span>
                  </div>
                  <p className="text-slate-900 font-medium">{owner.businessEmail || owner.email || 'No email'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Business Phone</span>
                  </div>
                  <p className="text-slate-900 font-medium">{owner.businessPhone || owner.phone || 'No phone'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building className="w-4 h-4" />
                    <span className="text-sm font-medium">Owner Name</span>
                  </div>
                  <p className="text-slate-900 font-medium">{owner.ownerName || 'Unknown'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Personal Email</span>
                  </div>
                  <p className="text-slate-900 font-medium">{owner.email || 'No email'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Business Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Registration Date</span>
                  </div>
                  <p className="text-slate-900 font-medium">{owner.registrationDate || 'Unknown'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building className="w-4 h-4" />
                    <span className="text-sm font-medium">Total Properties</span>
                  </div>
                  <p className="text-slate-900 font-medium">{owner.totalProperties || 0} properties</p>
                </div>
                {owner.licenseNumber && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">License Number</span>
                    </div>
                    <p className="text-slate-900 font-medium">{owner.licenseNumber}</p>
                  </div>
                )}
                {owner.documentUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">License Document</span>
                    </div>
                    <a 
                      href={owner.documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      View Document
                    </a>
                  </div>
                )}
                {(owner.rating || 0) > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-sm font-medium">Rating</span>
                    </div>
                    <p className="text-slate-900 font-medium">⭐ {owner.rating}/5</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Close
            </Button>
            {owner.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => onReject?.(owner.id)}
                  className="px-6"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => onVerify?.(owner.id)}
                  className="px-6 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
