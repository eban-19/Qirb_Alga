import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Bed, X, Package as PackageIcon, Home, Hash, Users, AlertCircle } from 'lucide-react';
import { Package } from '../../types/dashboard';
import { useLanguage } from '../../hooks/use-language';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  newRoom: any;
  setNewRoom: (room: any) => void;
  packages: Package[];
  onAddRoom: () => void;
  existingRooms: any[];
  errorMessage?: string;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  newRoom,
  setNewRoom,
  packages,
  onAddRoom,
  existingRooms,
  errorMessage
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden border-none shadow-2xl bg-white ring-1 ring-slate-200 rounded-[2rem]">
        <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 shadow-lg">
                <Bed className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.dashboard?.addNewRoom || "Add New Room"}</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">{t.dashboard?.addRoomDesc || "Configure your property's room details"}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 overflow-y-auto max-h-[calc(90vh-140px)] p-8">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-red-900">{t.dashboard?.actionRequired || "Action Required"}</h4>
                <p className="text-sm text-red-700 opacity-80">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{t.dashboard?.categoryAndType || "Category & Type"}</h3>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <PackageIcon className="h-4 w-4 text-blue-600" /> {t.dashboard?.selectPackageTier || "Select Package Tier"}
                  </Label>
                  <select
                    value={newRoom.package}
                    onChange={(e) => {
                      const pkgId = e.target.value;
                      const selectedPackage = packages.find(p => String(p.id || p.package_id) === String(pkgId));
                      const firstExistingRoom = existingRooms.find(r => String(r.package_id) === String(pkgId));
                      
                      if (firstExistingRoom) {
                        setNewRoom({ 
                          ...newRoom, 
                          package: pkgId,
                          type: firstExistingRoom.room_type || selectedPackage?.name || '',
                          capacity: String(firstExistingRoom.capacity || '1'),
                          numberOfBeds: String(firstExistingRoom.number_of_beds || '1'),
                          status: 'Available'
                        });
                      } else {
                        setNewRoom({ 
                          ...newRoom, 
                          package: pkgId,
                          type: selectedPackage?.name || '',
                          capacity: selectedPackage?.services?.length ? '2' : '1',
                          numberOfBeds: selectedPackage?.name?.includes('Double') ? '2' : '1'
                        });
                      }
                    }}
                    className="h-12 w-full border border-slate-200 rounded-xl px-4 bg-slate-50/30 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-slate-700"
                  >
                    <option value="">{t.dashboard?.selectPackage || "Select a package"}</option>
                    {packages.map(pkg => (
                      <option key={String(pkg.id || pkg.package_id)} value={String(pkg.id || pkg.package_id)}>
                        {pkg.name} - ETB {pkg.price}/{t.dashboard?.perNight || "night"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Home className="h-4 w-4 text-blue-600" /> {t.dashboard?.roomTypeName || "Room Type Name"}
                  </Label>
                  <Input
                    value={newRoom.type || ''}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                    placeholder="e.g., Luxury Double"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" /> {t.dashboard?.currentStatus || "Current Status"}
                  </Label>
                  <select
                    value={newRoom.status}
                    onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
                    className="h-12 w-full border border-slate-200 bg-slate-50/30 rounded-xl px-4 outline-none font-medium text-slate-700"
                  >
                    <option value="Available">{t.dashboard?.available || "Available"}</option>
                    <option value="Occupied">{t.dashboard?.occupied || "Occupied"}</option>
                    <option value="Maintenance">{t.dashboard?.maintenance || "Maintenance"}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{t.dashboard?.inventoryCapacity || "Inventory & Capacity"}</h3>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-600" /> {t.dashboard?.roomNumbers || "Room Numbers"}
                  </Label>
                  <Input
                    value={newRoom.roomNumbers || ''}
                    onChange={(e) => {
                      const numbers = e.target.value;
                      const count = numbers.split(',').map(n => n.trim()).filter(n => n !== '').length;
                      setNewRoom({ 
                        ...newRoom, 
                        roomNumbers: numbers,
                        numberOfRooms: count > 0 ? String(count) : newRoom.numberOfRooms
                      });
                    }}
                    placeholder="e.g., 201, 202, 203"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                  />
                  <p className="text-[10px] text-slate-400 font-medium pl-1 italic">{t.dashboard?.roomNumbersHelp || "Enter multiple room numbers separated by commas"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">{t.dashboard?.totalRooms || "Total Rooms"}</Label>
                    <Input
                      value={newRoom.numberOfRooms}
                      onChange={(e) => setNewRoom({ ...newRoom, numberOfRooms: e.target.value })}
                      type="number"
                      min="1"
                      className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">{t.dashboard?.totalBeds || "Total Beds"}</Label>
                    <Input
                      value={newRoom.numberOfBeds || ''}
                      onChange={(e) => setNewRoom({ ...newRoom, numberOfBeds: e.target.value })}
                      type="number"
                      className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" /> {t.dashboard?.maximumCapacity || "Maximum Capacity"}
                  </Label>
                  <Input
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                    type="number"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 text-lg font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold border-2">
              {t.dashboard?.cancel || "Cancel"}
            </Button>
            <Button 
              onClick={() => {
                if (!newRoom.package) return;
                onAddRoom();
              }} 
              disabled={!newRoom.package}
              className={`flex-1 h-12 shadow-lg transition-all rounded-xl font-bold text-lg ${
                !newRoom.package 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-blue-500/25"
              }`}
            >
              {!newRoom.package ? (t.dashboard?.selectPackage || "Select Package") : (t.dashboard?.addRooms || "Add Rooms")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
