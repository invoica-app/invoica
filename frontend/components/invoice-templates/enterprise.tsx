"use client";

import { formatMoney } from "@/lib/currency";
import { numberToWords } from "@/lib/templates/number-to-words";
import type { InvoiceData } from "./shared";
import { PaymentDetails, formatDate, useTotals, useResolvedColor } from "./shared";

export function EnterpriseTemplate({ data }: { data: InvoiceData }) {
  const resolvedColor = useResolvedColor(data);
  const { subtotal, discountAmount, taxAmount, total, currency } = useTotals(data);

  const combinedPhone = [data.phoneCode, data.phone].filter(Boolean).join(" ");
  const contactParts = [combinedPhone, data.companyEmail].filter(Boolean);

  return (
    <>
      {/* Top colored banner */}
      <div
        className="rounded-t-lg px-8 py-5 -mx-10 -mt-10 mb-8"
        style={{ backgroundColor: resolvedColor }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {data.companyLogo ? (
              <img
                src={data.companyLogo}
                alt="Logo"
                className="max-h-12 max-w-[140px] w-auto h-auto brightness-0 invert"
                loading="lazy"
              />
            ) : null}
            <div className="text-white">
              <div className="text-lg font-bold">
                {data.companyName || "Your Company"}
              </div>
              <div className="text-white/70 text-xs mt-0.5">
                {contactParts.join(" \u00B7 ")}
              </div>
            </div>
          </div>
          <div className="text-white text-right">
            <div className="text-2xl font-light tracking-wider">INVOICE</div>
            {data.invoiceNumber && (
              <div className="text-white/80 text-sm mt-0.5">#{data.invoiceNumber}</div>
            )}
          </div>
        </div>
      </div>

      {/* 2-column header: Bill To + Invoice Details */}
      <div className="flex justify-between mb-8">
        <div>
          <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: resolvedColor }}>
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

        <div className="text-right">
          <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: resolvedColor }}>
            Company Address
          </div>
          <div className="text-xs text-gray-500 space-y-0.5 leading-relaxed">
            {data.address && <div>{data.address}</div>}
            {(data.city || data.zipCode) && (
              <div>{[data.city, data.zipCode].filter(Boolean).join(", ")}</div>
            )}
            {data.country && <div>{data.country}</div>}
          </div>
          <div className="mt-3 text-sm text-gray-600 space-y-0.5">
            <div>
              <span className="text-gray-400 text-xs">Date: </span>
              {formatDate(data.invoiceDate)}
            </div>
            <div>
              <span className="text-gray-400 text-xs">Due: </span>
              {formatDate(data.dueDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <table className="w-full mb-6 text-sm">
        <thead>
          <tr style={{ backgroundColor: resolvedColor }}>
            <th className="text-left py-2.5 px-3 text-xs font-semibold tracking-wider text-white uppercase">
              Item
            </th>
            <th className="py-2.5 px-3 w-16 text-center text-xs font-semibold tracking-wider text-white uppercase">
              Qty
            </th>
            <th className="py-2.5 px-3 w-28 text-right text-xs font-semibold tracking-wider text-white uppercase">
              Price
            </th>
            <th className="py-2.5 px-3 w-28 text-right text-xs font-semibold tracking-wider text-white uppercase">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.length > 0 ? (
            data.lineItems.map((item, i) => (
              <tr
                key={item.id}
                className="border-b border-gray-100"
                style={{ backgroundColor: i % 2 === 0 ? "#fafafa" : "white" }}
              >
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

      {/* Amount in words */}
      <div className="mb-6 px-4 py-3 rounded bg-gray-50 border border-gray-200">
        <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1">
          Amount in Words
        </div>
        <div className="text-sm text-gray-700 font-medium italic">
          {numberToWords(total)} {currency}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-start">
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

          {/* Authorized Signature */}
          <div className="mt-8 pt-4">
            <div className="border-t border-gray-300 w-48 pt-2">
              <div className="text-xs text-gray-500">
                {data.authorizedSignature || "Authorized Signature"}
              </div>
            </div>
          </div>
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
            <div className="border-t-2 pt-2" style={{ borderColor: resolvedColor }}>
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-700">Total</span>
                <span style={{ color: resolvedColor }}>{formatMoney(total, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
