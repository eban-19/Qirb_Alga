import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface PensionOwner {
  id?: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessId: string;
  status: "pending" | "verified" | "rejected" | "suspended";
  registrationDate?: string;
  totalProperties?: number;
  totalRevenue?: number;
  rating?: number;
  documentStatus?: "pending" | "approved" | "rejected";
  lastActive?: string;
}

interface OwnerFormProps {
  owner?: PensionOwner;
  isOpen: boolean;
  onClose: () => void;
  onSave: (owner: PensionOwner) => void;
}

export function OwnerForm({ owner, isOpen, onClose, onSave }: OwnerFormProps) {
  const [formData, setFormData] = useState<PensionOwner>({
    businessName: owner?.businessName || "",
    ownerName: owner?.ownerName || "",
    email: owner?.email || "",
    phone: owner?.phone || "",
    businessId: owner?.businessId || "",
    status: owner?.status || "pending",
    registrationDate: owner?.registrationDate || "",
    totalProperties: owner?.totalProperties || 0,
    totalRevenue: owner?.totalRevenue || 0,
    rating: owner?.rating || 0,
    documentStatus: owner?.documentStatus || "pending",
    lastActive: owner?.lastActive || "",
    id: owner?.id || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{owner?.id ? "Edit Owner" : "Create New Owner"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => handleChange("ownerName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="businessId">Business ID</Label>
                <Input
                  id="businessId"
                  value={formData.businessId}
                  onChange={(e) => handleChange("businessId", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="registrationDate">Registration Date</Label>
                <Input
                  id="registrationDate"
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => handleChange("registrationDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="totalProperties">Total Properties</Label>
                <Input
                  id="totalProperties"
                  type="number"
                  value={formData.totalProperties?.toString() || "0"}
                  onChange={(e) => handleChange("totalProperties", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="totalRevenue">Total Revenue</Label>
                <Input
                  id="totalRevenue"
                  type="number"
                  value={formData.totalRevenue?.toString() || "0"}
                  onChange={(e) => handleChange("totalRevenue", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating?.toString() || "0"}
                  onChange={(e) => handleChange("rating", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="documentStatus">Document Status</Label>
                <Select value={formData.documentStatus} onValueChange={(value) => handleChange("documentStatus", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lastActive">Last Active</Label>
                <Input
                  id="lastActive"
                  type="datetime-local"
                  value={formData.lastActive}
                  onChange={(e) => handleChange("lastActive", e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {owner?.id ? "Update Owner" : "Create Owner"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
