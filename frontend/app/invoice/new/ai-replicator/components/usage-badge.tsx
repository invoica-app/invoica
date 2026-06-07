"use client";

import { useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import type { AiUsageResponse } from "@/lib/types";
import { Sparkles } from "lucide-react";

export function UsageBadge() {
  const api = useAuthenticatedApi();
  const [usage, setUsage] = useState<AiUsageResponse | null>(null);

  useEffect(() => {
    api.getAiUsage().then(setUsage).catch(() => {});
  }, [api]);

  if (!usage) return null;

  if (usage.maxFreeUses === 2147483647) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
        <Sparkles className="w-3 h-3" />
        Pro — Unlimited
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
        usage.isExhausted
          ? "bg-destructive/10 text-destructive"
          : usage.remaining <= 1
          ? "bg-amber-500/10 text-amber-600"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {usage.isExhausted
        ? "No free analyses remaining"
        : `${usage.remaining} of ${usage.maxFreeUses} free analyses remaining`}
    </span>
  );
}
