"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, FileText, DollarSign, UserCheck } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useAdminApi } from "@/lib/hooks/use-admin-api";
import { DashboardStats } from "@/lib/admin-api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboardPage() {
  const api = useAdminApi();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboard();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ErrorBanner message={error} onRetry={fetchStats} />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const metricCards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users },
    { label: "Total Invoices", value: stats.totalInvoices.toLocaleString(), icon: FileText },
    { label: "Revenue (Paid)", value: `$${stats.paidRevenue.toLocaleString()}`, icon: DollarSign },
    { label: "Active Users (30d)", value: stats.activeUsers30d.toLocaleString(), icon: UserCheck },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-semibold mb-0.5">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform overview and metrics.</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-muted/50 rounded-lg p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <p className="text-xl font-semibold tabular-nums">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Invoice status breakdown */}
        <div className="bg-muted/50 rounded-lg p-3.5 mb-6">
          <p className="text-xs text-muted-foreground mb-2">Invoice Status Breakdown</p>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.invoicesByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${statusDotColor(status)}`} />
                <span className="text-sm">{status}</span>
                <span className="text-sm font-medium tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Invoices over time */}
          <div className="bg-muted/50 rounded-lg p-3.5">
            <p className="text-xs text-muted-foreground mb-4">Invoices Over Time</p>
            <div className="h-48">
              {stats.invoicesOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.invoicesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No data yet
                </div>
              )}
            </div>
          </div>

          {/* Revenue over time */}
          <div className="bg-muted/50 rounded-lg p-3.5">
            <p className="text-xs text-muted-foreground mb-4">Revenue Over Time</p>
            <div className="h-48">
              {stats.revenueOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.revenueOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No data yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <Bone className="h-5 w-24" />
          <Bone className="h-3.5 w-52 opacity-60" />
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <Bone className="w-4 h-4 rounded" />
                <Bone className="h-3 w-20" />
              </div>
              <Bone className="h-6 w-16" />
            </div>
          ))}
        </div>

        {/* Status breakdown */}
        <div className="bg-muted/50 rounded-lg p-3.5 mb-6">
          <Bone className="h-3 w-40 mb-3" />
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Bone className="w-2 h-2 rounded-full" />
                <Bone className="h-3.5 w-14" />
                <Bone className="h-3.5 w-6" />
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-3.5">
              <Bone className="h-3 w-32 mb-4" />
              <Bone className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function statusDotColor(status: string): string {
  switch (status) {
    case "PAID": return "bg-emerald-500";
    case "SENT": return "bg-blue-500";
    case "DRAFT": return "bg-muted-foreground";
    case "CANCELLED": return "bg-red-500";
    default: return "bg-muted-foreground";
  }
}
