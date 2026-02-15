"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { NothingDey } from "@/components/nothing-dey";
import { useAuth } from "@/lib/auth";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { Invoice } from "@/lib/types";
import { WizardHeader } from "@/components/wizard-header";
import { useSettingsStore } from "@/lib/settings-store";
import { formatMoney } from "@/lib/currency";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PAID: "bg-green-500/10 text-green-600 dark:text-green-400",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export default function InvoiceHistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const api = useAuthenticatedApi();
  const defaultCurrency = useSettingsStore((s) => s.defaultCurrency);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInvoices();
    }
  }, [isAuthenticated, fetchInvoices]);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await api.deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invoice.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <WizardHeader stepLabel="Invoice History" />

      <div className="flex-1 p-4 md:p-8 bg-secondary overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-3xl font-semibold mb-1 md:mb-2">Invoice History</h1>
            <p className="text-sm text-muted-foreground">
              View and manage your sent invoices.
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 md:mb-8 p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchInvoices}
                className="ml-4 flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {(loading || authLoading) && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {/* Invoice List */}
          {!loading && !authLoading && invoices.length > 0 && (
            <div className="space-y-3 md:space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow gap-2 sm:gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 mb-1">
                      <span className="text-sm md:text-base font-semibold">
                        {invoice.invoiceNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${
                          statusColors[invoice.status || "DRAFT"]
                        }`}
                      >
                        {invoice.status || "DRAFT"}
                      </span>
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground truncate">
                      {invoice.clientEmail} &middot; {invoice.companyName}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6">
                    <span className="text-base md:text-lg font-bold">
                      {formatMoney(invoice.totalAmount ?? 0, defaultCurrency)}
                    </span>
                    {confirmDeleteId === invoice.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => invoice.id && handleDelete(invoice.id)}
                          disabled={deletingId === invoice.id}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {deletingId === invoice.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md text-muted-foreground hover:bg-accent transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => invoice.id && setConfirmDeleteId(invoice.id)}
                        disabled={deletingId === invoice.id}
                        className="p-2 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !authLoading && invoices.length === 0 && !error && (
            <div className="text-center py-12">
              <h2
                className="text-2xl md:text-5xl mb-8 md:mb-12 text-primary font-bold font-script"
              >
                Nothing Dey
              </h2>

              <div className="mb-8 flex justify-center">
                <NothingDey className="w-[200px] h-[226px] md:w-[248px] md:h-[280px]" />
              </div>

              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                You haven&apos;t created any invoices yet. Click &quot;+ New Invoice&quot; to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
