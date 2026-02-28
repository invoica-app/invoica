"use client";

import { formatMoney } from "@/lib/currency";
import type { InvoiceData } from "./shared";
import { PaymentDetails, formatDate, useTotals, useResolvedColor } from "./shared";

export function ModernTemplate({ data }: { data: InvoiceData }) {
  const resolvedColor = useResolvedColor(data);
  const { subtotal, discountAmount, taxAmount, total, currency } = useTotals(data);

  const combinedPhone = [data.phoneCode, data.phone].filter(Boolean).join(" ");
  const contactParts = [combinedPhone, data.companyEmail].filter(Boolean);

  return (
    <>
      {/* Header: Logo left, Invoice title + company info right */}
      <div className="flex justify-between items-start mb-8">
        <div className="pt-2">
          {data.companyLogo ? (
            <img
              src={data.companyLogo}
              alt="Logo"
              className="max-h-14 max-w-[160px] w-auto h-auto"
              loading="lazy"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-gray-100" />
          )}
        </div>

        <div className="text-right">
          <div
            className="text-4xl font-light tracking-wide mb-3"
            style={{ color: resolvedColor }}
          >
            Invoice
          </div>
          <div className="text-sm text-gray-800 font-semibold">
            {data.companyName || "Your Company"}
          </div>
          <div className="text-xs text-gray-500 mt-1 space-y-0.5 leading-relaxed">
            {data.address && <div>{data.address}</div>}
            {(data.city || data.zipCode) && (
              <div>
                {[data.city, data.zipCode].filter(Boolean).join(", ")}
              </div>
            )}
            {data.country && <div>{data.country}</div>}
            {contactParts.length > 0 && (
              <div>{contactParts.join(" \u00B7 ")}</div>
            )}
          </div>
        </div>
      </div>

      {/* Bill To Banner */}
      <div
        className="rounded-lg px-6 py-5 mb-8"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="flex justify-between">
          <div>
            <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">
              Bill To
            </div>
            <div className="text-sm space-y-0.5">
              {data.clientName && (
                <div className="font-semibold text-gray-800">
                  {data.clientName}
                </div>
              )}
              {data.clientCompany && (
                <div className="text-gray-600">{data.clientCompany}</div>
              )}
              {data.clientEmail && (
                <div className="text-gray-500">{data.clientEmail}</div>
              )}
              {data.clientAddress && (
                <div className="text-gray-500">{data.clientAddress}</div>
              )}
              {(data.clientCity || data.clientZip || data.clientCountry) && (
                <div className="text-gray-500">
                  {[data.clientCity, data.clientZip, data.clientCountry]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
              {!data.clientName && !data.clientEmail && (
                <div className="text-gray-400 italic">No client info</div>
              )}
            </div>
          </div>

          <div className="text-right text-sm">
            <div className="space-y-2">
              {data.invoiceNumber && (
                <div>
                  <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                    Invoice #
                  </div>
                  <div className="text-gray-800 font-medium">
                    {data.invoiceNumber}
                  </div>
                </div>
              )}
              <div>
                <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  Date
                </div>
                <div className="text-gray-800">
                  {formatDate(data.invoiceDate)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  Due Date
                </div>
                <div className="text-gray-800">
                  {formatDate(data.dueDate)}
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
          {data.lineItems.length > 0 ? (
            data.lineItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-800">
                  {item.description || "\u2014"}
                </td>
                <td className="py-3 text-center text-gray-600">
                  {item.quantity}
                </td>
                <td className="py-3 text-right text-gray-600">
                  {formatMoney(item.rate, currency)}
                </td>
                <td className="py-3 text-right text-gray-800 font-medium">
                  {formatMoney(item.amount, currency)}
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

      {/* Footer: Notes + Payment left, Totals right */}
      <div className="flex justify-between items-start">
        {/* Notes & Payment */}
        <div className="max-w-[320px] space-y-4">
          {data.notes && (
            <div>
              <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
                Notes / Terms
              </div>
              <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                {data.notes}
              </p>
            </div>
          )}
          <PaymentDetails data={data} />
        </div>

        {/* Totals */}
        <div className="w-56">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-800">
                {formatMoney(subtotal, currency)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="text-gray-800">
                  -{formatMoney(discountAmount, currency)}
                </span>
              </div>
            )}
            {(data.taxRate || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tax ({data.taxRate}%)</span>
                <span className="text-gray-800">
                  {formatMoney(taxAmount, currency)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-700">Total</span>
                <span className="text-gray-900">
                  {formatMoney(total, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Due Box */}
          <div
            className="mt-4 rounded-lg px-4 py-3 border border-gray-200"
            style={{ borderTopColor: resolvedColor, borderTopWidth: 3 }}
          >
            <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1">
              Amount Due
            </div>
            <div className="text-xl font-bold text-gray-900">
              {formatMoney(total, currency)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
