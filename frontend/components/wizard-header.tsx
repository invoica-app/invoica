"use client";

import { useInvoiceStore } from "@/lib/store";
import { formatDistanceToNow } from "@/lib/date-utils";
import { useAuth } from "@/lib/auth";

interface WizardHeaderProps {
  stepLabel?: string;
}

function avatarUrl(seed: string, size = 28): string {
  return `https://api.navii.dev/avatar/${encodeURIComponent(seed)}?size=${size}`;
}

function parseStep(label: string): { current: number; total: number } | null {
  const match = label.match(/Step (\d+) of (\d+)/i);
  if (!match) return null;
  return { current: parseInt(match[1]), total: parseInt(match[2]) };
}

export function WizardHeader({ stepLabel = "Start" }: WizardHeaderProps) {
  const lastSaved = useInvoiceStore((state) => state.lastSaved);
  const { user, isGuest } = useAuth();

  const seed = user?.email || user?.name || "guest";
  const step = parseStep(stepLabel);

  return (
    <header className="border-b border-border bg-card/50">
      <div className="px-4 py-3 md:px-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          {stepLabel}
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-muted-foreground">
            Saved {formatDistanceToNow(lastSaved)}
          </span>
          <img
            src={avatarUrl(seed)}
            alt={user?.name || "Guest"}
            className="w-7 h-7 rounded-full"
          />
        </div>
      </div>

      {step && (
        <div className="flex gap-1 px-4 pb-2.5 md:px-6">
          {Array.from({ length: step.total }, (_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-colors ${
                i < step.current ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </header>
  );
}
