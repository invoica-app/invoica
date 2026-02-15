"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { useInvoiceStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { CreateInvoiceRequest } from "@/lib/types";
import { InvoicePreview, InvoiceFullPage } from "@/components/invoice-preview";
import { formatMoney } from "@/lib/currency";
import { useSettingsStore } from "@/lib/settings-store";
import { Download, Send, Loader2 } from "lucide-react";

export default function ReviewPage() {
  const router = useRouter();
  const api = useAuthenticatedApi();
  const settings = useSettingsStore();
  const pdfRef = useRef<HTMLDivElement>(null);

  const data = useInvoiceStore(
    useShallow((s) => ({
      companyName: s.companyName,
      companyLogo: s.companyLogo,
      address: s.address,
      city: s.city,
      zipCode: s.zipCode,
      country: s.country,
      phone: s.phone,
      companyEmail: s.companyEmail,
      invoiceNumber: s.invoiceNumber,
      invoiceDate: s.invoiceDate,
      dueDate: s.dueDate,
      primaryColor: s.primaryColor,
      fontFamily: s.fontFamily,
      clientEmail: s.clientEmail,
      emailSubject: s.emailSubject,
      emailMessage: s.emailMessage,
      clientName: s.clientName,
      clientCompany: s.clientCompany,
      clientAddress: s.clientAddress,
      clientCity: s.clientCity,
      clientZip: s.clientZip,
      clientCountry: s.clientCountry,
      taxRate: s.taxRate,
      discount: s.discount,
      notes: s.notes,
      lineItems: s.lineItems,
      currency: s.currency,
    }))
  );
  const reset = useInvoiceStore((s) => s.reset);

  const [sending, setSending] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = data.currency || "USD";
  const subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = data.discount || 0;
  const taxAmount = ((subtotal - discountAmount) * (data.taxRate || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handlePreview = async () => {
    const el = pdfRef.current;
    if (!el) return;

    setGeneratingPdf(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleSend = async () => {
    const missing: string[] = [];
    if (!data.companyName.trim()) missing.push("Company name");
    if (!data.address.trim()) missing.push("Address");
    if (!data.city.trim()) missing.push("City");
    if (!data.zipCode.trim()) missing.push("Zip code");
    if (!data.country.trim()) missing.push("Country");
    if (!data.phone.trim()) missing.push("Phone");
    if (!data.companyEmail.trim()) missing.push("Company email");
    if (!data.invoiceNumber.trim()) missing.push("Invoice number");
    if (!data.clientEmail.trim()) missing.push("Client email");
    if (data.lineItems.length === 0) missing.push("At least one line item");

    if (missing.length > 0) {
      setError(`Missing required fields: ${missing.join(", ")}`);
      return;
    }

    setSending(true);
    setError(null);
    try {
      const request: CreateInvoiceRequest = {
        companyName: data.companyName,
        companyLogo: data.companyLogo,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        country: data.country,
        phone: data.phone,
        companyEmail: data.companyEmail,
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        primaryColor: data.primaryColor,
        fontFamily: data.fontFamily,
        clientEmail: data.clientEmail,
        emailSubject: data.emailSubject || null,
        emailMessage: data.emailMessage || null,
        clientName: data.clientName || null,
        clientCompany: data.clientCompany || null,
        clientAddress: data.clientAddress || null,
        clientCity: data.clientCity || null,
        clientZip: data.clientZip || null,
        clientCountry: data.clientCountry || null,
        taxRate: data.taxRate || null,
        discount: data.discount || null,
        notes: data.notes || null,
        lineItems: data.lineItems.map(({ description, quantity, rate }) => ({
          description,
          quantity,
          rate,
        })),
      };
      await api.createInvoice(request);
      settings.updateSettings({ nextInvoiceNumber: settings.nextInvoiceNumber + 1 });
      reset();
      router.push("/invoice/new/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invoice.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <WizardHeader stepLabel="Step 5 of 5" />

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-5">
            <h1 className="text-lg font-semibold mb-0.5">Review & Send</h1>
            <p className="text-sm text-muted-foreground">
              Double-check everything before sending.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Amount + date */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatMoney(total, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">Date</p>
                  <p className="text-sm font-medium">
                    {new Date(data.invoiceDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mb-1.5">Billed to</p>
                  <div className="text-sm space-y-0.5">
                    {data.clientName && <p className="font-medium">{data.clientName}</p>}
                    {data.clientCompany && <p className="text-muted-foreground">{data.clientCompany}</p>}
                    <p className="text-muted-foreground">{data.clientEmail}</p>
                    {data.clientAddress && <p className="text-muted-foreground">{data.clientAddress}</p>}
                    {(data.clientCity || data.clientZip) && (
                      <p className="text-muted-foreground">
                        {[data.clientCity, data.clientZip].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {data.clientCountry && <p className="text-muted-foreground">{data.clientCountry}</p>}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mb-1.5">From</p>
                  <div className="text-sm">
                    <p className="font-medium">{data.companyName}</p>
                    <p className="text-muted-foreground">{data.companyEmail}</p>
                  </div>
                </div>
              </div>

              {/* Line items */}
              {data.lineItems.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mb-2">Line items</p>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Description</th>
                          <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground w-14">Qty</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground w-24">Rate</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground w-24">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {data.lineItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2">{item.description || "\u2014"}</td>
                            <td className="px-3 py-2 text-center text-muted-foreground tabular-nums">{item.quantity}</td>
                            <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">{formatMoney(item.rate, currency)}</td>
                            <td className="px-3 py-2 text-right font-medium tabular-nums">{formatMoney(item.amount, currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-muted/50 rounded-lg p-3.5">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{formatMoney(subtotal, currency)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-destructive">
                      <span>Discount</span>
                      <span className="tabular-nums">-{formatMoney(discountAmount, currency)}</span>
                    </div>
                  )}
                  {(data.taxRate || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax ({data.taxRate}%)</span>
                      <span className="tabular-nums">{formatMoney(taxAmount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-1.5 border-t border-border mt-1">
                    <span>Total</span>
                    <span className="tabular-nums">{formatMoney(total, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Email preview */}
              <div className="bg-muted/50 rounded-lg p-3.5">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Email message</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {data.emailMessage}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={sending || generatingPdf}
                  className="gap-2"
                >
                  {generatingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {generatingPdf ? "Generating..." : "Preview PDF"}
                </Button>
                <Button onClick={handleSend} disabled={sending || generatingPdf} className="gap-2">
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {sending ? "Sending..." : "Send invoice"}
                </Button>
              </div>
            </div>

            {/* PDF thumbnail */}
            <div className="border border-border rounded-lg p-4 h-fit">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Preview</label>
              <InvoicePreview />
            </div>
          </div>

          <div className="flex justify-start mt-6 pt-6 border-t border-border/50">
            <Button variant="ghost" asChild>
              <Link href="/invoice/new/email">Back</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden full-size invoice for PDF capture */}
      <div className="fixed left-[-9999px] top-0" aria-hidden="true">
        <InvoiceFullPage ref={pdfRef} />
      </div>
    </>
  );
}
