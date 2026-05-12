import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Package as PackageIcon, X, Upload, Plus, CheckCircle2 } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[85vh] border-none shadow-2xl bg-white ring-1 ring-slate-200 overflow-y-auto">
        <div className="h-2 w-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 shadow-lg">
                <PackageIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingPackage ? 'Edit Package' : 'Add New Package'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {editingPackage ? 'Update package details' : 'Create a new package tier'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-slate-100">
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Package Name</Label>
            <Input
              value={language === 'en' ? newPackage.name_en : language === 'am' ? newPackage.name_am : newPackage.name_om}
              onChange={(e) => {
                const value = e.target.value;
                if (language === 'en') setNewPackage({ ...newPackage, name_en: value, name: value });
                else if (language === 'am') setNewPackage({ ...newPackage, name_am: value });
                else setNewPackage({ ...newPackage, name_om: value });
              }}
              placeholder="e.g., Luxury Double"
              className="h-10 border-slate-200 bg-slate-50/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Price per Night (ETB)</Label>
            <Input
              value={newPackage.price}
              onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
              type="number"
              className="h-10 border-slate-200 bg-slate-50/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Description</Label>
            <textarea
              value={language === 'en' ? newPackage.description_en : language === 'am' ? newPackage.description_am : newPackage.description_om}
              onChange={(e) => {
                const value = e.target.value;
                if (language === 'en') setNewPackage({ ...newPackage, description_en: value, description: value });
                else if (language === 'am') setNewPackage({ ...newPackage, description_am: value });
                else setNewPackage({ ...newPackage, description_om: value });
              }}
              rows={2}
              className="w-full border-slate-200 bg-slate-50/30 rounded-lg px-3 py-2 outline-none resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Services Included</Label>
            <div className="flex gap-2">
              <Input
                value={newPackage.customService || ''}
                onChange={(e) => setNewPackage({ ...newPackage, customService: e.target.value })}
                placeholder="e.g., Free WiFi"
                className="h-10 border-slate-200 bg-slate-50/30"
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
                size="sm"
                className="h-10 px-3 bg-purple-50 text-purple-600 hover:bg-purple-100"
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
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(newPackage.services || []).map((service: string, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100 shadow-sm animate-in fade-in zoom-in duration-200">
                  {service}
                  <button 
                    onClick={() => setNewPackage({
                      ...newPackage,
                      services: (newPackage.services || []).filter((_: any, i: number) => i !== idx)
                    })}
                    className="hover:text-purple-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${newPackage.isMostPopular ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-500'}`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-sm font-bold text-slate-700 cursor-pointer">Most Popular</Label>
                <p className="text-[10px] text-slate-500">Highlights this package to users</p>
              </div>
            </div>
            <Switch 
              checked={newPackage.isMostPopular}
              onCheckedChange={(checked) => setNewPackage({ ...newPackage, isMostPopular: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Package Image</Label>
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white hover:border-purple-400">
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Upload className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-semibold">Click to upload</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePackageImageUpload(file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {newPackage.image && (
              <img src={newPackage.image} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2" />
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 h-10">Cancel</Button>
            <Button onClick={onAddPackage} className="flex-1 h-10 bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
              {editingPackage ? 'Update Package' : 'Add Package'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
