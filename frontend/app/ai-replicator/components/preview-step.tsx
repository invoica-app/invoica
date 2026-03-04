"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AiDynamicTemplate } from "@/components/ai-dynamic-template";
import type { AiInvoiceFormData } from "@/components/ai-dynamic-template";
import type { AiInvoiceAnalysis } from "@/lib/types";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";

interface PreviewStepProps {
  analysis: AiInvoiceAnalysis;
  formData: AiInvoiceFormData;
  sampleImageUrl: string;
  analysisJson: string;
  onEdit: () => void;
  onStartOver: () => void;
}

export function PreviewStep({
  analysis,
  formData,
  sampleImageUrl,
  analysisJson,
  onEdit,
  onStartOver,
}: PreviewStepProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const api = useAuthenticatedApi();
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 800,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        let y = 0;
        while (y < imgHeight) {
          if (y > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
          y += pageHeight;
        }
      }

      pdf.save(`${formData.invoiceNumber || "invoice"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    setSaving(true);
    try {
      await api.saveAiTemplate({
        name: templateName.trim(),
        analysisJson,
        sampleImageUrl,
      });
      setSaved(true);
      setShowSaveForm(false);
    } catch (err) {
      console.error("Save template failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Preview your invoice</h1>
        <p className="text-sm text-muted-foreground">
          Compare your generated invoice with the original sample.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={handleDownloadPdf} disabled={downloading}>
          {downloading ? "Generating PDF..." : "Download PDF"}
        </Button>
        {!saved && !showSaveForm && (
          <Button variant="outline" onClick={() => setShowSaveForm(true)}>
            Save as Template
          </Button>
        )}
        {showSaveForm && (
          <div className="flex gap-2 items-center">
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              className="w-48"
            />
            <Button size="sm" onClick={handleSaveTemplate} disabled={saving || !templateName.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowSaveForm(false)}>
              Cancel
            </Button>
          </div>
        )}
        {saved && (
          <span className="inline-flex items-center text-sm text-green-600 font-medium px-3">
            Template saved!
          </span>
        )}
        <Button variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" onClick={onStartOver}>
          Start Over
        </Button>
      </div>

      {/* Side by side preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generated Invoice */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
            Generated Invoice
          </h3>
          <div className="border border-border rounded-lg shadow-sm overflow-hidden bg-white">
            <div ref={invoiceRef} style={{ width: "800px", transform: "scale(0.5)", transformOrigin: "top left", height: "fit-content" }}>
              <AiDynamicTemplate analysis={analysis} data={formData} />
            </div>
          </div>
        </div>

        {/* Original Sample */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
            Original Sample
          </h3>
          <div className="border border-border rounded-lg shadow-sm overflow-hidden">
            <img
              src={sampleImageUrl}
              alt="Original sample invoice"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
