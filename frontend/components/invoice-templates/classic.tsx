"use client";

import { formatMoney } from "@/lib/currency";
import type { InvoiceData } from "./shared";
import { PaymentDetails, formatDate, useTotals, useResolvedColor } from "./shared";

export function ClassicTemplate({ data }: { data: InvoiceData }) {
  const resolvedColor = useResolvedColor(data);
  const { subtotal, discountAmount, taxAmount, total, currency } = useTotals(data);

  const combinedPhone = [data.phoneCode, data.phone].filter(Boolean).join(" ");
  const contactParts = [combinedPhone, data.companyEmail].filter(Boolean);

  return (
    <div style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}>
      {/* Centered Header */}
      <div className="text-center mb-8 pb-6" style={{ borderBottom: `3px double ${resolvedColor}` }}>
        {data.companyLogo ? (
          <img
            src={data.companyLogo}
            alt="Logo"
            className="max-h-14 max-w-[160px] w-auto h-auto mx-auto mb-3"
            loading="lazy"
          />
        ) : null}
        <h1
          className="text-3xl font-bold tracking-wider uppercase mb-2"
          style={{ color: resolvedColor }}
        >
          INVOICE
        </h1>
        <div className="text-base font-semibold text-gray-800">
          {data.companyName || "Your Company"}
        </div>
        <div className="text-xs text-gray-500 mt-1 space-y-0.5 leading-relaxed">
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

      {/* Invoice details + Bill To in two columns */}
      <div className="flex justify-between mb-8">
        <div>
          <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
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

        <div className="text-right text-sm space-y-1.5">
          {data.invoiceNumber && (
            <div>
              <span className="text-gray-500 font-medium">Invoice No: </span>
              <span className="text-gray-800 font-semibold">{data.invoiceNumber}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500 font-medium">Date: </span>
            <span className="text-gray-800">{formatDate(data.invoiceDate)}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Due: </span>
            <span className="text-gray-800">{formatDate(data.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* Line Items Table — double-rule borders */}
      <table className="w-full mb-8 text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderTop: `2px solid ${resolvedColor}`, borderBottom: `2px solid ${resolvedColor}` }}>
            <th className="text-left py-2.5 text-xs font-bold tracking-wider text-gray-600 uppercase">
              Description
            </th>
            <th className="py-2.5 w-16 text-center text-xs font-bold tracking-wider text-gray-600 uppercase">
              Qty
            </th>
            <th className="py-2.5 w-28 text-right text-xs font-bold tracking-wider text-gray-600 uppercase">
              Rate
            </th>
            <th className="py-2.5 w-28 text-right text-xs font-bold tracking-wider text-gray-600 uppercase">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.length > 0 ? (
            data.lineItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3 text-gray-800">{item.description || "\u2014"}</td>
                <td className="py-3 text-center text-gray-600">{item.quantity}</td>
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
              <td colSpan={4} className="py-6 text-center text-gray-400 italic">
                No items added
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: `2px solid ${resolvedColor}` }}>
            <td colSpan={4} />
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div className="flex justify-between items-start">
        <div className="max-w-[320px] space-y-4">
          {data.notes && (
            <div>
              <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1.5">
                Notes / Terms
              </div>
              <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line italic">
                {data.notes}
              </p>
            </div>
          )}
          <PaymentDetails data={data} />
        </div>

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

          <div
            className="mt-3 pt-3 flex justify-between font-bold text-lg"
            style={{ borderTop: `2px solid ${resolvedColor}` }}
          >
            <span className="text-gray-700">Total Due</span>
            <span style={{ color: resolvedColor }}>{formatMoney(total, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
