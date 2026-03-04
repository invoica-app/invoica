"use client";

import { Sparkles } from "lucide-react";

export function AnalyzingStep() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="relative mb-5">
        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <Sparkles className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-sm font-medium mb-1">Analyzing invoice style</p>
      <p className="text-xs text-muted-foreground">
        This usually takes 10-20 seconds.
      </p>
    </div>
  );
}
