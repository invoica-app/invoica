"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInvoiceStore } from "@/lib/store";

export default function EmailDetailsPage() {
  const router = useRouter();
  const store = useInvoiceStore();

  const [clientEmail, setClientEmail] = useState(store.clientEmail);
  const [emailSubject, setEmailSubject] = useState(
    store.emailSubject ||
      `Invoice ${store.invoiceNumber} from ${store.companyName}`
  );
  const [emailMessage, setEmailMessage] = useState(store.emailMessage);

  const handleNext = () => {
    store.updateEmail({
      clientEmail,
      emailSubject,
      emailMessage,
    });
    router.push("/invoice/new/review");
  };

  return (
    <>
      <WizardHeader stepLabel="Step 4 of 5" />

      <div className="flex-1 p-4 md:p-8 bg-secondary overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Email Details</h1>
            <p className="text-gray-600">
              Configure the email that will be sent to your client.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 md:p-8 border border-gray-100 space-y-6">
              {/* To */}
              <div>
                <Label htmlFor="clientEmail" className="mb-3 block text-gray-700">
                  To (Client Email)
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                />
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="emailSubject" className="mb-3 block text-gray-700">
                  Subject
                </Label>
                <Input
                  id="emailSubject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Invoice INV-001 from Acme Corp"
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="emailMessage" className="mb-3 block text-gray-700">
                  Message
                </Label>
                <Textarea
                  id="emailMessage"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={10}
                  placeholder="Your message here..."
                />
              </div>
            </div>

            {/* PDF Preview Thumbnail */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
              <Label className="mb-3 block text-gray-700 text-sm">
                PDF Preview
              </Label>
              <div className="aspect-[8.5/11] bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-400 text-sm">
                  <div className="mb-2">📄</div>
                  <div>Invoice Preview</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" asChild>
              <Link href="/invoice/new/design">Back</Link>
            </Button>
            <Button onClick={handleNext}>Next Step</Button>
          </div>
        </div>
      </div>
    </>
  );
}
