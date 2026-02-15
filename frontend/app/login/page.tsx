"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { HelpCircle, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Logo + Theme Toggle */}
      <div className="p-4 md:p-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoica</h1>
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading !== null}
                className="w-full h-12 bg-primary hover:bg-primary/90 gap-3"
              >
                {isLoading === "google" ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Sign in with Google
              </Button>

              {/* Microsoft Sign In */}
              <Button
                onClick={handleMicrosoftSignIn}
                disabled={isLoading !== null}
                variant="outline"
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 hover:text-background border-foreground gap-3"
              >
                {isLoading === "microsoft" ? (
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                  </svg>
                )}
                Sign in with Microsoft
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">OR CONTINUE WITH</span>
                </div>
              </div>

              {/* Guest Sign In */}
              <Button
                onClick={handleGuestSignIn}
                disabled={isLoading !== null}
                variant="outline"
                className="w-full h-12 bg-muted hover:bg-muted/80"
              >
                {isLoading === "guest" ? (
                  <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Continue as Guest"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Icon */}
      <button className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors shadow-lg">
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
