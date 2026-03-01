"use client";

import { useState, useEffect } from "react";
import { X, Lightbulb, Bug, Heart, Star } from "lucide-react";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    value: "idea",
    label: "Idea",
    icon: Lightbulb,
    selectedColor: "text-[#9747E6]",
    selectedBorder: "border-[#9747E6] bg-[#9747E6]/5",
  },
  {
    value: "bug",
    label: "Bug",
    icon: Bug,
    selectedColor: "text-red-500",
    selectedBorder: "border-red-500 bg-red-500/5",
  },
  {
    value: "praise",
    label: "Praise",
    icon: Heart,
    selectedColor: "text-pink-500",
    selectedBorder: "border-pink-500 bg-pink-500/5",
  },
];

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Amazing",
};

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

  const activeRating = hoveredStar ?? rating;
  const ratingLabel = activeRating ? RATING_LABELS[activeRating] : null;

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
              Feedback sent! Thank you.
            </p>
          ) : (
            <>
              <h2 className="text-base font-semibold mb-1">Send Feedback</h2>
              <p className="text-xs text-muted-foreground mb-5">
                Help us improve Invoica
              </p>

              {/* Category cards */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const isSelected = category === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setCategory(isSelected ? null : c.value)}
                      className={cn(
                        "flex flex-col items-center py-3 rounded-xl border transition-colors",
                        isSelected
                          ? c.selectedBorder
                          : "border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isSelected ? c.selectedColor : "text-gray-400"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium mt-1.5",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {c.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                className="w-full min-h-[100px] rounded-xl border border-gray-200 dark:border-border bg-transparent p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#9747E6]/30 focus:border-[#9747E6] mb-4 transition-colors"
              />

              {/* Star rating */}
              <div className="mb-5">
                <div
                  className="flex items-center gap-1"
                  onMouseLeave={() => setHoveredStar(null)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = activeRating !== null && star <= activeRating;
                    return (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "w-5 h-5",
                            filled
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200 dark:text-gray-600"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className={cn(
                  "text-xs text-gray-400 mt-1 h-4",
                  ratingLabel ? "opacity-100" : "opacity-0"
                )}>
                  {ratingLabel || "\u00A0"}
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting || (!message.trim() && !category && !rating)}
                className="w-full bg-[#9747E6] text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-[#8a3dd4] transition-colors"
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
