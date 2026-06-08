"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Check, Loader2 } from "lucide-react";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

const PRO_FEATURES = [
  "Unlimited AI invoice analyses",
  "PDF & image upload support",
  "Template mapping to all 5 styles",
  "Priority processing",
];

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  const api = useAuthenticatedApi();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<{ amount: number; currency: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    api.getSubscriptionConfig().then(setConfig).catch(() => {});
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose, api]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const result = await api.initializeSubscription();
      window.location.href = result.authorizationUrl;
    } catch (err) {
      console.error("Failed to initialize payment:", err);
      setLoading(false);
    }
  };

  if (!open) return null;

  const formattedPrice = config
    ? `${config.currency} ${(config.amount / 100).toFixed(2)}`
    : "...";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-base font-semibold mb-1">Upgrade to Pro</h2>
          <p className="text-sm text-muted-foreground">
            You&apos;ve used all 3 free AI analyses. Upgrade for unlimited access.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4 mb-5">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Pro Plan</span>
            </div>
            <div>
              <span className="text-lg font-bold">{formattedPrice}</span>
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>
          </div>
          <ul className="space-y-2">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full gap-2"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Upgrade Now
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-full text-muted-foreground">
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
