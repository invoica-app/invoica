"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInvoiceStore } from "@/lib/store";
import { Plus, Trash2 } from "lucide-react";

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const store = useInvoiceStore();

  const [invoiceNumber, setInvoiceNumber] = useState(store.invoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState(store.invoiceDate);
  const [dueDate, setDueDate] = useState(store.dueDate);

  // Client (Bill To) local state
  const [clientName, setClientName] = useState(store.clientName);
  const [clientCompany, setClientCompany] = useState(store.clientCompany);
  const [clientEmail, setClientEmail] = useState(store.clientEmail);
  const [clientAddress, setClientAddress] = useState(store.clientAddress);
  const [clientCity, setClientCity] = useState(store.clientCity);
  const [clientZip, setClientZip] = useState(store.clientZip);
  const [clientCountry, setClientCountry] = useState(store.clientCountry);

  // Tax, Discount, Notes
  const [taxRate, setTaxRate] = useState(store.taxRate);
  const [discount, setDiscount] = useState(store.discount);
  const [notes, setNotes] = useState(store.notes);

  const lineItems = store.lineItems;

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = discount || 0;
  const taxAmount = ((subtotal - discountAmount) * (taxRate || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handleNext = () => {
    store.updateInvoice({
      invoiceNumber,
      invoiceDate,
      dueDate,
    });
    store.updateClient({
      clientName,
      clientCompany,
      clientEmail,
      clientAddress,
      clientCity,
      clientZip,
      clientCountry,
    });
    store.updateInvoice({
      taxRate,
      discount,
      notes,
    });
    router.push("/invoice/new/design");
  };

  return (
    <>
      <WizardHeader stepLabel="Step 2 of 5" />

      <div className="flex-1 p-4 md:p-8 bg-secondary overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Invoice Details</h1>
            <p className="text-muted-foreground">
              Set the invoice number, dates, client info, and line items.
            </p>
          </div>

          <div className="bg-card rounded-xl shadow-sm p-4 md:p-8 border border-border">
            {/* Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div>
                <Label htmlFor="invoiceNumber" className="mb-3 block text-muted-foreground">
                  Invoice Number
                </Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-001"
                />
              </div>
              <div>
                <Label htmlFor="invoiceDate" className="mb-3 block text-muted-foreground">
                  Date
                </Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dueDate" className="mb-3 block text-muted-foreground">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Bill To Section */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold mb-4">Bill To</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName" className="mb-2 block text-muted-foreground">
                    Client Name
                  </Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="clientCompany" className="mb-2 block text-muted-foreground">
                    Company <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="clientCompany"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="Client Company"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail" className="mb-2 block text-muted-foreground">
                    Client Email
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="clientAddress" className="mb-2 block text-muted-foreground">
                    Address
                  </Label>
                  <Input
                    id="clientAddress"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="123 Client St"
                  />
                </div>
                <div>
                  <Label htmlFor="clientCity" className="mb-2 block text-muted-foreground">
                    City
                  </Label>
                  <Input
                    id="clientCity"
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientZip" className="mb-2 block text-muted-foreground">
                      Zip Code
                    </Label>
                    <Input
                      id="clientZip"
                      value={clientZip}
                      onChange={(e) => setClientZip(e.target.value)}
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientCountry" className="mb-2 block text-muted-foreground">
                      Country
                    </Label>
                    <Input
                      id="clientCountry"
                      value={clientCountry}
                      onChange={(e) => setClientCountry(e.target.value)}
                      placeholder="USA"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Line Items</h3>
                <Button
                  onClick={() => store.addLineItem()}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-24">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-32">
                        Rate
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground w-36">
                        Amount
                      </th>
                      <th className="px-4 py-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              store.updateLineItem(item.id, {
                                description: e.target.value,
                              })
                            }
                            className="border-0 shadow-none h-9 px-2"
                            placeholder="Service description"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              store.updateLineItem(item.id, {
                                quantity: parseInt(e.target.value) || 0,
                              })
                            }
                            className="border-0 shadow-none h-9 px-2"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              store.updateLineItem(item.id, {
                                rate: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="border-0 shadow-none h-9 px-2"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ${item.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => store.removeLineItem(item.id)}
                            className="text-muted-foreground hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {lineItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No items yet. Click &quot;Add Item&quot; to add a line item.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile stacked cards */}
              <div className="md:hidden space-y-4">
                {lineItems.map((item) => (
                  <div key={item.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          store.updateLineItem(item.id, {
                            description: e.target.value,
                          })
                        }
                        className="h-9"
                        placeholder="Service description"
                      />
                      <button
                        onClick={() => store.removeLineItem(item.id)}
                        className="ml-2 mt-1 text-muted-foreground hover:text-red-600 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Qty</label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            store.updateLineItem(item.id, {
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Rate</label>
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            store.updateLineItem(item.id, {
                              rate: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="text-right font-medium text-sm">
                      Amount: ${item.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
                {lineItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No items yet. Click &quot;Add Item&quot; to add a line item.
                  </div>
                )}
              </div>
            </div>

            {/* Tax, Discount, Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <Label htmlFor="taxRate" className="mb-2 block text-muted-foreground">
                  Tax Rate (%)
                </Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.1"
                  min="0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="discount" className="mb-2 block text-muted-foreground">
                  Discount ($)
                </Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="notes" className="mb-2 block text-muted-foreground">
                  Notes / Terms
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Payment terms, notes..."
                />
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-80 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Discount:</span>
                    <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax ({taxRate}%):</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-border">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" asChild>
              <Link href="/invoice/new/company">Back</Link>
            </Button>
            <Button onClick={handleNext}>Next Step</Button>
          </div>
        </div>
      </div>
    </>
  );
}
