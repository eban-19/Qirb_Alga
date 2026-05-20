import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  LayoutDashboard, 
  BarChart3, 
  Mail, 
  Phone, 
  Building, 
  BedDouble, 
  CalendarCheck, 
  DollarSign,
  MessageSquare,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { TranslationText } from "@/components/TranslationText";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GuestsSectionProps {
  guests: any[];
  viewMode: 'card' | 'table';
  onToggleView: () => void;
  pagination?: { page: number; limit: number };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  selectedRows?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
  totalItems?: number;
  language?: any;
}

export const GuestsSection: React.FC<GuestsSectionProps> = ({
  guests = [],
  viewMode,
  onToggleView,
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
  // Ensure guests is always an array
  const safeGuests = Array.isArray(guests) ? guests : [];
  const totalPages = Math.ceil(totalItems / pagination.limit) || 1;

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl shadow-inner w-fit">
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            onClick={onToggleView}
            className={`gap-2 rounded-lg transition-all duration-300 ${
              viewMode === "card" ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-white hover:text-primary hover:shadow-md"
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
              viewMode === "table" ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-white hover:text-primary hover:shadow-md"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <TranslationText text="Table" language={language} />
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-white border border-slate-200 p-3 rounded-xl shadow-md flex items-center justify-between mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold">
              {selectedRows.length} selected
            </Badge>
            <p className="text-sm font-medium text-slate-600 hidden sm:block">Perform actions on all selected guests</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-slate-600 border-slate-200 font-bold hover:bg-slate-50"
              onClick={() => onSelectAll?.([])}
            >
              Clear Selection
            </Button>
            <Button 
              size="sm" 
              className="bg-red-500 hover:bg-red-600 text-white font-bold shadow-sm"
              onClick={() => setShowConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {selectedRows.length === 1 ? 'Delete' : `Delete ${selectedRows.length}`}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDeleteModal 
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => {
          // Add actual delete logic here when available
          alert(`Deleting ${selectedRows.length} guests.`);
          onSelectAll?.([]);
        }}
        title={selectedRows.length === 1 ? "Delete Guest Record" : "Delete Guest Records"}
        description={`Are you sure you want to permanently delete ${selectedRows.length === 1 ? "this guest record" : "these " + selectedRows.length + " guest records"}? This will remove all their history and personal details.`}
        itemCount={selectedRows.length}
      />

      {/* Cards View */}
      {viewMode === "card" && (
        <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {safeGuests.map((guest) => (
            <Card key={guest.id} className={`group border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden ${selectedRows.includes(guest.id) ? 'ring-2 ring-primary' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative">
                <div className="absolute top-4 right-4">
                  <Checkbox checked={selectedRows.includes(guest.id)} onCheckedChange={() => onToggleSelection?.(guest.id)} />
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-bold shadow-lg group-hover:shadow-purple-500/25 group-hover:scale-110 transition-all duration-300">
                      {guest.name.charAt(0)}
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-purple-600 transition-colors">{guest.name}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1"><Phone className="h-3 w-3" />{guest.phone}</p>
                    </div>
                  </div>
                  <Badge className={`${
                    guest.status === 'Checked In' ? 'bg-emerald-500' :
                    guest.status === 'Checked Out' ? 'bg-slate-500' : 'bg-amber-500'
                  } text-white text-xs shadow-sm shadow-black/5`}>
                    <TranslationText text={guest.status} language={language} />
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2 font-medium"><Building className="h-4 w-4 text-purple-600" /><TranslationText text="Nationality" language={language} /></span>
                    <span className="font-bold text-slate-900">{guest.nationality}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2 font-medium"><BedDouble className="h-4 w-4 text-purple-600" /><TranslationText text="Room" language={language} /></span>
                    <span className="font-bold text-slate-900">{guest.room_number || guest.roomId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2 font-medium"><CalendarCheck className="h-4 w-4 text-purple-600" /><TranslationText text="Total Bookings" language={language} /></span>
                    <span className="font-bold text-slate-900">{guest.totalBookings}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-sm">
                    <span className="text-sm font-bold text-emerald-700 flex items-center gap-2"><DollarSign className="h-4 w-4" /><TranslationText text="Total Spent" language={language} /></span>
                    <span className="font-bold text-emerald-700 text-lg">ETB {guest.totalSpent.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card className="border-none shadow-lg bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[50px] px-4">
                      <Checkbox 
                        checked={safeGuests.length > 0 && selectedRows.length === safeGuests.length}
                        onCheckedChange={(checked) => {
                          if (checked) onSelectAll?.(safeGuests.map(g => g.id));
                          else onSelectAll?.([]);
                        }}
                      />
                    </TableHead>
                    <TableHead className="font-bold"><TranslationText text="Guest" language={language} /></TableHead>
                    <TableHead className="font-bold"><TranslationText text="Contact" language={language} /></TableHead>
                    <TableHead className="font-bold"><TranslationText text="Nationality" language={language} /></TableHead>
                    <TableHead className="font-bold"><TranslationText text="Room" language={language} /></TableHead>
                    <TableHead className="font-bold"><TranslationText text="Status" language={language} /></TableHead>
                    <TableHead className="text-right font-bold"><TranslationText text="Total Bookings" language={language} /></TableHead>
                    <TableHead className="text-right font-bold"><TranslationText text="Total Spent" language={language} /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeGuests.map((guest) => (
                    <TableRow key={guest.id} className={`hover:bg-slate-50/50 transition-colors ${selectedRows.includes(guest.id) ? 'bg-blue-50/30' : ''}`}>
                      <TableCell className="px-4">
                        <Checkbox checked={selectedRows.includes(guest.id)} onCheckedChange={() => onToggleSelection?.(guest.id)} />
                      </TableCell>
                      <TableCell><p className="font-bold text-slate-900">{guest.name}</p></TableCell>
                      <TableCell className="font-medium">{guest.phone}</TableCell>
                      <TableCell>{guest.nationality}</TableCell>
                      <TableCell className="font-bold text-purple-700">{guest.room_number || guest.roomId || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          guest.status === 'Checked In' ? 'bg-emerald-500' : guest.status === 'Checked Out' ? 'bg-slate-500' : 'bg-amber-500'
                        } text-white text-xs shadow-sm`}><TranslationText text={guest.status} language={language} /></Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{guest.totalBookings}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">ETB {guest.totalSpent.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Unified Pagination Footer */}
            <div className="p-3 sm:p-8 border-t border-slate-50 flex flex-row items-center justify-between gap-1.5 sm:gap-4 bg-slate-50/30 overflow-hidden">
              <div className="text-[10px] sm:text-sm font-bold text-slate-500 shrink-0">
                <span className="hidden xs:inline sm:inline">Showing </span>
                <span className="text-slate-900">{safeGuests.length}</span> of <span className="text-slate-900">{totalItems}</span>
                <span className="hidden xs:inline sm:inline"> guests</span>
              </div>

              <div className="flex flex-row items-center gap-1.5 sm:gap-3 shrink-0">
                <div className="flex items-center gap-1 shrink-0">
                  <Select value={String(pagination.limit)} onValueChange={(val) => onLimitChange?.(parseInt(val))}>
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
                  <Button variant="ghost" size="icon" onClick={() => onPageChange?.(pagination.page - 1)} disabled={pagination.page <= 1} className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0">
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  {getPageNumbers().map(pageNum => (
                    <Button key={pageNum} variant={pagination.page === pageNum ? "default" : "ghost"} onClick={() => onPageChange?.(pageNum)} className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 p-0 ${pagination.page === pageNum ? "bg-[#F29F1F] text-slate-900 hover:bg-[#F29F1F]/90 shadow-md shadow-orange-200" : "text-slate-500 hover:bg-slate-50"}`}>
                      {pageNum}
                    </Button>
                  ))}
                  <Button variant="ghost" size="icon" onClick={() => onPageChange?.(pagination.page + 1)} disabled={pagination.page >= totalPages} className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0">
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
