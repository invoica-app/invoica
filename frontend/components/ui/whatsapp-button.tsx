"use client";

import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  /** "brand" = green WhatsApp style, "outline" = matches other buttons */
  variant?: "brand" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
}

function cleanPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function WhatsAppButton({
  clientPhone,
  clientName,
  invoiceNumber,
  companyName,
  generatePdf,
  iconOnly = false,
  variant = "brand",
  size,
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

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: `Invoice ${invoiceNumber}`,
            text: shareText,
          });
          return;
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
        }
      }

      // Fallback: download PDF + open wa.me link
      downloadBlob(pdfBlob, fileName);

      if (clientPhone) {
        const phone = cleanPhone(clientPhone).replace(/^\+/, "");
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(shareText)}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
        setFallbackMessage("PDF downloaded — attach it in the chat.");
      } else {
        setFallbackMessage("PDF downloaded — share it manually.");
      }
    } catch {
      setFallbackMessage("Failed to generate PDF. Try again.");
    } finally {
      setSharing(false);
    }
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        disabled={sharing || disabled}
        title="Share invoice"
        className={cn(
          "p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50",
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

  if (variant === "outline") {
    return (
      <div className={cn("inline-flex flex-col gap-1", className)}>
        <Button
          variant="outline"
          size={size}
          onClick={handleClick}
          disabled={sharing || disabled}
          className="gap-2"
        >
          {sharing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          {sharing ? "Sharing..." : "Share"}
        </Button>
        {fallbackMessage && (
          <p className="text-[11px] text-muted-foreground">{fallbackMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <Button
        size={size}
        onClick={handleClick}
        disabled={sharing || disabled}
        className="gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A]"
      >
        {sharing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        {sharing ? "Sharing..." : "Share"}
      </Button>
      {fallbackMessage && (
        <p className="text-[11px] text-muted-foreground">{fallbackMessage}</p>
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
