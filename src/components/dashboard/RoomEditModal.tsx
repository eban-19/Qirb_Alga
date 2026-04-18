import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { TranslationText } from "@/components/TranslationText";

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
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    room_type: room?.room_type || '',
    room_type_en: room?.room_type_ml?.en || room?.room_type || '',
    room_type_am: room?.room_type_ml?.am || '',
    room_type_om: room?.room_type_ml?.om || '',
    floor: room?.floor || '',
    price_per_night: room?.price_per_night || '',
    number_of_beds: room?.number_of_beds || '',
    capacity: room?.capacity || '',
    availability_status: room?.availability_status || 'Available',
    package_id: room?.package_id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct multilingual room_type object
    const room_type_ml = {
      en: formData.room_type_en || formData.room_type,
      am: formData.room_type_am,
      om: formData.room_type_om
    };
    
    onUpdate({
      ...formData,
      room_type: formData.room_type_en || formData.room_type,
      room_type_ml
    });
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
          <DialogTitle><TranslationText text="Edit Room" language={language} /></DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label><TranslationText text="Room Type (English)" language={language} /></Label>
            <Input
              value={formData.room_type_en}
              onChange={(e) => handleChange('room_type_en', e.target.value)}
              placeholder="e.g., Single, Double, Suite"
              required
            />
          </div>
          
          <div>
            <Label><TranslationText text="Room Type (Amharic)" language={language} /></Label>
            <Input
              value={formData.room_type_am}
              onChange={(e) => handleChange('room_type_am', e.target.value)}
              placeholder="እቃ ክፍል (አማርኛ)"
            />
          </div>
          
          <div>
            <Label><TranslationText text="Room Type (Afaan Oromo)" language={language} /></Label>
            <Input
              value={formData.room_type_om}
              onChange={(e) => handleChange('room_type_om', e.target.value)}
              placeholder="Qubee (Afaan Oromoo)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="floor"><TranslationText text="Floor" language={language} /></Label>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) => handleChange('floor', e.target.value)}
                placeholder="e.g., 1, 2, 3"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="price_per_night"><TranslationText text="Price per Night (ETB)" language={language} /></Label>
              <Input
                id="price_per_night"
                type="number"
                value={formData.price_per_night}
                onChange={(e) => handleChange('price_per_night', e.target.value)}
                placeholder="e.g., 1500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="number_of_beds"><TranslationText text="Number of Beds" language={language} /></Label>
              <Input
                id="number_of_beds"
                type="number"
                value={formData.number_of_beds}
                onChange={(e) => handleChange('number_of_beds', e.target.value)}
                placeholder="e.g., 1, 2"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="capacity"><TranslationText text="Capacity" language={language} /></Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                placeholder="e.g., 2, 4"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="availability_status"><TranslationText text="Availability Status" language={language} /></Label>
              <Select
                value={formData.availability_status}
                onValueChange={(value) => handleChange('availability_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={<TranslationText text="Select status" language={language} />} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available"><TranslationText text="Available" language={language} /></SelectItem>
                  <SelectItem value="Occupied"><TranslationText text="Occupied" language={language} /></SelectItem>
                  <SelectItem value="Maintenance"><TranslationText text="Maintenance" language={language} /></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="package_id"><TranslationText text="Package ID" language={language} /></Label>
            <Input
              id="package_id"
              value={formData.package_id}
              onChange={(e) => handleChange('package_id', e.target.value)}
              placeholder="Package ID (optional)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <TranslationText text="Cancel" language={language} />
            </Button>
            <Button type="submit">
              <TranslationText text="Update Room" language={language} />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
