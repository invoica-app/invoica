"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NothingDey } from "@/components/nothing-dey";
import { DemoInvoice } from "@/components/demo-invoice";
import { WaveBackground } from "@/components/ui/wave-background";
import { AppFooter } from "@/components/app-footer";
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

type RevealDirection = "up" | "down" | "left" | "right";

const DIRECTION_OFFSET: Record<RevealDirection, string> = {
  up: "translateY(24px)",
  down: "translateY(-24px)",
  left: "translateX(24px)",
  right: "translateX(-24px)",
};

function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  scale = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  scale?: boolean;
}) {
  const { ref, visible } = useReveal();
  const scaleFrom = scale ? " scale(0.97)" : "";
  const scaleTo = scale ? " scale(1)" : "";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? `translateX(0) translateY(0)${scaleTo}`
          : `${DIRECTION_OFFSET[direction]}${scaleFrom}`,
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  "9 currencies built in \u2014 USD, GHS, EUR, GBP, NGN, and more",
  "PDF preview and download before sending",
  "Works on phone, tablet, and laptop",
  "Guest mode \u2014 no account needed to start",
];

function DetailsIllustration({ color = "#9747E6" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-[260px] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-transform duration-500 ease-out group-hover:scale-[1.03]">
        <div className="h-1.5 transition-all duration-500 ease-out group-hover:h-2" style={{ backgroundColor: color }} />
        <div className="p-4 space-y-3">
          <div className="h-2.5 w-3/4 bg-gray-100 rounded-full transition-all duration-500 ease-out group-hover:w-full group-hover:bg-gray-200" />
          <div className="h-2.5 w-1/2 bg-gray-100 rounded-full transition-all duration-500 ease-out delay-75 group-hover:w-2/3 group-hover:bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded-md border border-gray-200 bg-gray-50 transition-all duration-300 delay-150 group-hover:bg-gray-100" />
            <div className="h-8 flex-1 rounded-md border border-gray-200 bg-gray-50 transition-all duration-300 delay-200 group-hover:bg-gray-100" />
          </div>
          <div className="h-2.5 w-2/3 bg-gray-100 rounded-full transition-all duration-500 ease-out delay-300 group-hover:w-full group-hover:bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

const SWATCH_COLORS = ["#9747E6", "#2563eb", "#f59e0b", "#176636"];

function DesignIllustration({ color = "#9747E6", onColorChange }: { color?: string; onColorChange?: (c: string) => void }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex gap-4 items-end">
        {SWATCH_COLORS.map((c, i) => {
          const selected = c === color;
          return (
            <div key={c} className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onColorChange?.(c); }}
                className="rounded-full flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-1 cursor-pointer"
                style={{
                  width: selected ? 40 : 32,
                  height: selected ? 40 : 32,
                  backgroundColor: c,
                  boxShadow: selected ? `0 0 0 3px white, 0 0 0 5px ${c}40` : "none",
                  transitionDelay: `${i * 75}ms`,
                }}
              >
                {selected && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:scale-125">
                    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <div className="h-1.5 w-6 bg-gray-200 rounded-full" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComposeIllustration({ color = "#9747E6" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-[260px] rounded-xl border border-gray-200 bg-white shadow-sm p-4 space-y-3 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
        <div className="h-2.5 w-1/2 bg-gray-100 rounded-full transition-all duration-500 ease-out group-hover:w-2/3 group-hover:bg-gray-200" />
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="h-2 w-full bg-gray-100 rounded-full transition-all duration-500 ease-out delay-75 group-hover:bg-gray-200" />
          <div className="h-2 w-5/6 rounded-full transition-all duration-500 ease-out delay-150 group-hover:w-full" style={{ backgroundColor: `${color}1a` }} />
          <div className="h-2 w-3/4 bg-gray-100 rounded-full transition-all duration-500 ease-out delay-200 group-hover:w-5/6 group-hover:bg-gray-200" />
        </div>
        <div className="flex justify-end pt-1">
          <div className="h-6 w-14 rounded-md flex items-center justify-center transition-all duration-300 delay-300 group-hover:w-16 group-hover:shadow-md" style={{ backgroundColor: color }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 delay-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliverIllustration({ color = "#9747E6" }: { color?: string }) {
  const delays = ["0ms", "75ms", "150ms"];
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-3">
        {delays.map((d, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-1"
            style={{ backgroundColor: color, transitionDelay: d }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}
        <div
          className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-500 ease-out delay-200 group-hover:border-solid group-hover:scale-110 group-hover:-translate-y-1"
          style={{ borderColor: `${color}66` }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform duration-700 ease-out delay-200 group-hover:rotate-[360deg]">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={color} />
          </svg>
        </div>
      </div>
    </div>
  );
}

const STEP_CARDS = [
  { label: "DETAILS", title: "Enter your details", desc: "Company name, client info, and line items with amounts.", key: "details" as const },
  { label: "DESIGN", title: "Pick a design", desc: "Choose a color and layout. See a live preview as you go.", key: "design" as const },
  { label: "COMPOSE", title: "Write the email", desc: "Customize the subject line and message body.", key: "compose" as const },
  { label: "DELIVER", title: "Send it", desc: "Review the PDF, then send directly from the app.", key: "deliver" as const },
];

function HowItWorks() {
  const [accentColor, setAccentColor] = useState("#9747E6");

  const renderIllustration = (key: string) => {
    switch (key) {
      case "details": return <DetailsIllustration color={accentColor} />;
      case "design": return <DesignIllustration color={accentColor} onColorChange={setAccentColor} />;
      case "compose": return <ComposeIllustration color={accentColor} />;
      case "deliver": return <DeliverIllustration color={accentColor} />;
      default: return null;
    }
  };

  return (
    <section className="relative z-10 px-4 sm:px-5 py-16 md:py-28">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <Reveal>
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3 transition-colors duration-500" style={{ color: accentColor }}>
              HOW IT WORKS
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-3">
              Invoice in four steps
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
              From details to delivery — everything you need to create and send professional invoices.
            </p>
          </div>
        </Reveal>

        {/* 2x2 Step cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {STEP_CARDS.map((card, i) => (
            <Reveal key={card.label} delay={i * 0.12} scale>
              <div className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <div className="px-5 pt-5 pb-1 sm:px-6 sm:pt-6">
                  <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-1.5 transition-colors duration-500" style={{ color: accentColor }}>
                    {card.label}
                  </p>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {card.title}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="h-36 sm:h-44 px-5 sm:px-6">
                  {renderIllustration(card.key)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Features card */}
        <Reveal scale>
          <div className="mt-3 sm:mt-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-5 py-6 sm:px-8 sm:py-8">
            <div className="text-center mb-5">
              <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-1.5 transition-colors duration-500" style={{ color: accentColor }}>
                BUILT IN
              </p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Everything you need, nothing you don&apos;t
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-500" style={{ backgroundColor: accentColor }}>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

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
          <Link href="/">
            <Image
              src="/images/logo-full-colored-lightmode.svg"
              alt="invoica"
              width={100}
              height={28}
              className="w-[70px] md:w-[100px] h-auto dark:brightness-0 dark:invert"
            />
          </Link>
          <div className="flex items-center gap-2">
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

      {/* How it works */}
      <HowItWorks />

      {/* Mascot */}
      <section className="relative z-10 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-5 py-14 sm:py-20 flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
          <Reveal direction="right">
            <NothingDey className="w-24 h-28 shrink-0" />
          </Reveal>
          <Reveal delay={0.15} direction="left">
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
      <div className="relative z-10">
        <AppFooter />
      </div>
    </div>
  );
}
