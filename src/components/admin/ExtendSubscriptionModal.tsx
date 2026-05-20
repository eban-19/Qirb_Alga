import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface ExtendSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: any;
  onExtend: (subscriptionId: number, durationDays: number) => Promise<void>;
}

export function ExtendSubscriptionModal({ isOpen, onClose, subscription, onExtend }: ExtendSubscriptionModalProps) {
  const { t } = useLanguage();
  const [duration, setDuration] = useState("30");
  const [customDuration, setCustomDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subscription) return;
    
    setIsSubmitting(true);
    try {
      const days = duration === "custom" ? parseInt(customDuration) : parseInt(duration);
      if (isNaN(days) || days <= 0) return;
      
      await onExtend(subscription.subscription_id, days);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!subscription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {t.adminTabs?.payments?.extendSubscription || "Extend Subscription"}
          </DialogTitle>
          <DialogDescription>
            {t.adminTabs?.payments?.extendSubDesc?.replace("{name}", subscription.owner?.full_name) || `Add extra days to ${subscription.owner?.full_name}'s subscription.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>{t.adminTabs?.payments?.extensionPeriod || "Extension Period"}</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder={t.adminTabs?.payments?.selectDuration || "Select duration"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 {t.adminTabs?.payments?.days || "Days"}</SelectItem>
                <SelectItem value="14">14 {t.adminTabs?.payments?.days || "Days"}</SelectItem>
                <SelectItem value="30">1 {t.adminTabs?.payments?.month || "Month"} (30 {t.adminTabs?.payments?.days || "Days"})</SelectItem>
                <SelectItem value="90">3 {t.adminTabs?.payments?.months || "Months"} (90 {t.adminTabs?.payments?.days || "Days"})</SelectItem>
                <SelectItem value="365">1 {t.adminTabs?.payments?.year || "Year"} (365 {t.adminTabs?.payments?.days || "Days"})</SelectItem>
                <SelectItem value="custom">{t.adminTabs?.payments?.customDuration || "Custom Duration"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {duration === "custom" && (
            <div className="space-y-2">
              <Label>{t.adminTabs?.payments?.customDays || "Custom Days"}</Label>
              <Input 
                type="number" 
                min="1" 
                value={customDuration} 
                onChange={(e) => setCustomDuration(e.target.value)} 
                placeholder={t.adminTabs?.payments?.enterDays || "Enter number of days"} 
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t.adminTabs?.common?.cancel || "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || (duration === "custom" && !customDuration)}>
            {isSubmitting ? (t.adminTabs?.payments?.extending || "Extending...") : (t.adminTabs?.payments?.extendSubscription || "Extend Subscription")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
