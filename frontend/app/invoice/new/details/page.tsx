"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvoiceStore } from "@/lib/store";
import { Plus, Trash2 } from "lucide-react";

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const store = useInvoiceStore();

  const [invoiceNumber, setInvoiceNumber] = useState(store.invoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState(store.invoiceDate);
  const [dueDate, setDueDate] = useState(store.dueDate);

  const lineItems = store.lineItems;

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const handleNext = () => {
    store.updateInvoice({
      invoiceNumber,
      invoiceDate,
      dueDate,
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
            <p className="text-gray-600">
              Set the invoice number, dates, and line items.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 border border-gray-100">
            {/* Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div>
                <Label htmlFor="invoiceNumber" className="mb-3 block text-gray-700">
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
                <Label htmlFor="invoiceDate" className="mb-3 block text-gray-700">
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
                <Label htmlFor="dueDate" className="mb-3 block text-gray-700">
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
              <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-24">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">
                        Rate
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 w-36">
                        Amount
                      </th>
                      <th className="px-4 py-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
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
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile stacked cards */}
              <div className="md:hidden space-y-4">
                {lineItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
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
                        className="ml-2 mt-1 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Qty</label>
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
                        <label className="text-xs text-gray-500 mb-1 block">Rate</label>
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
                    <div className="text-right font-medium text-sm text-gray-900">
                      Amount: ${item.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-80 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>${subtotal.toFixed(2)}</span>
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
