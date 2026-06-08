"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Sparkles, FileText, Image } from "lucide-react";
import { UsageBadge } from "./usage-badge";

interface UploadStepProps {
  onAnalyze: (file: File) => void;
  isLoading: boolean;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024;

export function UploadStep({ onAnalyze, isLoading }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback((f: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Only PNG, JPG, WebP, and PDF files are supported.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("File must be under 5MB.");
      return;
    }
    setFile(f);
    if (f.type === "application/pdf") {
      setPreview("pdf");
    } else {
      setPreview(URL.createObjectURL(f));
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) validateAndSetFile(f);
    },
    [validateAndSetFile]
  );

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="max-w-xl mx-auto pt-4 sm:pt-8">
      {/* Hero */}
      <div className="text-center mb-6 sm:mb-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-primary/20">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
        </div>
        <h1 className="text-lg sm:text-xl font-semibold mb-2">Upload a sample invoice</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed px-2">
          Our AI will analyze its visual design — colors, layout, typography — and replicate the style for your invoices.
        </p>
        <div className="mt-4">
          <UsageBadge />
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : preview
            ? "border-border bg-card"
            : "border-border hover:border-primary/40 hover:bg-muted/30"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !preview && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) validateAndSetFile(f);
          }}
        />

        {preview ? (
          <div className="relative p-5">
            <button
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {preview === "pdf" ? (
              <div className="flex flex-col items-center py-10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-medium">PDF ready for analysis</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Sample invoice"
                  className="max-h-80 rounded-lg shadow-sm"
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {file?.type === "application/pdf" ? (
                  <FileText className="w-3.5 h-3.5" />
                ) : (
                  <Image className="w-3.5 h-3.5" />
                )}
                <span className="font-medium text-foreground">{file?.name}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-xs text-muted-foreground">
                {((file?.size || 0) / 1024).toFixed(0)} KB
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="ml-auto text-xs text-primary font-medium hover:underline"
              >
                Change file
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 sm:py-12 px-4 sm:px-6 cursor-pointer">
            <img
              src="/images/upload.svg"
              alt="Upload"
              className="w-24 h-24 sm:w-32 sm:h-32 mb-4 opacity-90"
            />
            <p className="text-sm font-medium mb-1">
              Drop your invoice here
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              or click to browse files
            </p>
            <div className="flex items-center gap-2">
              {["PNG", "JPG", "WebP", "PDF"].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground uppercase tracking-wide"
                >
                  {fmt}
                </span>
              ))}
              <span className="text-[10px] text-muted-foreground/60">max 5MB</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive text-center">{error}</p>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <Button
          size="lg"
          onClick={() => file && onAnalyze(file)}
          disabled={!file || isLoading}
          className="gap-2 px-8 shadow-lg shadow-primary/20"
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? "Analyzing..." : "Analyze Style"}
        </Button>
      </div>
    </div>
  );
}
