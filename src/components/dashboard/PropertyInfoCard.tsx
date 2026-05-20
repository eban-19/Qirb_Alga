import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building, User, BedDouble, Users } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface PropertySettings {
  name: string;
  description: string;
  ownerInfo: string;
  roomDetails: string;
  address: string;
  capacity: string;
}

interface PropertyInfoCardProps {
  propertySettings: PropertySettings;
}

const PropertyInfoCard: React.FC<PropertyInfoCardProps> = ({ propertySettings }) => {
  const { t } = useLanguage();
  if (!propertySettings.name) return null;

  return (
    <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:scale-[1.02] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg group-hover:shadow-indigo-500/25 group-hover:scale-110 transition-all duration-300">
            <Building className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-800">{t.dashboard?.propertyInformation || "Property Information"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{propertySettings.name}</h3>
            <p className="text-slate-600 mb-4">{propertySettings.description}</p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                {t.dashboard?.ownerPropertyInfo || "Owner / Property Info"}
              </Label>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{propertySettings.ownerInfo}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-indigo-600" />
                {t.dashboard?.roomDetails || "Room Details"}
              </Label>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{propertySettings.roomDetails}</p>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building className="h-4 w-4 text-indigo-600" />
                {t.dashboard?.location || "Location"}
              </Label>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{propertySettings.address}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                {t.dashboard?.capacity || "Capacity"}
              </Label>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{propertySettings.capacity || 0} {t.dashboard?.rooms || "rooms"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyInfoCard;
