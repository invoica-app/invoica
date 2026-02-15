"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { useInvoiceStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function DesignPage() {
  const router = useRouter();

  const { storePrimaryColor, storeFontFamily, companyName, invoiceNumber, lineItems } =
    useInvoiceStore(
      useShallow((s) => ({
        storePrimaryColor: s.primaryColor,
        storeFontFamily: s.fontFamily,
        companyName: s.companyName,
        invoiceNumber: s.invoiceNumber,
        lineItems: s.lineItems,
      }))
    );
  const setDesign = useInvoiceStore((s) => s.setDesign);

  const [primaryColor, setPrimaryColor] = useState(storePrimaryColor);
  const [fontFamily, setFontFamily] = useState(storeFontFamily);

  const handleNext = () => {
    setDesign(primaryColor, fontFamily);
    router.push("/invoice/new/email");
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
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
            {/* Primary Color */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-3">Color</label>
              <div className="flex flex-wrap gap-3">
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
                      style={{ backgroundColor: primaryColor }}
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
                    <div className="text-xl font-bold" style={{ color: primaryColor }}>
                      ${subtotal.toFixed(2)}
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
    </>
  );
}
