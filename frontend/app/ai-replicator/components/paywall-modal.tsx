"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <h2 className="text-sm font-semibold mb-1.5">Free analyses used</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          You&apos;ve used all 3 free AI invoice analyses.
          Paid plans with unlimited analyses are coming soon.
        </p>
        <Button variant="outline" size="sm" onClick={onClose} className="w-full">
          Got it
        </Button>
      </div>
    </div>
  );
}
