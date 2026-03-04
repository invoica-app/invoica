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

type Step = "upload" | "analyzing" | "form" | "preview";

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
    <div className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-destructive/60 hover:text-destructive"
          >
            Dismiss
          </button>
        </div>
      )}

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

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
