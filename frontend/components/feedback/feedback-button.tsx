"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { FeedbackModal } from "./feedback-modal";

export function FeedbackButton() {
  const { isAuthenticated, isGuest } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated || isGuest) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex fixed bottom-5 left-5 z-40 items-center gap-1.5 rounded-full bg-white dark:bg-card border border-gray-200 dark:border-border shadow-sm px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-muted-foreground hover:border-[#9747E6] hover:text-[#9747E6] transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Feedback
      </button>

      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
