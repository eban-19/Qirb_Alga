import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Users, Shield, TrendingUp } from "lucide-react";
import { OwnerCard } from "./OwnerCard";
import { OwnerForm } from "./OwnerForm";

interface PensionOwner {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessId: string;
  status: "pending" | "verified" | "rejected" | "suspended";
  registrationDate: string;
  totalProperties: number;
  totalRevenue: number;
  rating: number;
  documentStatus: "pending" | "approved" | "rejected";
  lastActive: string;
}

interface OwnersTabProps {
  owners: PensionOwner[];
  searchTerm: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onOwnerAction: (action: string, ownerId: string, owner?: PensionOwner) => void;
}

export function OwnersTab({ 
  owners, 
  searchTerm, 
  filterStatus, 
  onSearchChange, 
  onFilterChange, 
  onOwnerAction 
}: OwnersTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<PensionOwner | undefined>();

  // Filter owners based on search and status
  const filteredOwners = owners.filter(owner => {
    const matchesSearch = owner.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         owner.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         owner.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || owner.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOwner = () => {
    setSelectedOwner(undefined);
    setShowForm(true);
  };

  const handleEditOwner = (owner: PensionOwner) => {
    setSelectedOwner(owner);
    setShowForm(true);
  };

  const handleSaveOwner = (owner: PensionOwner) => {
    if (owner.id) {
      onOwnerAction("update", owner.id, owner);
    } else {
      onOwnerAction("create", "", owner);
    }
  };

  const handleDeleteOwner = (ownerId: string) => {
    if (confirm("Are you sure you want to delete this owner?")) {
      onOwnerAction("delete", ownerId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with prominent CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Owners Management</h2>
            <p className="text-slate-600">Manage pension property owners and verify businesses</p>
          </div>
        </div>
        
        <Button 
          onClick={handleCreateOwner}
          size="lg"
          className="
            relative
            overflow-hidden
            bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 
            hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 
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
            border-blue-800
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
            <span>Add New Owner</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </span>
        </Button>
      </div>

      {/* Enhanced Search and Filter */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-3xl opacity-50"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/50 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <Input
                placeholder="Search owners by name, business, or email..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-16 h-14 text-lg bg-white/80 backdrop-blur-sm border-2 border-white/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 rounded-2xl shadow-lg"
              />
            </div>
            <Select value={filterStatus} onValueChange={onFilterChange}>
              <SelectTrigger className="w-full lg:w-80 h-14 text-lg bg-white/80 backdrop-blur-sm border-2 border-white/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 rounded-2xl shadow-lg">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-2 border-white/50 shadow-2xl rounded-2xl">
                <SelectItem value="all" className="font-semibold">🔍 All Status</SelectItem>
                <SelectItem value="pending" className="font-semibold">⏳ Pending Verification</SelectItem>
                <SelectItem value="verified" className="font-semibold">✅ Verified</SelectItem>
                <SelectItem value="rejected" className="font-semibold">❌ Rejected</SelectItem>
                <SelectItem value="suspended" className="font-semibold">⚠️ Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Hero Section with Stats */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl opacity-10"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/50 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Pending Verification */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 mx-auto mb-4">
                  <Shield className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300 mx-auto" />
                </div>
                <div className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-orange-200 transition-all duration-300">
                  {owners.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-orange-100 text-sm font-semibold group-hover:text-white transition-colors duration-300">Pending Verification</div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div className="text-xs text-yellow-300 font-semibold">Requires attention</div>
                </div>
              </div>
            </div>

            {/* Verified Owners */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-rotate-1 transition-all duration-500 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 mx-auto mb-4">
                  <Users className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300 mx-auto" />
                </div>
                <div className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-emerald-200 transition-all duration-300">
                  {owners.filter(o => o.status === 'verified').length}
                </div>
                <div className="text-emerald-100 text-sm font-semibold group-hover:text-white transition-colors duration-300">Verified Owners</div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="text-xs text-green-300 font-semibold">Active accounts</div>
                </div>
              </div>
            </div>

            {/* Total Properties */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 mx-auto mb-4">
                  <Plus className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300 mx-auto" />
                </div>
                <div className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-purple-200 transition-all duration-300">
                  {owners.reduce((sum, o) => sum + o.totalProperties, 0)}
                </div>
                <div className="text-purple-100 text-sm font-semibold group-hover:text-white transition-colors duration-300">Total Properties</div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <div className="text-xs text-purple-300 font-semibold">Portfolio size</div>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl p-6 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-rotate-1 transition-all duration-500 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300 mx-auto" />
                </div>
                <div className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-indigo-200 transition-all duration-300">
                  ${owners.reduce((sum, o) => sum + o.totalRevenue, 0).toLocaleString()}
                </div>
                <div className="text-indigo-100 text-sm font-semibold group-hover:text-white transition-colors duration-300">Total Revenue</div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="text-xs text-blue-300 font-semibold">Monthly earnings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Owners List */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-3xl opacity-50"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-2xl">
          <div className="p-8">
            {/* Enhanced Header */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600 rounded-2xl opacity-10"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-50"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 mb-1">Owners Directory</h3>
                      <p className="text-slate-600 text-lg">Manage and verify property owners efficiently</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-slate-900 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                      {filteredOwners.length}
                    </div>
                    <div className="text-slate-600 font-semibold">Total Results</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOwners.map((owner) => (
                <div key={owner.id} className="group">
                  <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-6">
                      <OwnerCard
                        owner={owner}
                        onAction={(action) => {
                          if (action === "edit") {
                            handleEditOwner(owner);
                          } else if (action === "delete") {
                            handleDeleteOwner(owner.id);
                          } else {
                            onOwnerAction(action, owner.id);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Enhanced Empty State */}
            {filteredOwners.length === 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-3xl opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-12 border-2 border-slate-200 text-center">
                  <div className="relative w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full opacity-20 blur-xl"></div>
                    <Users className="w-16 h-16 text-slate-500" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3">No Owners Found</h3>
                  <p className="text-slate-600 text-lg mb-8">Try adjusting your search or filter criteria to find the owners you're looking for.</p>
                  <Button 
                    onClick={handleCreateOwner} 
                    className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                      <span>Add First Owner</span>
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Owner Form Modal */}
      <OwnerForm
        owner={selectedOwner}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveOwner}
      />
    </div>
  );
}
