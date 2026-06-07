"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Scan, Palette, Wand2 } from "lucide-react";

const FEATURES = [
  { icon: Scan, title: "Upload any invoice", desc: "PDF or image — we handle both" },
  { icon: Palette, title: "AI style extraction", desc: "Colors, layout, and typography detected" },
  { icon: Wand2, title: "One-click replication", desc: "Apply the style to your own invoices" },
];

export function GuestGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
        <Sparkles className="w-6 h-6 text-primary-foreground" />
      </div>
      <h1 className="text-xl font-semibold mb-2">AI Invoice Replicator</h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm text-center leading-relaxed">
        Upload a sample invoice and let AI replicate its style for your own invoices.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-lg w-full">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2.5">
              <f.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-medium mb-0.5">{f.title}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{f.desc}</p>
          </div>
        ))}
      </div>

      <Button size="lg" onClick={() => signIn()} className="gap-2 px-8 shadow-lg shadow-primary/20">
        Sign in to get started
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
