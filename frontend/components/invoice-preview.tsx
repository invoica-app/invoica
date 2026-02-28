"use client";

import { forwardRef, useRef, useState, useEffect, useCallback } from "react";
import type { TemplateId } from "@/lib/types";
import { useInvoiceData, type InvoiceData } from "./invoice-templates/shared";
import { ModernTemplate } from "./invoice-templates/modern";
import { ClassicTemplate } from "./invoice-templates/classic";
import { EnterpriseTemplate } from "./invoice-templates/enterprise";
import { FreelancerTemplate } from "./invoice-templates/freelancer";
import { CorporateTemplate } from "./invoice-templates/corporate";

const TEMPLATE_MAP: Record<TemplateId, React.FC<{ data: InvoiceData }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  enterprise: EnterpriseTemplate,
  freelancer: FreelancerTemplate,
  corporate: CorporateTemplate,
};

export function InvoicePreview() {
  const data = useInvoiceData();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.34);

  const updateScale = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setScale(containerWidth / 800);
    }
  }, []);

  useEffect(() => {
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

  const Template = TEMPLATE_MAP[data.templateId || "modern"];

  return (
    <div
      ref={containerRef}
      className="aspect-[8.5/11] bg-white rounded-lg border border-gray-200 overflow-hidden relative"
    >
      <div
        className="origin-top-left w-[800px] p-10"
        style={{
          transform: `scale(${scale})`,
          fontFamily: data.fontFamily || "Inter",
          color: "#1a1a1a",
        }}
      >
        <Template data={data} />
      </div>
    </div>
  );
}

export const InvoiceFullPage = forwardRef<HTMLDivElement>((_, ref) => {
  const data = useInvoiceData();
  const Template = TEMPLATE_MAP[data.templateId || "modern"];

  return (
    <div
      ref={ref}
      className="w-[800px] bg-white p-10"
      style={{
        fontFamily: data.fontFamily || "Inter",
        color: "#1a1a1a",
      }}
    >
      <Template data={data} />
    </div>
  );
});
InvoiceFullPage.displayName = "InvoiceFullPage";
