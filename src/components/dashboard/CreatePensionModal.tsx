import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface CreatePensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPension: any;
  setNewPension: (pension: any) => void;
  onCreatePension: () => void;
  language: string;
  pensionImageFile: File | null;
  setPensionImageFile: (file: File | null) => void;
}

export const CreatePensionModal: React.FC<CreatePensionModalProps> = ({
  isOpen,
  onClose,
  newPension,
  setNewPension,
  onCreatePension,
  language,
  pensionImageFile,
  setPensionImageFile
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Create New Pension</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm font-semibold">Pension Name *</Label>
                <Input
                  id="name"
                  value={language === 'en' ? newPension.name_en : language === 'am' ? newPension.name_am : newPension.name_om}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (language === 'en') setNewPension({ ...newPension, name_en: value, name: value });
                    else if (language === 'am') setNewPension({ ...newPension, name_am: value });
                    else setNewPension({ ...newPension, name_om: value });
                  }}
                  placeholder="Enter pension name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-semibold">Address *</Label>
                <Input
                  id="address"
                  value={language === 'en' ? newPension.address_en : language === 'am' ? newPension.address_am : newPension.address_om}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (language === 'en') setNewPension({ ...newPension, address_en: value, address: value });
                    else if (language === 'am') setNewPension({ ...newPension, address_am: value });
                    else setNewPension({ ...newPension, address_om: value });
                  }}
                  placeholder="Enter address"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-semibold">Phone</Label>
                <Input
                  id="phone"
                  value={newPension.phone}
                  onChange={(e) => setNewPension({...newPension, phone: e.target.value})}
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPension.email}
                  onChange={(e) => setNewPension({...newPension, email: e.target.value})}
                  placeholder="Enter email"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="capacity" className="text-sm font-semibold">Total Capacity (Total Rooms)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newPension.capacity}
                  onChange={(e) => setNewPension({...newPension, capacity: e.target.value})}
                  placeholder="e.g. 20"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  value={language === 'en' ? newPension.description_en : language === 'am' ? newPension.description_am : newPension.description_om}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (language === 'en') setNewPension({ ...newPension, description_en: value, description: value });
                    else if (language === 'am') setNewPension({ ...newPension, description_am: value });
                    else setNewPension({ ...newPension, description_om: value });
                  }}
                  placeholder="Brief description of the pension"
                />
              </div>

              <div>
                <Label htmlFor="owner_info" className="text-sm font-semibold">Owner / Property Info</Label>
                <textarea
                  id="owner_info"
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  value={language === 'en' ? newPension.owner_info_en : language === 'am' ? newPension.owner_info_am : newPension.owner_info_om}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (language === 'en') setNewPension({ ...newPension, owner_info_en: value, owner_info: value });
                    else if (language === 'am') setNewPension({ ...newPension, owner_info_am: value });
                    else setNewPension({ ...newPension, owner_info_om: value });
                  }}
                  placeholder="Details about ownership and property type"
                />
              </div>

              <div>
                <Label htmlFor="room_details" className="text-sm font-semibold">Room Details Summary</Label>
                <textarea
                  id="room_details"
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  value={language === 'en' ? newPension.room_details_en : language === 'am' ? newPension.room_details_am : newPension.room_details_om}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (language === 'en') setNewPension({ ...newPension, room_details_en: value, room_details: value });
                    else if (language === 'am') setNewPension({ ...newPension, room_details_am: value });
                    else setNewPension({ ...newPension, room_details_om: value });
                  }}
                  placeholder="General info about rooms and amenities"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="image" className="text-sm font-semibold">Pension Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPensionImageFile(file);
                  setNewPension({...newPension, image_url: file.name});
                }
              }}
              className="mt-1 cursor-pointer"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onCreatePension} 
              disabled={!newPension.name || !newPension.address} 
              className="flex-1 h-11 text-base font-bold shadow-lg shadow-primary/20"
            >
              Create Pension
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 h-11 text-base font-medium">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
