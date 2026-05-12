import React from 'react';
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
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  selectedRows = [],
  onToggleSelection,
  onSelectAll,
  totalItems = 0,
  language
}) => {
  // Ensure staff is always an array
  const safeStaff = Array.isArray(staff) ? staff : [];
  
  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-primary text-white p-4 rounded-xl shadow-lg flex items-center justify-between mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-none px-3 py-1 font-bold">
              {selectedRows.length} Selected
            </Badge>
            <p className="text-sm font-medium hidden sm:block">Perform actions on all selected staff</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/10 font-bold"
              onClick={() => onSelectAll?.([])}
            >
              Clear Selection
            </Button>
            <Button 
              size="sm" 
              className="bg-white text-primary hover:bg-blue-50 font-bold shadow-md"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${selectedRows.length} staff members?`)) {
                  selectedRows.forEach(id => onDeleteStaff(id));
                  onSelectAll?.([]);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Bulk Delete
            </Button>
          </div>
        </div>
      )}
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

      {/* Summary Cards */}
      <div className="grid gap-6 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium"><TranslationText text="Total Staff" language={language} /></p>
                <p className="text-2xl font-bold text-blue-700">{totalItems}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <div className="h-6 w-6 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium"><TranslationText text="Active" language={language} /></p>
                <p className="text-2xl font-bold text-emerald-700">
                  {safeStaff.filter(s => s.status === 'Active').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <div className="h-6 w-6 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium"><TranslationText text="On Leave" language={language} /></p>
                <p className="text-2xl font-bold text-amber-700">
                  {safeStaff.filter(s => s.status === 'On Leave').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <div className="h-6 w-6 bg-amber-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium"><TranslationText text="Departments" language={language} /></p>
                <p className="text-2xl font-bold text-slate-700">
                  {[...new Set(safeStaff.map(s => s.department))].length}
                </p>
              </div>
              <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <div className="h-6 w-6 bg-slate-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                    <span className="font-bold text-slate-900 text-sm">{member.role}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <TranslationText text="Department" language={language} />
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{member.department}</span>
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

                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300"
                    onClick={() => onEditStaff(member)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <TranslationText text="Edit" language={language} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
                    onClick={() => onDeleteStaff(member.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <TranslationText text="Delete" language={language} />
                  </Button>
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
                    <TableHead className="whitespace-nowrap"><TranslationText text="Department" language={language} /></TableHead>
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
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{member.id}</TableCell>
                      <TableCell className="text-sm">{member.role}</TableCell>
                      <TableCell className="text-sm">{member.department}</TableCell>
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
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onEditStaff(member)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onDeleteStaff(member.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-900">{safeStaff.length}</span> of <span className="font-semibold text-slate-900">{totalItems}</span> employees
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="h-9 px-3 rounded-xl border-slate-200 hover:bg-white transition-all shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="flex items-center px-4 h-9 bg-white border border-slate-200 rounded-xl text-sm font-medium shadow-sm">
                  Page {pagination.page} of {Math.ceil(totalItems / pagination.limit) || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.page + 1)}
                  disabled={pagination.page >= (Math.ceil(totalItems / pagination.limit) || 1)}
                  className="h-9 px-3 rounded-xl border-slate-200 hover:bg-white transition-all shadow-sm"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
