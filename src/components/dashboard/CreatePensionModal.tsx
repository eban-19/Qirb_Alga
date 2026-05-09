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
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Create New Pension</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          <div>
            <Label htmlFor="name">Pension Name *</Label>
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
            />
          </div>
          <div>
            <Label htmlFor="address">Address *</Label>
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
            />
          </div>
          <div>
            <Label htmlFor="image">Pension Image</Label>
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
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={newPension.phone}
              onChange={(e) => setNewPension({...newPension, phone: e.target.value})}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newPension.email}
              onChange={(e) => setNewPension({...newPension, email: e.target.value})}
              placeholder="Enter email"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={onCreatePension} disabled={!newPension.name || !newPension.address} className="flex-1">
              Create Pension
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
