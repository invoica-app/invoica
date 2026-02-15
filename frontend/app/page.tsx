"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NothingDey } from "@/components/nothing-dey";
import { DemoInvoice } from "@/components/demo-invoice";
import { WaveBackground } from "@/components/ui/wave-background";
import { useAuth } from "@/lib/auth";

const ROTATING_WORDS = ["hours", "days", "weeks", "months"];
const WORD_INTERVAL = 2500;

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase("exit");
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setPhase("enter");
      }, 300);
    }, WORD_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-block relative">
      <span
        key={`${index}-${phase}`}
        className={`inline-block text-primary ${phase === "enter" ? "word-enter" : "word-exit"}`}
      >
        {ROTATING_WORDS[index]}
      </span>
    </span>
  );
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const STEPS = [
  {
    n: "1",
    title: "Enter your details",
    desc: "Company name, client info, and line items with amounts.",
  },
  {
    n: "2",
    title: "Pick a design",
    desc: "Choose a color and layout. See a live preview as you go.",
  },
  {
    n: "3",
    title: "Write the email",
    desc: "Customize the subject line and message body.",
  },
  {
    n: "4",
    title: "Send it",
    desc: "Review the PDF, then send directly from the app.",
  },
];

const FEATURES = [
  "9 currencies built in \u2014 USD, GHS, EUR, GBP, NGN, and more",
  "PDF preview and download before sending",
  "Works on phone, tablet, and laptop",
  "Guest mode \u2014 no account needed to start",
];

export default function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const appHref = "/invoice/new/company";

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WaveBackground />

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            invoica
          </Link>
          <div className="flex items-center gap-2">
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
            {isAuthenticated ? (
              <Button asChild size="sm">
                <Link href={appHref}>
                  {user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Dashboard"}
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block px-2"
                >
                  Sign in
                </Link>
                <Button asChild size="sm">
                  <Link href="/login">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 pt-14 sm:pt-24 pb-4 sm:pb-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-[42px] font-semibold tracking-tight leading-[1.15] animate-fade-in-up">
            Invoice clients in minutes,
            <br className="hidden sm:block" /> not <RotatingWord />.
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg animate-fade-in-up-delay-1">
            Fill in the details, pick a design, send. Supports 9 currencies
            including USD, GHS, EUR, and GBP.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 animate-fade-in-up-delay-2">
            <Button asChild>
              <Link href={isAuthenticated ? appHref : "/login"}>
                {isAuthenticated ? "Go to dashboard" : "Create an invoice"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            {!isAuthenticated && (
              <span className="text-sm text-muted-foreground">
                Free &middot; No account needed
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Demo invoice */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 pt-8 sm:pt-12 pb-16 sm:pb-24">
        <div className="animate-fade-in-up-delay-3">
          <DemoInvoice />
        </div>
      </section>

      {/* How it works + features (merged) */}
      <section className="relative z-10 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-5 py-14 sm:py-20">
          <Reveal>
            <p className="text-sm font-medium text-muted-foreground mb-6 sm:mb-8">
              How it works
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-6 sm:gap-y-10">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.08}>
                <p className="text-sm font-medium mb-1.5">
                  <span className="text-muted-foreground mr-2">{step.n}.</span>
                  {step.title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </Reveal>
            ))}
          </div>

          {/* Features as a compact list under the steps */}
          <Reveal>
            <ul className="mt-12 sm:mt-16 pt-8 border-t border-border/50 grid sm:grid-cols-2 gap-x-12 gap-y-2.5">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-primary mt-0.5 shrink-0">&bull;</span>
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Mascot */}
      <section className="relative z-10 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-5 py-14 sm:py-20 flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
          <Reveal>
            <NothingDey className="w-24 h-28 shrink-0" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="text-center sm:text-left">
              <p className="font-[family-name:var(--font-amatica)] text-3xl font-bold mb-1">
                Nothing Dey
              </p>
              <p className="text-sm text-muted-foreground max-w-sm mb-5">
                That&apos;s Ghanaian pidgin for &ldquo;nothing here yet.&rdquo;{" "}
                Your invoice history is empty &mdash; go create your first one.
              </p>
              <Button asChild size="sm">
                <Link href={isAuthenticated ? appHref : "/login"}>
                  {isAuthenticated ? "Go to dashboard" : "Create your first invoice"}
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-5 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight">
              invoica
            </span>
            <span className="text-xs text-muted-foreground">
              For freelancers and small businesses.
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild size="sm">
                <Link href={appHref}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
                <Button asChild size="sm">
                  <Link href="/login">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-5 pb-6">
          <p className="text-[11px] text-muted-foreground">
            &copy; 2025 Invoica
          </p>
        </div>
      </footer>
    </div>
  );
}
