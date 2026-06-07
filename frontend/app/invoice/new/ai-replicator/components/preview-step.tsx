"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Save, Pencil, RotateCcw, Check, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInvoiceStore } from "@/lib/store";
import type { TemplateId } from "@/lib/types";
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
  const router = useRouter();
  const { setDesign } = useInvoiceStore();
  const [downloading, setDownloading] = useState(false);
  const [applying, setApplying] = useState(false);
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

  const handleApplyTemplate = async () => {
    setApplying(true);
    try {
      const mapping = await api.mapTemplate(analysisJson);
      setDesign(
        mapping.primaryColor,
        mapping.fontFamily,
        mapping.templateId as TemplateId
      );
      router.push("/invoice/new/design");
    } catch (err) {
      console.error("Template mapping failed:", err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Preview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare your generated invoice with the original.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleDownloadPdf} disabled={downloading}>
            <Download className="w-4 h-4 mr-1.5" />
            {downloading ? "Generating..." : "Download PDF"}
          </Button>

          {!saved && !showSaveForm && (
            <Button variant="outline" size="sm" onClick={() => setShowSaveForm(true)}>
              <Save className="w-4 h-4 mr-1.5" />
              Save Template
            </Button>
          )}

          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 px-2">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}

          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onStartOver}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Start Over
          </Button>
          <Button size="sm" onClick={handleApplyTemplate} disabled={applying}>
            <Wand2 className="w-4 h-4 mr-1.5" />
            {applying ? "Applying..." : "Use This Template"}
          </Button>
        </div>
      </div>

      {showSaveForm && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/50 border border-border">
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name"
            className="max-w-xs"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSaveTemplate()}
          />
          <Button size="sm" onClick={handleSaveTemplate} disabled={saving || !templateName.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowSaveForm(false)}>
            Cancel
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Generated</p>
          <div className="border border-border rounded-lg overflow-hidden bg-white">
            <div className="overflow-auto" style={{ maxHeight: "70vh" }}>
              <div ref={invoiceRef} style={{ width: "800px", transformOrigin: "top left" }}>
                <AiDynamicTemplate analysis={analysis} data={formData} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Original</p>
          <div className="border border-border rounded-lg overflow-hidden">
            <img src={sampleImageUrl} alt="Original sample" className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
