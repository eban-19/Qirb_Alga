
import React, { useState } from 'react';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Shield, Clock, Gift } from "lucide-react";
import { useLanguage } from '@/hooks/use-language';

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  owners: any[];
  plans: any[];
  onSuccess: () => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  onClose,
  owners,
  plans,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ownerId: "",
    planId: "",
    durationDays: "30",
    isFree: true,
    reason: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerId || !formData.planId || !formData.durationDays) {
      toast.error(t.adminTabs?.payments?.fillRequired || "Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3006/api/admin-payments/subscriptions/override', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(t.adminTabs?.payments?.overrideSuccess || "Subscription override successful");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || (t.adminTabs?.payments?.overrideFailed || "Failed to override subscription"));
      }
    } catch (error) {
      console.error('Override error:', error);
      toast.error(t.adminTabs?.payments?.errorOccurred || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Shield className="w-6 h-6 text-indigo-600" />
            {t.adminTabs?.payments?.manualAccessOverride || "Manual Access Override"}
          </DialogTitle>
          <DialogDescription>
            {t.adminTabs?.payments?.manualAccessDesc || "Grant manual subscription or free access to an owner."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="owner">{t.adminTabs?.payments?.selectOwner || "Select Owner"}</Label>
              <Select 
                value={formData.ownerId} 
                onValueChange={(val) => setFormData({...formData, ownerId: val})}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder={t.adminTabs?.payments?.selectAnOwner || "Select an owner"} />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id.toString()}>
                      {owner.ownerName} ({owner.businessName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">{t.adminTabs?.payments?.selectPlanLevel || "Select Plan Level"}</Label>
              <Select 
                value={formData.planId} 
                onValueChange={(val) => setFormData({...formData, planId: val})}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder={t.adminTabs?.payments?.selectPlanTier || "Select a plan tier"} />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.plan_id} value={plan.plan_id.toString()}>
                      {plan.name} ({plan.duration_days} days)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">{t.adminTabs?.payments?.durationDaysLabel || "Duration (Days)"}</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Checkbox 
                  id="isFree" 
                  checked={formData.isFree}
                  onCheckedChange={(checked) => setFormData({...formData, isFree: !!checked})}
                />
                <Label htmlFor="isFree" className="flex items-center gap-1 cursor-pointer">
                  <Gift className="w-4 h-4 text-purple-600" />
                  {t.adminTabs?.payments?.grantForFree || "Grant for Free"}
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">{t.adminTabs?.payments?.reasonNotes || "Reason / Notes"}</Label>
              <Input
                id="reason"
                placeholder={t.adminTabs?.payments?.reasonPlaceholder || "e.g., Marketing partnership, troubleshooting compensation"}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              {t.adminTabs?.common?.cancel || "Cancel"}
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-8" disabled={loading}>
              {loading ? (t.adminTabs?.payments?.processing || "Processing...") : (t.adminTabs?.payments?.grantAccessNow || "Grant Access Now")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
