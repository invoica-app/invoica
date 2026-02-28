"use client";

import { formatMoney } from "@/lib/currency";
import { numberToWords } from "@/lib/templates/number-to-words";
import type { InvoiceData } from "./shared";
import { PaymentDetails, formatDate, useTotals, useResolvedColor } from "./shared";

export function CorporateTemplate({ data }: { data: InvoiceData }) {
  const resolvedColor = useResolvedColor(data);
  const { subtotal, discountAmount, taxAmount, total, currency } = useTotals(data);

  const combinedPhone = [data.phoneCode, data.phone].filter(Boolean).join(" ");
  const contactParts = [combinedPhone, data.companyEmail].filter(Boolean);

  return (
    <div className="relative">
      {/* Diagonal watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="text-[120px] font-black tracking-[0.2em] uppercase opacity-[0.03] rotate-[-35deg] whitespace-nowrap"
          style={{ color: resolvedColor }}
        >
          INVOICE
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-8 relative">
        <div>
          {data.companyLogo ? (
            <img
              src={data.companyLogo}
              alt="Logo"
              className="max-h-14 max-w-[160px] w-auto h-auto mb-2"
              loading="lazy"
            />
          ) : null}
          <div className="text-lg font-bold text-gray-800">
            {data.companyName || "Your Company"}
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
            className="text-sm font-bold tracking-[0.3em] uppercase mb-2"
            style={{ color: resolvedColor }}
          >
            INVOICE
          </div>
          <div
            className="w-full h-0.5 mb-3"
            style={{ backgroundColor: resolvedColor }}
          />
          <div className="text-sm space-y-1">
            {data.invoiceNumber && (
              <div className="flex justify-end gap-4">
                <span className="text-gray-400 text-xs uppercase tracking-wider">No.</span>
                <span className="text-gray-800 font-semibold min-w-[100px] text-right">{data.invoiceNumber}</span>
              </div>
            )}
            <div className="flex justify-end gap-4">
              <span className="text-gray-400 text-xs uppercase tracking-wider">Date</span>
              <span className="text-gray-800 min-w-[100px] text-right">{formatDate(data.invoiceDate)}</span>
            </div>
            <div className="flex justify-end gap-4">
              <span className="text-gray-400 text-xs uppercase tracking-wider">Due</span>
              <span className="text-gray-800 min-w-[100px] text-right">{formatDate(data.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured grid: Bill To */}
      <div
        className="mb-8 border-l-4 pl-4 py-3"
        style={{ borderColor: resolvedColor }}
      >
        <div className="text-[10px] font-bold tracking-widest uppercase mb-2 text-gray-400">
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

      {/* Line Items Table */}
      <table className="w-full mb-6 text-sm relative">
        <thead>
          <tr className="border-b-2 border-t-2" style={{ borderColor: resolvedColor }}>
            <th className="text-left py-3 text-xs font-bold tracking-wider text-gray-600 uppercase">
              Description
            </th>
            <th className="py-3 w-16 text-center text-xs font-bold tracking-wider text-gray-600 uppercase">
              Qty
            </th>
            <th className="py-3 w-28 text-right text-xs font-bold tracking-wider text-gray-600 uppercase">
              Unit Price
            </th>
            <th className="py-3 w-28 text-right text-xs font-bold tracking-wider text-gray-600 uppercase">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.length > 0 ? (
            data.lineItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
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
      </table>

      {/* Totals row — right aligned */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
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
            <div
              className="border-t-2 pt-2 flex justify-between font-bold text-base"
              style={{ borderColor: resolvedColor }}
            >
              <span className="text-gray-700">Total Due</span>
              <span style={{ color: resolvedColor }}>{formatMoney(total, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div className="mb-6 py-2 border-y border-gray-200">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
          Amount in Words
        </div>
        <div className="text-sm text-gray-700 font-medium">
          {numberToWords(total)} {currency}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end">
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

        {/* Signature block */}
        <div className="text-center w-52">
          <div className="border-t-2 border-gray-300 pt-2 mt-4">
            <div className="text-sm text-gray-700 font-medium">
              {data.authorizedSignature || "Authorized Signature"}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {data.companyName || "Company"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
