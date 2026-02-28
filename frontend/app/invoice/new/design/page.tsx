"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { useInvoiceStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/lib/settings-store";
import { Ban, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import { HydrationGuard } from "@/components/hydration-guard";
import { DesignSkeleton } from "./loading";
import { TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/types";

const colors = [
  { name: "Purple", value: "#9747E6" },
  { name: "Blue", value: "#2563EB" },
  { name: "Green", value: "#16A34A" },
  { name: "Red", value: "#DC2626" },
  { name: "Orange", value: "#EA580C" },
  { name: "Black", value: "#171717" },
  { name: "Brown", value: "#92400E" },
  { name: "Gold", value: "#CA8A04" },
];

const fonts = [
  { name: "Inter", value: "Inter" },
  { name: "Satoshi", value: "Satoshi" },
  { name: "Helvetica", value: "Helvetica" },
  { name: "Times New Roman", value: "Times New Roman", style: "serif" },
  { name: "Courier New", value: "Courier New", style: "monospace" },
];

const TEMPLATE_ICONS: Record<TemplateId, { lines: string; accent: string }> = {
  modern: { lines: "top-right", accent: "banner" },
  classic: { lines: "center", accent: "double-rule" },
  enterprise: { lines: "top-bar", accent: "colored-header" },
  freelancer: { lines: "left-bar", accent: "rounded" },
  corporate: { lines: "watermark", accent: "structured" },
};

function TemplateThumbnail({ templateId, color }: { templateId: TemplateId; color: string }) {
  const icon = TEMPLATE_ICONS[templateId];

  return (
    <div className="w-full aspect-[8.5/11] bg-white rounded border border-gray-200 relative overflow-hidden p-2">
      {/* Enterprise: top colored bar */}
      {templateId === "enterprise" && (
        <div className="h-2.5 -mx-2 -mt-2 mb-1.5" style={{ backgroundColor: color }} />
      )}

      {/* Corporate: diagonal watermark */}
      {templateId === "corporate" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-[10px] font-black tracking-widest uppercase opacity-5 rotate-[-35deg]" style={{ color }}>
            INVOICE
          </div>
        </div>
      )}

      {/* Freelancer: left accent bar */}
      {templateId === "freelancer" && (
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />
      )}

      {/* Header area */}
      <div className={cn("flex mb-1.5", templateId === "classic" ? "justify-center" : "justify-between")}>
        {templateId === "classic" ? (
          <div className="text-center">
            <div className="w-4 h-1 rounded-full mx-auto mb-0.5" style={{ backgroundColor: color }} />
            <div className="w-8 h-0.5 bg-gray-200 mx-auto" />
          </div>
        ) : (
          <>
            <div className="w-4 h-3 rounded-sm bg-gray-100" />
            <div className="w-6 h-1 rounded-full" style={{ backgroundColor: color }} />
          </>
        )}
      </div>

      {/* Classic double rule */}
      {templateId === "classic" && (
        <div className="mb-1.5">
          <div className="h-[1px]" style={{ backgroundColor: color }} />
          <div className="h-[1px] mt-[1px]" style={{ backgroundColor: color }} />
        </div>
      )}

      {/* Bill to area */}
      <div className="rounded bg-gray-50 p-1 mb-1.5">
        <div className="w-6 h-0.5 bg-gray-200 mb-0.5" />
        <div className="w-10 h-0.5 bg-gray-200" />
      </div>

      {/* Table lines */}
      <div className="space-y-1 mb-1.5">
        <div className="h-[1px] bg-gray-200" />
        <div className="flex justify-between">
          <div className="w-10 h-0.5 bg-gray-100" />
          <div className="w-4 h-0.5 bg-gray-100" />
        </div>
        <div className="flex justify-between">
          <div className="w-8 h-0.5 bg-gray-100" />
          <div className="w-4 h-0.5 bg-gray-100" />
        </div>
        <div className="h-[1px] bg-gray-200" />
      </div>

      {/* Total area */}
      <div className="flex justify-end">
        <div className="w-8 h-1.5 rounded-sm" style={{ backgroundColor: `${color}20` }}>
          <div className="h-full rounded-sm" style={{ backgroundColor: color, width: "60%", marginLeft: "auto", opacity: 0.3 }} />
        </div>
      </div>
    </div>
  );
}

export default function DesignPage() {
  const router = useRouter();

  const { storePrimaryColor, storeFontFamily, storeTemplateId, companyName, invoiceNumber, lineItems, currency } =
    useInvoiceStore(
      useShallow((s) => ({
        storePrimaryColor: s.primaryColor,
        storeFontFamily: s.fontFamily,
        storeTemplateId: s.templateId,
        companyName: s.companyName,
        invoiceNumber: s.invoiceNumber,
        lineItems: s.lineItems,
        currency: s.currency,
      }))
    );
  const setDesign = useInvoiceStore((s) => s.setDesign);
  const defaultColor = useSettingsStore((s) => s.defaultColor);

  const [primaryColor, setPrimaryColor] = useState(storePrimaryColor);
  const [fontFamily, setFontFamily] = useState(storeFontFamily);
  const [templateId, setTemplateId] = useState<TemplateId>(storeTemplateId || "modern");

  // "" means "use default from settings"
  const isNone = primaryColor === "";
  const resolvedColor = primaryColor || defaultColor;

  const handleNext = () => {
    setDesign(primaryColor, fontFamily, templateId);
    router.push("/invoice/new/email");
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <HydrationGuard fallback={<DesignSkeleton />}>
      <WizardHeader stepLabel="Step 3 of 5" />

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-5">
            <h1 className="text-lg font-semibold mb-0.5">Design & Branding</h1>
            <p className="text-sm text-muted-foreground">
              Customize how your invoice looks.
            </p>
          </div>

          <div className="space-y-8">
            {/* Template Selector */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-3">Template</label>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:snap-none lg:grid-cols-5">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setTemplateId(tmpl.id)}
                    className={cn(
                      "rounded-lg border p-2.5 text-left transition-all snap-start shrink-0 w-[calc(50%-6px)] sm:w-auto sm:shrink",
                      templateId === tmpl.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <TemplateThumbnail templateId={tmpl.id} color={resolvedColor} />
                    <div className="mt-2">
                      <div className="text-xs font-medium">{tmpl.name}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                        {tmpl.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-3">Color</label>
              <div className="flex flex-wrap gap-3">
                {/* None — uses default from settings */}
                <button
                  onClick={() => setPrimaryColor("")}
                  className="relative"
                  title="None (uses default from settings)"
                >
                  <div
                    className={cn(
                      "w-9 h-9 md:w-11 md:h-11 rounded-full transition-all border-2 border-dashed flex items-center justify-center",
                      isNone
                        ? "ring-2 ring-offset-2 ring-foreground/20 ring-offset-background border-muted-foreground/40"
                        : "border-muted-foreground/20 hover:ring-2 hover:ring-offset-2 hover:ring-foreground/10 hover:ring-offset-background"
                    )}
                  >
                    <Ban className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/40" />
                  </div>
                </button>

                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPrimaryColor(color.value)}
                    className="relative"
                    title={color.name}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 md:w-11 md:h-11 rounded-full transition-all",
                        primaryColor === color.value
                          ? "ring-2 ring-offset-2 ring-foreground/20 ring-offset-background"
                          : "hover:ring-2 hover:ring-offset-2 hover:ring-foreground/10 hover:ring-offset-background"
                      )}
                      style={{ backgroundColor: color.value }}
                    >
                      {primaryColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-3">Font</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {fonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => setFontFamily(font.value)}
                    className={cn(
                      "px-4 py-3 rounded-lg border text-left text-sm transition-colors",
                      fontFamily === font.value
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                    style={{ fontFamily: font.style || font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-3">Preview</label>
              <div className="p-5 bg-white rounded-lg border border-gray-200 text-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: resolvedColor }}
                    >
                      {companyName.charAt(0) || "A"}
                    </div>
                    <div style={{ fontFamily }}>
                      <div className="font-semibold">{companyName || "Your Company"}</div>
                      <div className="text-xs text-gray-500">Invoice #{invoiceNumber || "001"}</div>
                    </div>
                  </div>
                  <div className="text-right" style={{ fontFamily }}>
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="text-xl font-bold" style={{ color: resolvedColor }}>
                      {formatMoney(subtotal, currency || "USD")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6 pt-6 border-t border-border/50">
            <Button variant="ghost" asChild>
              <Link href="/invoice/new/details">Back</Link>
            </Button>
            <Button onClick={handleNext}>Continue</Button>
          </div>
        </div>
      </div>
    </HydrationGuard>
  );
}
