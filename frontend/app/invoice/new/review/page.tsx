"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useInvoiceStore } from "@/lib/store";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { CreateInvoiceRequest } from "@/lib/types";
import { InvoicePreview } from "@/components/invoice-preview";
import { Download, Send, Loader2 } from "lucide-react";

export default function ReviewPage() {
  const router = useRouter();
  const store = useInvoiceStore();
  const api = useAuthenticatedApi();

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = store.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = store.discount || 0;
  const taxAmount = ((subtotal - discountAmount) * (store.taxRate || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handlePreview = () => {
    alert("Opening PDF preview...");
  };

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      const request: CreateInvoiceRequest = {
        companyName: store.companyName,
        companyLogo: store.companyLogo,
        address: store.address,
        city: store.city,
        zipCode: store.zipCode,
        country: store.country,
        phone: store.phone,
        companyEmail: store.companyEmail,
        invoiceNumber: store.invoiceNumber,
        invoiceDate: store.invoiceDate,
        dueDate: store.dueDate,
        primaryColor: store.primaryColor,
        fontFamily: store.fontFamily,
        clientEmail: store.clientEmail,
        emailSubject: store.emailSubject || null,
        emailMessage: store.emailMessage || null,
        clientName: store.clientName || null,
        clientCompany: store.clientCompany || null,
        clientAddress: store.clientAddress || null,
        clientCity: store.clientCity || null,
        clientZip: store.clientZip || null,
        clientCountry: store.clientCountry || null,
        taxRate: store.taxRate || null,
        discount: store.discount || null,
        notes: store.notes || null,
        lineItems: store.lineItems.map(({ description, quantity, rate }) => ({
          description,
          quantity,
          rate,
        })),
      };
      await api.createInvoice(request);
      store.reset();
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

      <div className="flex-1 p-4 md:p-8 bg-secondary overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Review & Send</h1>
            <p className="text-muted-foreground">
              Review your details and send the invoice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Card */}
            <div className="lg:col-span-2 bg-card rounded-xl shadow-sm p-4 md:p-8 border border-border">
              <div className="mb-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                    <div className="text-2xl md:text-4xl font-bold">
                      ${total.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Invoice Date</div>
                    <div className="font-semibold">
                      {new Date(store.invoiceDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 tracking-wider">
                      BILLED TO
                    </div>
                    <div className="text-sm space-y-0.5">
                      {store.clientName && <div className="font-medium">{store.clientName}</div>}
                      {store.clientCompany && <div className="text-muted-foreground">{store.clientCompany}</div>}
                      <div className="text-muted-foreground">{store.clientEmail}</div>
                      {store.clientAddress && <div className="text-muted-foreground">{store.clientAddress}</div>}
                      {(store.clientCity || store.clientZip) && (
                        <div className="text-muted-foreground">
                          {[store.clientCity, store.clientZip].filter(Boolean).join(", ")}
                        </div>
                      )}
                      {store.clientCountry && <div className="text-muted-foreground">{store.clientCountry}</div>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 tracking-wider">
                      FROM
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{store.companyName}</div>
                      <div className="text-muted-foreground">{store.companyEmail}</div>
                    </div>
                  </div>
                </div>

                {/* Totals breakdown */}
                {(discountAmount > 0 || (store.taxRate || 0) > 0) && (
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-red-600 dark:text-red-400">
                          <span>Discount:</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {(store.taxRate || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax ({store.taxRate}%):</span>
                          <span>${taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-semibold mb-2">Email Preview:</div>
                  <p className="text-sm text-muted-foreground italic whitespace-pre-line">
                    &quot;{store.emailMessage}&quot;
                  </p>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={sending}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Preview PDF
                </Button>
                <Button onClick={handleSend} disabled={sending} className="gap-2">
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {sending ? "Sending..." : "Send Invoice"}
                </Button>
              </div>
            </div>

            {/* PDF Preview Thumbnail */}
            <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
              <Label className="mb-3 block text-muted-foreground text-sm font-medium">
                PDF Preview
              </Label>
              <InvoicePreview />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" asChild>
              <Link href="/invoice/new/email">Back</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
