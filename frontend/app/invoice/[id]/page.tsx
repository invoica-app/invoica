"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { invoiceApi } from "@/lib/api";
import { Invoice, InvoiceStatus } from "@/lib/types";
import { PublicInvoiceView } from "@/components/public-invoice-view";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { useInvoiceStore } from "@/lib/store";
import { formatMoney } from "@/lib/currency";
import {
  ArrowLeft,
  Download,
  Loader2,
  Pencil,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  PAID: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  CANCELLED: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const api = useAuthenticatedApi();
  const loadFromInvoice = useInvoiceStore((s) => s.loadFromInvoice);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!id || isNaN(id)) {
      setError("Invalid invoice ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInvoiceById(id);
      setInvoice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoice.");
    } finally {
      setLoading(false);
    }
  }, [id, api]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchInvoice();
    }
  }, [isAuthenticated, authLoading, fetchInvoice]);

  const handleDownloadPdf = async () => {
    if (!invoice?.publicToken) return;
    setDownloading(true);
    try {
      const blob = await invoiceApi.downloadPublicPdf(invoice.publicToken);
      const fileName = `Invoice-${invoice.invoiceNumber}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      api.recordDownload(id).catch(() => {});
    } catch {
      setError("Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handleEdit = () => {
    if (!invoice || !invoice.id) return;
    loadFromInvoice(invoice, invoice.id);
    router.push("/invoice/new/company");
  };

  const handleMarkPaid = async () => {
    if (!invoice?.id) return;
    setMarkingPaid(true);
    try {
      const updated = await api.updateInvoice(invoice.id, { status: "PAID" as InvoiceStatus });
      setInvoice(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setMarkingPaid(false);
    }
  };

  const generatePdfForShare = async (): Promise<Blob> => {
    if (!invoice?.publicToken) throw new Error("No public token");
    return invoiceApi.downloadPublicPdf(invoice.publicToken);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-lg font-semibold mb-2">Invoice Not Found</p>
        <p className="text-sm text-muted-foreground mb-4">
          {error || "This invoice could not be loaded."}
        </p>
        <Button variant="outline" asChild>
          <Link href="/invoice/new/history">Back to invoices</Link>
        </Button>
      </div>
    );
  }

  const status = invoice.status || "DRAFT";
  const isPaid = status === "PAID";
  const currency = invoice.currency || "USD";
  const totalAmount = invoice.totalAmount ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Top bar */}
      <div className="bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/invoice/new/history">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Link>
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold truncate">
                  {invoice.invoiceNumber}
                </h1>
                <span
                  className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    statusStyles[status]
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {invoice.clientName || invoice.clientEmail} &middot;{" "}
                {formatMoney(totalAmount, currency)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="gap-1.5"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {downloading ? "Downloading..." : "Download PDF"}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>

            {!isPaid && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkPaid}
                disabled={markingPaid}
                className="gap-1.5"
              >
                {markingPaid ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {markingPaid ? "Updating..." : "Mark Paid"}
                </span>
              </Button>
            )}

            <WhatsAppButton
              clientPhone={invoice.clientPhone}
              clientName={invoice.clientName}
              invoiceNumber={invoice.invoiceNumber}
              companyName={invoice.companyName}
              generatePdf={generatePdfForShare}
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Invoice render */}
      <div className="py-6 px-4 md:py-10">
        <PublicInvoiceView invoice={invoice} />
      </div>
    </div>
  );
}
