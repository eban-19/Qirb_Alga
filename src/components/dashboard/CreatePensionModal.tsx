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
        
        <CardContent className="p-8 pt-0 space-y-8 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Basic Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Basic Information</h3>
                
                <div className="space-y-2">
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
                    placeholder="e.g., Sunshine Pension"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-bold text-slate-700">Location Address *</Label>
                  <Input
                    id="address"
                    value={language === 'en' ? newPension.address_en : language === 'am' ? newPension.address_am : newPension.address_om}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (language === 'en') setNewPension({ ...newPension, address_en: value, address: value });
                      else if (language === 'am') setNewPension({ ...newPension, address_am: value });
                      else setNewPension({ ...newPension, address_om: value });
                    }}
                    placeholder="e.g., Addis Ababa, Bole Sub-city"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-bold text-slate-700">Contact Phone</Label>
                    <Input
                      id="phone"
                      value={newPension.phone}
                      onChange={(e) => setNewPension({...newPension, phone: e.target.value})}
                      placeholder="+251 ..."
                      className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-sm font-bold text-slate-700">Total Rooms</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newPension.capacity}
                      onChange={(e) => setNewPension({...newPension, capacity: e.target.value})}
                      placeholder="e.g., 25"
                      className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-700">Official Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPension.email}
                    onChange={(e) => setNewPension({...newPension, email: e.target.value})}
                    placeholder="contact@pension.com"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Content & Profile</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-bold text-slate-700">Public Description</Label>
                  <textarea
                    id="description"
                    rows={2}
                    className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
                    value={language === 'en' ? newPension.description_en : language === 'am' ? newPension.description_am : newPension.description_om}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (language === 'en') setNewPension({ ...newPension, description_en: value, description: value });
                      else if (language === 'am') setNewPension({ ...newPension, description_am: value });
                      else setNewPension({ ...newPension, description_om: value });
                    }}
                    placeholder="Highlight your property's best features..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_info" className="text-sm font-bold text-slate-700">Owner & Property Background</Label>
                  <textarea
                    id="owner_info"
                    rows={2}
                    className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
                    value={language === 'en' ? newPension.owner_info_en : language === 'am' ? newPension.owner_info_am : newPension.owner_info_om}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (language === 'en') setNewPension({ ...newPension, owner_info_en: value, owner_info: value });
                      else if (language === 'am') setNewPension({ ...newPension, owner_info_am: value });
                      else setNewPension({ ...newPension, owner_info_om: value });
                    }}
                    placeholder="Details about ownership and history..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-bold text-slate-700">Property Cover Image</Label>
                  <div className="relative">
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
                      className="h-12 pt-2.5 border-slate-200 bg-slate-50/30 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold border-2">Cancel</Button>
            <Button 
              onClick={onCreatePension} 
              disabled={!newPension.name || !newPension.address} 
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 rounded-xl font-bold text-lg active:scale-95 transition-all"
            >
              Create Property
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
