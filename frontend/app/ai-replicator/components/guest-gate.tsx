"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export function GuestGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <h1 className="text-xl font-semibold mb-2">AI Invoice Replicator</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
        Upload a sample invoice and let AI replicate its style for your own invoices.
      </p>
      <Button onClick={() => signIn()} className="gap-2">
        Sign in to get started
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
