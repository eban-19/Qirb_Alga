import { Building, X, CheckCircle, Clock, XCircle, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PensionOwner } from "@/types/admin";
import { useLanguage } from "@/hooks/use-language";

interface OwnerDetailsModalProps {
  selectedOwner: PensionOwner;
  setShowOwnerDetails: (show: boolean) => void;
  handleOwnerAction: (action: string, id: string) => void;
}

export const OwnerDetailsModal = ({ selectedOwner, setShowOwnerDetails, handleOwnerAction }: OwnerDetailsModalProps) => {
  const { t } = useLanguage();
  // Helper function to get full document URL
  const getDocumentUrl = (documentPath: string) => {
    if (!documentPath) return '';
    // If it's already a full URL, return as is
    if (documentPath.startsWith('http')) return documentPath;
    // Otherwise, prepend backend URL
    return `http://localhost:3006${documentPath}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedOwner.businessName}</h2>
                <p className="text-blue-100">{t.adminDetails?.businessInfo || "Business Details"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOwnerDetails(false)}
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Business Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">{t.adminDetails?.businessInfo || "Business Information"}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.businessName || "Business Name"}</p>
                  <p className="text-slate-900 font-medium">{selectedOwner.businessName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.businessEmail || "Business Email"}</p>
                  <p className="text-slate-900 font-medium">{selectedOwner.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.businessPhone || "Business Phone"}</p>
                  <p className="text-slate-900 font-medium">{selectedOwner.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.licenseNumber || "License Number"}</p>
                  <p className="text-slate-900 font-medium">{selectedOwner.licenseNumber || t.adminDetails?.notProvided || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">{t.adminDetails?.ownerInfo || "Owner Information"}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.ownerName || "Owner Name"}</p>
                  <p className="text-slate-900 font-medium">{selectedOwner.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.regDate || "Registration Date"}</p>
                  <p className="text-slate-900 font-medium">{selectedOwner.registrationDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.docStatus || "Document Status"}</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedOwner.documentStatus === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : selectedOwner.documentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedOwner.documentStatus === 'approved' && <CheckCircle className="w-4 h-4" />}
                    {selectedOwner.documentStatus === 'pending' && <Clock className="w-4 h-4" />}
                    {selectedOwner.documentStatus === 'rejected' && <XCircle className="w-4 h-4" />}
                    {t.adminDetails?.document || "Document"} {selectedOwner.documentStatus}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.idDocument || "ID Document"}</p>
                  {selectedOwner.documentUrl ? (
                    <a 
                      href={getDocumentUrl(selectedOwner.documentUrl)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {t.adminDetails?.viewDocument || "View Document"}
                    </a>
                  ) : (
                    <p className="text-slate-500 italic">{t.adminDetails?.noDocUploaded || "No document uploaded"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Business Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">{t.adminDetails?.businessStatus || "Business Status"}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.approvalStatus || "Approval Status"}</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedOwner.status === 'verified' 
                      ? 'bg-green-100 text-green-800'
                      : selectedOwner.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedOwner.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOwner.status === 'verified' && <CheckCircle className="w-4 h-4" />}
                    {selectedOwner.status === 'pending' && <Clock className="w-4 h-4" />}
                    {selectedOwner.status === 'rejected' && <XCircle className="w-4 h-4" />}
                    {selectedOwner.status}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.totalProperties || "Total Properties"}</p>
                  <p className="text-slate-900 font-medium">{selectedOwner.totalProperties}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">{t.adminDetails?.performance || "Performance"}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.totalRevenue || "Total Revenue"}</p>
                  <p className="text-slate-900 font-medium">${selectedOwner.totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.rating || "Rating"}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < selectedOwner.rating 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                    <span className="text-slate-900 font-medium ml-2">{selectedOwner.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">{t.adminDetails?.quickActions || "Quick Actions"}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.lastActive || "Last Active"}</p>
                  <p className="text-slate-900 font-medium">{selectedOwner.lastActive}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{t.adminDetails?.businessId || "Business ID"}</p>
                  <p className="text-slate-900 font-medium">{selectedOwner.businessId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6 flex gap-3">
            {/* Debug: Show current status */}
            <div className="text-xs text-gray-500 mb-2 hidden">
              Debug: Current status = "{selectedOwner.status}"
            </div>
            
            {selectedOwner.status === 'pending' && (
              <>
                <Button
                  onClick={() => {
                    handleOwnerAction('verify', selectedOwner.id);
                    setShowOwnerDetails(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t.adminDetails?.approveBusiness || "Approve Business"}
                </Button>
                <Button
                  onClick={() => {
                    handleOwnerAction('reject', selectedOwner.id);
                    setShowOwnerDetails(false);
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {t.adminDetails?.rejectBusiness || "Reject Business"}
                </Button>
              </>
            )}
            
            <Button
              onClick={() => setShowOwnerDetails(false)}
              variant="outline"
              className="flex-1"
            >
              {t.adminDetails?.close || "Close"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
