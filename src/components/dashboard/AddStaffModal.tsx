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
      <Card className="w-full max-w-4xl border-none shadow-2xl bg-white ring-1 ring-slate-200 rounded-[2rem] overflow-hidden">
        <CardHeader className="pb-6 p-8">
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 shadow-md">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Manage your team and personnel details</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Personal Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Personal Information</h3>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Full Name</Label>
                  <Input
                    value={newStaff.full_name}
                    onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                    placeholder="e.g., Abebe Daniel"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Email Address</Label>
                  <Input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="name@pensionhub.com"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Phone Number</Label>
                  <Input
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="+251 ..."
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Role & Compensation */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Role & Compensation</h3>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Position / Role</Label>
                  <Input
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    placeholder="e.g., Manager, Receptionist"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Monthly Salary</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">ETB</span>
                      <Input
                        type="number"
                        value={newStaff.salary}
                        onChange={(e) => setNewStaff({ ...newStaff, salary: e.target.value })}
                        className="h-12 pl-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Employment Status</Label>
                    <select
                      value={newStaff.status}
                      onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                      className="w-full h-12 border border-slate-200 bg-slate-50/30 rounded-xl px-4 outline-none font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on leave">On Leave</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold border-2">Cancel</Button>
            <Button 
              onClick={onSaveStaff} 
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 rounded-xl font-bold text-lg active:scale-95 transition-all"
            >
              {editingStaff ? 'Update Staff' : 'Add Staff Member'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
