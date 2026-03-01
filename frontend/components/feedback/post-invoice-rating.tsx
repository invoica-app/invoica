"use client";

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { cn } from "@/lib/utils";

const RATINGS = [
  { label: "Terrible", value: 1 },
  { label: "Bad", value: 2 },
  { label: "Okay", value: 3 },
  { label: "Good", value: 4 },
  { label: "Amazing", value: 5 },
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
            Thanks for your feedback!
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-center mb-3">How was your experience?</p>

            {/* Star rating row */}
            <div className="flex flex-col items-center gap-1 mb-3">
              <div className="flex gap-1">
                {RATINGS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRating(r.value)}
                    title={r.label}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8",
                        selectedRating !== null && r.value <= selectedRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200 dark:text-gray-600"
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className={cn(
                "text-xs text-gray-400 h-4",
                selectedRating ? "opacity-100" : "opacity-0"
              )}>
                {selectedRating ? RATINGS[selectedRating - 1].label : "\u00A0"}
              </p>
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
