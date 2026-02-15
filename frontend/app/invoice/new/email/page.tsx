"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInvoiceStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { InvoicePreview } from "@/components/invoice-preview";

export default function EmailDetailsPage() {
  const router = useRouter();

  const { storeClientEmail, storeEmailSubject, storeEmailMessage, invoiceNumber, companyName } =
    useInvoiceStore(
      useShallow((s) => ({
        storeClientEmail: s.clientEmail,
        storeEmailSubject: s.emailSubject,
        storeEmailMessage: s.emailMessage,
        invoiceNumber: s.invoiceNumber,
        companyName: s.companyName,
      }))
    );
  const updateEmail = useInvoiceStore((s) => s.updateEmail);

  const [clientEmail, setClientEmail] = useState(storeClientEmail);
  const [emailSubject, setEmailSubject] = useState(
    storeEmailSubject ||
      `Invoice ${invoiceNumber} from ${companyName}`
  );
  const [emailMessage, setEmailMessage] = useState(
    storeEmailMessage ||
      `Hi,\n\nPlease find attached invoice ${invoiceNumber} for our recent services.\n\nIf you have any questions, feel free to reach out.\n\nThank you,\n${companyName}`
  );

  const handleNext = () => {
    updateEmail({ clientEmail, emailSubject, emailMessage });
    router.push("/invoice/new/review");
  };

  return (
    <>
      <WizardHeader stepLabel="Step 4 of 5" />

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-0.5">Email Details</h1>
            <p className="text-sm text-muted-foreground">
              Configure the email sent with your invoice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label htmlFor="clientEmail" className="block text-xs font-medium text-muted-foreground mb-1.5">To</label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <label htmlFor="emailSubject" className="block text-xs font-medium text-muted-foreground mb-1.5">Subject</label>
                <Input
                  id="emailSubject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Invoice INV-001 from Your Company"
                />
              </div>
              <div>
                <label htmlFor="emailMessage" className="block text-xs font-medium text-muted-foreground mb-1.5">Message</label>
                <Textarea
                  id="emailMessage"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={10}
                  placeholder="Your message here..."
                />
              </div>
            </div>

            {/* PDF Preview */}
            <div className="border border-border rounded-lg p-4 h-fit">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Preview</label>
              <InvoicePreview />
            </div>
          </div>

          <div className="flex justify-between mt-6 pt-6 border-t border-border/50">
            <Button variant="ghost" asChild>
              <Link href="/invoice/new/design">Back</Link>
            </Button>
            <Button onClick={handleNext}>Continue</Button>
          </div>
        </div>
      </div>
    </>
  );
}
