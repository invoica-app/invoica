"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { cn } from "@/lib/utils";

const EMOJIS = [
  { emoji: "\u{1F621}", label: "Terrible", value: 1 },
  { emoji: "\u{1F615}", label: "Bad", value: 2 },
  { emoji: "\u{1F610}", label: "Okay", value: 3 },
  { emoji: "\u{1F642}", label: "Good", value: 4 },
  { emoji: "\u{1F60D}", label: "Amazing", value: 5 },
];

interface PostInvoiceRatingProps {
  invoiceId: number;
  onDismiss: () => void;
}

function shouldShowRating(invoiceId: number): boolean {
  // Already shown for this invoice
  if (localStorage.getItem(`feedback_shown_${invoiceId}`)) return false;

  // Anti-fatigue: skip if 3 consecutive
  const streak = parseInt(localStorage.getItem("feedback_streak") || "0", 10);
  const streakReset = localStorage.getItem("feedback_streak_reset");
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  if (streakReset && parseInt(streakReset, 10) < weekAgo) {
    localStorage.setItem("feedback_streak", "0");
    localStorage.setItem("feedback_streak_reset", String(Date.now()));
    return true;
  }

  return streak < 3;
}

function markShown(invoiceId: number) {
  localStorage.setItem(`feedback_shown_${invoiceId}`, "1");
  const streak = parseInt(localStorage.getItem("feedback_streak") || "0", 10);
  localStorage.setItem("feedback_streak", String(streak + 1));
  if (!localStorage.getItem("feedback_streak_reset")) {
    localStorage.setItem("feedback_streak_reset", String(Date.now()));
  }
}

export function PostInvoiceRating({ invoiceId, onDismiss }: PostInvoiceRatingProps) {
  const api = useAuthenticatedApi();
  const [visible, setVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!shouldShowRating(invoiceId)) {
      onDismiss();
      return;
    }
    // Slide in
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [invoiceId, onDismiss]);

  const dismiss = useCallback(() => {
    markShown(invoiceId);
    setVisible(false);
    setTimeout(onDismiss, 300);
  }, [invoiceId, onDismiss]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dismiss]);

  const handleSend = async () => {
    if (!selectedRating || submitting) return;
    setSubmitting(true);
    try {
      await api.submitFeedback({
        type: "post_invoice",
        rating: selectedRating,
        message: message.trim() || undefined,
        invoiceId,
      });
      setSubmitted(true);
      setTimeout(() => {
        markShown(invoiceId);
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 2000);
    } catch {
      // Silently fail — feedback is non-critical
      dismiss();
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4 transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-[calc(100%+2rem)]"
      )}
    >
      <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-gray-100 dark:border-border p-5">
        {submitted ? (
          <p className="text-center text-sm text-muted-foreground py-2">
            Thanks for your feedback! {"\u{1F64F}"}
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-center mb-3">How was your experience?</p>

            {/* Emoji row */}
            <div className="flex justify-center gap-3 mb-3">
              {EMOJIS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setSelectedRating(e.value)}
                  title={e.label}
                  className={cn(
                    "w-10 h-10 text-xl flex items-center justify-center rounded-full transition-all",
                    selectedRating === e.value
                      ? "scale-125 ring-2 ring-[#9747E6] ring-offset-2 dark:ring-offset-card"
                      : "opacity-60 hover:opacity-100 hover:scale-110"
                  )}
                >
                  {e.emoji}
                </button>
              ))}
            </div>

            {/* Optional message after selection */}
            {selectedRating !== null && (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Any additional thoughts? (optional)"
                className="w-full text-xs rounded-lg border border-gray-200 dark:border-border bg-transparent p-2 mb-3 resize-none focus:outline-none focus:ring-1 focus:ring-[#9747E6]"
              />
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={dismiss}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSend}
                disabled={selectedRating === null || submitting}
                className="text-xs font-medium text-white bg-[#9747E6] rounded-lg px-4 py-1.5 disabled:opacity-40 hover:bg-[#8535d4] transition-colors"
              >
                {submitting ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
