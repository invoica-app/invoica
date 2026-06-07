"use client";

import { useState, useEffect } from "react";
import { Sparkles, Palette, Type, Layout, Table2 } from "lucide-react";

const STAGES = [
  { icon: Layout, label: "Detecting layout structure", duration: 3000 },
  { icon: Palette, label: "Extracting color palette", duration: 3000 },
  { icon: Type, label: "Identifying typography", duration: 3000 },
  { icon: Table2, label: "Analyzing table design", duration: 3000 },
  { icon: Sparkles, label: "Generating template match", duration: 5000 },
];

export function AnalyzingStep() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    let elapsed = 0;
    STAGES.forEach((stage, i) => {
      if (i === 0) return;
      elapsed += stage.duration;
      timers.push(setTimeout(() => setActiveStage(i), elapsed));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh]">
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <Sparkles className="w-7 h-7 text-primary-foreground animate-pulse" />
        </div>
        <div className="absolute -inset-3 rounded-3xl border-2 border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
      </div>

      <h2 className="text-base font-semibold mb-1">Analyzing your invoice</h2>
      <p className="text-sm text-muted-foreground mb-8">This usually takes 10–20 seconds</p>

      <div className="w-full max-w-xs space-y-2">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isActive = i === activeStage;
          const isDone = i < activeStage;
          return (
            <div
              key={stage.label}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-500 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : isDone
                  ? "text-primary/60"
                  : "text-muted-foreground/30"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "animate-pulse" : ""}`} />
              <span className="text-xs font-medium">{stage.label}</span>
              {isDone && <span className="ml-auto text-[10px]">✓</span>}
              {isActive && (
                <div className="ml-auto w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
