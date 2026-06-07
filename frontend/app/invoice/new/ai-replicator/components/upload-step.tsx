"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Sparkles, FileText } from "lucide-react";
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
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">AI Invoice Replicator</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload a sample invoice to analyze its design style.
        </p>
        <div className="mt-3">
          <UsageBadge />
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : preview
            ? "border-border"
            : "border-border hover:border-muted-foreground/30"
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
          <div className="relative p-4">
            <button
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="absolute top-2 right-2 p-1 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {preview === "pdf" ? (
              <div className="flex flex-col items-center py-8">
                <FileText className="w-12 h-12 text-primary/60 mb-2" />
                <p className="text-sm font-medium">PDF uploaded</p>
              </div>
            ) : (
              <img
                src={preview}
                alt="Sample invoice"
                className="max-h-72 mx-auto rounded-md"
              />
            )}
            <p className="text-xs text-muted-foreground text-center mt-3">
              {file?.name}
              <span className="mx-1.5 text-border">|</span>
              {((file?.size || 0) / 1024).toFixed(0)} KB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 px-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">
              Drop an invoice here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WebP, or PDF — max 5MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-destructive text-center">{error}</p>
      )}

      <div className="flex justify-center mt-5">
        <Button
          onClick={() => file && onAnalyze(file)}
          disabled={!file || isLoading}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? "Analyzing..." : "Analyze Style"}
        </Button>
      </div>
    </div>
  );
}
