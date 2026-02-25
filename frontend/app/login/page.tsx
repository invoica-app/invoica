"use client";

import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Copy, ExternalLink, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { ThemeSwitcher } from "@/components/theme-switcher";

const APP_URL = "https://invoica.co";


function useIsSnapchat() {
  const [isSnapchat, setIsSnapchat] = useState(false);
  useEffect(() => {
    setIsSnapchat(/Snapchat/i.test(navigator.userAgent || ""));
  }, []);
  return isSnapchat;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isSnapchat = useIsSnapchat();

  const isDark = mounted && resolvedTheme === "dark";

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

  const handleOpenInBrowser = () => {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) {
      window.location.href = `x-safari-${APP_URL}`;
    } else {
      window.location.href = `intent://${APP_URL.replace(/^https?:\/\//, "")}#Intent;scheme=https;end`;
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = APP_URL;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col bg-background text-foreground">
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
      {/* Left panel — Form */}
      <div className="flex-1 md:w-[60%] md:max-w-[60%] flex flex-col min-h-0">
        {/* Logo */}
        <header className="px-6 lg:px-16 pt-6 pb-2 shrink-0">
          <Link href="/">
            <Image
              src="/images/logo-full-colored-lightmode.svg"
              alt="invoica"
              width={100}
              height={28}
              className="w-[80px] md:w-[100px] h-auto dark:brightness-0 dark:invert"
            />
          </Link>
        </header>

        {/* Centered form area */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-16 py-8">
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
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm mb-5">
                <div className="mt-0.5 shrink-0 rounded-full bg-red-500/10 p-1">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500/70" />
                </div>
                <p className="flex-1 text-muted-foreground leading-relaxed">{error}</p>
              </div>
            )}

            {isSnapchat ? (
              <div className="space-y-4">
                <div className="px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                  Google sign-in requires a regular browser. Tap the button below, or copy the link and paste it in Safari/Chrome.
                </div>

                <button
                  onClick={handleOpenInBrowser}
                  className="w-full h-11 px-4 flex items-center justify-center gap-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in browser
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full h-11 px-4 flex items-center justify-center gap-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy link
                    </>
                  )}
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-background text-xs text-muted-foreground">
                      or continue here
                    </span>
                  </div>
                </div>

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
                <p className="text-[11px] text-muted-foreground text-center">
                  No account needed. Sign up later to save your history.
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-border bg-background px-6 py-4 lg:px-16">
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
            <ThemeSwitcher />
            <p className="text-[11px] text-muted-foreground">&copy; 2025 Invoica</p>
          </div>
        </footer>
      </div>

      {/* Right panel — Illustration (desktop only) */}
      <div className="hidden md:block md:w-[40%] relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Slow zoom animation */}
          <style jsx>{`
            @keyframes slowZoom {
              from { transform: scale(1); }
              to { transform: scale(1.05); }
            }
            .auth-illustration {
              animation: slowZoom 30s ease infinite alternate;
            }
          `}</style>

          {/* Day image */}
          <Image
            src="/images/auth/day.png"
            alt="Illustrated sky with warm Kente-patterned clouds"
            fill
            priority={!isDark}
            className={`object-cover auth-illustration transition-opacity duration-700 ${
              isDark ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Night image */}
          <Image
            src="/images/auth/night.png"
            alt="Illustrated night sky with purple Kente-patterned clouds and crescent moon"
            fill
            priority={isDark}
            className={`object-cover auth-illustration transition-opacity duration-700 ${
              isDark ? "opacity-100" : "opacity-0"
            }`}
          />

        </div>
      </div>
      </div>
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
