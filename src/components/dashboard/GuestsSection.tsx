import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LayoutDashboard,
  BarChart3,
  Phone,
  Building,
  BedDouble,
  CalendarCheck,
  DollarSign,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
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
  totalItems = 0
}) => {
  const { t } = useLanguage();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
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
            className={`gap-2 rounded-lg transition-all duration-300 ${viewMode === "card" ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-white hover:text-primary hover:shadow-md"
              }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            {t.dashboard?.cards || "Cards"}
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={onToggleView}
            className={`gap-2 rounded-lg transition-all duration-300 ${viewMode === "table" ? "bg-primary text-white shadow-lg shadow-primary/25" : "hover:bg-white hover:text-primary hover:shadow-md"
              }`}
          >
            <BarChart3 className="h-4 w-4" />
            {t.dashboard?.table || "Table"}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-white border border-slate-200 p-3 rounded-xl shadow-md flex flex-col xs:flex-row items-center justify-between gap-3 mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 w-full xs:w-auto">
            <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold shrink-0">
              {selectedRows.length} {t.dashboard?.selected || 'selected'}
            </Badge>
            <p className="text-sm font-medium text-slate-600 hidden sm:block truncate">{t.dashboard?.performActionsGuests || 'Perform actions on all selected guests'}</p>
          </div>
          <div className="flex items-center gap-2 w-full xs:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 xs:flex-none text-slate-600 border-slate-200 font-bold hover:bg-slate-50 h-10"
              onClick={() => onSelectAll?.([])}
            >
              <span>{t.dashboard?.clearSelection || 'Clear Selection'}</span>
            </Button>
            <Button
              size="sm"
              className="flex-1 xs:flex-none bg-red-500 hover:bg-red-600 text-white font-bold shadow-sm h-10"
              onClick={() => setShowConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>{selectedRows.length === 1 ? (t.dashboard?.delete || 'Delete') : `${t.dashboard?.delete || 'Delete'} ${selectedRows.length}`}</span>
            </Button>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => {
          alert(`Deleting ${selectedRows.length} guests.`);
          onSelectAll?.([]);
        }}
        title={selectedRows.length === 1 ? (t.dashboard?.deleteGuestRecord || "Delete Guest Record") : (t.dashboard?.deleteGuestRecords || "Delete Guest Records")}
        description={selectedRows.length === 1
          ? (t.dashboard?.confirmDeleteGuestSingleDescription || "Are you sure you want to permanently delete this guest record? This will remove all their history and personal details.")
          : (t.dashboard?.confirmDeleteGuestMultipleDescription || `Are you sure you want to permanently delete these ${selectedRows.length} guest records? This will remove all their history and personal details.`)
        }
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
                  <Badge className={`${guest.status === 'Checked In' ? 'bg-emerald-500' :
                    guest.status === 'Checked Out' ? 'bg-slate-500' :
                      guest.status === 'Active' ? 'bg-blue-500' : 'bg-amber-500'
                    } text-white text-xs shadow-sm shadow-black/5`}>
                    {guest.status === 'Checked In' ? (t.dashboard?.checkedIn || 'Checked In') :
                      guest.status === 'Checked Out' ? (t.dashboard?.checkedOut || 'Checked Out') :
                        guest.status === 'Active' ? (t.dashboard?.active || 'Active') :
                          (guest.status || 'N/A')}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2 font-medium"><Building className="h-4 w-4 text-purple-600" />{t.dashboard?.nationality || "Nationality"}</span>
                    <span className="font-bold text-slate-900">{guest.nationality}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2 font-medium"><BedDouble className="h-4 w-4 text-purple-600" />{t.dashboard?.room || "Room"}</span>
                    <span className="font-bold text-slate-900">{guest.room_number || guest.roomId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2 font-medium"><CalendarCheck className="h-4 w-4 text-purple-600" />{t.dashboard?.totalBookings || "Total Bookings"}</span>
                    <span className="font-bold text-slate-900">{guest.totalBookings}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-sm">
                    <span className="text-sm font-bold text-emerald-700 flex items-center gap-2"><DollarSign className="h-4 w-4" />{t.dashboard?.totalSpent || "Total Spent"}</span>
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
                    <TableHead className="font-bold">{t.dashboard?.guest || "Guest"}</TableHead>
                    <TableHead className="font-bold">{t.dashboard?.contact || "Contact"}</TableHead>
                    <TableHead className="font-bold">{t.dashboard?.nationality || "Nationality"}</TableHead>
                    <TableHead className="font-bold">{t.dashboard?.room || "Room"}</TableHead>
                    <TableHead className="font-bold">{t.dashboard?.status || "Status"}</TableHead>
                    <TableHead className="text-right font-bold">{t.dashboard?.totalBookings || "Total Bookings"}</TableHead>
                    <TableHead className="text-right font-bold">{t.dashboard?.totalSpent || "Total Spent"}</TableHead>
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
                        <Badge className={`${guest.status === 'Checked In' ? 'bg-emerald-500' :
                          guest.status === 'Checked Out' ? 'bg-slate-500' :
                            guest.status === 'Active' ? 'bg-blue-500' : 'bg-amber-500'
                          } text-white text-xs shadow-sm`}>
                          {guest.status === 'Checked In' ? (t.dashboard?.checkedIn || 'Checked In') :
                            guest.status === 'Checked Out' ? (t.dashboard?.checkedOut || 'Checked Out') :
                              guest.status === 'Active' ? (t.dashboard?.active || 'Active') :
                                (guest.status || 'N/A')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{guest.totalBookings}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">ETB {guest.totalSpent.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Unified Pagination Footer */}
            <div className="p-3 sm:p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 gap-2 overflow-hidden">
              <div className="text-[10px] sm:text-sm font-bold text-slate-500 shrink-0">
                <span className="hidden sm:inline">
                  {t.dashboard?.showingGuests ? (
                    t.dashboard.showingGuests.replace('{count}', String(safeGuests.length)).replace('{total}', String(totalItems))
                  ) : (
                    <>Showing <span className="text-slate-900">{safeGuests.length}</span> of <span className="text-slate-900">{totalItems}</span></>
                  )}
                </span>
                <span className="sm:hidden text-slate-900 font-extrabold">{safeGuests.length}/{totalItems}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <Select value={String(pagination.limit)} onValueChange={(val) => onLimitChange?.(parseInt(val))}>
                  <SelectTrigger className="w-[65px] sm:w-[130px] h-8 sm:h-10 border-slate-200 rounded-lg text-slate-600 font-medium bg-white px-1 sm:px-3 text-[10px] sm:text-sm">
                    <div className="flex items-center justify-center w-full">
                      <span className="sm:hidden">{pagination.limit}/p</span>
                      <span className="hidden sm:inline">{pagination.limit} {t.dashboard?.perPage || '/ page'}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 sm:gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onPageChange?.(pagination.page - 1)} disabled={pagination.page <= 1} className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0">
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map(pageNum => (
                      <Button key={pageNum} variant={pagination.page === pageNum ? "default" : "ghost"} onClick={() => onPageChange?.(pageNum)} className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-sm transition-all duration-200 p-0 ${pagination.page === pageNum ? "bg-[#F29F1F] text-slate-900 hover:bg-[#F29F1F]/90 shadow-md shadow-orange-200" : "text-slate-500 hover:bg-slate-50"}`}>
                        {pageNum}
                      </Button>
                    ))}
                  </div>
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
