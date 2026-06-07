"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Status = "verifying" | "success" | "failed";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const api = useAuthenticatedApi();
  const [status, setStatus] = useState<Status>("verifying");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) {
      setStatus("failed");
      return;
    }

    api
      .verifySubscription(reference)
      .then((result) => {
        setStatus(result.status === "success" ? "success" : "failed");
      })
      .catch(() => setStatus("failed"));
  }, [searchParams, api]);

  return (
    <div className="max-w-sm w-full text-center">
      {status === "verifying" && (
        <>
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold mb-1">Verifying payment...</h1>
          <p className="text-sm text-muted-foreground">Please wait while we confirm your upgrade.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-lg font-semibold mb-1">Welcome to Pro!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your account has been upgraded. You now have unlimited AI invoice analyses.
          </p>
          <Button onClick={() => router.push("/invoice/new/ai-replicator")} className="w-full">
            Start Replicating
          </Button>
        </>
      )}

      {status === "failed" && (
        <>
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-lg font-semibold mb-1">Payment could not be verified</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Something went wrong. If you were charged, please contact support.
          </p>
          <div className="space-y-2">
            <Button onClick={() => router.push("/invoice/new/ai-replicator")} className="w-full">
              Try Again
            </Button>
            <Button variant="ghost" onClick={() => router.push("/invoice/new")} className="w-full">
              Back to Dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
