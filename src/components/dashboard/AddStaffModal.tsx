import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Users, X } from 'lucide-react';
import { Staff } from '../../types/dashboard';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  newStaff: any;
  setNewStaff: (staff: any) => void;
  editingStaff: Staff | null;
  onSaveStaff: () => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  newStaff,
  setNewStaff,
  editingStaff,
  onSaveStaff
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white ring-1 ring-slate-200">
        <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h2>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Full Name</Label>
            <Input
              value={newStaff.full_name}
              onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
              placeholder="e.g., Abebe Daniel"
              className="h-10 border-slate-200 bg-slate-50/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Role</Label>
              <Input
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                placeholder="Manager"
                className="h-10 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Department</Label>
              <Input
                value={newStaff.department}
                onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                placeholder="Front Desk"
                className="h-10 border-slate-200 bg-slate-50/30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Email</Label>
            <Input
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              placeholder="name@email.com"
              className="h-10 border-slate-200 bg-slate-50/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Phone Number</Label>
            <Input
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              placeholder="+251 ..."
              className="h-10 border-slate-200 bg-slate-50/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Salary (ETB)</Label>
              <Input
                type="number"
                value={newStaff.salary}
                onChange={(e) => setNewStaff({ ...newStaff, salary: e.target.value })}
                className="h-10 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Status</Label>
              <select
                value={newStaff.status}
                onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                className="w-full h-10 border border-slate-200 bg-slate-50/30 rounded-lg px-3"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on leave">On Leave</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 h-10">Cancel</Button>
            <Button onClick={onSaveStaff} className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              {editingStaff ? 'Update Staff' : 'Add Staff'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
