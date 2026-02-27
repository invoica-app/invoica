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
  SENT: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  PAID: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  CANCELLED: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  OVERDUE: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
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

      <div className="flex-1 w-full overflow-auto overflow-x-hidden">
        <div className="w-full max-w-3xl mx-auto px-4 pt-4 pb-6 md:px-6">
          <div className="mb-5">
            <h1 className="text-lg font-semibold">Invoices</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your sent and drafted invoices.
            </p>
          </div>

          {error && (
            <ErrorBanner message={error} onRetry={fetchInvoices} className="mb-5" />
          )}

          {/* Loading skeleton */}
          {(loading || authLoading) && (
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full p-4 sm:p-5 bg-card rounded-xl border border-border overflow-hidden"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-16 bg-muted rounded animate-pulse shrink-0" />
                  </div>
                  <div className="h-4 w-14 bg-muted/60 rounded-full animate-pulse mt-2" />
                  <div className="h-3 w-32 max-w-full bg-muted/40 rounded animate-pulse mt-2.5" />
                  <div className="h-3 w-44 max-w-full bg-muted/30 rounded animate-pulse mt-1" />
                </div>
              ))}
            </div>
          )}

          {/* Invoice list */}
          {!loading && !authLoading && invoices.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {invoices.map((invoice) => {
                const isRemoving = removingId === invoice.id;
                const isDraft = (invoice.status || "DRAFT") === "DRAFT";
                return (
                  <div
                    key={invoice.id}
                    className="overflow-hidden"
                    style={isRemoving ? { animation: "collapseRow 300ms 500ms ease-in forwards" } : undefined}
                  >
                    <div
                      className="w-full p-4 sm:p-5 bg-card rounded-xl border border-border hover:bg-muted/30 active:bg-muted/50 transition-colors duration-150 group overflow-hidden"
                      style={isRemoving ? { animation: "foldCard 500ms ease-in forwards", transformOrigin: "top center" } : undefined}
                    >
                      {/* Row 1: Invoice number + amount */}
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-semibold truncate">
                          {invoice.invoiceNumber}
                        </span>
                        <span className="text-sm font-semibold tabular-nums shrink-0">
                          {formatMoney(invoice.totalAmount ?? 0, invoice.currency || defaultCurrency)}
                        </span>
                      </div>

                      {/* Row 2: Status badge + action buttons */}
                      <div className="flex items-center justify-between mt-1.5">
                        <span
                          className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            statusStyles[invoice.status || "DRAFT"]
                          }`}
                        >
                          {invoice.status || "DRAFT"}
                        </span>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => invoice.id && handleEdit(invoice.id)}
                            disabled={editingId === invoice.id}
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                          >
                            {editingId === invoice.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Pencil className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => invoice.id && setConfirmDeleteId(invoice.id)}
                            disabled={deletingId === invoice.id}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          >
                            {deletingId === invoice.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Row 3: Company name */}
                      {invoice.companyName && (
                        <p className="text-xs text-muted-foreground truncate mt-2">
                          {invoice.companyName}
                        </p>
                      )}

                      {/* Row 4: Client email */}
                      {invoice.clientEmail && (
                        <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                          {invoice.clientEmail}
                        </p>
                      )}
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
