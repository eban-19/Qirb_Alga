import React from 'react';
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
  Edit
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { TranslationText } from "@/components/TranslationText";

interface GuestsSectionProps {
  guests: any[];
  viewMode: 'card' | 'table';
  onToggleView: () => void;
}

export const GuestsSection: React.FC<GuestsSectionProps> = ({
  guests,
  viewMode,
  onToggleView
}) => {
  const { language } = useLanguage();
  
  // Debug: Log guest data to see available fields
  console.log('🔍 Guests Section - Guest data:', guests);
  if (guests.length > 0) {
    console.log('🔍 First guest object structure:', guests[0]);
    console.log('🔍 First guest room fields:', {
      room_number: guests[0].room_number,
      roomId: guests[0].roomId,
      room_id: guests[0].room_id
    });
  }
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

      {/* Cards View */}
      {viewMode === "card" && (
        <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {guests.map((guest) => (
            <Card key={guest.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-bold shadow-lg group-hover:shadow-purple-500/25 group-hover:scale-110 transition-all duration-300">
                      {guest.name.charAt(0)}
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-purple-600 transition-colors">{guest.name}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {guest.email}
                      </p>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {guest.phone}
                      </p>
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
                    <span className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                      <Building className="h-4 w-4 text-purple-600" />
                      <TranslationText text="Nationality" language={language} />
                    </span>
                    <span className="font-bold text-slate-900">{guest.nationality}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                      <BedDouble className="h-4 w-4 text-purple-600" />
                      <TranslationText text="Room" language={language} />
                    </span>
                    <span className="font-bold text-slate-900">{guest.room_number || guest.roomId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                      <CalendarCheck className="h-4 w-4 text-purple-600" />
                      <TranslationText text="Total Bookings" language={language} />
                    </span>
                    <span className="font-bold text-slate-900">{guest.totalBookings}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-sm">
                    <span className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <TranslationText text="Total Spent" language={language} />
                    </span>
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
                    <TableHead className="font-bold"><TranslationText text="Guest" language={language} /></TableHead>
                    <TableHead className="font-bold"><TranslationText text="Contact" language={language} /></TableHead>
                    <TableHead className="font-bold"><TranslationText text="Nationality" language={language} /></TableHead>
                    <TableHead className="font-bold"><TranslationText text="Room" language={language} /></TableHead>
                    <TableHead className="font-bold"><TranslationText text="Status" language={language} /></TableHead>
                    <TableHead className="text-right font-bold"><TranslationText text="Total Bookings" language={language} /></TableHead>
                    <TableHead className="text-right font-bold"><TranslationText text="Total Spent" language={language} /></TableHead>
                    <TableHead className="font-bold"><TranslationText text="Actions" language={language} /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => (
                    <TableRow key={guest.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-bold text-slate-900">{guest.name}</p>
                          <p className="text-sm text-slate-500">{guest.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{guest.phone}</TableCell>
                      <TableCell>{guest.nationality}</TableCell>
                      <TableCell className="font-bold text-purple-700">{guest.room_number || guest.roomId || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          guest.status === 'Checked In' ? 'bg-emerald-500' :
                          guest.status === 'Checked Out' ? 'bg-slate-500' : 'bg-amber-500'
                        } text-white text-xs shadow-sm`}>
                          <TranslationText text={guest.status} language={language} />
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{guest.totalBookings}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">
                        ETB {guest.totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="hover:bg-purple-50 hover:text-purple-600">
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                            <Edit className="h-3.5 w-3.5" />
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
