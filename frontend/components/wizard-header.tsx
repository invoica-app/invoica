"use client";

import Link from "next/link";
import { useInvoiceStore } from "@/lib/store";
import { formatDistanceToNow } from "@/lib/date-utils";
import { useAuth } from "@/lib/auth";

interface WizardHeaderProps {
  stepLabel?: string;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function WizardHeader({ stepLabel = "Start" }: WizardHeaderProps) {
  const lastSaved = useInvoiceStore((state) => state.lastSaved);
  const { user, isGuest } = useAuth();

  const initials = getInitials(user?.name);

  return (
    <header className="border-b border-border px-4 py-3 md:px-8 md:py-4 flex items-center justify-between bg-white">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          ← <span className="hidden sm:inline">Back to </span>Dashboard
        </Link>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600 text-sm">{stepLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline text-sm text-gray-500">
          Draft saved {formatDistanceToNow(lastSaved)}
        </span>
        {isGuest ? (
          <div className="px-3 py-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            Guest
          </div>
        ) : (
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
