"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
        <div className="text-3xl mb-3">&#9889;</div>
        <h2 className="text-lg font-semibold mb-2">Free Uses Exhausted</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          You&apos;ve used all 3 free AI invoice analyses. Upgrade to a paid
          plan for unlimited analyses.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
