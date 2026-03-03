"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function GuestGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-5xl mb-4">&#129302;</div>
      <h1 className="text-2xl font-bold mb-2">AI Invoice Replicator</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Upload a sample invoice and our AI will analyze its style. Then create
        your own invoices that match the same look and feel.
      </p>
      <Button size="lg" onClick={() => signIn()}>
        Sign in to get started
      </Button>
    </div>
  );
}
