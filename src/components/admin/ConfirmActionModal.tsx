import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  confirmText: string;
  onConfirm: () => Promise<void>;
  variant?: "destructive" | "default";
}

export function ConfirmActionModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  confirmText, 
  onConfirm,
  variant = "destructive"
}: ConfirmActionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === "destructive" && <AlertTriangle className="w-5 h-5 text-red-600" />}
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t.adminDetails?.close || "Cancel"}
          </Button>
          <Button 
            variant={variant} 
            onClick={handleConfirm} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (t.adminDetails?.processing || "Processing...") : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
