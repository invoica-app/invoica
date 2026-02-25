"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CountrySelect } from "@/components/ui/country-select";
import { useInvoiceStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/lib/settings-store";
import { CURRENCIES, formatMoney } from "@/lib/currency";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HydrationGuard } from "@/components/hydration-guard";
import { DetailsSkeleton } from "./loading";

function Field({
  label,
  htmlFor,
  optional,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-muted-foreground mb-1.5"
      >
        {label}
        {optional && <span className="ml-1 opacity-50">optional</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[11px] text-red-400/80">{error}</p>}
    </div>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const settings = useSettingsStore();

  const storeData = useInvoiceStore(
    useShallow((s) => ({
      invoiceNumber: s.invoiceNumber,
      invoiceDate: s.invoiceDate,
      dueDate: s.dueDate,
      currency: s.currency,
      clientName: s.clientName,
      clientCompany: s.clientCompany,
      clientEmail: s.clientEmail,
      clientAddress: s.clientAddress,
      clientCity: s.clientCity,
      clientZip: s.clientZip,
      clientCountry: s.clientCountry,
      taxRate: s.taxRate,
      discount: s.discount,
      notes: s.notes,
      lineItems: s.lineItems,
    }))
  );
  const { updateInvoice, updateClient, addLineItem, removeLineItem, updateLineItem } =
    useInvoiceStore(
      useShallow((s) => ({
        updateInvoice: s.updateInvoice,
        updateClient: s.updateClient,
        addLineItem: s.addLineItem,
        removeLineItem: s.removeLineItem,
        updateLineItem: s.updateLineItem,
      }))
    );

  const [invoiceNumber, setInvoiceNumber] = useState(
    storeData.invoiceNumber || settings.getNextInvoiceNumber()
  );
  const [invoiceDate, setInvoiceDate] = useState(storeData.invoiceDate);
  const [dueDate, setDueDate] = useState(storeData.dueDate);
  const [currency, setCurrency] = useState(storeData.currency || "USD");

  const [clientName, setClientName] = useState(storeData.clientName);
  const [clientCompany, setClientCompany] = useState(storeData.clientCompany);
  const [clientEmail, setClientEmail] = useState(storeData.clientEmail);
  const [clientAddress, setClientAddress] = useState(storeData.clientAddress);
  const [clientCity, setClientCity] = useState(storeData.clientCity);
  const [clientZip, setClientZip] = useState(storeData.clientZip);
  const [clientCountry, setClientCountry] = useState(storeData.clientCountry);

  const [taxRate, setTaxRate] = useState(storeData.taxRate);
  const [discount, setDiscount] = useState(storeData.discount);
  const [notes, setNotes] = useState(storeData.notes);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const lineItems = storeData.lineItems;

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = discount || 0;
  const taxAmount = ((subtotal - discountAmount) * (taxRate || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!invoiceNumber.trim()) e.invoiceNumber = "Required";
    if (!invoiceDate) e.invoiceDate = "Required";
    if (!dueDate) e.dueDate = "Required";
    if (dueDate && invoiceDate && dueDate < invoiceDate) e.dueDate = "Must be after invoice date";
    if (!clientName.trim()) e.clientName = "Required";
    if (clientEmail.trim() && !isValidEmail(clientEmail)) {
      e.clientEmail = "Enter a valid email";
    }
    if (lineItems.length === 0) e.lineItems = "Add at least one item";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    updateInvoice({ invoiceNumber, invoiceDate, dueDate, currency });
    updateClient({
      clientName, clientCompany, clientEmail,
      clientAddress, clientCity, clientZip, clientCountry,
    });
    updateInvoice({ taxRate, discount, notes });
    router.push("/invoice/new/design");
  };

  return (
    <HydrationGuard fallback={<DetailsSkeleton />}>
      <WizardHeader stepLabel="Step 2 of 5" />

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-lg font-semibold mb-0.5">Invoice Details</h1>
            <p className="text-sm text-muted-foreground">
              Invoice number, dates, client info, and line items.
            </p>
          </div>

          {/* ─── Invoice Meta ─── */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Invoice info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Invoice #" htmlFor="invoiceNumber" error={errors.invoiceNumber}>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => { setInvoiceNumber(e.target.value); setErrors((p) => ({ ...p, invoiceNumber: "" })); }}
                  placeholder="INV-001"
                  className={cn(errors.invoiceNumber && "border-red-400/50 focus-visible:border-red-400/50 focus-visible:ring-red-400/10")}
                />
              </Field>
              <Field label="Date" htmlFor="invoiceDate" error={errors.invoiceDate}>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => { setInvoiceDate(e.target.value); setErrors((p) => ({ ...p, invoiceDate: "" })); }}
                  className={cn(errors.invoiceDate && "border-red-400/50 focus-visible:border-red-400/50 focus-visible:ring-red-400/10")}
                />
              </Field>
              <Field label="Due date" htmlFor="dueDate" error={errors.dueDate}>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => { setDueDate(e.target.value); setErrors((p) => ({ ...p, dueDate: "" })); }}
                  className={cn(errors.dueDate && "border-red-400/50 focus-visible:border-red-400/50 focus-visible:ring-red-400/10")}
                />
              </Field>
              <Field label="Currency" htmlFor="currency">
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm shadow-sm transition-all duration-200 hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:bg-background"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <div className="border-t border-border/40" />

          {/* ─── Bill To ─── */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Bill to</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name" htmlFor="clientName" error={errors.clientName}>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => { setClientName(e.target.value); setErrors((p) => ({ ...p, clientName: "" })); }}
                  placeholder="John Doe"
                  className={cn(errors.clientName && "border-red-400/50 focus-visible:border-red-400/50 focus-visible:ring-red-400/10")}
                />
              </Field>
              <Field label="Company" htmlFor="clientCompany" optional>
                <Input id="clientCompany" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} placeholder="Client Co" />
              </Field>
              <Field label="Email" htmlFor="clientEmail" error={errors.clientEmail}>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => { setClientEmail(e.target.value); setErrors((p) => ({ ...p, clientEmail: "" })); }}
                  placeholder="client@example.com"
                  className={cn(errors.clientEmail && "border-red-400/50 focus-visible:border-red-400/50 focus-visible:ring-red-400/10")}
                />
              </Field>
              <Field label="Address" htmlFor="clientAddress">
                <Input id="clientAddress" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="123 Client St" />
              </Field>
              <Field label="City" htmlFor="clientCity">
                <Input id="clientCity" value={clientCity} onChange={(e) => setClientCity(e.target.value)} placeholder="City" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Zip" htmlFor="clientZip">
                  <Input id="clientZip" value={clientZip} onChange={(e) => setClientZip(e.target.value)} placeholder="10001" />
                </Field>
                <Field label="Country">
                  <CountrySelect
                    value={clientCountry}
                    onChange={setClientCountry}
                    placeholder="Select"
                  />
                </Field>
              </div>
            </div>
          </section>

          <div className="border-t border-border/40" />

          {/* ─── Line Items ─── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Line items</h2>
              <button
                onClick={() => { addLineItem(); setErrors((p) => ({ ...p, lineItems: "" })); }}
                className="text-sm text-[#9747E6] hover:underline transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5 inline mr-1" />
                Add item
              </button>
            </div>

            {errors.lineItems && (
              <p className="mb-3 text-[11px] text-red-400/80">{errors.lineItems}</p>
            )}

            {/* Desktop table */}
            <div className="hidden md:block">
              {lineItems.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_72px_100px_100px_40px] gap-0 bg-muted/40 px-3 py-2">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Description</span>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Qty</span>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Rate</span>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Amount</span>
                    <span />
                  </div>
                  {/* Rows */}
                  {lineItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className={cn(
                        "grid grid-cols-[1fr_72px_100px_100px_40px] gap-0 items-center px-3 py-1 group",
                        idx < lineItems.length - 1 && "border-b border-gray-100 dark:border-gray-800/50"
                      )}
                    >
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                        className="border-0 shadow-none h-9 px-1 rounded-md focus-visible:ring-0 focus-visible:bg-muted/30"
                        placeholder="Service description"
                      />
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                        className="border-0 shadow-none h-9 px-1 rounded-md focus-visible:ring-0 focus-visible:bg-muted/30"
                      />
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateLineItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                        className="border-0 shadow-none h-9 px-1 rounded-md focus-visible:ring-0 focus-visible:bg-muted/30"
                      />
                      <span className="text-sm font-medium tabular-nums text-right pr-1">
                        {formatMoney(item.amount, currency)}
                      </span>
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="flex justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {lineItems.length === 0 && (
                <div className="border border-dashed border-border rounded-lg py-10 text-center">
                  <p className="text-sm text-muted-foreground">No items yet. Click &quot;Add item&quot; to start.</p>
                </div>
              )}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {lineItems.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-3 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                      className="h-10 flex-1"
                      placeholder="Description"
                    />
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="mt-2.5 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Qty</label>
                      <Input type="number" value={item.quantity} onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 0 })} className="h-10" />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Rate</label>
                      <Input type="number" value={item.rate} onChange={(e) => updateLineItem(item.id, { rate: parseFloat(e.target.value) || 0 })} className="h-10" />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="text-[11px] text-muted-foreground mb-1 block">Amount</label>
                      <span className="text-sm font-medium tabular-nums h-10 flex items-center justify-end">{formatMoney(item.amount, currency)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {lineItems.length === 0 && (
                <div className="border border-dashed border-border rounded-lg py-10 text-center">
                  <p className="text-sm text-muted-foreground">No items yet.</p>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-end">
                <div className="w-full md:w-64 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatMoney(subtotal, currency)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-destructive">
                      <span>Discount</span>
                      <span className="tabular-nums">-{formatMoney(discountAmount, currency)}</span>
                    </div>
                  )}
                  {taxRate > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax ({taxRate}%)</span>
                      <span className="tabular-nums">{formatMoney(taxAmount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="tabular-nums">{formatMoney(total, currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-border/40" />

          {/* ─── Adjustments & Notes ─── */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Adjustments & notes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tax rate (%)" htmlFor="taxRate">
                <Input
                  id="taxRate" type="number" step="0.1" min="0" max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  placeholder="0"
                />
              </Field>
              <Field label="Discount" htmlFor="discount">
                <Input
                  id="discount" type="number" step="0.01" min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Notes / Terms" htmlFor="notes" optional>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Payment terms, bank details, thank you note..." />
                </Field>
              </div>
            </div>
          </section>

          {/* Footer nav */}
          <div className="flex justify-between pt-6 border-t border-border/50">
            <Button variant="ghost" asChild>
              <Link href="/invoice/new/company">Back</Link>
            </Button>
            <Button onClick={handleNext}>Continue</Button>
          </div>
        </div>
      </div>
    </HydrationGuard>
  );
}
