import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Package as PackageIcon, X, Upload, Plus, CheckCircle2, Trash2, Box } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Package } from '../../types/dashboard';

interface AddPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPackage: any;
  setNewPackage: (pkg: any) => void;
  editingPackage: Package | null;
  onAddPackage: () => void;
  language: string;
  handlePackageImageUpload: (file: File) => void;
}

export const AddPackageModal: React.FC<AddPackageModalProps> = ({
  isOpen,
  onClose,
  newPackage,
  setNewPackage,
  editingPackage,
  onAddPackage,
  language,
  handlePackageImageUpload
}) => {
  if (!isOpen) return null;

  const handleRemoveImage = (index: number) => {
    const currentImages = newPackage.images || [];
    const updatedImages = currentImages.filter((_: any, i: number) => i !== index);
    setNewPackage({
      ...newPackage,
      images: updatedImages,
      image: updatedImages.length > 0 ? updatedImages[0] : null
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] border-none shadow-2xl bg-white ring-1 ring-slate-200 overflow-hidden flex flex-col rounded-[2rem]">
        <CardHeader className="pb-4 border-b border-slate-50">
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 shadow-md">
                <PackageIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingPackage ? 'Edit Package Tier' : 'Create New Package Tier'}
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  {editingPackage ? 'Update your package details and pricing' : 'Define a new pricing category for your rooms'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Basic Details */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Package Name</Label>
                  <Input
                    value={(language === 'en' ? newPackage.name_en : language === 'am' ? newPackage.name_am : newPackage.name_om) || newPackage.name || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (language === 'en') setNewPackage({ ...newPackage, name_en: value, name: value });
                      else if (language === 'am') setNewPackage({ ...newPackage, name_am: value });
                      else setNewPackage({ ...newPackage, name_om: value });
                    }}
                    placeholder="e.g., Luxury Double"
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-purple-500/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Price per Night (ETB)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">ETB</span>
                    <Input
                      value={newPackage.price}
                      onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                      type="number"
                      className="h-12 pl-14 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-purple-500/20 text-lg font-bold text-purple-600"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Description</Label>
                  <textarea
                    value={(language === 'en' ? newPackage.description_en : language === 'am' ? newPackage.description_am : newPackage.description_om) || newPackage.description || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (language === 'en') setNewPackage({ ...newPackage, description_en: value, description: value });
                      else if (language === 'am') setNewPackage({ ...newPackage, description_am: value });
                      else setNewPackage({ ...newPackage, description_om: value });
                    }}
                    rows={4}
                    placeholder="Provide a detailed description of what this package offers..."
                    className="w-full border-slate-200 bg-slate-50/30 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all min-h-[120px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Settings</h3>
                <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-purple-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${newPackage.isMostPopular ? 'bg-purple-100 text-purple-600 shadow-inner' : 'bg-white text-slate-400 shadow-sm'}`}>
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <Label className="text-base font-bold text-slate-800 cursor-pointer">Most Popular</Label>
                      <p className="text-xs text-slate-500 font-medium">Highlight this package to potential guests</p>
                    </div>
                  </div>
                  <Switch 
                    checked={newPackage.isMostPopular}
                    onCheckedChange={(checked) => setNewPackage({ ...newPackage, isMostPopular: checked })}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Services & Media */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Services & Amenities</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newPackage.customService || ''}
                      onChange={(e) => setNewPackage({ ...newPackage, customService: e.target.value })}
                      placeholder="e.g., Free High-Speed WiFi"
                      className="h-12 border-slate-200 bg-slate-50/30 rounded-xl"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newPackage.customService?.trim()) {
                            setNewPackage({
                              ...newPackage,
                              services: [...(newPackage.services || []), newPackage.customService.trim()],
                              customService: ''
                            });
                          }
                        }
                      }}
                    />
                    <Button 
                      type="button"
                      variant="secondary"
                      className="h-12 w-12 p-0 bg-purple-600 text-white hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                      onClick={() => {
                        if (newPackage.customService?.trim()) {
                          setNewPackage({
                            ...newPackage,
                            services: [...(newPackage.services || []), newPackage.customService.trim()],
                            customService: ''
                          });
                        }
                      }}
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2.5 mt-4 min-h-[60px] p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    {(newPackage.services || []).map((service: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl text-sm font-bold border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-300 group hover:border-purple-300 hover:text-purple-600 transition-all">
                        {service}
                        <button 
                          onClick={() => setNewPackage({
                            ...newPackage,
                            services: (newPackage.services || []).filter((_: any, i: number) => i !== idx)
                          })}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {(newPackage.services || []).length === 0 && (
                      <p className="text-slate-400 text-sm italic font-medium m-auto">No services added yet...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Virtual Experience</h3>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Box className="h-4 w-4 text-purple-600" /> Virtual Tour / 3D Image URL
                  </Label>
                  <Input
                    value={newPackage.virtual_tour_url || ''}
                    onChange={(e) => setNewPackage({ ...newPackage, virtual_tour_url: e.target.value })}
                    placeholder="e.g., https://my.matterport.com/show/?m=..."
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl focus:ring-purple-500/20"
                  />
                  <p className="text-[10px] text-slate-500 font-medium">Link to your 360° virtual tour or 3D panorama</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Package Gallery</h3>
                <div className="grid grid-cols-2 gap-4">
                  {(newPackage.images || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative group aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                      <img src={img} alt={`Package ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-9 w-9 rounded-full p-0 shadow-xl"
                          onClick={() => handleRemoveImage(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="relative aspect-video border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-purple-50 hover:border-purple-300 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group">
                    <div className="p-3 rounded-full bg-white text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-purple-600">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          Array.from(files).forEach(file => handlePackageImageUpload(file));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center">Recommended size: 1200x800px • Support for JPG, PNG, WEBP</p>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4">
          <Button variant="outline" onClick={onClose} className="flex-1 h-14 rounded-2xl font-bold text-slate-600 border-2 hover:bg-white transition-all">Cancel</Button>
          <Button onClick={onAddPackage} className="flex-[2] h-14 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
            {editingPackage ? 'Update Package Tier' : 'Create Package Tier'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
