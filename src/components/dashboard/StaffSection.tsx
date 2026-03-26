import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { LayoutDashboard, Edit, Trash2, MessageSquare, Phone, Mail, BarChart3, User, Building, DollarSign } from 'lucide-react';
import { StaffMember } from '../../data/types/dashboardTypes';

interface StaffSectionProps {
  staff: StaffMember[];
  viewMode: 'card' | 'table';
  onToggleView: () => void;
  onEditStaff: (id: string) => void;
  onDeleteStaff: (id: string) => void;
  downloadTemplate: () => void;
}

export const StaffSection: React.FC<StaffSectionProps> = ({
  staff,
  viewMode,
  onToggleView,
  onEditStaff,
  onDeleteStaff,
  downloadTemplate
}) => {
  return (
    <div className="space-y-6">
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
          Cards
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
          Table
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Staff</p>
                <p className="text-2xl font-bold text-blue-700">{staff.length}</p>
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
                <p className="text-sm text-emerald-600 font-medium">Active</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {staff.filter(s => s.status === 'Active').length}
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
                <p className="text-sm text-amber-600 font-medium">On Leave</p>
                <p className="text-2xl font-bold text-amber-700">
                  {staff.filter(s => s.status === 'On Leave').length}
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
                <p className="text-sm text-slate-600 font-medium">Departments</p>
                <p className="text-2xl font-bold text-slate-700">
                  {[...new Set(staff.map(s => s.department))].length}
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
          {staff.map((member) => (
            <Card key={member.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative">
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
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Role
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{member.role}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Department
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{member.department}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{member.phone}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
                    <span className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Salary
                    </span>
                    <span className="font-bold text-emerald-700 text-lg">ETB {member.salary.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300"
                    onClick={() => onEditStaff(member.id)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
                    onClick={() => onDeleteStaff(member.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-0 sm:p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="pl-4 sm:pl-6 whitespace-nowrap">Employee</TableHead>
                    <TableHead className="whitespace-nowrap">ID</TableHead>
                    <TableHead className="whitespace-nowrap">Role</TableHead>
                    <TableHead className="whitespace-nowrap">Department</TableHead>
                    <TableHead className="whitespace-nowrap">Salary</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right pr-4 sm:pr-6 whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-4 sm:pl-6">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-[140px] sm:min-w-[160px]">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold text-[10px] sm:text-sm">
                              {member.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden sm:block flex-1 min-w-0">
                            <div className="font-medium text-slate-900 text-sm">{member.name}</div>
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
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4 sm:pr-6">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onEditStaff(member.id)}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};
