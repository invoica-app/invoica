"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useInvoiceStore } from "@/lib/store";
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
  const store = useInvoiceStore();

  const [primaryColor, setPrimaryColor] = useState(store.primaryColor);
  const [fontFamily, setFontFamily] = useState(store.fontFamily);

  const handleNext = () => {
    store.setDesign(primaryColor, fontFamily);
    router.push("/invoice/new/email");
  };

  const subtotal = store.lineItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <WizardHeader stepLabel="Step 3 of 5" />

      <div className="flex-1 p-4 md:p-8 bg-secondary overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Design & Branding</h1>
            <p className="text-muted-foreground">
              Customize the look and feel of your invoice.
            </p>
          </div>

          <div className="bg-card rounded-xl shadow-sm p-4 md:p-8 border border-border space-y-8">
            {/* Primary Color */}
            <div>
              <Label className="mb-4 block text-muted-foreground text-base">
                Primary Color
              </Label>
              <div className="flex flex-wrap gap-4">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPrimaryColor(color.value)}
                    className="relative group"
                    title={color.name}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 md:w-14 md:h-14 rounded-full transition-all cursor-pointer",
                        primaryColor === color.value
                          ? "ring-4 ring-offset-2 ring-border ring-offset-card"
                          : "hover:ring-2 hover:ring-offset-2 hover:ring-border hover:ring-offset-card"
                      )}
                      style={{ backgroundColor: color.value }}
                    >
                      {primaryColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div>
              <Label className="mb-4 block text-muted-foreground text-base">
                Font Family
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => setFontFamily(font.value)}
                    className={cn(
                      "p-6 rounded-lg border-2 transition-all text-left hover:border-muted-foreground/30",
                      fontFamily === font.value
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                    style={{
                      fontFamily: font.style || font.value,
                    }}
                  >
                    <span className="text-lg font-medium">{font.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Header — stays light since it previews the printed invoice */}
            <div>
              <Label className="mb-4 block text-muted-foreground text-base">
                Preview Header
              </Label>
              <div className="p-6 bg-white rounded-lg border border-gray-200 text-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {store.companyName.charAt(0)}
                    </div>
                    <div style={{ fontFamily }}>
                      <div className="font-semibold text-lg">
                        {store.companyName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Invoice #{store.invoiceNumber}
                      </div>
                    </div>
                  </div>
                  <div className="text-right" style={{ fontFamily }}>
                    <div className="text-sm text-gray-600">Total Due</div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      ${subtotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" asChild>
              <Link href="/invoice/new/details">Back</Link>
            </Button>
            <Button onClick={handleNext}>Next Step</Button>
          </div>
        </div>
      </div>
    </>
  );
}
