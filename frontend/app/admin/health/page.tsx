"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useAdminApi } from "@/lib/hooks/use-admin-api";
import { SystemHealth } from "@/lib/admin-api";

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function AdminHealthPage() {
  const api = useAdminApi();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>(undefined);

  const fetchHealth = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load health data");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchHealth, 30000);
      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [autoRefresh, fetchHealth]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner message={error} onRetry={fetchHealth} />
        </div>
      </div>
    );
  }

  if (!health) return null;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold mb-0.5">System Health</h1>
            <p className="text-sm text-muted-foreground">Monitor backend status and resources.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchHealth}
              className="p-1.5 rounded-md border border-border hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  autoRefresh ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                    autoRefresh ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              Auto-refresh
            </label>
          </div>
        </div>

        {error && (
          <ErrorBanner message={error} className="mb-4" />
        )}

        {/* Health cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* API Status */}
          <div className="bg-muted/50 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">API Status</span>
              <StatusDot status={health.apiStatus} />
            </div>
            <p className="text-xl font-semibold">{health.apiStatus}</p>
          </div>

          {/* Database Status */}
          <div className="bg-muted/50 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Database Status</span>
              <StatusDot status={health.databaseStatus} />
            </div>
            <p className="text-xl font-semibold">{health.databaseStatus}</p>
          </div>

          {/* Uptime */}
          <div className="bg-muted/50 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Uptime</span>
              <StatusDot status="UP" />
            </div>
            <p className="text-xl font-semibold">{formatUptime(health.uptime)}</p>
          </div>

          {/* JVM Memory */}
          <div className="bg-muted/50 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">JVM Memory</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatBytes(health.jvmMemoryUsed)} / {formatBytes(health.jvmMemoryMax)}
              </span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all ${
                  health.jvmMemoryPercent > 80 ? "bg-red-500" : health.jvmMemoryPercent > 60 ? "bg-yellow-500" : "bg-emerald-500"
                }`}
                style={{ width: `${health.jvmMemoryPercent}%` }}
              />
            </div>
            <p className="text-xl font-semibold tabular-nums">{health.jvmMemoryPercent}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const isUp = status === "UP";
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${isUp ? "bg-emerald-500" : "bg-red-500"}`} />
    </span>
  );
}
