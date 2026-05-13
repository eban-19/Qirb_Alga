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
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
        <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                <TranslationText text="Edit Room Details" language={language} />
              </DialogTitle>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Update configuration for this specific room unit</p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Naming & Locality */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Multilingual Naming</h3>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700"><TranslationText text="Room Type (English)" language={language} /></Label>
                  <Input
                    value={formData.room_type_en}
                    onChange={(e) => handleChange('room_type_en', e.target.value)}
                    placeholder="e.g., Luxury Double"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-medium"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700"><TranslationText text="Room Type (Amharic)" language={language} /></Label>
                  <Input
                    value={formData.room_type_am}
                    onChange={(e) => handleChange('room_type_am', e.target.value)}
                    placeholder="እቃ ክፍል..."
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700"><TranslationText text="Room Type (Afaan Oromo)" language={language} /></Label>
                  <Input
                    value={formData.room_type_om}
                    onChange={(e) => handleChange('room_type_om', e.target.value)}
                    placeholder="Qubee..."
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Configuration */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Inventory & Pricing</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floor" className="text-sm font-bold text-slate-700"><TranslationText text="Floor" language={language} /></Label>
                    <Input
                      id="floor"
                      value={formData.floor}
                      onChange={(e) => handleChange('floor', e.target.value)}
                      placeholder="e.g., 1"
                      className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-bold"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price_per_night" className="text-sm font-bold text-slate-700"><TranslationText text="Price per Night (ETB)" language={language} /></Label>
                    <Input
                      id="price_per_night"
                      type="number"
                      value={formData.price_per_night}
                      onChange={(e) => handleChange('price_per_night', e.target.value)}
                      placeholder="e.g., 1500"
                      className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-bold text-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number_of_beds" className="text-sm font-bold text-slate-700"><TranslationText text="Number of Beds" language={language} /></Label>
                    <Input
                      id="number_of_beds"
                      type="number"
                      value={formData.number_of_beds}
                      onChange={(e) => handleChange('number_of_beds', e.target.value)}
                      className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-sm font-bold text-slate-700"><TranslationText text="Capacity" language={language} /></Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleChange('capacity', e.target.value)}
                      className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availability_status" className="text-sm font-bold text-slate-700"><TranslationText text="Availability Status" language={language} /></Label>
                    <Select
                      value={formData.availability_status}
                      onValueChange={(value) => handleChange('availability_status', value)}
                    >
                      <SelectTrigger className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-medium">
                        <SelectValue placeholder={<TranslationText text="Select status" language={language} />} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        <SelectItem value="Available" className="rounded-lg"><TranslationText text="Available" language={language} /></SelectItem>
                        <SelectItem value="Occupied" className="rounded-lg"><TranslationText text="Occupied" language={language} /></SelectItem>
                        <SelectItem value="Maintenance" className="rounded-lg"><TranslationText text="Maintenance" language={language} /></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package_id" className="text-sm font-bold text-slate-700"><TranslationText text="Package ID" language={language} /></Label>
                    <Input
                      id="package_id"
                      value={formData.package_id}
                      onChange={(e) => handleChange('package_id', e.target.value)}
                      className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="h-12 px-8 rounded-xl font-bold border-2">
              <TranslationText text="Cancel" language={language} />
            </Button>
            <Button type="submit" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 rounded-xl font-bold text-lg active:scale-95 transition-all">
              <TranslationText text="Update Room" language={language} />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
