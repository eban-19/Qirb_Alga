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
  MoreVertical, 
  Edit2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ChevronDown 
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { TranslationText } from "@/components/TranslationText";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
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
  onBulkUpload?: () => void;
  pagination?: { page: number; limit: number };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  selectedRows?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
  onUpdateStatus?: (roomId: string | number, currentStatus: string) => void;
  totalItems?: number;
  language?: any;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  rooms = [],
  viewMode,
  onToggleView,
  onDeleteRoom,
  onAddNewRoom,
  onBulkUpload,
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
  const [roomToDelete, setRoomToDelete] = useState<any | null>(null);
  // Ensure rooms is always an array
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const totalPages = Math.ceil(totalItems / pagination.limit) || 1;

  // Generate page numbers
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
        <div className="sticky top-0 z-20 bg-white border border-slate-200 p-3 rounded-xl shadow-md flex items-center justify-between mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold">
              {selectedRows.length} selected
            </Badge>
            <p className="text-sm font-medium text-slate-600 hidden sm:block">Perform actions on all selected rooms</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.length === 1 && (
              <Button 
                size="sm" 
                variant="outline"
                className="font-bold text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100 shadow-sm"
                onClick={() => {
                  const room = rooms.find(r => String(r.id || r.room_id) === String(selectedRows[0]));
                  if (room) onEditRoom?.(room);
                }}
              >
                <Edit2 className="h-4 w-4 mr-1.5" />
                Edit Room
              </Button>
            )}
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
              <TrashIcon className="h-4 w-4 mr-2" />
              {selectedRows.length === 1 ? 'Delete' : `Delete ${selectedRows.length}`}
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
        title={selectedRows.length === 1 ? "Delete Room" : "Delete Rooms"}
        description={`Are you sure you want to permanently delete ${selectedRows.length === 1 ? "this room" : "these " + selectedRows.length + " rooms"}? This action cannot be reversed.`}
        itemCount={selectedRows.length}
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* View Toggle */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl shadow-inner w-fit">
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
            onClick={onAddNewRoom}
            className="flex-grow sm:flex-none gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all duration-300"
          >
            <LayoutDashboard className="h-4 w-4" />
            <TranslationText text="Add Rooms" language={language} />
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
                <TranslationText text="No rooms found" language={language} />
              </h3>
              <p className="text-slate-500 mb-4">
                <TranslationText text="Get started by adding your first room to this pension." language={language} />
              </p>
            </div>
          ) : (
            <div className="grid gap-6 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {safeRooms.map((room) => (
                <Card key={room.id} className={`group border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden bg-white hover:scale-[1.02] ${selectedRows.includes(room.id) ? 'ring-2 ring-primary' : ''}`}>
                  <div className={`h-3 w-full ${room.status === "Available" ? "bg-emerald-500" :
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
                          room.status === "Occupied" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                          }`}>
                          {room.room_number || room.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-slate-900">{room.type}</h3>
                          <p className="text-sm text-slate-500">
                            <TranslationText text="Room" language={language} /> {room.room_number || room.id}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${
                        room.status === "Available" ? "bg-emerald-500" :
                        room.status === "Occupied" ? "bg-blue-500" : "bg-slate-400"
                      } text-white text-xs px-3 py-1 shadow-sm`}>
                        <TranslationText text={room.status} language={language} />
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-bold text-slate-900">ETB {room.price}</span>
                      <span className="text-sm text-slate-500 font-medium">
                        <TranslationText text="per night" language={language} />
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
                               <TranslationText text="Actions" language={language} />
                             </span>
                             <ChevronDown className="h-4 w-4 opacity-50" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-200 p-1">
                           <DropdownMenuItem 
                             onClick={() => onUpdateStatus?.(room.id, room.status)}
                             disabled={room.status === 'Occupied'}
                             className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-colors ${room.status === 'Occupied' ? 'opacity-50 grayscale' : 'focus:bg-blue-50 focus:text-blue-600'}`}
                           >
                             <RotateCcw className="h-4 w-4" />
                             <div className="flex flex-col text-left">
                               <span className="font-bold text-sm">Toggle Status</span>
                               <span className="text-[10px] text-slate-500">
                                 {room.status === 'Occupied' ? 'Active booking' : (room.status === 'Available' ? 'Mark as Occupied' : 'Mark as Available')}
                               </span>
                             </div>
                           </DropdownMenuItem>
                           <div className="h-px bg-slate-100 my-1" />
                           <DropdownMenuItem 
                             onClick={() => setRoomToDelete(room)}
                             disabled={room.status === 'Occupied'}
                             className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600 transition-colors text-red-500"
                           >
                             <TrashIcon className="h-4 w-4" />
                             <div className="flex flex-col text-left">
                               <span className="font-bold text-sm">Delete Room</span>
                               <span className="text-[10px] text-slate-500">Remove permanently</span>
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
                      <TranslationText text="Room Number" language={language} />
                    </TableHead>
                    <TableHead className="font-bold">
                      <TranslationText text="Type" language={language} />
                    </TableHead>
                    <TableHead className="font-bold">
                      <TranslationText text="Price" language={language} />
                    </TableHead>
                    <TableHead className="font-bold">
                      <TranslationText text="Status" language={language} />
                    </TableHead>
                    <TableHead className="font-bold">
                      <TranslationText text="Capacity" language={language} />
                    </TableHead>
                    <TableHead className="font-bold text-right pr-4">
                      <TranslationText text="Actions" language={language} />
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
                            <TranslationText text="No rooms found" language={language} />
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
                          <Badge className={`${
                            room.status === "Available" ? "bg-emerald-500" :
                            room.status === "Occupied" ? "bg-blue-500" : "bg-slate-400"
                          } text-white text-xs shadow-sm`}>
                            <TranslationText text={room.status} language={language} />
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
                                   className="h-7 sm:h-9 px-1.5 sm:px-3 gap-1 sm:gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all duration-300 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold shrink-0"
                                 >
                                   <span className="text-[10px] sm:text-xs font-bold"><TranslationText text="Actions" language={language} /></span>
                                   <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-50 shrink-0" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-200 p-1">
                                <DropdownMenuItem 
                                  onClick={() => onUpdateStatus?.(room.id, room.status)}
                                  disabled={room.status === 'Occupied'}
                                  className={`flex items-center gap-2 p-2.5 cursor-pointer rounded-lg transition-colors ${room.status === 'Occupied' ? 'opacity-50 grayscale' : 'focus:bg-blue-50 focus:text-blue-600'}`}
                                >
                                  {room.status === 'Available' ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                  <span className="font-medium text-sm">
                                    {room.status === 'Occupied' ? 'Locked (Occupied)' : (room.status === 'Available' ? 'Mark Occupied' : 'Mark Available')}
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setRoomToDelete(room)}
                                  disabled={room.status === 'Occupied'}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600 text-red-500 transition-colors"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  <span className="font-medium text-sm">Delete Room</span>
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
            <div className="p-3 sm:p-8 border-t border-slate-50 flex flex-row items-center justify-between gap-1.5 sm:gap-4 bg-slate-50/30 overflow-hidden">
              <div className="text-[10px] sm:text-sm font-bold text-slate-500 shrink-0">
                <span className="hidden xs:inline sm:inline">Showing </span>
                <span className="text-slate-900">{safeRooms.length}</span> of <span className="text-slate-900">{totalItems}</span>
                <span className="hidden xs:inline sm:inline"> rooms</span>
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

      {/* Individual Room Custom Delete Confirmation Modal */}
      <ConfirmDeleteModal 
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        onConfirm={() => {
          if (roomToDelete && onDeleteRoom) {
            onDeleteRoom(roomToDelete.id || roomToDelete.room_id);
          }
          setRoomToDelete(null);
        }}
        title="Delete Room"
        description={`Are you sure you want to permanently delete Room ${roomToDelete?.room_number || roomToDelete?.id || ''}? This action cannot be reversed.`}
        itemCount={1}
      />
    </div>
  );
};
