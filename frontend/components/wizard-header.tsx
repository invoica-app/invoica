"use client";

import Link from "next/link";
import { useInvoiceStore } from "@/lib/store";
import { formatDistanceToNow } from "@/lib/date-utils";

interface WizardHeaderProps {
  stepLabel?: string;
}

export function WizardHeader({ stepLabel = "Start" }: WizardHeaderProps) {
  const lastSaved = useInvoiceStore((state) => state.lastSaved);

  return (
    <header className="border-b border-border px-8 py-4 flex items-center justify-between bg-white">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          ← Back to Dashboard
        </Link>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600 text-sm">{stepLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          Draft saved {formatDistanceToNow(lastSaved)}
        </span>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          JD
        </div>
      </div>
    </header>
  );
}
