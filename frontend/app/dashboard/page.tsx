"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { Invoice } from "@/lib/types";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const { user, isGuest, isAuthenticated, isLoading: authLoading } = useAuth();
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
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const initials = getInitials(user?.name);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 md:px-8 md:py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inv.</h1>
        {isGuest ? (
          <div className="px-3 py-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            Guest
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 md:mb-16 border-2 border-primary rounded-lg p-1 max-w-md mx-auto">
          <button className="flex-1 px-6 py-3 bg-primary text-white rounded-md font-medium flex items-center justify-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            HISTORY
          </button>
          <Link
            href="/invoice/new"
            className="flex-1 px-6 py-3 text-primary rounded-md font-medium flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors text-sm"
          >
            + INVOICE
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchInvoices}
              className="ml-4 flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
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
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900">
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
                  <div className="text-sm text-gray-600 truncate">
                    {invoice.clientEmail} &middot; {invoice.companyName}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-lg font-bold text-gray-900">
                    ${(invoice.totalAmount ?? 0).toFixed(2)}
                  </span>
                  <button
                    onClick={() => invoice.id && handleDelete(invoice.id)}
                    disabled={deletingId === invoice.id}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
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
          <div className="text-center">
            <h2
              className="text-3xl md:text-5xl mb-12 text-primary font-bold"
              style={{ fontFamily: "Amatica SC, cursive" }}
            >
              Nothing Dey
            </h2>

            <div className="mb-8 flex justify-center">
              <Image
                src="/images/nothing-dey.svg"
                alt="Nothing Dey - Empty State"
                width={280}
                height={320}
                priority
              />
            </div>

            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              You haven&apos;t created any invoices yet. Click the &quot;+
              Invoice&quot; tab to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
