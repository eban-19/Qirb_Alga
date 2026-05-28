import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LayoutDashboard,
  BarChart3,
  TrashIcon,
  ChevronLeft,
  ChevronRight,
  Edit2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  CalendarDays
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoomsSectionProps {
  rooms: any[];
  viewMode: 'card' | 'table';
  onToggleView: () => void;
  onDeleteRoom?: (roomId: string | number) => void;
  onAddNewRoom?: () => void;
  pagination?: { page: number; limit: number };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  selectedRows?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
  onUpdateStatus?: (roomId: string | number, currentStatus: string) => void;
  totalItems?: number;
  onEditRoom?: (room: any) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  rooms = [],
  viewMode,
  onToggleView,
  onDeleteRoom,
  onAddNewRoom,
  pagination = { page: 1, limit: 10 },
  onPageChange,
  onLimitChange,
  selectedRows = [],
  onToggleSelection,
  onSelectAll,
  totalItems = 0,
  onEditRoom,
  onUpdateStatus
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const totalPages = Math.ceil(totalItems / pagination.limit) || 1;

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-white border border-slate-200 p-3 rounded-xl shadow-md flex flex-col xs:flex-row items-center justify-between gap-3 mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 w-full xs:w-auto">
            <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold shrink-0">
              {selectedRows.length} {t.dashboard?.selected || 'selected'}
            </Badge>
            <p className="text-sm font-medium text-slate-600 hidden sm:block truncate">{t.dashboard?.performActionsRooms || 'Perform actions on all selected rooms'}</p>
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
              className={`flex-1 xs:flex-none bg-red-500 hover:bg-red-600 text-white font-bold shadow-sm transition-all duration-300 h-10 ${selectedRows.some(id => {
                const room = rooms.find(r => String(r.id || r.room_id) === String(id));
                return room?.status === 'Occupied';
              }) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              onClick={() => {
                const hasOccupied = selectedRows.some(id => {
                  const room = rooms.find(r => String(r.id || r.room_id) === String(id));
                  return room?.status === 'Occupied';
                });
                if (hasOccupied) {
                  alert(t.dashboard?.roomDeleteOccupiedError || 'Cannot delete occupied rooms. Please check out the guest first.');
                  return;
                }
                setShowConfirmDelete(true);
              }}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              <span>{selectedRows.length === 1 ? (t.dashboard?.delete || 'Delete') : `${t.dashboard?.delete || 'Delete'} ${selectedRows.length}`}</span>
            </Button>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => {
          selectedRows.forEach(id => onDeleteRoom?.(id));
          onSelectAll?.([]);
        }}
        title={selectedRows.length === 1 ? (t.dashboard?.deleteRoom || "Delete Room") : (t.dashboard?.deleteRooms || "Delete Rooms")}
        description={selectedRows.length === 1
          ? (t.dashboard?.confirmDeleteRoomSingleDescription || "Are you sure you want to permanently delete this room? This action cannot be reversed.")
          : (t.dashboard?.confirmDeleteRoomsMultipleDescription || `Are you sure you want to permanently delete these ${selectedRows.length} rooms? This action cannot be reversed.`)
        }
        itemCount={selectedRows.length}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* View Toggle */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl shadow-inner w-fit">
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            onClick={onToggleView}
            className={`gap-2 rounded-lg transition-all duration-300 ${viewMode === "card"
              ? "bg-primary text-white shadow-lg shadow-primary/25"
              : "hover:bg-white hover:text-primary hover:shadow-md"
              }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            {t.dashboard?.cards || "Cards"}
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={onToggleView}
            className={`gap-2 rounded-lg transition-all duration-300 ${viewMode === "table"
              ? "bg-primary text-white shadow-lg shadow-primary/25"
              : "hover:bg-white hover:text-primary hover:shadow-md"
              }`}
          >
            <BarChart3 className="h-4 w-4" />
            {t.dashboard?.table || "Table"}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={onAddNewRoom}
            className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all duration-300"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t.dashboard?.addRoom || "Add Room"}
          </Button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === "card" && (
        <>
          {safeRooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t.dashboard?.noRoomsFound || "No rooms found"}
              </h3>
              <p className="text-slate-500 mb-4">
                {t.dashboard?.getStartedAddRoom || "Get started by adding your first room to this pension."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {safeRooms.map((room) => (
                <Card key={room.id} className={`group border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-white ${selectedRows.includes(room.id) ? 'ring-2 ring-primary' : ''}`}>
                  <div className={`h-3 w-full ${room.status === "Available" ? "bg-emerald-500" :
                    room.status === "Available (Future Bookings)" ? "bg-teal-500" :
                    room.status === "Occupied" ? "bg-blue-500" : "bg-slate-400"
                    }`} />
                  <CardContent className="p-8 relative">
                    <div className="absolute top-4 right-4">
                      <Checkbox
                        checked={selectedRows.includes(room.id)}
                        onCheckedChange={() => onToggleSelection?.(room.id)}
                      />
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-14 w-14 flex items-center justify-center rounded-xl font-bold text-xl shadow-lg ${room.status === "Available" ? "bg-emerald-100 text-emerald-700" :
                          room.status === "Available (Future Bookings)" ? "bg-teal-100 text-teal-700" :
                          room.status === "Occupied" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                          }`}>
                          {room.room_number || room.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-slate-900">{room.type}</h3>
                          <p className="text-sm text-slate-500">
                            {t.dashboard?.room || "Room"} {room.room_number || room.id}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${room.status === "Available" ? "bg-emerald-500" :
                        room.status === "Available (Future Bookings)" ? "bg-teal-500" :
                        room.status === "Occupied" ? "bg-blue-500" : "bg-slate-400"
                        } text-white text-xs px-3 py-1 shadow-sm`}>
                        {room.status === "Available" ? (t.dashboard?.available || 'Available') :
                          room.status === "Available (Future Bookings)" ? (t.dashboard?.availableFuture || 'Available (Booked Later)') :
                          room.status === "Occupied" ? (t.dashboard?.occupied || 'Occupied') :
                            (room.status || 'N/A')}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-bold text-slate-900">ETB {room.price}</span>
                      <span className="text-sm text-slate-500 font-medium">
                        {t.dashboard?.perNight || "per night"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary transition-all duration-300 rounded-xl h-11"
                          >
                            <span className="flex items-center gap-2 font-bold">
                              {t.dashboard?.actions || "Actions"}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-xl border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300 p-1">
                          <DropdownMenuItem
                            onClick={() => navigate(`/dashboard/rooms/${room.id}/calendar`)}
                            className="flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-colors hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                          >
                            <CalendarDays className="h-4 w-4" />
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-sm">Availability Calendar</span>
                              <span className="text-[10px] text-slate-500">View bookings & block dates</span>
                            </div>
                          </DropdownMenuItem>
                          <div className="h-px bg-slate-100 my-1" />
                          <DropdownMenuItem
                            onClick={() => onDeleteRoom && onDeleteRoom(room.id)}
                            disabled={room.status === 'Occupied'}
                            className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600 transition-colors text-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-sm">{t.dashboard?.deleteRoom || "Delete Room"}</span>
                              <span className="text-[10px] text-slate-500">{t.dashboard?.cannotBeUndone || "This action cannot be undone"}</span>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
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
                        checked={safeRooms.length > 0 && selectedRows.length === safeRooms.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onSelectAll?.(safeRooms.map(r => r.id));
                          } else {
                            onSelectAll?.([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="font-bold">
                      {t.dashboard?.roomNumber || "Room Number"}
                    </TableHead>
                    <TableHead className="font-bold">
                      {t.dashboard?.type || "Type"}
                    </TableHead>
                    <TableHead className="font-bold">
                      {t.dashboard?.price || "Price"}
                    </TableHead>
                    <TableHead className="font-bold">
                      {t.dashboard?.status || "Status"}
                    </TableHead>
                    <TableHead className="font-bold">
                      {t.dashboard?.capacity || "Capacity"}
                    </TableHead>
                    <TableHead className="font-bold text-right pr-4">
                      {t.dashboard?.actions || "Actions"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeRooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <LayoutDashboard className="h-12 w-12 text-slate-400 mb-2" />
                          <p className="text-slate-500">
                            {t.dashboard?.noRoomsFound || "No rooms found"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    safeRooms.map((room) => (
                      <TableRow key={room.id} className={`hover:bg-slate-50/50 transition-colors ${selectedRows.includes(room.id) ? 'bg-blue-50/30' : ''}`}>
                        <TableCell className="px-4">
                          <Checkbox
                            checked={selectedRows.includes(room.id)}
                            onCheckedChange={() => onToggleSelection?.(room.id)}
                          />
                        </TableCell>
                        <TableCell className="font-bold">{room.room_number || room.id}</TableCell>
                        <TableCell className="font-medium">{room.type}</TableCell>
                        <TableCell className="font-bold text-emerald-600">ETB {room.price}</TableCell>
                        <TableCell>
                          <Badge className={`${room.status === "Available" ? "bg-emerald-500" :
                            room.status === "Available (Future Bookings)" ? "bg-teal-500" :
                            room.status === "Occupied" ? "bg-blue-500" : "bg-slate-400"
                            } text-white text-xs shadow-sm`}>
                            {room.status === "Available" ? (t.dashboard?.available || 'Available') :
                              room.status === "Available (Future Bookings)" ? (t.dashboard?.availableFuture || 'Available (Booked Later)') :
                              room.status === "Occupied" ? (t.dashboard?.occupied || 'Occupied') :
                                (room.status || 'N/A')}
                          </Badge>
                        </TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>
                          <div className="flex justify-end pr-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 px-3 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors duration-200 rounded-lg"
                                >
                                  <span className="text-xs font-bold">{t.dashboard?.actions || "Actions"}</span>
                                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300 p-1">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/dashboard/rooms/${room.id}/calendar`)}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg transition-colors hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                                >
                                  <CalendarDays className="h-4 w-4" />
                                  <span className="font-medium text-sm">Availability Calendar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onDeleteRoom && onDeleteRoom(room.id)}
                                  disabled={room.status === 'Occupied'}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600 text-red-500 transition-colors"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  <span className="font-medium text-sm">{t.dashboard?.deleteRoom || "Delete Room"}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Unified Pagination Footer */}
            <div className="p-3 sm:p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 gap-2 overflow-hidden">
              <div className="text-[10px] sm:text-sm font-bold text-slate-500 shrink-0">
                <span className="hidden sm:inline">
                  {t.dashboard?.showingRooms ? (
                    t.dashboard.showingRooms.replace('{count}', String(safeRooms.length)).replace('{total}', String(totalItems))
                  ) : (
                    <>Showing <span className="text-slate-900">{safeRooms.length}</span> of <span className="text-slate-900">{totalItems}</span></>
                  )}
                </span>
                <span className="sm:hidden text-slate-900 font-extrabold">{safeRooms.length}/{totalItems}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <Select
                  value={String(pagination.limit)}
                  onValueChange={(val) => onLimitChange?.(parseInt(val))}
                >
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange?.(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map(pageNum => (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "ghost"}
                        onClick={() => onPageChange?.(pageNum)}
                        className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-sm transition-all duration-200 p-0 ${pagination.page === pageNum
                          ? "bg-[#F29F1F] text-slate-900 hover:bg-[#F29F1F]/90 shadow-md shadow-orange-200"
                          : "text-slate-500 hover:bg-slate-50"
                          }`}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>

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
    </div>
  );
};
