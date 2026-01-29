"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { useInvoiceStore } from "@/lib/store";
import { Download, Send } from "lucide-react";

export default function ReviewPage() {
  const router = useRouter();
  const store = useInvoiceStore();

  const subtotal = store.lineItems.reduce((sum, item) => sum + item.amount, 0);

  const handlePreview = () => {
    alert("Opening PDF preview...");
  };

  const handleSend = () => {
    alert("Invoice sent successfully!");
    router.push("/dashboard");
  };

  return (
    <>
      <WizardHeader stepLabel="Step 5 of 5" />

      <div className="flex-1 p-8 bg-secondary overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Review & Send</h1>
            <p className="text-gray-600">
              Review your details and send the invoice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Card */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="mb-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                    <div className="text-4xl font-bold">
                      ${subtotal.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Invoice Date</div>
                    <div className="font-semibold">
                      {new Date(store.invoiceDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2 tracking-wider">
                      BILLED TO
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{store.clientEmail}</div>
                      <div className="text-gray-600">Client ID: #88392</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2 tracking-wider">
                      FROM
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{store.companyName}</div>
                      <div className="text-gray-600">{store.companyEmail}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-semibold mb-2">Email Preview:</div>
                  <p className="text-sm text-gray-600 italic">
                    &quot;{store.emailMessage.split("\n").slice(0, 2).join(" ")}&quot;
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Preview PDF
                </Button>
                <Button onClick={handleSend} className="gap-2">
                  Send Invoice
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* PDF Preview Thumbnail */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <Label className="mb-3 block text-gray-700 text-sm font-medium">
                PDF Preview
              </Label>
              <div className="aspect-[8.5/11] bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center mb-4">
                <div className="text-center text-gray-400 text-sm p-4">
                  <div className="mb-2 text-3xl">📄</div>
                  <div className="font-medium">{store.companyName}</div>
                  <div className="text-xs mt-1">Invoice #{store.invoiceNumber}</div>
                  <div className="text-xs mt-3 font-semibold">
                    ${subtotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" asChild>
              <Link href="/invoice/new/email">Back</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function Label({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
