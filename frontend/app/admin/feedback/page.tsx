"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useAdminApi } from "@/lib/hooks/use-admin-api";
import { AdminFeedback, FeedbackStats } from "@/lib/admin-api";

const RATING_EMOJIS: Record<number, string> = {
  1: "\u{1F621}",
  2: "\u{1F615}",
  3: "\u{1F610}",
  4: "\u{1F642}",
  5: "\u{1F60D}",
};

const CATEGORY_ICONS: Record<string, string> = {
  idea: "\u{1F4A1}",
  bug: "\u{1F41B}",
  praise: "\u{1F64F}",
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
              <p className="text-xl font-semibold">
                {stats.averageRating > 0
                  ? `${stats.averageRating.toFixed(1)} ${RATING_EMOJIS[Math.round(stats.averageRating)] || ""}`
                  : "—"}
              </p>
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
              <p className="text-xl font-semibold">
                {topCategory
                  ? `${CATEGORY_ICONS[topCategory[0]] || ""} ${topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1)}`
                  : "—"}
              </p>
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
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                            {fb.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {fb.category
                            ? `${CATEGORY_ICONS[fb.category] || ""} ${fb.category}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-center text-lg">
                          {fb.rating ? RATING_EMOJIS[fb.rating] || fb.rating : "—"}
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
