
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, CheckCircle } from "lucide-react";

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: any;
  onSuccess: () => void;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration_days: "30",
    is_active: true,
    is_public: true
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        price: plan.price.toString(),
        duration_days: plan.duration_days.toString(),
        is_active: plan.is_active,
        is_public: plan.is_public
      });
      setFeatures(JSON.parse(plan?.features || "[]"));
    } else {
      setFormData({
        name: "",
        price: "",
        duration_days: "30",
        is_active: true,
        is_public: true
      });
      setFeatures([]);
    }
  }, [plan, isOpen]);

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.duration_days) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const method = plan ? 'PUT' : 'POST';
      const url = plan 
        ? `http://localhost:3006/api/admin-payments/plans/${plan.plan_id}`
        : 'http://localhost:3006/api/admin-payments/plans';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          features
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Plan ${plan ? 'updated' : 'created'} successfully`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to save plan");
      }
    } catch (error) {
      console.error('Plan save error:', error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <CreditCard className="w-6 h-6 text-blue-600" />
            {plan ? "Edit Subscription Plan" : "Create New Plan"}
          </DialogTitle>
          <DialogDescription>
            Configure pricing, duration, and features for this subscription tier.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                placeholder="e.g., Premium Monthly, Business Annual"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-50 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (ETB)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="bg-slate-50 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Days)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={formData.duration_days}
                onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                className="bg-slate-50 border-slate-200"
              />
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_active" 
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: !!checked})}
                />
                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_public" 
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({...formData, is_public: !!checked})}
                />
                <Label htmlFor="is_public" className="cursor-pointer">Public Visibility</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Features & Benefits</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a feature (e.g., Priority Support)"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="bg-slate-50 border-slate-200"
              />
              <Button type="button" onClick={addFeature} variant="secondary" className="bg-slate-200 hover:bg-slate-300">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feature}
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-slate-400 hover:text-red-500"
                    onClick={() => removeFeature(index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {features.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4">No features added yet</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8" disabled={loading}>
              {loading ? "Saving..." : (plan ? "Update Plan" : "Create Plan")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
