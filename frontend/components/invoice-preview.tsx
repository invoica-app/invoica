"use client";

import { useInvoiceStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

export function InvoicePreview() {
  const store = useInvoiceStore(
    useShallow((state) => ({
      lineItems: state.lineItems,
      discount: state.discount,
      taxRate: state.taxRate,
      fontFamily: state.fontFamily,
      companyLogo: state.companyLogo,
      primaryColor: state.primaryColor,
      companyName: state.companyName,
      address: state.address,
      city: state.city,
      zipCode: state.zipCode,
      country: state.country,
      phone: state.phone,
      companyEmail: state.companyEmail,
      invoiceNumber: state.invoiceNumber,
      invoiceDate: state.invoiceDate,
      dueDate: state.dueDate,
      clientName: state.clientName,
      clientCompany: state.clientCompany,
      clientEmail: state.clientEmail,
      clientAddress: state.clientAddress,
      clientCity: state.clientCity,
      clientZip: state.clientZip,
      clientCountry: state.clientCountry,
      notes: state.notes,
    }))
  );

  const subtotal = store.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = store.discount || 0;
  const taxAmount = ((subtotal - discountAmount) * (store.taxRate || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const contactParts = [store.phone, store.companyEmail].filter(Boolean);

  return (
    <div className="aspect-[8.5/11] bg-white rounded-lg border border-gray-200 overflow-hidden relative">
      <div
        className="origin-top-left w-[800px] p-10"
        style={{
          transform: "scale(0.34)",
          fontFamily: store.fontFamily || "Inter",
          color: "#1a1a1a",
        }}
      >
        {/* Header: Logo left, Invoice title + company info right */}
        <div className="flex justify-between items-start mb-8">
          <div className="pt-2">
            {store.companyLogo ? (
              <img
                src={store.companyLogo}
                alt="Logo"
                className="h-14 object-contain"
                loading="lazy"
                width={140}
                height={56}
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gray-100" />
            )}
          </div>

          <div className="text-right">
            <div
              className="text-4xl font-light tracking-wide mb-3"
              style={{ color: store.primaryColor }}
            >
              Invoice
            </div>
            <div className="text-sm text-gray-800 font-semibold">
              {store.companyName || "Your Company"}
            </div>
            <div className="text-xs text-gray-500 mt-1 space-y-0.5 leading-relaxed">
              {store.address && <div>{store.address}</div>}
              {(store.city || store.zipCode) && (
                <div>
                  {[store.city, store.zipCode].filter(Boolean).join(", ")}
                </div>
              )}
              {store.country && <div>{store.country}</div>}
              {contactParts.length > 0 && (
                <div>{contactParts.join(" \u00B7 ")}</div>
              )}
            </div>
          </div>
        </div>

        {/* Bill To Banner */}
        <div className="rounded-lg px-6 py-5 mb-8" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="flex justify-between">
            <div>
              <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">
                Bill To
              </div>
              <div className="text-sm space-y-0.5">
                {store.clientName && (
                  <div className="font-semibold text-gray-800">
                    {store.clientName}
                  </div>
                )}
                {store.clientCompany && (
                  <div className="text-gray-600">{store.clientCompany}</div>
                )}
                {store.clientEmail && (
                  <div className="text-gray-500">{store.clientEmail}</div>
                )}
                {store.clientAddress && (
                  <div className="text-gray-500">{store.clientAddress}</div>
                )}
                {(store.clientCity || store.clientZip || store.clientCountry) && (
                  <div className="text-gray-500">
                    {[store.clientCity, store.clientZip, store.clientCountry]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
                {!store.clientName && !store.clientEmail && (
                  <div className="text-gray-400 italic">No client info</div>
                )}
              </div>
            </div>

            <div className="text-right text-sm">
              <div className="space-y-2">
                {store.invoiceNumber && (
                  <div>
                    <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                      Invoice #
                    </div>
                    <div className="text-gray-800 font-medium">
                      {store.invoiceNumber}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                    Date
                  </div>
                  <div className="text-gray-800">
                    {formatDate(store.invoiceDate)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                    Due Date
                  </div>
                  <div className="text-gray-800">
                    {formatDate(store.dueDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8 text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Item
              </th>
              <th className="py-2.5 w-16 text-center text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Qty
              </th>
              <th className="py-2.5 w-28 text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Price
              </th>
              <th className="py-2.5 w-28 text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {store.lineItems.length > 0 ? (
              store.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-gray-800">
                    {item.description || "\u2014"}
                  </td>
                  <td className="py-3 text-center text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-gray-600">
                    ${formatCurrency(item.rate)}
                  </td>
                  <td className="py-3 text-right text-gray-800 font-medium">
                    ${formatCurrency(item.amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="py-6 text-center text-gray-400 italic"
                >
                  No items added
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer: Notes left, Totals right */}
        <div className="flex justify-between items-start">
          {/* Notes */}
          <div className="max-w-[320px]">
            {store.notes && (
              <>
                <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
                  Notes / Terms
                </div>
                <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                  {store.notes}
                </p>
              </>
            )}
          </div>

          {/* Totals */}
          <div className="w-56">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-800">
                  ${formatCurrency(subtotal)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-gray-800">
                    -${formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
              {(store.taxRate || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax ({store.taxRate}%)</span>
                  <span className="text-gray-800">
                    ${formatCurrency(taxAmount)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-700">Total</span>
                  <span className="text-gray-900">
                    ${formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount Due Box */}
            <div
              className="mt-4 rounded-lg px-4 py-3 border border-gray-200"
              style={{ borderTopColor: store.primaryColor, borderTopWidth: 3 }}
            >
              <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1">
                Amount Due
              </div>
              <div className="text-xl font-bold text-gray-900">
                ${formatCurrency(total)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
