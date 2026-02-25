"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, Trash2, Plus } from "lucide-react";
import { NothingDey } from "@/components/nothing-dey";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/lib/auth";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { Invoice } from "@/lib/types";
import { WizardHeader } from "@/components/wizard-header";
import { useSettingsStore } from "@/lib/settings-store";
import { formatMoney } from "@/lib/currency";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

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

  const invoiceToDelete = invoices.find((inv) => inv.id === confirmDeleteId);

  return (
    <>
      <ConfirmDialog
        open={confirmDeleteId !== null}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete this invoice?"
        description={`${invoiceToDelete?.invoiceNumber || "This invoice"} will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        variant="destructive"
      />

      <WizardHeader stepLabel="Invoice History" />

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-0.5">Invoices</h1>
            <p className="text-sm text-muted-foreground">
              Your sent and drafted invoices.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchInvoices}
                className="ml-4 flex items-center gap-1.5 text-destructive hover:text-destructive/80 text-sm font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {(loading || authLoading) && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-lg border border-border"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-40 bg-muted/60 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse ml-3" />
                </div>
              ))}
            </div>
          )}

          {/* Invoice list */}
          {!loading && !authLoading && invoices.length > 0 && (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-border/80 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">
                        {invoice.invoiceNumber}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          statusStyles[invoice.status || "DRAFT"]
                        }`}
                      >
                        {invoice.status || "DRAFT"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {invoice.clientEmail}
                      {invoice.companyName && (
                        <>
                          <span className="mx-1.5 opacity-40">/</span>
                          {invoice.companyName}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 ml-3">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatMoney(invoice.totalAmount ?? 0, invoice.currency || defaultCurrency)}
                    </span>
                    <button
                      onClick={() => invoice.id && setConfirmDeleteId(invoice.id)}
                      disabled={deletingId === invoice.id}
                      className="p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all disabled:opacity-50"
                    >
                      {deletingId === invoice.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !authLoading && invoices.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="mb-6 flex justify-center">
                <NothingDey className="w-[140px] h-[158px]" />
              </div>
              <p className="font-[family-name:var(--font-amatica)] text-2xl font-bold text-foreground mb-2">
                Nothing Dey
              </p>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                No invoices yet. Create your first one and it&apos;ll show up here.
              </p>
              <Button asChild size="sm">
                <Link href="/invoice/new/company">
                  <Plus className="w-4 h-4 mr-1.5" />
                  New invoice
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
