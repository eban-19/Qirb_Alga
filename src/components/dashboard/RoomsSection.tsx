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

interface RoomsSectionProps {
  rooms: any[];
  viewMode: 'card' | 'table';
  onToggleView: () => void;
  onDeleteRoom?: (roomId: string | number) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  rooms = [], // Default to empty array
  viewMode,
  onToggleView,
  onDeleteRoom
}) => {
  // Ensure rooms is always an array
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  
  return (
    <div className="space-y-6">
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

      {/* Cards View */}
      {viewMode === "card" && (
        <>
          {safeRooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No rooms found</h3>
              <p className="text-slate-500 mb-4">Get started by adding your first room to this pension.</p>
            </div>
          ) : (
            <div className="grid gap-6 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {safeRooms.map((room) => (
            <Card key={room.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden bg-white hover:scale-[1.02]">
              <div className={`h-3 w-full ${room.status === "Available" ? "bg-emerald-500" :
                room.status === "Occupied" ? "bg-blue-500" : "bg-slate-400"
                }`} />
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-14 w-14 flex items-center justify-center rounded-xl font-bold text-xl shadow-lg ${room.status === "Available" ? "bg-emerald-100 text-emerald-700" :
                      room.status === "Occupied" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                      }`}>
                      {room.room_number || room.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900">{room.type}</h3>
                      <p className="text-sm text-slate-500">Room {room.room_number || room.id}</p>
                    </div>
                  </div>
                  <Badge className={`${
                    room.status === "Available" ? "bg-emerald-500" :
                    room.status === "Occupied" ? "bg-blue-500" : "bg-slate-400"
                  } text-white text-xs px-3 py-1 shadow-sm`}>
                    {room.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-bold text-slate-900">ETB {room.price}</span>
                  <span className="text-sm text-slate-500 font-medium">per night</span>
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
                      {room.status === 'Occupied' ? 'Occupied' : 'Delete'}
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
                    <TableHead className="font-bold">Room Number</TableHead>
                    <TableHead className="font-bold">Type</TableHead>
                    <TableHead className="font-bold">Price</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Capacity</TableHead>
                    <TableHead className="font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeRooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <LayoutDashboard className="h-12 w-12 text-slate-400 mb-2" />
                          <p className="text-slate-500">No rooms found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    safeRooms.map((room) => (
                      <TableRow key={room.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-bold">{room.room_number || room.id}</TableCell>
                        <TableCell className="font-medium">{room.type}</TableCell>
                        <TableCell className="font-bold text-emerald-600">ETB {room.price}</TableCell>
                        <TableCell>
                          <Badge className={`${
                            room.status === "Available" ? "bg-emerald-500" :
                            room.status === "Occupied" ? "bg-blue-500" : "bg-slate-400"
                          } text-white text-xs shadow-sm`}>
                            {room.status}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};
