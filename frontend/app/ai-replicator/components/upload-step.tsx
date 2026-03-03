"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UsageBadge } from "./usage-badge";

interface UploadStepProps {
  onAnalyze: (file: File) => void;
  isLoading: boolean;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function UploadStep({ onAnalyze, isLoading }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback((f: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Only PNG, JPG, and WebP images are allowed.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("File must be under 5MB.");
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
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

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">AI Invoice Replicator</h1>
        <p className="text-muted-foreground">
          Upload a sample invoice and our AI will analyze its design style.
        </p>
        <div className="mt-3">
          <UsageBadge />
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Sample invoice preview"
              className="max-h-80 mx-auto rounded-lg border border-border shadow-sm"
            />
            <div className="text-sm text-muted-foreground">
              {file?.name} ({((file?.size || 0) / 1024).toFixed(0)} KB)
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-8">
            <div className="text-4xl">&#128196;</div>
            <div className="text-sm font-medium">
              Drop your sample invoice here, or click to browse
            </div>
            <div className="text-xs text-muted-foreground">
              PNG, JPG, or WebP up to 5MB
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 text-center">{error}</div>
      )}

      <div className="flex justify-center gap-3 mt-6">
        {preview && (
          <Button variant="outline" onClick={clearFile} disabled={isLoading}>
            Clear
          </Button>
        )}
        <Button
          onClick={() => file && onAnalyze(file)}
          disabled={!file || isLoading}
        >
          {isLoading ? "Analyzing..." : "Analyze Style"}
        </Button>
      </div>
    </div>
  );
}
