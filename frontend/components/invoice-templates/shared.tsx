"use client";

import { useInvoiceStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/lib/settings-store";
import { formatMoney } from "@/lib/currency";
import { findPhoneCountry } from "@/lib/phone-countries";
import type { PaymentMethodType, MomoProvider, TemplateId } from "@/lib/types";

export function useInvoiceData() {
  return useInvoiceStore(
    useShallow((state) => ({
      lineItems: state.lineItems,
      discount: state.discount,
      taxRate: state.taxRate,
      fontFamily: state.fontFamily,
      companyLogo: state.companyLogo,
      primaryColor: state.primaryColor,
      templateId: state.templateId,
      authorizedSignature: state.authorizedSignature,
      companyName: state.companyName,
      address: state.address,
      city: state.city,
      zipCode: state.zipCode,
      country: state.country,
      phoneCode: state.phoneCode,
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
      currency: state.currency,
      paymentMethod: state.paymentMethod,
      momoProvider: state.momoProvider,
      momoAccountName: state.momoAccountName,
      momoNumber: state.momoNumber,
      momoCountryCode: state.momoCountryCode,
      bankName: state.bankName,
      bankAccountName: state.bankAccountName,
      bankAccountNumber: state.bankAccountNumber,
      bankBranch: state.bankBranch,
      bankSwiftCode: state.bankSwiftCode,
    }))
  );
}

export type InvoiceData = ReturnType<typeof useInvoiceData>;

const MOMO_LABELS: Record<MomoProvider, string> = {
  mtn: "MTN Mobile Money",
  telecel: "Telecel Cash",
  airteltigo: "AirtelTigo Money",
};

export function PaymentDetails({ data }: { data: InvoiceData }) {
  const hasPaymentInfo =
    data.paymentMethod === "momo"
      ? !!(data.momoAccountName || data.momoNumber)
      : !!(data.bankAccountName || data.bankAccountNumber);

  if (!hasPaymentInfo) return null;

  const momoCountry = findPhoneCountry(data.momoCountryCode);
  const momoDialCode = momoCountry?.dialCode ?? "+233";

  return (
    <div>
      <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
        Payment Details
      </div>
      {data.paymentMethod === "momo" ? (
        <div className="text-xs text-gray-500 space-y-0.5 leading-relaxed">
          <div className="text-gray-700 font-medium">
            {MOMO_LABELS[data.momoProvider]}
          </div>
          {data.momoAccountName && <div>{data.momoAccountName}</div>}
          {data.momoNumber && (
            <div>
              {momoDialCode} {data.momoNumber}
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-gray-500 space-y-0.5 leading-relaxed">
          {data.bankName && (
            <div className="text-gray-700 font-medium">{data.bankName}</div>
          )}
          {data.bankAccountName && <div>{data.bankAccountName}</div>}
          {data.bankAccountNumber && (
            <div style={{ fontFamily: "monospace" }}>
              {data.bankAccountNumber}
            </div>
          )}
          {data.bankBranch && <div>Branch: {data.bankBranch}</div>}
          {data.bankSwiftCode && <div>SWIFT: {data.bankSwiftCode}</div>}
        </div>
      )}
    </div>
  );
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function useTotals(data: InvoiceData) {
  const subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = data.discount || 0;
  const taxAmount = ((subtotal - discountAmount) * (data.taxRate || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;
  const currency = data.currency || "USD";
  return { subtotal, discountAmount, taxAmount, total, currency };
}

export function useResolvedColor(data: InvoiceData) {
  const defaultColor = useSettingsStore((s) => s.defaultColor);
  return data.primaryColor || defaultColor;
}
