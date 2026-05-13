import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { LocationPicker } from '../ui/LocationPicker';

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <Card className="w-full max-w-4xl border-none shadow-2xl bg-white ring-1 ring-slate-200 rounded-[2rem] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <CardHeader className="pb-6 p-8">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New Pension</h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Define your property details and public profile</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-0">
          {/* Hero Map Section (Edge-to-Edge) */}
          <div className="w-full border-b border-slate-100">
            <LocationPicker
              onLocationSelect={(loc) => {
                setNewPension({
                  ...newPension,
                  address: loc.address,
                  address_en: loc.address,
                  latitude: loc.lat,
                  longitude: loc.lng
                });
              }}
              initialLat={newPension.latitude}
              initialLng={newPension.longitude}
              initialAddress={newPension.address}
            />
          </div>

          <div className="p-6 space-y-6">
            {/* Essential Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-bold text-slate-700">Pension Name *</Label>
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
                  className="mt-1.5 h-11 border-slate-200 bg-slate-50/30 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-bold text-slate-700">Phone</Label>
                <Input
                  id="phone"
                  value={newPension.phone}
                  onChange={(e) => setNewPension({ ...newPension, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="mt-1.5 h-11 border-slate-200 bg-slate-50/30 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPension.email}
                  onChange={(e) => setNewPension({ ...newPension, email: e.target.value })}
                  placeholder="Enter email"
                  className="mt-1.5 h-11 border-slate-200 bg-slate-50/30 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="capacity" className="text-sm font-bold text-slate-700">Total Capacity (Rooms)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newPension.capacity}
                  onChange={(e) => setNewPension({ ...newPension, capacity: e.target.value })}
                  placeholder="e.g. 20"
                  className="mt-1.5 h-11 border-slate-200 bg-slate-50/30 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Description & Info Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description" className="text-sm font-bold text-slate-700">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all mt-1.5"
                  value={language === 'en' ? newPension.description_en : language === 'am' ? newPension.description_am : newPension.description_om}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (language === 'en') setNewPension({ ...newPension, description_en: value, description: value });
                    else if (language === 'am') setNewPension({ ...newPension, description_am: value });
                    else setNewPension({ ...newPension, description_om: value });
                  }}
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <Label htmlFor="owner_info" className="text-sm font-bold text-slate-700">Owner Info</Label>
                <textarea
                  id="owner_info"
                  rows={3}
                  className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all mt-1.5"
                  value={language === 'en' ? newPension.owner_info_en : language === 'am' ? newPension.owner_info_am : newPension.owner_info_om}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (language === 'en') setNewPension({ ...newPension, owner_info_en: value, owner_info: value });
                    else if (language === 'am') setNewPension({ ...newPension, owner_info_am: value });
                    else setNewPension({ ...newPension, owner_info_om: value });
                  }}
                  placeholder="Ownership details..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image" className="text-sm font-bold text-slate-700">Property Cover Image</Label>
              <div className="mt-1.5 border-2 border-dashed border-primary/20 rounded-xl p-3 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all cursor-pointer group relative overflow-hidden">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPensionImageFile(file);
                      setNewPension({ ...newPension, image_url: file.name });
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer flex items-center justify-center gap-4 py-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-600 rounded-lg shadow-md flex items-center justify-center text-white transition-transform group-hover:scale-110 duration-200">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">
                    {pensionImageFile ? pensionImageFile.name : "Upload Pension Photo"}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={onCreatePension}
                disabled={!newPension.name || !newPension.address}
                className="flex-1 h-12 text-base font-bold shadow-lg shadow-primary/20 rounded-xl"
              >
                Create Pension
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1 h-12 text-base font-medium rounded-xl border-slate-200">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
