import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2 } from "lucide-react";
import { RoomPackage } from "@/lib/rooms";

interface Room {
  id?: string;
  name: string;
  description: string;
  ownerInfo: string;
  roomDetails: string;
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
  const [formData, setFormData] = useState<Room>({
    name: property?.name || "",
    description: property?.description || "",
    ownerInfo: property?.ownerInfo || "",
    roomDetails: property?.roomDetails || "",
    locationName: property?.locationName || "",
    city: property?.city || "",
    area: property?.area || "",
    latitude: property?.latitude || 0,
    longitude: property?.longitude || 0,
    availableRooms: property?.availableRooms || 0,
    images: property?.images || [],
    packages: property?.packages || [
      { name: "Basic", price: 2000, description: "Room only with shared essentials.", image: "", services: ["Standard WiFi", "Shared Bathroom"], availableRooms: 1 },
      { name: "Standard", price: 3500, description: "Comfortable stay with private amenities.", image: "", services: ["High-speed WiFi", "Private Bathroom", "Breakfast Included"], availableRooms: 2 },
      { name: "Premium", price: 5000, description: "Luxury experience with full board.", image: "", services: ["Premium WiFi", "Private Balcony", "All Meals Included"], availableRooms: 1 }
    ],
    ...property
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackageChange = (index: number, field: string, value: string | number | string[]) => {
    const updatedPackages = [...formData.packages];
    updatedPackages[index] = { ...updatedPackages[index], [field]: value };
    setFormData(prev => ({ ...prev, packages: updatedPackages }));
  };

  const addPackage = () => {
    const newPackage: RoomPackage = {
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
    const updatedPackages = formData.packages.filter((_, i) => i !== index);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Property Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ownerInfo">Owner Information</Label>
                  <Input
                    id="ownerInfo"
                    value={formData.ownerInfo}
                    onChange={(e) => handleChange("ownerInfo", e.target.value)}
                    required
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="roomDetails">Room Details</Label>
                <Textarea
                  id="roomDetails"
                  value={formData.roomDetails}
                  onChange={(e) => handleChange("roomDetails", e.target.value)}
                  rows={3}
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
