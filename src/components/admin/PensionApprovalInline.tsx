import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface Pension {
  pension_id: number;
  id: number; // Backend sends this field
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  status: 'pending' | 'active' | 'inactive';
  rejection_reason?: string;
  reviewed_at?: string;
  owner_name: string;
  owner_email: string;
  created_at: string;
}

const PensionApprovalInline: React.FC = () => {
  const [pensions, setPensions] = useState<Pension[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'inactive'>('all');
  const [selectedPension, setSelectedPension] = useState<Pension | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedPensionIds, setSelectedPensionIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (selectedPension) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPension]);

  // Fetch pensions
  const fetchPensions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = 'http://localhost:3005/api/admin/pensions/all';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPensions(data.data || []);
      } else {
        console.error('Failed to fetch pensions');
      }
    } catch (error) {
      console.error('Error fetching pensions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPensions();
  }, [filter]);

  // Handle approve
  const handleApprove = async (pensionId: number) => {
    try {
      setActionLoading(`approve-${pensionId}`);
      const token = localStorage.getItem('token');
      
      // Debug: Check what's in selectedPension
      console.log('🔍 Approve button clicked - pensionId:', pensionId);
      console.log('🔍 selectedPension object:', selectedPension);
      console.log('🔍 selectedPension.pension_id:', selectedPension?.pension_id);
      console.log('🔍 selectedPension.id:', selectedPension?.id);
      
      const response = await fetch(`http://localhost:3005/api/admin/pensions/${pensionId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Update local state
        setPensions(prev => prev.map(p => 
          (p.pension_id === pensionId || p.id === pensionId)
            ? { ...p, status: 'active', reviewed_at: new Date().toISOString() }
            : p
        ));
        setSelectedPension(null);
      } else {
        alert('Failed to approve pension');
      }
    } catch (error) {
      console.error('Error approving pension:', error);
      alert('Error approving pension');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject
  const handleReject = async (pensionId: number, reason: string) => {
    if (!reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      setActionLoading(`reject-${pensionId}`);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3005/api/admin/pensions/${pensionId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: reason })
      });
      
      if (response.ok) {
        // Update local state
        setPensions(prev => prev.map(p => 
          (p.pension_id === pensionId || p.id === pensionId)
            ? { ...p, status: 'inactive', rejection_reason: reason, reviewed_at: new Date().toISOString() }
            : p
        ));
        setSelectedPension(null);
        setRejectionReason('');
      } else {
        alert('Failed to reject pension');
      }
    } catch (error) {
      console.error('Error rejecting pension:', error);
      alert('Error rejecting pension');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const filteredPensions = pensions.filter(pension =>
    filter === 'all' || pension.status === filter
  );

  // Handle individual row selection
  const handleRowSelect = (pensionId: number, checked: boolean) => {
    setSelectedPensionIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(pensionId);
      } else {
        newSet.delete(pensionId);
      }
      return newSet;
    });
  };

  // Handle select all/deselect all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPensionIds(new Set(filteredPensions.map(p => p.pension_id || p.id)));
    } else {
      setSelectedPensionIds(new Set());
    }
  };

  // Calculate header checkbox state
  const allSelected = filteredPensions.length > 0 && selectedPensionIds.size === filteredPensions.length;
  const someSelected = selectedPensionIds.size > 0 && selectedPensionIds.size < filteredPensions.length;

  // Pagination
  const totalPages = Math.ceil(filteredPensions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPensions = filteredPensions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedPensionIds(new Set()); // Clear selection when changing pages
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

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedPensionIds(new Set());
  }, [filter]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pension Approval Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pensions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pension List */}
          {loading ? (
            <div className="text-center py-8">Loading pensions...</div>
          ) : filteredPensions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No pensions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all pensions"
                      className="rounded data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-600"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPensions.map((pension) => (
                  <TableRow key={pension.pension_id || pension.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPensionIds.has(pension.pension_id || pension.id)}
                        onCheckedChange={(checked) => handleRowSelect(pension.pension_id || pension.id, checked as boolean)}
                        aria-label={`Select pension ${pension.name}`}
                        className="rounded data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-600"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{pension.name}</TableCell>
                    <TableCell>{pension.owner_name}</TableCell>
                    <TableCell>{getStatusBadge(pension.status)}</TableCell>
                    <TableCell>{format(new Date(pension.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPension(pension)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        {pension.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(pension.pension_id || pension.id)}
                              disabled={actionLoading === `approve-${pension.pension_id || pension.id}`}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {actionLoading === `approve-${pension.pension_id || pension.id}` ? 'Approving...' : 'Approve'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setSelectedPension(pension)}
                              disabled={actionLoading === `reject-${pension.pension_id || pension.id}`}
                            >
                              {actionLoading === `reject-${pension.pension_id || pension.id}` ? 'Rejecting...' : 'Reject'}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {filteredPensions.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredPensions.length)} of {filteredPensions.length} pensions
                </span>
                <Select value={itemsPerPage.toString()} onValueChange={(value: any) => {
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
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedPension && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 pt-8" onClick={() => setSelectedPension(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPension.name}</h2>
                  <p className="text-blue-100">Pension Review</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPension(null)}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pension Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Description:</p>
                      <p className="text-gray-600">{selectedPension.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Address:</p>
                      <p className="text-gray-600">{selectedPension.address || 'No address provided'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Capacity:</p>
                      <p className="text-gray-600">{selectedPension.capacity ? `${selectedPension.capacity} guests` : 'Capacity not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Name:</p>
                      <p className="text-gray-600">{selectedPension.owner_name || 'Not available'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Email:</p>
                      <p className="text-gray-600">{selectedPension.owner_email || 'Not available'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Phone:</p>
                      <p className="text-gray-600">{selectedPension.phone || 'Not available'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="font-medium mb-2">Current Status:</p>
                {getStatusBadge(selectedPension.status)}
              </div>

              {/* Actions */}
              {selectedPension.status === 'pending' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Review Actions</h3>
                  
                  {/* Rejection Reason */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Rejection Reason (if rejecting):</label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-3 mb-6">
                    <Button
                      size="lg"
                      onClick={() => handleApprove(selectedPension.pension_id || selectedPension.id)}
                      disabled={actionLoading === `approve-${selectedPension.pension_id || selectedPension.id}`}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === `approve-${selectedPension.pension_id || selectedPension.id}` ? 'Approving...' : '✅ Approve Pension'}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={() => handleReject(selectedPension.pension_id || selectedPension.id, rejectionReason)}
                      disabled={actionLoading === `reject-${selectedPension.pension_id || selectedPension.id}`}
                    >
                      {actionLoading === `reject-${selectedPension.pension_id}` ? 'Rejecting...' : '❌ Reject Pension'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PensionApprovalInline;
