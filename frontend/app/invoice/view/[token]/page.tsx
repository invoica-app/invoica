"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { invoiceApi } from "@/lib/api";
import { Invoice } from "@/lib/types";
import { PublicInvoiceView } from "@/components/public-invoice-view";
import { Download, Loader2 } from "lucide-react";

export default function PublicInvoicePage() {
  const params = useParams();
  const token = params.token as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    invoiceApi
      .getPublicInvoice(token)
      .then(setInvoice)
      .catch(() => setError("Invoice not found or link has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownloadPdf = async () => {
    if (!token) return;
    setDownloading(true);
    try {
      const blob = await invoiceApi.downloadPublicPdf(token);
      const fileName = `Invoice-${invoice?.invoiceNumber || "download"}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-lg font-semibold text-foreground mb-2">Invoice Not Found</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error || "This invoice link may be invalid or has expired."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading ? "Downloading..." : "Download PDF"}
        </button>
      </div>

      <PublicInvoiceView invoice={invoice} />
    </div>
  );
}
