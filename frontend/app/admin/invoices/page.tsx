"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useAdminApi } from "@/lib/hooks/use-admin-api";
import { AdminInvoice } from "@/lib/admin-api";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const STATUS_OPTIONS = ["", "DRAFT", "SENT", "PAID", "CANCELLED"];

export default function AdminInvoicesPage() {
  const api = useAdminApi();
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const pageSize = 20;

  const fetchInvoices = useCallback(async (p: number, q: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInvoices(p, pageSize, status || undefined, q || undefined);
      setInvoices(data.invoices);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchInvoices(page, search, statusFilter);
  }, [page, statusFilter, fetchInvoices]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchInvoices(0, value, statusFilter);
    }, 300);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(0);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-semibold mb-0.5">Invoices</h1>
          <p className="text-sm text-muted-foreground">All invoices across the platform.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by invoice #, company, or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {error && (
          <ErrorBanner message={error} onRetry={() => fetchInvoices(page, search, statusFilter)} className="mb-4" />
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Invoice #</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Company</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Client</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Amount</th>
                      <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Owner</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium">{invoice.invoiceNumber}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{invoice.companyName}</td>
                        <td className="px-4 py-2.5">
                          <div>
                            <span className="text-foreground">{invoice.clientName || "—"}</span>
                            <p className="text-xs text-muted-foreground">{invoice.clientEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                          ${Number(invoice.totalAmount).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusStyles[invoice.status] || "bg-muted text-muted-foreground"}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">
                          {invoice.ownerName || invoice.ownerEmail || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No invoices found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {total} invoice{total !== 1 ? "s" : ""} total
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
