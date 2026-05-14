import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface ExtendSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: any;
  onExtend: (subscriptionId: number, durationDays: number) => Promise<void>;
}

export function ExtendSubscriptionModal({ isOpen, onClose, subscription, onExtend }: ExtendSubscriptionModalProps) {
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
            Extend Subscription
          </DialogTitle>
          <DialogDescription>
            Add extra days to <strong>{subscription.owner?.full_name}'s</strong> subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Extension Period</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">1 Month (30 Days)</SelectItem>
                <SelectItem value="90">3 Months (90 Days)</SelectItem>
                <SelectItem value="365">1 Year (365 Days)</SelectItem>
                <SelectItem value="custom">Custom Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {duration === "custom" && (
            <div className="space-y-2">
              <Label>Custom Days</Label>
              <Input 
                type="number" 
                min="1" 
                value={customDuration} 
                onChange={(e) => setCustomDuration(e.target.value)} 
                placeholder="Enter number of days" 
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || (duration === "custom" && !customDuration)}>
            {isSubmitting ? "Extending..." : "Extend Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
