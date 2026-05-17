import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Search, Mail, Phone, Calendar, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import apiService from "@/services/api";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinedAt: string;
}

interface StaffsTabProps {
  staffs?: Staff[];
  onRefresh?: () => void;
}

const ADMIN_ROLES = [
  { value: "superAdmin", label: "Super Admin" },
  { value: "marketing and sales", label: "Marketing and Sales" },
  { value: "system technicians", label: "System Technicians" },
  { value: "customer support", label: "Customer Support" },
  { value: "finance", label: "Finance" }
];

export function StaffsTab({ staffs = [], onRefresh }: StaffsTabProps) {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "superAdmin"
  });

  const filteredStaffs = useMemo(() => {
    if (!search) return staffs;
    return staffs.filter(s => 
      s.name?.toLowerCase().includes(search.toLowerCase()) || 
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.role?.toLowerCase().includes(search.toLowerCase())
    );
  }, [staffs, search]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Name, email, and role are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiService.createStaff(formData);
      if (res.success) {
        toast.success("Staff member added successfully");
        setIsAddModalOpen(false);
        setFormData({ name: "", email: "", phone: "", role: "superAdmin" });
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.message || "Failed to add staff");
      }
    } catch (error) {
      toast.error("An error occurred while adding staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg sm:ml-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Admin Staff</h2>
            <p className="text-slate-600">Manage internal administrative accounts</p>
          </div>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md sm:mr-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create a new admin account. They will be assigned a default password: <strong>Admin@123</strong>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name *</label>
                <Input 
                  placeholder="e.g. Abebe Kebede" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address *</label>
                <Input 
                  type="email" 
                  placeholder="abebe@qirbalga.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number (Optional)</label>
                <Input 
                  placeholder="+251..." 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Admin Role *</label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({...formData, role: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add Staff"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-slate-700 mb-0.5">{staffs.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Staff Members</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-indigo-700 mb-0.5">
              {staffs.filter(s => s.role === 'superAdmin').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Super Admins</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-purple-700 mb-0.5">
              {staffs.filter(s => s.role !== 'superAdmin').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Specialized Roles</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-100 rounded-3xl opacity-50"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-2xl p-6 sm:p-8">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b-2 border-slate-200">
                    <TableHead className="font-bold text-slate-900 py-4 px-6">Staff Member</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6">Contact</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6 text-center">Role</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6 text-center">Status</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6 text-right">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaffs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <div className="text-slate-500 text-lg font-medium">No staff found</div>
                        <div className="text-slate-400 text-sm mt-1">Try adjusting your search filters.</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaffs.map((staff) => (
                      <TableRow key={staff.id} className="hover:bg-slate-50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
                              {staff.name?.substring(0, 2).toUpperCase() || 'ST'}
                            </div>
                            <span className="font-semibold text-slate-900">{staff.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {staff.email}
                            </div>
                            {staff.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {staff.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Badge variant="outline" className="capitalize bg-indigo-50 text-indigo-700 border-indigo-200">
                            {staff.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Badge className={`${
                            staff.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-100'
                          }`}>
                            {staff.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right text-sm text-slate-500">
                          <div className="flex items-center justify-end gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(staff.joinedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
