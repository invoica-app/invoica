"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  clientPhone?: string | null;
  clientName?: string | null;
  invoiceNumber: string;
  currency: string;
  totalAmount: number;
  publicToken?: string;
  companyName: string;
  dueDate: string;
  /** Render as a small icon button (for lists) */
  iconOnly?: boolean;
  className?: string;
}

function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "").replace(/^(\+)/, "$1");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function WhatsAppButton({
  clientPhone,
  clientName,
  invoiceNumber,
  currency,
  totalAmount,
  publicToken,
  companyName,
  dueDate,
  iconOnly = false,
  className,
}: WhatsAppButtonProps) {
  if (!clientPhone) return null;

  const phone = cleanPhone(clientPhone);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const invoiceUrl = publicToken ? `${baseUrl}/invoice/view/${publicToken}` : "";

  const message = [
    `Hi ${clientName || "there"},`,
    "",
    `Here is your invoice #${invoiceNumber} for ${currency} ${totalAmount.toLocaleString()}.`,
    "",
    invoiceUrl ? `View your invoice here: ${invoiceUrl}` : "",
    "",
    `Due date: ${formatDate(dueDate)}`,
    "",
    "Thank you for your business!",
    companyName,
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappUrl = `https://wa.me/${phone.replace("+", "")}?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        title="Send via WhatsApp"
        className={cn(
          "p-1.5 text-muted-foreground hover:text-[#25D366] transition-colors",
          className
        )}
      >
        <MessageCircle className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
        "bg-[#25D366] text-white hover:bg-[#20BD5A]",
        className
      )}
    >
      <MessageCircle className="w-4 h-4" />
      Send via WhatsApp
    </button>
  );
}
