"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Trash2, Plus, Pencil } from "lucide-react";
import { NothingDey } from "@/components/nothing-dey";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/lib/auth";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { useInvoiceStore } from "@/lib/store";
import { Invoice } from "@/lib/types";
import { WizardHeader } from "@/components/wizard-header";
import { useSettingsStore } from "@/lib/settings-store";
import { formatMoney } from "@/lib/currency";
import { ErrorBanner } from "@/components/ui/error-banner";
import { HydrationGuard } from "@/components/hydration-guard";
import { HistorySkeleton } from "./loading";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export default function InvoiceHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const api = useAuthenticatedApi();
  const loadFromInvoice = useInvoiceStore((s) => s.loadFromInvoice);
  const defaultCurrency = useSettingsStore((s) => s.defaultCurrency);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

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
      setDeletingId(null);
      setRemovingId(id);
      setTimeout(() => {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
        setRemovingId(null);
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invoice.");
      setDeletingId(null);
    }
  };

  const handleEdit = async (id: number) => {
    setEditingId(id);
    try {
      const invoice = await api.getInvoiceById(id);
      loadFromInvoice(invoice, id);
      router.push("/invoice/new/company");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoice for editing.");
      setEditingId(null);
    }
  };

  const invoiceToDelete = invoices.find((inv) => inv.id === confirmDeleteId);

  return (
    <HydrationGuard fallback={<HistorySkeleton />}>
      <style>{`
        @keyframes foldCard {
          0%   { transform: perspective(600px) rotateX(0deg); opacity: 1; }
          50%  { transform: perspective(600px) rotateX(-80deg) scaleY(0.6); opacity: 0.5; }
          100% { transform: perspective(600px) rotateX(-90deg) scaleY(0.1); opacity: 0; }
        }
        @keyframes collapseRow {
          0%   { max-height: 200px; margin-bottom: 8px; }
          100% { max-height: 0; margin-bottom: 0; }
        }
      `}</style>

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

      <div className="flex-1 p-4 md:p-6 overflow-auto overflow-x-hidden">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-0.5">Invoices</h1>
            <p className="text-sm text-muted-foreground">
              Your sent and drafted invoices.
            </p>
          </div>

          {error && (
            <ErrorBanner message={error} onRetry={fetchInvoices} className="mb-6" />
          )}

          {/* Loading skeleton */}
          {(loading || authLoading) && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="p-3 sm:p-4 bg-card rounded-lg border border-border overflow-hidden"
                >
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-40 max-w-full bg-muted/60 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse shrink-0 hidden sm:block" />
                  </div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse mt-1.5 ml-auto sm:hidden" />
                </div>
              ))}
            </div>
          )}

          {/* Invoice list */}
          {!loading && !authLoading && invoices.length > 0 && (
            <div className="space-y-2">
              {invoices.map((invoice) => {
                const isRemoving = removingId === invoice.id;
                return (
                  <div
                    key={invoice.id}
                    className="overflow-hidden"
                    style={isRemoving ? { animation: "collapseRow 300ms 500ms ease-in forwards" } : undefined}
                  >
                    <div
                      className="p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-border/80 transition-colors group overflow-hidden"
                      style={isRemoving ? { animation: "foldCard 500ms ease-in forwards", transformOrigin: "top center" } : undefined}
                    >
                      <div className="flex items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium truncate">
                              {invoice.invoiceNumber}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
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
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                          <span className="text-sm font-semibold tabular-nums hidden sm:block">
                            {formatMoney(invoice.totalAmount ?? 0, invoice.currency || defaultCurrency)}
                          </span>
                          {(invoice.status || "DRAFT") === "DRAFT" && (
                            <button
                              onClick={() => invoice.id && handleEdit(invoice.id)}
                              disabled={editingId === invoice.id}
                              className="p-1.5 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-primary transition-all disabled:opacity-50"
                            >
                              {editingId === invoice.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Pencil className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => invoice.id && setConfirmDeleteId(invoice.id)}
                            disabled={deletingId === invoice.id}
                            className="p-1.5 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-destructive transition-all disabled:opacity-50"
                          >
                            {deletingId === invoice.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      {/* Mobile: amount on its own row */}
                      <p className="text-sm font-semibold tabular-nums text-right mt-1.5 sm:hidden">
                        {formatMoney(invoice.totalAmount ?? 0, invoice.currency || defaultCurrency)}
                      </p>
                    </div>
                  </div>
                );
              })}
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
    </HydrationGuard>
  );
}
