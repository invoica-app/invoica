"use client";

import { useState, useEffect, useCallback } from "react";
import { PartyPopper } from "lucide-react";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { cn } from "@/lib/utils";

interface FirstInvoiceFeedbackProps {
  onDismiss: () => void;
}

export function FirstInvoiceFeedback({ onDismiss }: FirstInvoiceFeedbackProps) {
  const api = useAuthenticatedApi();
  const [easeScore, setEaseScore] = useState(5);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleMaybeLater = useCallback(() => {
    const attempts = parseInt(localStorage.getItem("first_invoice_attempts") || "0", 10);
    localStorage.setItem("first_invoice_attempts", String(attempts + 1));
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleMaybeLater();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleMaybeLater]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.submitFeedback({
        type: "first_invoice",
        easeScore,
        npsScore: npsScore ?? undefined,
      });
      setSubmitted(true);
      // Mark as permanently done
      localStorage.setItem("first_invoice_attempts", "3");
      setTimeout(onDismiss, 2000);
    } catch {
      onDismiss();
    } finally {
      setSubmitting(false);
    }
  };

  function getNpsColor(n: number, selected: boolean) {
    if (!selected) return "border-gray-200 dark:border-border text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500";
    if (n <= 6) return "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800";
    if (n <= 8) return "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    return "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800";
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleMaybeLater}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {submitted ? (
          <p className="text-center text-sm py-8">
            Thanks for the feedback!
          </p>
        ) : (
          <>
            <div className="text-center mb-5">
              <PartyPopper className="w-8 h-8 text-[#9747E6] mx-auto" />
              <h2 className="text-base font-semibold mt-2">Your first invoice!</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Congrats! Help us improve with quick feedback.
              </p>
            </div>

            {/* Ease slider */}
            <div className="mb-5">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                How easy was it to create your invoice?
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={easeScore}
                onChange={(e) => setEaseScore(parseInt(e.target.value, 10))}
                className="w-full accent-[#9747E6]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Very Hard</span>
                <span className="font-medium text-foreground">{easeScore}/10</span>
                <span>Very Easy</span>
              </div>
            </div>

            {/* NPS row */}
            <div className="mb-5">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                How likely are you to recommend Invoica?
              </label>
              <div className="flex gap-1 flex-wrap justify-center">
                {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNpsScore(n)}
                    className={cn(
                      "w-8 h-8 rounded-full border text-xs font-medium transition-colors",
                      getNpsColor(n, npsScore === n)
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleMaybeLater}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Maybe later
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="text-xs font-medium text-white bg-[#9747E6] rounded-lg px-5 py-2 disabled:opacity-40 hover:bg-[#8535d4] transition-colors"
              >
                {submitting ? "Sending..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
