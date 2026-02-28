"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "idea", emoji: "\u{1F4A1}", label: "Idea" },
  { value: "bug", emoji: "\u{1F41B}", label: "Bug" },
  { value: "praise", emoji: "\u{1F64F}", label: "Praise" },
];

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const api = useAuthenticatedApi();
  const [category, setCategory] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setCategory(null);
      setMessage("");
      setRating(null);
      setSubmitted(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.submitFeedback({
        type: "general",
        category: category || undefined,
        rating: rating || undefined,
        message: message.trim() || undefined,
        page: typeof window !== "undefined" ? window.location.pathname : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch {
      // Silently close — non-critical
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — centered on desktop, bottom sheet on mobile */}
      <div
        className={cn(
          "relative bg-card border border-border shadow-xl w-full",
          "md:max-w-md md:mx-4 md:rounded-2xl",
          "max-md:fixed max-md:bottom-0 max-md:inset-x-0 max-md:rounded-t-2xl max-md:animate-in max-md:slide-in-from-bottom"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {submitted ? (
            <p className="text-center text-sm py-8">
              Feedback sent! Thank you {"\u{1F49C}"}
            </p>
          ) : (
            <>
              <h2 className="text-base font-semibold mb-1">Send Feedback</h2>
              <p className="text-xs text-muted-foreground mb-5">
                Help us improve Invoica
              </p>

              {/* Category cards */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(category === c.value ? null : c.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-colors",
                      category === c.value
                        ? "border-[#9747E6] bg-[#9747E6]/5 text-foreground"
                        : "border-gray-200 dark:border-border text-muted-foreground hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <span className="text-lg">{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                className="w-full min-h-[100px] rounded-xl border border-gray-200 dark:border-border bg-transparent p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#9747E6] mb-4"
              />

              {/* Star rating */}
              <div className="flex items-center gap-1 mb-5">
                <span className="text-xs text-muted-foreground mr-2">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg
                      className={cn(
                        "w-5 h-5",
                        (hoveredStar !== null ? star <= hoveredStar : star <= (rating || 0))
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-200 dark:text-gray-600 fill-gray-200 dark:fill-gray-600"
                      )}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting || (!message.trim() && !category && !rating)}
                className="w-full bg-[#9747E6] text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-[#8535d4] transition-colors"
              >
                {submitting ? "Sending..." : "Submit Feedback"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
