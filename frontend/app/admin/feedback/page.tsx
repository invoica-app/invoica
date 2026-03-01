"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, ChevronLeft, ChevronRight, Star, Lightbulb, Bug, Heart } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useAdminApi } from "@/lib/hooks/use-admin-api";
import { AdminFeedback, FeedbackStats } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG: Record<string, { icon: typeof Lightbulb; color: string; label: string }> = {
  idea: { icon: Lightbulb, color: "text-[#9747E6]", label: "Idea" },
  bug: { icon: Bug, color: "text-red-500", label: "Bug" },
  praise: { icon: Heart, color: "text-pink-500", label: "Praise" },
};

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  general: { label: "General", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" },
  first_invoice: { label: "First Invoice", bg: "bg-purple-50 dark:bg-purple-950", text: "text-purple-600 dark:text-purple-400" },
  post_invoice: { label: "Post Invoice", bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-600 dark:text-blue-400" },
};

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "post_invoice", label: "Post-Invoice" },
  { value: "general", label: "General" },
  { value: "first_invoice", label: "First Invoice" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "idea", label: "Idea" },
  { value: "bug", label: "Bug" },
  { value: "praise", label: "Praise" },
];

function StarRating({ value, size = "w-3.5 h-3.5" }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            size,
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "text-gray-200 dark:text-gray-600"
          )}
        />
      ))}
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const config = CATEGORY_CONFIG[category];
  if (!config) return <span className="text-muted-foreground">{category}</span>;
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className={cn("w-4 h-4", config.color)} />
      {config.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const config = TYPE_CONFIG[type];
  if (!config) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
        {type}
      </span>
    );
  }
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", config.bg, config.text)}>
      {config.label}
    </span>
  );
}

export default function AdminFeedbackPage() {
  const api = useAdminApi();
  const [feedbackList, setFeedbackList] = useState<AdminFeedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  const fetchData = useCallback(async (p: number, type: string, category: string) => {
    setLoading(true);
    setError(null);
    try {
      const [listData, statsData] = await Promise.all([
        api.getFeedbackList(p, pageSize, type || undefined, category || undefined),
        api.getFeedbackStats(),
      ]);
      setFeedbackList(listData.feedback);
      setTotal(listData.total);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData(page, typeFilter, categoryFilter);
  }, [page, typeFilter, categoryFilter, fetchData]);

  const totalPages = Math.ceil(total / pageSize);

  const topCategory = stats?.categoryBreakdown
    ? Object.entries(stats.categoryBreakdown).sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-semibold mb-0.5">Feedback</h1>
          <p className="text-sm text-muted-foreground">User feedback and ratings.</p>
        </div>

        {/* Summary cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Average Rating</p>
              {stats.averageRating > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">{stats.averageRating.toFixed(1)}</span>
                  <StarRating value={Math.round(stats.averageRating)} />
                </div>
              ) : (
                <p className="text-xl font-semibold">—</p>
              )}
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Feedback</p>
              <p className="text-xl font-semibold">{stats.totalCount}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">NPS Score</p>
              <p className="text-xl font-semibold">
                {stats.npsScore !== 0 ? `${stats.npsScore > 0 ? "+" : ""}${Math.round(stats.npsScore)}` : "—"}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Top Category</p>
              {topCategory ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    <CategoryBadge category={topCategory[0]} />
                  </span>
                </div>
              ) : (
                <p className="text-xl font-semibold">—</p>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <ErrorBanner message={error} onRetry={() => fetchData(page, typeFilter, categoryFilter)} className="mb-4" />
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Date</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Type</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Category</th>
                      <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Rating</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Message</th>
                      <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">NPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackList.map((fb) => (
                      <tr key={fb.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <TypeBadge type={fb.type} />
                        </td>
                        <td className="px-4 py-2.5">
                          {fb.category ? <CategoryBadge category={fb.category} /> : "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex justify-center">
                            {fb.rating ? <StarRating value={fb.rating} /> : <span className="text-muted-foreground">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 max-w-[200px] truncate" title={fb.message || undefined}>
                          {fb.message || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-center tabular-nums">
                          {fb.npsScore !== null ? fb.npsScore : "—"}
                        </td>
                      </tr>
                    ))}
                    {feedbackList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No feedback found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {total} item{total !== 1 ? "s" : ""} total
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1.5 rounded-md border border-border hover:bg-accent/50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm tabular-nums">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-1.5 rounded-md border border-border hover:bg-accent/50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
