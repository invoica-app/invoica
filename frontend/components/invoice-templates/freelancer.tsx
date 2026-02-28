"use client";

import { formatMoney } from "@/lib/currency";
import type { InvoiceData } from "./shared";
import { PaymentDetails, formatDate, useTotals, useResolvedColor } from "./shared";

export function FreelancerTemplate({ data }: { data: InvoiceData }) {
  const resolvedColor = useResolvedColor(data);
  const { subtotal, discountAmount, taxAmount, total, currency } = useTotals(data);

  const combinedPhone = [data.phoneCode, data.phone].filter(Boolean).join(" ");
  const contactParts = [combinedPhone, data.companyEmail].filter(Boolean);

  return (
    <div className="flex">
      {/* Left accent bar */}
      <div
        className="w-1.5 -ml-10 -my-10 mr-8 rounded-l-lg flex-shrink-0"
        style={{ backgroundColor: resolvedColor }}
      />

      <div className="flex-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {data.companyLogo ? (
                <img
                  src={data.companyLogo}
                  alt="Logo"
                  className="max-h-10 max-w-[120px] w-auto h-auto"
                  loading="lazy"
                />
              ) : null}
              <div className="text-xl font-bold text-gray-800">
                {data.companyName || "Your Company"}
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-0.5 leading-relaxed mt-1">
              {data.address && <div>{data.address}</div>}
              {(data.city || data.zipCode) && (
                <div>{[data.city, data.zipCode].filter(Boolean).join(", ")}</div>
              )}
              {data.country && <div>{data.country}</div>}
              {contactParts.length > 0 && (
                <div>{contactParts.join(" \u00B7 ")}</div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: resolvedColor }}
            >
              Invoice
            </div>
            {data.invoiceNumber && (
              <div className="text-sm text-gray-500 mt-1">#{data.invoiceNumber}</div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Bill To Card */}
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: resolvedColor }}>
              Bill To
            </div>
            <div className="text-sm space-y-0.5">
              {data.clientName && (
                <div className="font-semibold text-gray-800">{data.clientName}</div>
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

          {/* Dates Card */}
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: resolvedColor }}>
              Details
            </div>
            <div className="text-sm space-y-2">
              <div>
                <div className="text-gray-400 text-xs">Issue Date</div>
                <div className="text-gray-800 font-medium">{formatDate(data.invoiceDate)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">Due Date</div>
                <div className="text-gray-800 font-medium">{formatDate(data.dueDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8 text-sm">
          <thead>
            <tr>
              <th
                className="text-left py-2.5 px-3 text-xs font-semibold tracking-wider uppercase rounded-l-lg"
                style={{ backgroundColor: `${resolvedColor}15`, color: resolvedColor }}
              >
                Item
              </th>
              <th
                className="py-2.5 px-3 w-16 text-center text-xs font-semibold tracking-wider uppercase"
                style={{ backgroundColor: `${resolvedColor}15`, color: resolvedColor }}
              >
                Qty
              </th>
              <th
                className="py-2.5 px-3 w-28 text-right text-xs font-semibold tracking-wider uppercase"
                style={{ backgroundColor: `${resolvedColor}15`, color: resolvedColor }}
              >
                Price
              </th>
              <th
                className="py-2.5 px-3 w-28 text-right text-xs font-semibold tracking-wider uppercase rounded-r-lg"
                style={{ backgroundColor: `${resolvedColor}15`, color: resolvedColor }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.length > 0 ? (
              data.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-800">{item.description || "\u2014"}</td>
                  <td className="py-3 px-3 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 px-3 text-right text-gray-600">
                    {formatMoney(item.rate, currency)}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-800 font-medium">
                    {formatMoney(item.amount, currency)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400 italic">
                  No items added
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-between items-start">
          <div className="max-w-[300px] space-y-4">
            {data.notes && (
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: resolvedColor }}>
                  Notes
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
                <span className="text-gray-800">{formatMoney(subtotal, currency)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-gray-800">-{formatMoney(discountAmount, currency)}</span>
                </div>
              )}
              {(data.taxRate || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax ({data.taxRate}%)</span>
                  <span className="text-gray-800">{formatMoney(taxAmount, currency)}</span>
                </div>
              )}
            </div>

            {/* Bold total callout */}
            <div
              className="mt-4 rounded-xl px-5 py-4 text-white"
              style={{ backgroundColor: resolvedColor }}
            >
              <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
                Amount Due
              </div>
              <div className="text-2xl font-extrabold">
                {formatMoney(total, currency)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
