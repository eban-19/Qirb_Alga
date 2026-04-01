import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface Pension {
  pension_id: number;
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

const PensionApprovalSection: React.FC = () => {
  const [pensions, setPensions] = useState<Pension[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'inactive'>('all');
  const [selectedPension, setSelectedPension] = useState<Pension | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch pensions
  const fetchPensions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin-approvals/pensions/${filter === 'all' ? 'all' : filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.success) {
        setPensions(response.data);
      } else {
        console.error('Failed to fetch pensions:', response);
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
    setActionLoading('approve');
    try {
      const response = await fetch(`/api/admin-approvals/pensions/${pensionId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.success) {
        alert('Pension approved successfully!');
        fetchPensions(); // Refresh list
        setSelectedPension(null);
      } else {
        alert('Failed to approve pension: ' + response.message);
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
    setActionLoading('reject');
    try {
      const response = await fetch(`/api/admin-approvals/pensions/${pensionId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: reason })
      });

      if (response.success) {
        alert('Pension rejected successfully!');
        fetchPensions(); // Refresh list
        setSelectedPension(null);
      } else {
        alert('Failed to reject pension: ' + response.message);
      }
    } catch (error) {
      console.error('Error rejecting pension:', error);
      alert('Error rejecting pension');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredPensions = pensions.filter(pension => 
    filter === 'all' || pension.status === filter
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pension Approval Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                Filter: {filter === 'all' ? 'All Pensions' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Pensions`}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pensions</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="active">Approved Pensions</SelectItem>
                <SelectItem value="inactive">Rejected Pensions</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500">
              {filteredPensions.length} {filter === 'all' ? 'total' : filter} pensions
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 border-t-transparent border-r-transparent"></div>
              <p className="text-gray-500">Loading pensions...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pension List */}
              {filteredPensions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {filter === 'all' ? 'pensions' : `${filter} pensions`} found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pension Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPensions.map((pension) => (
                      <TableRow key={pension.pension_id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{pension.name}</div>
                            <div className="text-sm text-gray-500">{pension.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{pension.owner_name}</div>
                            <div className="text-sm text-gray-500">{pension.owner_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(pension.status)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(pension.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPension(pension)}
                            >
                              Review
                            </Button>
                            
                            {pension.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleApprove(pension.pension_id)}
                                  disabled={actionLoading === 'approve'}
                                >
                                  {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(pension.pension_id)}
                                  disabled={actionLoading === 'reject'}
                                >
                                  {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedPension && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Review Pension: {selectedPension.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Owner</label>
                <div className="text-sm text-gray-600">
                  {selectedPension.owner_name} ({selectedPension.owner_email})
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedPension.description}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <div className="text-sm text-gray-600">
                  {selectedPension.address}
                </div>
              </div>

              {selectedPension.status === 'pending' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Approval Action</label>
                    <Select defaultValue="">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">Approve</SelectItem>
                        <SelectItem value="reject">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                    <Textarea
                      placeholder="Enter reason for rejection (if rejecting)..."
                      className="w-full"
                      id="rejectionReason"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedPension(null)}
              >
                Cancel
              </Button>
              
              {selectedPension.status === 'pending' && (
                <Button
                  onClick={async () => {
                    const action = (document.getElementById('approvalAction') as HTMLSelectElement)?.value;
                    const reason = (document.getElementById('rejectionReason') as HTMLTextAreaElement)?.value;
                    
                    if (action === 'approve') {
                      await handleApprove(selectedPension.pension_id);
                    } else if (action === 'reject' && reason) {
                      await handleReject(selectedPension.pension_id, reason);
                    } else {
                      alert('Please select an action and provide rejection reason if rejecting');
                    }
                  }}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Submit Decision'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PensionApprovalSection;
