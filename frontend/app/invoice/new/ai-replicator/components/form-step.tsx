"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Eye, Plus, X, Upload, Loader2, Building2, User, FileText, StickyNote } from "lucide-react";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
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
  return <label className="block text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">{children}</label>;
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function FormStep({ analysis, sampleImageUrl, onPreview, onBack }: FormStepProps) {
  const api = useAuthenticatedApi();
  const logoInputRef = useRef<HTMLInputElement>(null);
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

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setUploadError("Only PNG and JPEG files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File must be smaller than 5MB.");
      return;
    }

    setUploadError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoUrl(base64);
      setFormData((prev) => ({ ...prev, companyLogo: base64 }));
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const result = await api.uploadLogo(file);
      setLogoUrl(result.url);
      setFormData((prev) => ({ ...prev, companyLogo: result.url }));
    } catch {
      // base64 fallback already set
    } finally {
      setUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    setFormData((prev) => ({ ...prev, companyLogo: null }));
  };

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold">Fill in your invoice details</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            The AI-detected style will be applied on preview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <Button size="sm" onClick={() => onPreview(formData)} className="shadow-sm">
            <Eye className="w-4 h-4 mr-1.5" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form sections */}
        <div className="lg:col-span-2 space-y-5">
          <Section icon={Building2} title="Your Business">
            <div className="grid grid-cols-2 gap-3">
              {/* Logo upload */}
              <div>
                <Label>Company Logo</Label>
                <input ref={logoInputRef} type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleLogoUpload} />
                {logoUrl ? (
                  <div className="relative border border-border rounded-lg p-3 flex items-center justify-center bg-background h-[88px]">
                    <img src={logoUrl} alt="Logo" className="object-contain max-h-14 max-w-full" />
                    {uploading && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                    )}
                    <button type="button" onClick={handleRemoveLogo} className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => !uploading && logoInputRef.current?.click()} className="border border-dashed border-border rounded-lg h-[88px] flex flex-col items-center justify-center hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer">
                    {uploading ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <Upload className="w-4 h-4 text-muted-foreground mb-1" />}
                    <p className="text-[11px] text-muted-foreground">{uploading ? "Uploading..." : "Upload logo"}</p>
                  </div>
                )}
                {uploadError && <p className="mt-1 text-[10px] text-destructive">{uploadError}</p>}
              </div>
              <div>
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
          </Section>

          <Section icon={User} title="Bill To">
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
          </Section>

          <Section icon={FileText} title="Invoice Details">
            <div className="grid grid-cols-3 gap-3 mb-5">
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

            {/* Line items */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 bg-muted/50 border-b border-border">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1" />
              </div>
              <div className="divide-y divide-border">
                {formData.lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center px-3 py-2">
                    <div className="col-span-5">
                      <Input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Item description" className="h-8 text-xs" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={0} step={0.01} value={item.rate || ""} onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground tabular-nums">{item.amount.toFixed(2)}</span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={formData.lineItems.length <= 1}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 w-full px-3 py-2.5 border-t border-border hover:bg-muted/30 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Add line item
              </button>
            </div>
          </Section>

          <Section icon={StickyNote} title="Notes">
            <Textarea
              value={formData.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Payment terms, thank you note..."
              rows={3}
              className="text-sm"
            />
          </Section>
        </div>

        {/* Sidebar — sample + detected style */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sample Invoice</h3>
            <img src={sampleImageUrl} alt="Sample" className="w-full rounded-lg" />
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Detected Style</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                analysis.layout.style,
                analysis.typography.headingFont,
                analysis.detectedCurrency,
                ...(analysis.layout.hasHeaderBar ? ["header bar"] : []),
                ...(analysis.tableStyle.hasAlternatingRows ? ["striped rows"] : []),
                ...(analysis.specialFeatures.hasSignatureLine ? ["signature"] : []),
              ].map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              {Object.entries(analysis.layout.colorScheme).slice(0, 5).map(([key, color]) => (
                <div
                  key={key}
                  className="w-6 h-6 rounded-lg border border-border shadow-sm"
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
