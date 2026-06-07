"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import type { AiInvoiceAnalysis } from "@/lib/types";
import type { AiInvoiceFormData } from "@/components/ai-dynamic-template";
import { GuestGate } from "./components/guest-gate";
import { UploadStep } from "./components/upload-step";
import { AnalyzingStep } from "./components/analyzing-step";
import { FormStep } from "./components/form-step";
import { PreviewStep } from "./components/preview-step";
import { PaywallModal } from "./components/paywall-modal";
import { Sparkles } from "lucide-react";

type Step = "upload" | "analyzing" | "form" | "preview";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "analyzing", label: "Analyze" },
  { key: "form", label: "Details" },
  { key: "preview", label: "Preview" },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => {
        const isActive = i === currentIdx;
        const isDone = i < currentIdx;
        return (
          <div key={s.key} className="flex items-center gap-1.5">
            {i > 0 && (
              <div className={`w-6 h-px ${isDone ? "bg-primary" : "bg-border"}`} />
            )}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : isDone
                  ? "text-primary"
                  : "text-muted-foreground/50"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AiReplicatorPage() {
  const { isGuest, isLoading: authLoading } = useAuth();
  const api = useAuthenticatedApi();

  const [step, setStep] = useState<Step>("upload");
  const [analysis, setAnalysis] = useState<AiInvoiceAnalysis | null>(null);
  const [analysisJson, setAnalysisJson] = useState("");
  const [sampleImageUrl, setSampleImageUrl] = useState("");
  const [formData, setFormData] = useState<AiInvoiceFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleAnalyze = useCallback(
    async (file: File) => {
      setStep("analyzing");
      setError(null);
      try {
        const result = await api.analyzeInvoice(file);
        const parsed: AiInvoiceAnalysis = JSON.parse(result.analysisJson);
        setAnalysis(parsed);
        setAnalysisJson(result.analysisJson);
        setSampleImageUrl(result.sampleImageUrl);
        setStep("form");
      } catch (err: unknown) {
        const error = err as Error & { status?: number };
        if (error.status === 402) {
          setShowPaywall(true);
          setStep("upload");
        } else {
          setError(error.message || "Analysis failed. Please try again.");
          setStep("upload");
        }
      }
    },
    [api]
  );

  const handlePreview = useCallback((data: AiInvoiceFormData) => {
    setFormData(data);
    setStep("preview");
  }, []);

  const handleStartOver = useCallback(() => {
    setStep("upload");
    setAnalysis(null);
    setAnalysisJson("");
    setSampleImageUrl("");
    setFormData(null);
    setError(null);
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isGuest) {
    return <GuestGate />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card/50 px-6 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none">AI Replicator</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">Clone any invoice style</p>
            </div>
          </div>
          <StepIndicator current={step} />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="shrink-0 px-6 pt-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-destructive/60 hover:text-destructive font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6 max-w-6xl mx-auto w-full">
          {step === "upload" && (
            <UploadStep onAnalyze={handleAnalyze} isLoading={false} />
          )}

          {step === "analyzing" && <AnalyzingStep />}

          {step === "form" && analysis && (
            <FormStep
              analysis={analysis}
              sampleImageUrl={sampleImageUrl}
              onPreview={handlePreview}
              onBack={handleStartOver}
            />
          )}

          {step === "preview" && analysis && formData && (
            <PreviewStep
              analysis={analysis}
              formData={formData}
              sampleImageUrl={sampleImageUrl}
              analysisJson={analysisJson}
              onEdit={() => setStep("form")}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
