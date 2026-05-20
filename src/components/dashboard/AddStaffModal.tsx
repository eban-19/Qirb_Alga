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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <Card className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 sm:p-8 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
          <CardHeader className="pb-4 sm:pb-6 p-0 mb-6 sm:mb-8">
            <CardTitle className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="hidden sm:flex p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-550 font-medium mt-1 text-slate-500 truncate sm:whitespace-normal">Manage your team and personnel details</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-slate-100 transition-colors shrink-0 flex items-center justify-center">
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              {/* Left Column: Personal Info */}
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400">Personal Information</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-slate-700">Full Name</Label>
                    <Input
                      value={newStaff.full_name}
                      onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                      placeholder="e.g., Abebe Daniel"
                      className="h-11 sm:h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-slate-700">Email Address</Label>
                    <Input
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      placeholder="name@pensionhub.com"
                      className="h-11 sm:h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-slate-700">Phone Number</Label>
                    <Input
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      placeholder="+251 ..."
                      className="h-11 sm:h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Role & Compensation */}
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400">Role & Compensation</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-slate-700">Position / Role</Label>
                    <Input
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      placeholder="e.g., Manager, Receptionist"
                      className="h-11 sm:h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 text-sm sm:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-slate-700">Monthly Salary</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] sm:text-xs font-bold">ETB</span>
                        <Input
                          type="number"
                          value={newStaff.salary}
                          onChange={(e) => setNewStaff({ ...newStaff, salary: e.target.value })}
                          className="h-11 sm:h-12 pl-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-slate-700">Employment Status</Label>
                      <select
                        value={newStaff.status}
                        onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                        className="w-full h-11 sm:h-12 border border-slate-200 bg-slate-50/30 rounded-xl px-3 sm:px-4 outline-none font-medium text-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20"
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

            <div className="flex gap-3 mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-slate-100">
              <Button variant="outline" onClick={onClose} className="flex-1 h-11 sm:h-12 rounded-xl font-bold border border-slate-200 text-sm sm:text-base">Cancel</Button>
              <Button 
                onClick={onSaveStaff} 
                className="flex-1 h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm sm:text-base active:scale-95 transition-all"
              >
                {editingStaff ? 'Update Staff' : 'Add Staff Member'}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};
