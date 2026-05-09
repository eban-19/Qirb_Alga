import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Bed, X, Package as PackageIcon, Home, Hash, Users } from 'lucide-react';
import { Package } from '../../types/dashboard';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  newRoom: any;
  setNewRoom: (room: any) => void;
  packages: Package[];
  onAddRoom: () => void;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  newRoom,
  setNewRoom,
  packages,
  onAddRoom
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden border-none shadow-2xl bg-white ring-1 ring-slate-200">
        <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shadow-lg">
                <Bed className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add New Room</h2>
                <p className="text-sm text-slate-500 mt-1">Enter room details</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-slate-100">
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] px-6">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <PackageIcon className="h-4 w-4 text-primary" /> Select Package
            </Label>
            <select
              value={newRoom.package}
              onChange={(e) => {
                const selectedPackage = packages.find(p => String(p.id || p.package_id) === String(e.target.value));
                setNewRoom({ 
                  ...newRoom, 
                  package: e.target.value,
                  type: selectedPackage?.name || '',
                  capacity: selectedPackage?.services?.length ? '2' : '1',
                  numberOfBeds: selectedPackage?.name?.includes('Double') ? '2' : '1'
                });
              }}
              className="h-10 w-full border rounded-lg px-3 bg-slate-50/30"
            >
              <option value="">Select a package</option>
              {packages.map(pkg => (
                <option key={String(pkg.id || pkg.package_id)} value={String(pkg.id || pkg.package_id)}>
                  {pkg.name} - ETB {pkg.price}/night
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" /> Room Type
            </Label>
            <Input
              value={newRoom.type || ''}
              onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
              placeholder="e.g., Double, Single, Suite"
              className="h-10 border-slate-200 bg-slate-50/30"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" /> Room Numbers (comma-separated)
            </Label>
            <Input
              value={newRoom.roomNumbers || ''}
              onChange={(e) => setNewRoom({ ...newRoom, roomNumbers: e.target.value })}
              placeholder="e.g., 201, 202, 203"
              className="h-10 border-slate-200 bg-slate-50/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Number of Beds</Label>
              <Input
                value={newRoom.numberOfBeds || ''}
                onChange={(e) => setNewRoom({ ...newRoom, numberOfBeds: e.target.value })}
                type="number"
                className="h-10 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Capacity
              </Label>
              <Input
                value={newRoom.capacity}
                onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                type="number"
                className="h-10 border-slate-200 bg-slate-50/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Status</Label>
            <select
              value={newRoom.status}
              onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
              className="h-10 w-full border border-slate-200 bg-slate-50/30 rounded-lg px-3"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11">Cancel</Button>
            <Button onClick={onAddRoom} className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              Add Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
