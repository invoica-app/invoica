"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { WaveBackground } from "@/components/ui/wave-background";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleGoogleSignIn = async () => {
    setIsLoading("google");
    try {
      await signIn("google", { callbackUrl: "/invoice/new" });
    } catch (error) {
      console.error("Google sign in error:", error);
      setIsLoading(null);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading("microsoft");
    try {
      await signIn("azure-ad", { callbackUrl: "/invoice/new" });
    } catch (error) {
      console.error("Microsoft sign in error:", error);
      setIsLoading(null);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading("guest");
    setError(null);
    try {
      const result = await signIn("guest", {
        redirect: false,
      });

      if (result?.ok) {
        router.push("/invoice/new");
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch {
      setError("Could not connect to the server. Is the backend running?");
    } finally {
      setIsLoading(null);
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <WaveBackground />

      {/* Nav — matches landing page */}
      <header className="relative z-10 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            invoica
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight mb-1">
              Sign in to Invoica
            </h1>
            <p className="text-sm text-muted-foreground">
              Create and send invoices in minutes.
            </p>
          </div>

          {error && (
            <div className="mb-5 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2.5">
            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading !== null}
              className="w-full h-11 px-4 flex items-center justify-center gap-3 rounded-lg border border-border bg-background text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading === "google" ? (
                <Spinner />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </button>

            {/* Microsoft */}
            <button
              onClick={handleMicrosoftSignIn}
              disabled={isLoading !== null}
              className="w-full h-11 px-4 flex items-center justify-center gap-3 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading === "microsoft" ? (
                <Spinner className="border-background border-t-transparent" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                </svg>
              )}
              Continue with Microsoft
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-background text-xs text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Guest */}
          <button
            onClick={handleGuestSignIn}
            disabled={isLoading !== null}
            className="w-full h-11 px-4 flex items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading === "guest" ? (
              <Spinner />
            ) : (
              "Continue as guest"
            )}
          </button>
          <p className="mt-2.5 text-[11px] text-muted-foreground text-center">
            No account needed. Sign up later to save your history.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-5 pb-6">
        <p className="text-center text-[11px] text-muted-foreground">
          &copy; 2025 Invoica
        </p>
      </footer>
    </div>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
