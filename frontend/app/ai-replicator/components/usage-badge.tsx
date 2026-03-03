"use client";

import { useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import type { AiUsageResponse } from "@/lib/types";

export function UsageBadge() {
  const api = useAuthenticatedApi();
  const [usage, setUsage] = useState<AiUsageResponse | null>(null);

  useEffect(() => {
    api.getAiUsage().then(setUsage).catch(() => {});
  }, [api]);

  if (!usage) return null;

  const isLow = usage.remaining <= 1 && !usage.isExhausted;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
        usage.isExhausted
          ? "bg-red-50 text-red-700 border border-red-200"
          : isLow
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-blue-50 text-blue-700 border border-blue-200"
      }`}
    >
      <span>
        {usage.isExhausted
          ? "No free uses remaining"
          : `${usage.remaining}/${usage.maxFreeUses} free uses remaining`}
      </span>
    </div>
  );
}
