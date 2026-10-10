import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { LocationPicker } from '../ui/LocationPicker';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Image as ImageIcon,
  FileText,
  Users,
  BedDouble,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../hooks/use-language';
import {
  filterPhoneInput,
  filterIntegerInput,
  validateRequiredText,
  validatePhone,
  validateEmail,
  validatePositiveInteger
} from '../../utils/validation';

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
  const { t } = useLanguage();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    const nameVal = validateRequiredText(propertySettings.name, 'Pension Name', 2, 100);
    if (!nameVal.isValid) {
      setError(nameVal.error);
      return;
    }
    if (propertySettings.phone && propertySettings.phone.trim()) {
      const phoneVal = validatePhone(propertySettings.phone, false);
      if (!phoneVal.isValid) {
        setError(phoneVal.error);
        return;
      }
    }
    if (propertySettings.email && propertySettings.email.trim()) {
      const emailVal = validateEmail(propertySettings.email, false);
      if (!emailVal.isValid) {
        setError(emailVal.error);
        return;
      }
    }
    if (propertySettings.capacity !== undefined && propertySettings.capacity !== '') {
      const capVal = validatePositiveInteger(propertySettings.capacity, 'Total Capacity', 1, 1000);
      if (!capVal.isValid) {
        setError(capVal.error);
        return;
      }
    }
    onSaveProfile();
  };

  const getFullImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) return '';
    if (typeof imagePath !== 'string') return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;

    // Normalize path
    let normalizedPath = imagePath;
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }

    // If it doesn't already contain 'uploads', assume it belongs in uploads
    if (!normalizedPath.toLowerCase().includes('uploads')) {
      normalizedPath = '/uploads' + normalizedPath;
    }

    return `http://localhost:3006${normalizedPath}`;
  };

  const currentImageUrl = propertySettings?.imageUrl || propertySettings?.image_url;
  const displayUrl = previewUrl || getFullImageUrl(currentImageUrl);
  return (
    <div className="space-y-6">
      {showSaveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 shadow-sm transition-all duration-300">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold text-sm">{t.dashboard?.pensionProfileUpdated || "Pension profile updated successfully!"}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold text-rose-500 hover:text-rose-700 ml-2">✕</button>
        </div>
      )}

      <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Building className="h-6 w-6" />
            </div>
            <span>{t.dashboard?.pensionProfile || "Pension Profile"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-600" /> {t.dashboard?.pensionName || "Pension Name"}
              </Label>
              <Input
                value={propertySettings.name}
                onChange={(e) => {
                  setPropertySettings({ ...propertySettings, name: e.target.value });
                  if (error) setError(null);
                }}
                placeholder="e.g., Sunshine Pension"
                className="h-11 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" /> {t.dashboard?.location || "Location"}
              </Label>
              <Input
                value={propertySettings.address}
                onChange={(e) => {
                  setPropertySettings({ ...propertySettings, address: e.target.value });
                  if (error) setError(null);
                }}
                placeholder="e.g., Bole, Addis Ababa"
                className="h-11 border-slate-200 bg-slate-50/30"
              />

              <div className="mt-4 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                <LocationPicker
                  onLocationSelect={(loc) => {
                    setPropertySettings({
                      ...propertySettings,
                      address: loc.address,
                      latitude: loc.lat,
                      longitude: loc.lng
                    });
                  }}
                  initialLat={propertySettings.latitude}
                  initialLng={propertySettings.longitude}
                  initialAddress={propertySettings.address}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-600" /> {t.dashboard?.contactPhone || "Contact Phone"}
              </Label>
              <Input
                value={propertySettings.phone}
                onChange={(e) => {
                  setPropertySettings({ ...propertySettings, phone: filterPhoneInput(e.target.value) });
                  if (error) setError(null);
                }}
                placeholder="0911..."
                className="h-11 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" /> {t.dashboard?.contactEmail || "Contact Email"}
              </Label>
              <Input
                value={propertySettings.email}
                onChange={(e) => {
                  setPropertySettings({ ...propertySettings, email: e.target.value });
                  if (error) setError(null);
                }}
                placeholder="info@pension.com"
                className="h-11 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-purple-600" /> {t.dashboard?.totalCapacityRooms || "Total Capacity (Rooms)"}
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                value={propertySettings.capacity}
                onChange={(e) => {
                  setPropertySettings({ ...propertySettings, capacity: filterIntegerInput(e.target.value) });
                  if (error) setError(null);
                }}
                placeholder="e.g., 20"
                className="h-11 border-slate-200 bg-slate-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-purple-600" /> {t.dashboard?.pensionImage || "Pension Image"}
              </Label>

              {displayUrl && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden mb-2 border border-slate-100 group">
                  <img
                    src={displayUrl}
                    alt="Pension Preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <p className="text-white text-xs font-bold">{t.dashboard?.currentImage || "Current Image"}</p>
                  </div>
                </div>
              )}

              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPensionProfileImageFile(file);
                    // Create local preview
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPreviewUrl(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="cursor-pointer border-slate-200 bg-slate-50/30 h-11 py-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" /> {t.dashboard?.aboutDescription || "About Description"}
              </Label>
              <textarea
                value={propertySettings.description}
                onChange={(e) => setPropertySettings({ ...propertySettings, description: e.target.value })}
                placeholder={t.dashboard?.describePensionPlaceholder || "Describe your pension..."}
                rows={4}
                className="w-full border border-slate-200 bg-slate-50/30 rounded-lg px-3 py-2 outline-none resize-none focus:border-purple-300 transition-all duration-200 min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" /> {t.dashboard?.ownerPropertyInfo || "Owner / Property Info"}
              </Label>
              <textarea
                value={propertySettings.ownerInfo}
                onChange={(e) => setPropertySettings({ ...propertySettings, ownerInfo: e.target.value })}
                placeholder={t.dashboard?.ownerDetailsPlaceholder || "Details about ownership..."}
                rows={4}
                className="w-full border border-slate-200 bg-slate-50/30 rounded-lg px-3 py-2 outline-none resize-none focus:border-purple-300 transition-all duration-200 min-h-[120px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-purple-600" /> {t.dashboard?.roomDetailsSummary || "Room Details Summary"}
            </Label>
            <textarea
              value={propertySettings.roomDetails}
              onChange={(e) => setPropertySettings({ ...propertySettings, roomDetails: e.target.value })}
              placeholder={t.dashboard?.roomDetailsSummaryPlaceholder || "Summary of room types and features..."}
              rows={3}
              className="w-full border border-slate-200 bg-slate-50/30 rounded-lg px-3 py-2 outline-none resize-none focus:border-purple-300 transition-all duration-200 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={handleSave} disabled={isUpdating} className="h-11 px-8 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg">
              {isUpdating ? (t.dashboard?.updating || 'Updating...') : (t.dashboard?.updatePensionProfile || 'Update Pension Profile')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
