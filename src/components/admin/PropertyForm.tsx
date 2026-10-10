import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2, AlertCircle } from "lucide-react";
import { RoomPackage } from "@/lib/rooms";
import {
  filterDecimalInput,
  filterIntegerInput,
  validateRequiredText,
  validatePositiveInteger
} from "@/utils/validation";

interface Room {
  id?: string;
  name: string;
  name_en?: string;
  name_am?: string;
  name_om?: string;
  name_ml?: { en?: string; am?: string; om?: string };
  description: string;
  description_en?: string;
  description_am?: string;
  description_om?: string;
  description_ml?: { en?: string; am?: string; om?: string };
  ownerInfo: string;
  ownerInfo_en?: string;
  ownerInfo_am?: string;
  ownerInfo_om?: string;
  owner_info_ml?: { en?: string; am?: string; om?: string };
  roomDetails: string;
  roomDetails_en?: string;
  roomDetails_am?: string;
  roomDetails_om?: string;
  room_details_ml?: { en?: string; am?: string; om?: string };
  locationName: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  availableRooms: number;
  images: string[];
  packages: RoomPackage[];
}

interface PropertyFormProps {
  property?: Room;
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Room) => void;
}

export function PropertyForm({ property, isOpen, onClose, onSave }: PropertyFormProps) {
  const [formData, setFormData] = useState<any>({
    name: property?.name || "",
    name_en: property?.name_ml?.en || property?.name || "",
    name_am: property?.name_ml?.am || "",
    name_om: property?.name_ml?.om || "",
    description: property?.description || "",
    description_en: property?.description_ml?.en || property?.description || "",
    description_am: property?.description_ml?.am || "",
    description_om: property?.description_ml?.om || "",
    ownerInfo: property?.ownerInfo || "",
    ownerInfo_en: property?.owner_info_ml?.en || property?.ownerInfo || "",
    ownerInfo_am: property?.owner_info_ml?.am || "",
    ownerInfo_om: property?.owner_info_ml?.om || "",
    roomDetails: property?.roomDetails || "",
    roomDetails_en: property?.room_details_ml?.en || property?.roomDetails || "",
    roomDetails_am: property?.room_details_ml?.am || "",
    roomDetails_om: property?.room_details_ml?.om || "",
    locationName: property?.locationName || "",
    city: property?.city || "",
    area: property?.area || "",
    latitude: property?.latitude || 0,
    longitude: property?.longitude || 0,
    availableRooms: property?.availableRooms || 0,
    images: property?.images || [],
    packages: property?.packages || [],
    ...property
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const propName = formData.name_en || formData.name || "";
    const nameVal = validateRequiredText(propName, "Property Name", 2, 100);
    if (!nameVal.isValid) {
      setError(nameVal.error);
      return;
    }

    const cityVal = validateRequiredText(formData.city, "City", 2, 50);
    if (!cityVal.isValid) {
      setError(cityVal.error);
      return;
    }

    const areaVal = validateRequiredText(formData.area, "Area", 2, 50);
    if (!areaVal.isValid) {
      setError(areaVal.error);
      return;
    }

    if (formData.availableRooms !== undefined && formData.availableRooms !== '') {
      const roomsVal = validatePositiveInteger(formData.availableRooms, "Available Rooms", 0);
      if (!roomsVal.isValid) {
        setError(roomsVal.error);
        return;
      }
    }
    
    // Construct multilingual JSON objects
    const name_ml = {
      en: formData.name_en || formData.name,
      am: formData.name_am,
      om: formData.name_om
    };
    
    const description_ml = {
      en: formData.description_en || formData.description,
      am: formData.description_am,
      om: formData.description_om
    };
    
    const owner_info_ml = {
      en: formData.ownerInfo_en || formData.ownerInfo,
      am: formData.ownerInfo_am,
      om: formData.ownerInfo_om
    };
    
    const room_details_ml = {
      en: formData.roomDetails_en || formData.roomDetails,
      am: formData.roomDetails_am,
      om: formData.roomDetails_om
    };
    
    onSave({
      ...formData,
      name: formData.name_en || formData.name,
      description: formData.description_en || formData.description,
      ownerInfo: formData.ownerInfo_en || formData.ownerInfo,
      roomDetails: formData.roomDetails_en || formData.roomDetails,
      name_ml,
      description_ml,
      owner_info_ml,
      room_details_ml
    });
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handlePackageChange = (index: number, field: string, value: string | number | string[]) => {
    const updatedPackages = [...formData.packages];
    updatedPackages[index] = { ...updatedPackages[index], [field]: value };
    setFormData(prev => ({ ...prev, packages: updatedPackages }));
  };

  const addPackage = () => {
    const newPackage: any = {
      name: "New Package",
      price: 3000,
      description: "Description for new package",
      image: "",
      services: ["WiFi", "Breakfast"],
      availableRooms: 1
    };
    setFormData(prev => ({ ...prev, packages: [...prev.packages, newPackage] }));
  };

  const removePackage = (index: number) => {
    const updatedPackages = formData.packages.filter((_: any, i: number) => i !== index);
    setFormData(prev => ({ ...prev, packages: updatedPackages }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{property?.id ? "Edit Property" : "Create New Property"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => setError(null)} className="font-bold text-red-500">✕</button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div>
                <Label htmlFor="name_en">Property Name (English)</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => handleChange("name_en", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_am">Property Name (Amharic)</Label>
                <Input
                  id="name_am"
                  value={formData.name_am}
                  onChange={(e) => handleChange("name_am", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="name_om">Property Name (Afaan Oromo)</Label>
                <Input
                  id="name_om"
                  value={formData.name_om}
                  onChange={(e) => handleChange("name_om", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerInfo_en">Owner Information (English)</Label>
                  <Input
                    id="ownerInfo_en"
                    value={formData.ownerInfo_en}
                    onChange={(e) => handleChange("ownerInfo_en", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ownerInfo_am">Owner Information (Amharic)</Label>
                  <Input
                    id="ownerInfo_am"
                    value={formData.ownerInfo_am}
                    onChange={(e) => handleChange("ownerInfo_am", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ownerInfo_om">Owner Information (Afaan Oromo)</Label>
                  <Input
                    id="ownerInfo_om"
                    value={formData.ownerInfo_om}
                    onChange={(e) => handleChange("ownerInfo_om", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="locationName">Location Name</Label>
                  <Input
                    id="locationName"
                    value={formData.locationName}
                    onChange={(e) => handleChange("locationName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="availableRooms">Available Rooms</Label>
                  <Input
                    id="availableRooms"
                    type="number"
                    value={formData.availableRooms}
                    onChange={(e) => handleChange("availableRooms", parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => handleChange("description_en", e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="description_am">Description (Amharic)</Label>
                <Textarea
                  id="description_am"
                  value={formData.description_am}
                  onChange={(e) => handleChange("description_am", e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="description_om">Description (Afaan Oromo)</Label>
                <Textarea
                  id="description_om"
                  value={formData.description_om}
                  onChange={(e) => handleChange("description_om", e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="roomDetails_en">Room Details (English)</Label>
                <Textarea
                  id="roomDetails_en"
                  value={formData.roomDetails_en}
                  onChange={(e) => handleChange("roomDetails_en", e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="roomDetails_am">Room Details (Amharic)</Label>
                <Textarea
                  id="roomDetails_am"
                  value={formData.roomDetails_am}
                  onChange={(e) => handleChange("roomDetails_am", e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="roomDetails_om">Room Details (Afaan Oromo)</Label>
                <Textarea
                  id="roomDetails_om"
                  value={formData.roomDetails_om}
                  onChange={(e) => handleChange("roomDetails_om", e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => handleChange("area", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => handleChange("latitude", parseFloat(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => handleChange("longitude", parseFloat(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Packages */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Room Packages</h3>
                <Button type="button" variant="outline" onClick={addPackage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Package
                </Button>
              </div>
              {formData.packages.map((pkg, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Package {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePackage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Package Name</Label>
                      <Input
                        value={pkg.name}
                        onChange={(e) => handlePackageChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Price (ETB)</Label>
                      <Input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => handlePackageChange(index, "price", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={pkg.description}
                        onChange={(e) => handlePackageChange(index, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Available Rooms</Label>
                      <Input
                        type="number"
                        value={pkg.availableRooms}
                        onChange={(e) => handlePackageChange(index, "availableRooms", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {property?.id ? "Update Property" : "Create Property"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
