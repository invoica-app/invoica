"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES } from "@/lib/currency";
import type { AiInvoiceAnalysis } from "@/lib/types";
import type { AiInvoiceFormData } from "@/components/ai-dynamic-template";

interface FormStepProps {
  analysis: AiInvoiceAnalysis;
  sampleImageUrl: string;
  onPreview: (data: AiInvoiceFormData) => void;
  onBack: () => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
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
    lineItems: [{ id: generateId(), description: "", quantity: 1, rate: 0, amount: 0 }],
    taxRate: 0,
    discount: 0,
    notes: "",
    currency: analysis.detectedCurrency || "USD",
  });

  const updateField = (field: keyof AiInvoiceFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateLineItem = (id: string, field: string, value: string | number) => {
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

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: generateId(), description: "", quantity: 1, rate: 0, amount: 0 }],
    }));
  };

  const removeLineItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Fill in your invoice details</h1>
        <p className="text-sm text-muted-foreground">
          Enter your information below. The AI-detected style will be applied in the preview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Info */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Your Business
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  value={formData.companyEmail}
                  onChange={(e) => updateField("companyEmail", e.target.value)}
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Country</label>
                <Input
                  value={formData.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
          </section>

          {/* Client Info */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Bill To
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Client Name</label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => updateField("clientName", e.target.value)}
                  placeholder="Client name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Company</label>
                <Input
                  value={formData.clientCompany}
                  onChange={(e) => updateField("clientCompany", e.target.value)}
                  placeholder="Client company"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  value={formData.clientEmail}
                  onChange={(e) => updateField("clientEmail", e.target.value)}
                  placeholder="client@email.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Address</label>
                <Input
                  value={formData.clientAddress}
                  onChange={(e) => updateField("clientAddress", e.target.value)}
                  placeholder="Client address"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">City</label>
                <Input
                  value={formData.clientCity}
                  onChange={(e) => updateField("clientCity", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Country</label>
                <Input
                  value={formData.clientCountry}
                  onChange={(e) => updateField("clientCountry", e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
          </section>

          {/* Invoice Details */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Invoice Details
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Invoice #</label>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => updateField("invoiceNumber", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => updateField("invoiceDate", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateField("dueDate", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Currency</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tax Rate (%)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.taxRate || ""}
                  onChange={(e) => updateField("taxRate", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Discount (%)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.discount || ""}
                  onChange={(e) => updateField("discount", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </section>

          {/* Line Items */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Line Items
            </h3>
            <div className="space-y-2">
              {formData.lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {formData.lineItems[0].id === item.id && (
                      <label className="text-xs font-medium text-muted-foreground">Description</label>
                    )}
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    {formData.lineItems[0].id === item.id && (
                      <label className="text-xs font-medium text-muted-foreground">Qty</label>
                    )}
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    {formData.lineItems[0].id === item.id && (
                      <label className="text-xs font-medium text-muted-foreground">Rate</label>
                    )}
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.rate || ""}
                      onChange={(e) => updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    {formData.lineItems[0].id === item.id && (
                      <label className="text-xs font-medium text-muted-foreground">Amount</label>
                    )}
                    <Input value={item.amount.toFixed(2)} disabled />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(item.id)}
                      disabled={formData.lineItems.length <= 1}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      &#10005;
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addLineItem} className="mt-3">
              + Add Item
            </Button>
          </section>

          {/* Notes */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Notes
            </h3>
            <Textarea
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Payment terms, thank you note, etc."
              rows={3}
            />
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={() => onPreview(formData)}>
              Preview Invoice
            </Button>
          </div>
        </div>

        {/* Right sidebar - sample image + detected style */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
              Sample Invoice
            </h3>
            <img
              src={sampleImageUrl}
              alt="Sample invoice"
              className="w-full rounded-lg border border-border shadow-sm"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
              Detected Style
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                {analysis.layout.style}
              </span>
              <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                {analysis.typography.headingFont}
              </span>
              {analysis.layout.hasHeaderBar && (
                <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                  header bar
                </span>
              )}
              {analysis.tableStyle.hasAlternatingRows && (
                <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                  striped rows
                </span>
              )}
              {analysis.specialFeatures.hasSignatureLine && (
                <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                  signature
                </span>
              )}
              {analysis.specialFeatures.hasFooterBar && (
                <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                  footer bar
                </span>
              )}
              <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                {analysis.detectedCurrency}
              </span>
            </div>

            <div className="mt-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">Colors</div>
              <div className="flex gap-1.5">
                {Object.entries(analysis.layout.colorScheme)
                  .slice(0, 4)
                  .map(([key, color]) => (
                    <div
                      key={key}
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: color }}
                      title={`${key}: ${color}`}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
