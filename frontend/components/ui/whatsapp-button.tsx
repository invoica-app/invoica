"use client";

import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  clientPhone?: string | null;
  clientName?: string | null;
  invoiceNumber: string;
  companyName: string;
  /** Function that generates the PDF blob. Called on click. */
  generatePdf: () => Promise<Blob>;
  /** Render as a small icon button (for lists) */
  iconOnly?: boolean;
  className?: string;
  disabled?: boolean;
}

function cleanPhone(phone: string): string {
  // Strip spaces, dashes, parens — keep + and digits
  return phone.replace(/[^\d+]/g, "");
}

export function WhatsAppButton({
  clientPhone,
  clientName,
  invoiceNumber,
  companyName,
  generatePdf,
  iconOnly = false,
  className,
  disabled = false,
}: WhatsAppButtonProps) {
  const [sharing, setSharing] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const shareText = `Hi ${clientName || "there"}, please find your invoice attached. Thank you! — ${companyName}`;
  const fileName = `Invoice-${invoiceNumber}.pdf`;

  const handleClick = async () => {
    setSharing(true);
    setFallbackMessage(null);

    try {
      const pdfBlob = await generatePdf();
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      // Try Web Share API with file
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: `Invoice ${invoiceNumber}`,
            text: shareText,
          });
          // Share completed (or cancelled — either way, done)
          return;
        } catch (err: unknown) {
          // AbortError = user cancelled share sheet — not an error
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
          // Other error — fall through to fallback
        }
      }

      // Fallback: download PDF + open wa.me link
      downloadBlob(pdfBlob, fileName);

      if (clientPhone) {
        const phone = cleanPhone(clientPhone).replace(/^\+/, "");
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(shareText)}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
        setFallbackMessage("PDF downloaded. Attach it in the WhatsApp chat that just opened.");
      } else {
        setFallbackMessage("PDF downloaded. You can share it manually via WhatsApp.");
      }
    } catch {
      setFallbackMessage("Failed to generate PDF. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        disabled={sharing || disabled}
        title={clientPhone ? "Send via WhatsApp" : "Send invoice via WhatsApp"}
        className={cn(
          "p-1.5 text-muted-foreground hover:text-[#25D366] transition-colors disabled:opacity-50",
          className
        )}
      >
        {sharing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Share2 className="w-3.5 h-3.5" />
        )}
      </button>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={sharing || disabled}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60",
          "bg-[#25D366] text-white hover:bg-[#20BD5A]",
          className
        )}
      >
        {sharing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        {sharing ? "Preparing..." : "Send via WhatsApp"}
      </button>
      {fallbackMessage && (
        <p className="text-xs text-muted-foreground max-w-[260px]">{fallbackMessage}</p>
      )}
    </div>
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
