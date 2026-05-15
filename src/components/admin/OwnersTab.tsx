import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import { Checkbox } from "@/components/ui/checkbox";

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { Search, Plus, Users, Shield, TrendingUp, Eye, Edit, Trash2, MoreHorizontal, ChevronDown, Check, X, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

import { OwnerCard } from "./OwnerCard";

import { OwnerForm } from "./OwnerForm";



interface PensionOwner {

  id: string;

  businessName: string;

  ownerName: string;

  email: string;

  phone: string;

  businessId: string;

  status: "pending" | "verified" | "approved" | "rejected" | "suspended";

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

  onBulkOwnerAction?: (action: string, ownerIds: string[], onSuccess: () => void) => void;

}



export function OwnersTab({ 

  owners, 

  searchTerm, 

  filterStatus, 

  onSearchChange, 

  onFilterChange, 

  onOwnerAction,

  onBulkOwnerAction

}: OwnersTabProps) {

  const [showForm, setShowForm] = useState(false);

  const [selectedOwner, setSelectedOwner] = useState<PensionOwner | undefined>();
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isBulkLoading, setIsBulkLoading] = useState<string | null>(null);

  const handleBulkAction = (action: string) => {
    if (!onBulkOwnerAction) return;
    setIsBulkLoading(action);
    onBulkOwnerAction(action, Array.from(selectedOwnerIds), () => {
      setSelectedOwnerIds(new Set());
      setIsBulkLoading(null);
    });
  };



  // Filter owners based on search and status

  const filteredOwners = owners.filter(owner => {

    const matchesSearch = owner.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||

                         owner.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||

                         owner.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || owner.status === filterStatus;

    return matchesSearch && matchesStatus;

  });

  // Handle individual row selection
  const handleRowSelect = (ownerId: string, checked: boolean) => {
    setSelectedOwnerIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(ownerId);
      } else {
        newSet.delete(ownerId);
      }
      return newSet;
    });
  };

  // Handle select all/deselect all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOwnerIds(new Set(filteredOwners.map(o => o.id)));
    } else {
      setSelectedOwnerIds(new Set());
    }
  };

  // Calculate header checkbox state
  const allSelected = filteredOwners.length > 0 && selectedOwnerIds.size === filteredOwners.length;
  const someSelected = selectedOwnerIds.size > 0 && selectedOwnerIds.size < filteredOwners.length;
  const isIndeterminate = someSelected;

  // Pagination
  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOwners = filteredOwners.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedOwnerIds(new Set()); // Clear selection when changing pages
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedOwnerIds(new Set());
  }, [searchTerm, filterStatus]);



  // const handleCreateOwner = () => {

  //   setSelectedOwner(undefined);

  //   setShowForm(true);

  // };



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

          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg sm:ml-4">

            <Users className="w-6 h-6" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-slate-900">Owners Management</h2>

            <p className="text-slate-600">Manage pension property owners and verify businesses</p>

          </div>

        </div>

        

        {/* <Button 

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

        </Button> */}

      </div>



      {/* Enhanced Search and Filter - More Compact */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Search owners..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 text-sm bg-white/80 backdrop-blur-sm border-2 border-white/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 rounded-lg shadow-md"
          />
        </div>
        <Select value={filterStatus} onValueChange={onFilterChange}>
          <SelectTrigger className="w-48 h-10 text-sm bg-white/80 backdrop-blur-sm border-2 border-white/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 rounded-lg shadow-md">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-xl border-2 border-white/50 shadow-2xl rounded-xl">
            <SelectItem value="all" className="font-semibold">All</SelectItem>
            <SelectItem value="pending" className="font-semibold">Pending</SelectItem>
            <SelectItem value="verified" className="font-semibold">Verified</SelectItem>
            <SelectItem value="rejected" className="font-semibold">Rejected</SelectItem>
            <SelectItem value="suspended" className="font-semibold">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center text-sm text-slate-600">
          <span>Total Results: </span>
          <span className="font-semibold">{filteredOwners.length}</span>
        </div>
      </div>

      {/* Owners List */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-3xl opacity-50"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-2xl">
          <div className="p-8">
            {/* Bulk Actions Toolbar */}
            {selectedOwnerIds.size > 0 && (
              <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
                    {selectedOwnerIds.size} selected
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleBulkAction('approve')}
                      disabled={isBulkLoading !== null}
                    >
                      {isBulkLoading === 'approve' ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleBulkAction('reject')}
                      disabled={isBulkLoading !== null}
                    >
                      {isBulkLoading === 'reject' ? 'Rejecting...' : 'Reject'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-amber-600 border-amber-200 hover:bg-amber-50"
                      onClick={() => handleBulkAction('suspend')}
                      disabled={isBulkLoading !== null}
                    >
                      {isBulkLoading === 'suspend' ? 'Suspending...' : 'Suspend'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => handleBulkAction('reactivate')}
                      disabled={isBulkLoading !== null}
                    >
                      {isBulkLoading === 'reactivate' ? 'Reactivating...' : 'Reactivate'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${selectedOwnerIds.size} owners?`)) {
                          handleBulkAction('delete');
                        }
                      }}
                      disabled={isBulkLoading !== null}
                    >
                      {isBulkLoading === 'delete' ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedOwnerIds(new Set())}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              </div>
            )}

            {/* Enhanced Table Layout */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-slate-200">
                    <TableHead className="font-bold text-slate-900 py-4 px-6 w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all owners"
                        className="rounded data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-600"
                      />
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6">Owner</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6">Business</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6">Contact</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6">Properties</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6">Revenue</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6">Status</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOwners.map((owner) => (
                    <TableRow key={owner.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <TableCell className="py-4 px-6">
                        <Checkbox
                          checked={selectedOwnerIds.has(owner.id)}
                          onCheckedChange={(checked) => handleRowSelect(owner.id, checked as boolean)}
                          aria-label={`Select owner ${owner.ownerName}`}
                          className="rounded data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-600"
                        />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {owner.ownerName ? owner.ownerName.charAt(0).toUpperCase() : 'O'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{owner.ownerName || 'N/A'}</div>
                            <div className="text-sm text-slate-500">ID: {owner.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div>
                          <div className="font-medium text-slate-900">{owner.businessName || 'N/A'}</div>
                          <div className="text-sm text-slate-500">{owner.businessId || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div>
                          <div className="text-sm text-slate-900">{owner.email}</div>
                          <div className="text-sm text-slate-500">{owner.phone || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="text-center">
                          <div className="font-semibold text-slate-900">{owner.totalProperties || 0}</div>
                          <div className="text-sm text-slate-500">properties</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">
                            ${owner.totalRevenue ? owner.totalRevenue.toLocaleString() : '0'}
                          </div>
                          <div className="text-sm text-slate-500">total</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge className={`${
                          owner.status === 'verified' ? 'bg-green-100 text-green-800' :
                          owner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          owner.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {owner.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-blue-50 hover:border-blue-300 flex items-center gap-2 px-3 py-1.5 text-sm"
                              >
                                <span>Actions</span>
                                <ChevronDown className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {/* Show Approve/Reject only for pending owners */}
                              {owner.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => onOwnerAction("approve", owner.id, owner)}
                                    className="flex items-center gap-2 text-green-600 hover:bg-green-50"
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>Approve</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => onOwnerAction("reject", owner.id, owner)}
                                    className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4" />
                                    <span>Reject</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              
                              {/* Show Suspend only for approved/verified owners */}
                              {(owner.status === 'verified' || owner.status === 'approved') && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => onOwnerAction("suspend", owner.id, owner)}
                                    className="flex items-center gap-2 text-orange-600 hover:bg-orange-50"
                                  >
                                    <Shield className="w-4 h-4" />
                                    <span>Suspend</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              
                              {/* Show Reactivate only for suspended owners */}
                              {owner.status === 'suspended' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => onOwnerAction("reactivate", owner.id, owner)}
                                    className="flex items-center gap-2 text-green-600 hover:bg-green-50"
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>Reactivate</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              
                              {/* Always show View Details and Delete */}
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('=== Dropdown View Details clicked ===');
                                  onOwnerAction("view", owner.id, owner);
                                }}
                                className="flex items-center gap-2 text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteOwner(owner.id)}
                                className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredOwners.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-slate-500 text-lg">No owners found</div>
                  <div className="text-slate-400 text-sm mt-2">Try adjusting your search or filter criteria</div>
                </div>
              )}

              {/* Pagination */}
              {filteredOwners.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredOwners.length)} of {filteredOwners.length} owners
                    </span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-24 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 per page</SelectItem>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="20">20 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`h-8 w-8 ${currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
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
};

