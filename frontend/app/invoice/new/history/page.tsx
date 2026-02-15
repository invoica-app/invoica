"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { NothingDey } from "@/components/nothing-dey";
import { useAuth } from "@/lib/auth";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { Invoice } from "@/lib/types";
import { WizardHeader } from "@/components/wizard-header";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PAID: "bg-green-500/10 text-green-600 dark:text-green-400",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export default function InvoiceHistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const api = useAuthenticatedApi();

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

  const handleDelete = async (id: number) => {
    setDeletingId(id);
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
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Invoice History</h1>
            <p className="text-muted-foreground">
              View and manage your sent invoices.
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
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
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold">
                        {invoice.invoiceNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[invoice.status || "DRAFT"]
                        }`}
                      >
                        {invoice.status || "DRAFT"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {invoice.clientEmail} &middot; {invoice.companyName}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-bold">
                      ${(invoice.totalAmount ?? 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => invoice.id && handleDelete(invoice.id)}
                      disabled={deletingId === invoice.id}
                      className="p-2 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingId === invoice.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !authLoading && invoices.length === 0 && !error && (
            <div className="text-center py-12">
              <h2
                className="text-3xl md:text-5xl mb-12 text-primary font-bold font-script"
              >
                Nothing Dey
              </h2>

              <div className="mb-8 flex justify-center">
                <NothingDey className="w-[248px] h-[280px]" />
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
