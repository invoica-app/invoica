"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Eye, Plus, X } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import type { AiInvoiceAnalysis } from "@/lib/types";
import type { AiInvoiceFormData } from "@/components/ai-dynamic-template";

interface FormStepProps {
  analysis: AiInvoiceAnalysis;
  sampleImageUrl: string;
  onPreview: (data: AiInvoiceFormData) => void;
  onBack: () => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-muted-foreground mb-1">{children}</label>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{children}</h3>;
}

export function FormStep({ analysis, sampleImageUrl, onPreview, onBack }: FormStepProps) {
  const today = new Date().toISOString().split("T")[0];
  const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const [formData, setFormData] = useState<AiInvoiceFormData>({
    companyName: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    phone: "",
    companyEmail: "",
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientAddress: "",
    clientCity: "",
    clientZip: "",
    clientCountry: "",
    invoiceNumber: "INV-001",
    invoiceDate: today,
    dueDate: due,
    lineItems: [{ id: uid(), description: "", quantity: 1, rate: 0, amount: 0 }],
    taxRate: 0,
    discount: 0,
    notes: "",
    currency: analysis.detectedCurrency || "USD",
  });

  const set = (field: keyof AiInvoiceFormData, value: string | number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const updateItem = (id: string, field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      }),
    }));
  };

  const addItem = () =>
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: uid(), description: "", quantity: 1, rate: 0, amount: 0 }],
    }));

  const removeItem = (id: string) =>
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((i) => i.id !== id),
    }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Invoice details</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            The detected style will be applied when you preview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <Button size="sm" onClick={() => onPreview(formData)}>
            <Eye className="w-4 h-4 mr-1.5" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Business */}
          <section>
            <SectionTitle>Your Business</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Company Name</Label>
                <Input value={formData.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Your company name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={formData.companyEmail} onChange={(e) => set("companyEmail", e.target.value)} placeholder="email@company.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 234 567 890" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={formData.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={formData.city} onChange={(e) => set("city", e.target.value)} placeholder="City" />
              </div>
            </div>
          </section>

          {/* Client */}
          <section>
            <SectionTitle>Bill To</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Client Name</Label>
                <Input value={formData.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="Client name" />
              </div>
              <div>
                <Label>Company</Label>
                <Input value={formData.clientCompany} onChange={(e) => set("clientCompany", e.target.value)} placeholder="Client company" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={formData.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} placeholder="client@email.com" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={formData.clientAddress} onChange={(e) => set("clientAddress", e.target.value)} placeholder="Client address" />
              </div>
            </div>
          </section>

          {/* Invoice Meta */}
          <section>
            <SectionTitle>Invoice Details</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Invoice #</Label>
                <Input value={formData.invoiceNumber} onChange={(e) => set("invoiceNumber", e.target.value)} />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={formData.invoiceDate} onChange={(e) => set("invoiceDate", e.target.value)} />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={formData.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
              </div>
              <div>
                <Label>Currency</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.currency}
                  onChange={(e) => set("currency", e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Tax %</Label>
                <Input type="number" min={0} max={100} value={formData.taxRate || ""} onChange={(e) => set("taxRate", parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Discount %</Label>
                <Input type="number" min={0} max={100} value={formData.discount || ""} onChange={(e) => set("discount", parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </section>

          {/* Line Items */}
          <section>
            <SectionTitle>Line Items</SectionTitle>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1" />
              </div>
              {formData.lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Item description" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min={0} step={0.01} value={item.rate || ""} onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-2">
                    <Input value={item.amount.toFixed(2)} disabled className="text-muted-foreground" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={formData.lineItems.length <= 1}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mt-3 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add item
            </button>
          </section>

          {/* Notes */}
          <section>
            <SectionTitle>Notes</SectionTitle>
            <Textarea
              value={formData.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Payment terms, notes..."
              rows={2}
            />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div>
            <SectionTitle>Sample Invoice</SectionTitle>
            <img
              src={sampleImageUrl}
              alt="Sample"
              className="w-full rounded-lg border border-border"
            />
          </div>

          <div>
            <SectionTitle>Detected Style</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {[
                analysis.layout.style,
                analysis.typography.headingFont,
                analysis.detectedCurrency,
                ...(analysis.layout.hasHeaderBar ? ["header bar"] : []),
                ...(analysis.tableStyle.hasAlternatingRows ? ["striped rows"] : []),
                ...(analysis.specialFeatures.hasSignatureLine ? ["signature"] : []),
              ].map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-1.5 mt-3">
              {Object.entries(analysis.layout.colorScheme).slice(0, 5).map(([key, color]) => (
                <div
                  key={key}
                  className="w-5 h-5 rounded border border-border"
                  style={{ backgroundColor: color }}
                  title={`${key}: ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
