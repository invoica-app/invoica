"use client";

import { useEffect, useState } from "react";

type Status = "healthy" | "degraded" | "unavailable";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const statusConfig: Record<Status, { label: string; dotClass: string }> = {
  healthy: {
    label: "All systems normal",
    dotClass: "bg-emerald-500",
  },
  degraded: {
    label: "Degraded performance",
    dotClass: "bg-yellow-500",
  },
  unavailable: {
    label: "System unavailable",
    dotClass: "bg-red-500",
  },
};

export function HealthStatus() {
  const [status, setStatus] = useState<Status>("healthy");

  useEffect(() => {
    async function check() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const start = Date.now();
        const res = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const elapsed = Date.now() - start;

        if (!res.ok) {
          setStatus("unavailable");
        } else if (elapsed > 2000) {
          setStatus("degraded");
        } else {
          setStatus("healthy");
        }
      } catch {
        setStatus("unavailable");
      }
    }

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  const { label, dotClass } = statusConfig[status];

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        {status === "healthy" && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotClass} opacity-75`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dotClass}`} />
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
