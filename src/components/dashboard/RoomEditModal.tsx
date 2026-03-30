import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoomEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  onUpdate: (roomData: any) => void;
}

export const RoomEditModal: React.FC<RoomEditModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    room_type: room?.room_type || '',
    floor: room?.floor || '',
    price_per_night: room?.price_per_night || '',
    number_of_beds: room?.number_of_beds || '',
    capacity: room?.capacity || '',
    availability_status: room?.availability_status || 'Available',
    package_id: room?.package_id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="room_type">Room Type</Label>
              <Input
                id="room_type"
                value={formData.room_type}
                onChange={(e) => handleChange('room_type', e.target.value)}
                placeholder="e.g., Single, Double, Suite"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) => handleChange('floor', e.target.value)}
                placeholder="e.g., 1, 2, 3"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_per_night">Price per Night (ETB)</Label>
              <Input
                id="price_per_night"
                type="number"
                value={formData.price_per_night}
                onChange={(e) => handleChange('price_per_night', e.target.value)}
                placeholder="e.g., 1500"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="number_of_beds">Number of Beds</Label>
              <Input
                id="number_of_beds"
                type="number"
                value={formData.number_of_beds}
                onChange={(e) => handleChange('number_of_beds', e.target.value)}
                placeholder="e.g., 1, 2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                placeholder="e.g., 2, 4"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="availability_status">Availability Status</Label>
              <Select
                value={formData.availability_status}
                onValueChange={(value) => handleChange('availability_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="package_id">Package ID</Label>
            <Input
              id="package_id"
              value={formData.package_id}
              onChange={(e) => handleChange('package_id', e.target.value)}
              placeholder="Package ID (optional)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Room
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
