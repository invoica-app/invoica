"use client";

import { useRef, useState, useEffect } from "react";
import type { Invoice, TemplateId } from "@/lib/types";
import type { InvoiceData } from "./invoice-templates/shared";
import { ModernTemplate } from "./invoice-templates/modern";
import { ClassicTemplate } from "./invoice-templates/classic";
import { EnterpriseTemplate } from "./invoice-templates/enterprise";
import { FreelancerTemplate } from "./invoice-templates/freelancer";
import { CorporateTemplate } from "./invoice-templates/corporate";
import { splitPhoneString } from "@/lib/country-codes";

const INVOICE_WIDTH = 800;

const TEMPLATE_MAP: Record<TemplateId, React.FC<{ data: InvoiceData }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  enterprise: EnterpriseTemplate,
  freelancer: FreelancerTemplate,
  corporate: CorporateTemplate,
};

export function mapInvoiceToData(invoice: Invoice): InvoiceData {
  const { phoneCode, localNumber } = splitPhoneString(invoice.phone, invoice.country);
  return {
    companyName: invoice.companyName,
    companyLogo: invoice.companyLogo ?? null,
    address: invoice.address,
    city: invoice.city,
    zipCode: invoice.zipCode,
    country: invoice.country,
    phoneCode,
    phone: localNumber,
    companyEmail: invoice.companyEmail,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    primaryColor: invoice.primaryColor,
    fontFamily: invoice.fontFamily,
    templateId: (invoice.templateId as TemplateId) || "modern",
    authorizedSignature: invoice.authorizedSignature ?? "",
    currency: invoice.currency,
    clientName: invoice.clientName ?? "",
    clientCompany: invoice.clientCompany ?? "",
    clientEmail: invoice.clientEmail ?? "",
    clientAddress: invoice.clientAddress ?? "",
    clientCity: invoice.clientCity ?? "",
    clientZip: invoice.clientZip ?? "",
    clientCountry: invoice.clientCountry ?? "",
    taxRate: invoice.taxRate ?? 0,
    discount: invoice.discount ?? 0,
    notes: invoice.notes ?? "",
    lineItems: invoice.lineItems.map((item, i) => ({
      id: String(item.id ?? i),
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
    })),
    // Payment fields — not available in public API, provide empty defaults
    paymentMethod: "momo" as const,
    momoProvider: "mtn" as const,
    momoAccountName: "",
    momoNumber: "",
    momoCountryCode: "GH",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankBranch: "",
    bankSwiftCode: "",
  };
}

export function PublicInvoiceView({ invoice }: { invoice: Invoice }) {
  const data = mapInvoiceToData(invoice);
  const Template = TEMPLATE_MAP[(invoice.templateId as TemplateId) || "modern"];
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      const available = containerRef.current.clientWidth;
      setScale(available < INVOICE_WIDTH ? available / INVOICE_WIDTH : 1);
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-[800px] mx-auto">
      <div
        className="bg-white p-10 shadow-sm origin-top"
        style={{
          fontFamily: data.fontFamily || "Inter",
          color: "#1a1a1a",
          width: INVOICE_WIDTH,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          marginBottom: scale < 1 ? `${(scale - 1) * INVOICE_WIDTH * 1.3}px` : undefined,
        }}
      >
        <Template data={data} />
      </div>
    </div>
  );
}
