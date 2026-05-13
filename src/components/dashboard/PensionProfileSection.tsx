import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Image as ImageIcon, 
  FileText, 
  Users, 
  BedDouble,
  CheckCircle
} from 'lucide-react';

interface PensionProfileSectionProps {
  propertySettings: any;
  setPropertySettings: (settings: any) => void;
  onSaveProfile: () => void;
  isUpdating: boolean;
  showSaveSuccess: boolean;
  pensionProfileImageFile: File | null;
  setPensionProfileImageFile: (file: File | null) => void;
}

export const PensionProfileSection: React.FC<PensionProfileSectionProps> = ({
  propertySettings,
  setPropertySettings,
  onSaveProfile,
  isUpdating,
  showSaveSuccess,
  pensionProfileImageFile,
  setPensionProfileImageFile,
}) => {
  return (
    <div className="space-y-6">
      {showSaveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 shadow-sm transition-all duration-300">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold text-sm">Pension profile updated successfully!</span>
        </div>
      )}

      <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
        <div className="h-2 w-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Building className="h-6 w-6" />
            </div>
            <span>Pension Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-600" /> Pension Name
              </Label>
              <Input
                value={propertySettings.name}
                onChange={(e) => setPropertySettings({ ...propertySettings, name: e.target.value })}
                placeholder="e.g., Sunshine Pension"
                className="h-11 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" /> Location
              </Label>
              <Input
                value={propertySettings.address}
                onChange={(e) => setPropertySettings({ ...propertySettings, address: e.target.value })}
                placeholder="e.g., Bole, Addis Ababa"
                className="h-11 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-600" /> Contact Phone
              </Label>
              <Input
                value={propertySettings.phone}
                onChange={(e) => setPropertySettings({ ...propertySettings, phone: e.target.value })}
                placeholder="+251 ..."
                className="h-11 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" /> Contact Email
              </Label>
              <Input
                value={propertySettings.email}
                onChange={(e) => setPropertySettings({ ...propertySettings, email: e.target.value })}
                placeholder="info@pension.com"
                className="h-11 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-purple-600" /> Total Capacity (Rooms)
              </Label>
              <Input
                type="number"
                value={propertySettings.capacity}
                onChange={(e) => setPropertySettings({ ...propertySettings, capacity: e.target.value })}
                placeholder="e.g., 20"
                className="h-11 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-purple-600" /> Pension Image
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPensionProfileImageFile(file);
                    setPropertySettings({ ...propertySettings, imageUrl: file.name });
                  }
                }}
                className="cursor-pointer border-slate-200 bg-slate-50/30 h-11 py-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" /> About Description
              </Label>
              <textarea
                value={propertySettings.description}
                onChange={(e) => setPropertySettings({ ...propertySettings, description: e.target.value })}
                placeholder="Describe your pension..."
                rows={4}
                className="w-full border border-slate-200 bg-slate-50/30 rounded-lg px-3 py-2 outline-none resize-none focus:border-purple-300 transition-all duration-200 min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" /> Owner / Property Info
              </Label>
              <textarea
                value={propertySettings.ownerInfo}
                onChange={(e) => setPropertySettings({ ...propertySettings, ownerInfo: e.target.value })}
                placeholder="Details about ownership..."
                rows={4}
                className="w-full border border-slate-200 bg-slate-50/30 rounded-lg px-3 py-2 outline-none resize-none focus:border-purple-300 transition-all duration-200 min-h-[120px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-purple-600" /> Room Details Summary
            </Label>
            <textarea
              value={propertySettings.roomDetails}
              onChange={(e) => setPropertySettings({ ...propertySettings, roomDetails: e.target.value })}
              placeholder="Summary of room types and features..."
              rows={3}
              className="w-full border border-slate-200 bg-slate-50/30 rounded-lg px-3 py-2 outline-none resize-none focus:border-purple-300 transition-all duration-200 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={onSaveProfile} disabled={isUpdating} className="h-11 px-8 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg">
              {isUpdating ? 'Updating...' : 'Update Pension Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
