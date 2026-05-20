import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { LayoutDashboard, Edit, Trash2, MessageSquare, Phone, Mail, BarChart3, User, Building, DollarSign } from 'lucide-react';
import { Staff } from '../../types/dashboard';
import { useLanguage } from '@/hooks/use-language';
import { TranslationText } from '@/components/TranslationText';

import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ChevronLeft, ChevronRight, ChevronDown, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StaffSectionProps {
  staff: Staff[];
  viewMode: 'card' | 'table' | string;
  onToggleView: () => void;
  onEditStaff: (staff: Staff) => void;
  onDeleteStaff: (id: string | number) => void;
  onAddNewStaff: () => void;
  onBulkUpload: () => void;
  downloadTemplate: () => void;
  pagination?: { page: number; limit: number };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  selectedRows?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
  totalItems?: number;
  language?: any;
}

export const StaffSection: React.FC<StaffSectionProps> = ({
  staff = [],
  viewMode,
  onToggleView,
  onEditStaff,
  onDeleteStaff,
  onAddNewStaff,
  onBulkUpload,
  downloadTemplate,
  pagination = { page: 1, limit: 10 },
  onPageChange,
  onLimitChange,
  selectedRows = [],
  onToggleSelection,
  onSelectAll,
  totalItems = 0,
  language
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  // Ensure staff is always an array
  const safeStaff = Array.isArray(staff) ? staff : [];
  const totalPages = Math.ceil(totalItems / pagination.limit) || 1;

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };
  
  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-white border border-slate-200 p-3 rounded-xl shadow-md flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold">
              {selectedRows.length} selected
            </Badge>
            <p className="text-sm font-medium text-slate-600 hidden sm:block">{selectedRows.length === 1 ? '1 staff member selected' : `${selectedRows.length} staff members selected`}</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.length === 1 && (
              <Button 
                size="sm" 
                variant="outline"
                className="font-bold text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100 shadow-sm"
                onClick={() => {
                  const member = staff.find(s => String(s.id) === String(selectedRows[0]));
                  if (member) onEditStaff(member);
                }}
              >
                <Edit className="h-4 w-4 mr-1.5" />
                Edit Profile
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              className="font-bold text-slate-600 border-slate-200"
              onClick={() => onSelectAll?.([])}
            >
              Clear
            </Button>
            <Button 
              size="sm" 
              className="bg-red-500 hover:bg-red-600 text-white font-bold shadow-sm"
              onClick={() => setShowConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              {selectedRows.length === 1 ? 'Delete' : `Delete ${selectedRows.length}`}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDeleteModal 
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => {
          selectedRows.forEach(id => onDeleteStaff(id));
          onSelectAll?.([]);
        }}
        title={selectedRows.length === 1 ? "Delete Staff Member" : "Delete Staff Members"}
        description={`Are you sure you want to permanently delete ${selectedRows.length === 1 ? "this staff member" : "these " + selectedRows.length + " staff members"}? This will remove all their records from the system.`}
        itemCount={selectedRows.length}
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* View Toggle */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl shadow-inner">
          <Button 
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            onClick={onToggleView}
            className={`gap-2 rounded-lg transition-all duration-300 ${
              viewMode === "card" 
                ? "bg-primary text-white shadow-lg shadow-primary/25" 
                : "hover:bg-white hover:text-primary hover:shadow-md"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <TranslationText text="Cards" language={language} />
          </Button>
          <Button 
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={onToggleView}
            className={`gap-2 rounded-lg transition-all duration-300 ${
              viewMode === "table" 
                ? "bg-primary text-white shadow-lg shadow-primary/25" 
                : "hover:bg-white hover:text-primary hover:shadow-md"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <TranslationText text="Table" language={language} />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={onBulkUpload}
            className="flex-1 sm:flex-none gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 text-primary font-bold transition-all duration-300"
          >
            <LayoutDashboard className="h-4 w-4 rotate-180" />
            <TranslationText text="Bulk Upload" language={language} />
          </Button>
          <Button 
            onClick={onAddNewStaff}
            className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all duration-300"
          >
            <User className="h-4 w-4" />
            <TranslationText text="Add Staff" language={language} />
          </Button>
        </div>
      </div>



      {/* Content */}
      {viewMode === 'card' ? (
        <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {safeStaff.map((member) => (
            <Card key={member.id} className={`group border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden ${selectedRows.includes(member.id) ? 'ring-2 ring-primary' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative">
                <div className="absolute top-4 right-4">
                  <Checkbox 
                    checked={selectedRows.includes(member.id)}
                    onCheckedChange={() => onToggleSelection?.(member.id)}
                  />
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
                      {member.full_name ? member.full_name.split(" ").map((n) => n[0]).join("") : "S"}
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{member.full_name || 'Unknown'}</h3>
                      <Badge className={`${
                        member.status === 'Active' ? 'bg-emerald-500 shadow-emerald-500/25' :
                        member.status === 'On Leave' ? 'bg-amber-500 shadow-amber-500/25' : 'bg-slate-500 shadow-slate-500/25'
                      } text-white text-xs shadow-sm`}>
                        <TranslationText text={member.status} language={language} />
                      </Badge>

                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <TranslationText text="Role" language={language} />
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{member.role || "N/A"}</span>

                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <TranslationText text="Contact" language={language} />
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{member.phone}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
                    <span className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <TranslationText text="Salary" language={language} />
                    </span>
                    <span className="font-bold text-emerald-700 text-lg">ETB {member.salary.toLocaleString()}</span>
                  </div>
                </div>

                 <div className="pt-2 border-t border-slate-100 mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-between border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary transition-all duration-300 rounded-xl h-11"
                        >
                          <span className="flex items-center gap-2 font-bold">
                            <TranslationText text="Actions" language={language} />
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-200 p-1">
                        <DropdownMenuItem 
                          onClick={() => onEditStaff(member)}
                          className="flex items-center gap-2 p-3 cursor-pointer rounded-lg focus:bg-blue-50 focus:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          <TranslationText text="Edit Profile" language={language} />
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-2 p-3 cursor-pointer rounded-lg focus:bg-purple-50 focus:text-purple-600 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          <TranslationText text="Send Message" language={language} />
                        </DropdownMenuItem>
 
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        <DropdownMenuItem 
                          onClick={() => setStaffToDelete(member)}
                          className="flex items-center gap-2 p-3 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600 text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <TranslationText text="Delete Staff" language={language} />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                 </div>

              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[50px] px-4">
                      <Checkbox 
                        checked={safeStaff.length > 0 && selectedRows.length === safeStaff.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onSelectAll?.(safeStaff.map(s => s.id));
                          } else {
                            onSelectAll?.([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="pl-4 whitespace-nowrap"><TranslationText text="Employee" language={language} /></TableHead>
                    <TableHead className="whitespace-nowrap">ID</TableHead>
                    <TableHead className="whitespace-nowrap"><TranslationText text="Role" language={language} /></TableHead>

                    <TableHead className="whitespace-nowrap"><TranslationText text="Salary" language={language} /></TableHead>
                    <TableHead className="whitespace-nowrap"><TranslationText text="Status" language={language} /></TableHead>
                    <TableHead className="text-right pr-4 whitespace-nowrap"><TranslationText text="Actions" language={language} /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeStaff.map((member) => (
                    <TableRow key={member.id} className={`hover:bg-slate-50/50 transition-colors ${selectedRows.includes(member.id) ? 'bg-blue-50/30' : ''}`}>
                      <TableCell className="px-4">
                        <Checkbox 
                          checked={selectedRows.includes(member.id)}
                          onCheckedChange={() => onToggleSelection?.(member.id)}
                        />
                      </TableCell>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-[140px] sm:min-w-[160px]">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold text-[10px] sm:text-sm">
                              {member.full_name ? member.full_name.split(" ").map((n) => n[0]).join("") : "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden sm:block flex-1 min-w-0">
                            <div className="font-medium text-slate-900 text-sm">{member.full_name}</div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none text-[10px]">
                              {member.role || "N/A"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{member.id}</TableCell>
                      <TableCell className="text-sm">{member.role || "N/A"}</TableCell>


                      <TableCell className="text-sm">ETB {member.salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          member.status === 'Active' ? 'bg-emerald-500' :
                          member.status === 'On Leave' ? 'bg-amber-500' : 'bg-slate-400'
                        } text-white text-[10px]`}>
                          <TranslationText text={member.status} language={language} />
                        </Badge>
                      </TableCell>
                       <TableCell className="text-right pr-4">
                         <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button 
                                   variant="outline" 
                                   size="sm"
                                   className="h-7 sm:h-9 px-1.5 sm:px-3 gap-1 sm:gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all duration-300 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold shrink-0"
                                 >
                                   <span className="text-[10px] sm:text-xs font-bold"><TranslationText text="Actions" language={language} /></span>
                                   <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-50 shrink-0" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-200 p-1">
                                <DropdownMenuItem 
                                  onClick={() => onEditStaff(member)}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-blue-50 focus:text-blue-600 transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                  <TranslationText text="Edit" language={language} />
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-purple-50 focus:text-purple-600 transition-colors"
                                >
                                  <Mail className="h-4 w-4" />
                                  <TranslationText text="Contact" language={language} />
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem 
                                  onClick={() => setStaffToDelete(member)}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600 text-red-500 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <TranslationText text="Delete" language={language} />
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                       </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Unified Pagination Footer */}
            <div className="p-3 sm:p-8 border-t border-slate-50 flex flex-row items-center justify-between gap-1.5 sm:gap-4 bg-slate-50/30 overflow-hidden">
              <div className="text-[10px] sm:text-sm font-bold text-slate-500 shrink-0">
                <span className="hidden xs:inline sm:inline">Showing </span>
                <span className="text-slate-900">{safeStaff.length}</span> of <span className="text-slate-900">{totalItems}</span>
                <span className="hidden xs:inline sm:inline"> employees</span>
              </div>

              <div className="flex flex-row items-center gap-1.5 sm:gap-3 shrink-0">
                <div className="flex items-center gap-1 shrink-0">
                  <Select
                    value={String(pagination.limit)}
                    onValueChange={(val) => onLimitChange?.(parseInt(val))}
                  >
                    <SelectTrigger className="w-[70px] sm:w-[125px] h-8 sm:h-10 border-slate-200 rounded-lg text-slate-600 font-medium bg-white px-1 sm:px-3 text-[10px] sm:text-sm">
                      <div className="flex items-center">
                        <span className="sm:hidden">{pagination.limit}/p</span>
                        <span className="hidden sm:inline">{pagination.limit} / page</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 / page</SelectItem>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange?.(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  
                  {getPageNumbers().map(pageNum => (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "ghost"}
                      onClick={() => onPageChange?.(pageNum)}
                      className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 p-0 ${
                        pagination.page === pageNum 
                          ? "bg-[#F29F1F] text-slate-900 hover:bg-[#F29F1F]/90 shadow-md shadow-orange-200" 
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  ))}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange?.(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                    className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Staff Custom Delete Confirmation Modal */}
      <ConfirmDeleteModal 
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={() => {
          if (staffToDelete && onDeleteStaff) {
            onDeleteStaff(staffToDelete.id);
          }
          setStaffToDelete(null);
        }}
        title="Delete Staff Member"
        description={`Are you sure you want to permanently delete staff member "${staffToDelete?.full_name || ''}"? This action cannot be undone.`}
        itemCount={1}
      />
    </div>
  );
};
