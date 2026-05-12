import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  LayoutDashboard, 
  BarChart3, 
  TrashIcon 
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { TranslationText } from "@/components/TranslationText";

import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RoomsSectionProps {
  rooms: any[];
  viewMode: 'card' | 'table';
  onToggleView: () => void;
  onDeleteRoom?: (roomId: string | number) => void;
  onAddNewRoom?: () => void;
  onBulkUpload?: () => void;
  pagination?: { page: number; limit: number };
  onPageChange?: (page: number) => void;
  selectedRows?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
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
  selectedRows = [],
  onToggleSelection,
  onSelectAll,
  totalItems = 0,
  language
}) => {
  // Ensure rooms is always an array
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  
  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-primary text-white p-4 rounded-xl shadow-lg flex items-center justify-between mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-none px-3 py-1 font-bold">
              {selectedRows.length} Selected
            </Badge>
            <p className="text-sm font-medium hidden sm:block">Perform actions on all selected rooms</p>
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
                if (window.confirm(`Are you sure you want to delete ${selectedRows.length} rooms?`)) {
                  selectedRows.forEach(id => onDeleteRoom?.(id));
                  onSelectAll?.([]);
                }
              }}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Bulk Delete
            </Button>
          </div>
        </div>
      )}
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
            variant="outline" 
            onClick={onBulkUpload}
            className="flex-1 sm:flex-none gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 text-primary font-bold transition-all duration-300"
          >
            <LayoutDashboard className="h-4 w-4 rotate-180" />
            <TranslationText text="Bulk Upload" language={language} />
          </Button>
          <Button 
            onClick={onAddNewRoom}
            className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all duration-300"
          >
            <LayoutDashboard className="h-4 w-4" />
            <TranslationText text="Add Room" language={language} />
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2 hover:bg-red-50 hover:text-red-600 transition-all duration-300 h-10"
                        onClick={() => onDeleteRoom && onDeleteRoom(room.id)}
                        disabled={room.status === 'Occupied'}
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {room.status === 'Occupied' ? (
                            <TranslationText text="Occupied" language={language} />
                          ) : (
                            <TranslationText text="Delete" language={language} />
                          )}
                        </span>
                      </Button>
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
                    <TableHead className="font-bold">
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
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-red-50 hover:text-red-600"
                              onClick={() => onDeleteRoom && onDeleteRoom(room.id)}
                              disabled={room.status === 'Occupied'}
                              title={room.status === 'Occupied' ? 'Cannot delete occupied room' : 'Delete room'}
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-900">{safeRooms.length}</span> of <span className="font-semibold text-slate-900">{totalItems}</span> rooms
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
