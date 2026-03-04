"use client";

export function AnalyzingStep() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Analyzing invoice style...</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Our AI is examining the layout, colors, typography, and structure of
        your sample invoice. This usually takes 10-20 seconds.
      </p>
    </div>
  );
}
