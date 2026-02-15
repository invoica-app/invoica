"use client";

import { useInvoiceStore } from "@/lib/store";
import { formatDistanceToNow } from "@/lib/date-utils";
import { useAuth } from "@/lib/auth";

interface WizardHeaderProps {
  stepLabel?: string;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function WizardHeader({ stepLabel = "Start" }: WizardHeaderProps) {
  const lastSaved = useInvoiceStore((state) => state.lastSaved);
  const { user, isGuest } = useAuth();

  const initials = getInitials(user?.name);

  return (
    <header className="border-b border-border px-4 py-3 md:px-8 md:py-4 flex items-center justify-between bg-card">
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground text-sm font-medium">{stepLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline text-sm text-muted-foreground">
          Draft saved {formatDistanceToNow(lastSaved)}
        </span>
        {isGuest ? (
          <div className="px-3 py-2 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            Guest
          </div>
        ) : (
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
