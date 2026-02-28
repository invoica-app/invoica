"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, ArrowRight, Smartphone, Landmark } from "lucide-react";
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
  "Mobile Money & bank transfer \u2014 MTN, Telecel, AirtelTigo, or any GH bank",
  "9 currencies built in \u2014 GHS, USD, EUR, GBP, NGN, and more",
  "PDF preview and download before sending",
  "Works on phone, tablet, and laptop",
];

function DetailsIllustration({ color = "#9747E6" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-[220px] sm:max-w-[260px] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-transform duration-500 ease-out group-hover:scale-[1.03]">
        <div className="h-1.5 transition-all duration-500 ease-out group-hover:h-2" style={{ backgroundColor: color }} />
        <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
          <div className="h-2.5 w-3/4 bg-gray-100 rounded-full transition-all duration-500 ease-out group-hover:w-full group-hover:bg-gray-200" />
          <div className="h-2.5 w-1/2 bg-gray-100 rounded-full transition-all duration-500 ease-out delay-75 group-hover:w-2/3 group-hover:bg-gray-200" />
          {/* Payment toggle hint */}
          <div className="flex gap-0.5 rounded-md bg-gray-100 p-0.5 transition-all duration-300 delay-100 group-hover:bg-gray-200/70">
            <div className="flex-1 h-6 rounded bg-white shadow-sm flex items-center justify-center gap-1 transition-all duration-300 delay-150">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FFC300" }} />
              <div className="h-1.5 w-8 rounded-full bg-gray-300" />
            </div>
            <div className="flex-1 h-6 rounded flex items-center justify-center gap-1 transition-all duration-300 delay-200 group-hover:bg-white/50">
              <div className="w-2.5 h-2.5 rounded-sm bg-gray-300 transition-all duration-300 delay-200 group-hover:bg-gray-400" />
              <div className="h-1.5 w-6 rounded-full bg-gray-200 transition-all duration-300 delay-200 group-hover:bg-gray-300" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded-md border border-gray-200 bg-gray-50 transition-all duration-300 delay-250 group-hover:bg-gray-100" />
            <div className="h-8 flex-1 rounded-md border border-gray-200 bg-gray-50 transition-all duration-300 delay-300 group-hover:bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

const SWATCH_COLORS = ["#9747E6", "#2563eb", "#f59e0b", "#176636"];

function DesignIllustration({ color = "#9747E6", onColorChange }: { color?: string; onColorChange?: (c: string) => void }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex gap-3 sm:gap-4 items-end">
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
      <div className="w-full max-w-[220px] sm:max-w-[260px] rounded-xl border border-gray-200 bg-white shadow-sm p-3 sm:p-4 space-y-2.5 sm:space-y-3 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
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

const BANNER_SLIDES = [
  {
    label: "BUILT FOR EVERYDAY PEOPLE",
    heading: "Payment info that actually shows up on the invoice",
    desc: "No more copy-pasting MoMo numbers into notes. Structured, professional, always visible.",
  },
  {
    label: "MOBILE MONEY",
    heading: "Accept MoMo payments instantly",
    desc: "MTN MoMo, Telecel Cash, AirtelTigo Money \u2014 your client sees exactly how to pay.",
  },
  {
    label: "MULTI-CURRENCY",
    heading: "Send invoices in any currency",
    desc: "GHS, USD, EUR, GBP, NGN, and more. 9 currencies built right in.",
  },
  {
    label: "PROFESSIONAL",
    heading: "Clean invoices, ready in minutes",
    desc: "Pick a design, add your details, preview the PDF, and send \u2014 all from one place.",
  },
];

const SLIDE_INTERVAL = 4000;

function BannerSlideshow() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "exit" | "enter">("visible");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setPhase("exit");
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
      setPhase("enter");
      setTimeout(() => setPhase("visible"), 400);
    }, 400);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(advance, SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [advance]);

  const slide = BANNER_SLIDES[index];
  const animClass = phase === "exit" ? "slide-exit" : phase === "enter" ? "slide-enter" : "";

  return (
    <div>
      {/* Text content */}
      <div className="min-h-[140px] sm:min-h-[120px]">
        <div key={index} className={animClass}>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-3">
            {slide.label}
          </p>
          <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-snug max-w-md">
            {slide.heading}
          </h3>
          <p className="text-sm text-white/60 mt-2 max-w-sm leading-relaxed">
            {slide.desc}
          </p>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="flex gap-1.5 mt-6">
        {BANNER_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (i === index || phase !== "visible") return;
              if (timerRef.current) clearInterval(timerRef.current);
              setPhase("exit");
              setTimeout(() => {
                setIndex(i);
                setPhase("enter");
                setTimeout(() => setPhase("visible"), 400);
                timerRef.current = setInterval(advance, SLIDE_INTERVAL);
              }, 400);
            }}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === index ? 24 : 8,
              backgroundColor: i === index ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const STEP_CARDS = [
  { label: "DETAILS", title: "Enter your details", desc: "Company info, line items, and your MoMo or bank payment details.", key: "details" as const },
  { label: "DESIGN", title: "Pick a design", desc: "Choose a color and layout. See a live preview as you go.", key: "design" as const },
  { label: "COMPOSE", title: "Write the email", desc: "Customize the subject line and message body.", key: "compose" as const },
  { label: "DELIVER", title: "Send it", desc: "Review the PDF, then send directly from the app.", key: "deliver" as const },
];

const TESTIMONIALS = [
  { quote: "I used to send MoMo numbers in WhatsApp messages. Now my invoices look like they came from a real company.", name: "Kwame Mensah", role: "Founder, Mensah Creative Studio", initials: "KM" },
  { quote: "My clients abroad can pay in USD or GBP and I still track everything in cedis. The multi-currency support is a lifesaver.", name: "Abena Osei-Bonsu", role: "Freelance Developer", initials: "AO" },
  { quote: "Setting up took five minutes. I created my first invoice on my phone during a trotro ride. It just works.", name: "Kofi Asante", role: "IT Consultant, TechBridge Solutions", initials: "KA" },
];

const AVATAR_COLORS = [
  { bg: "bg-primary/10", text: "text-primary" },
  { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  { bg: "bg-primary/10", text: "text-primary" },
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
      <div className="max-w-6xl mx-auto">
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
              <div className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30">
                <div className="px-4 pt-4 pb-1 sm:px-6 sm:pt-6">
                  <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-1.5 transition-colors duration-500" style={{ color: accentColor }}>
                    {card.label}
                  </p>
                  <p className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {card.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="py-4 px-4 sm:h-44 sm:px-6">
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

function Testimonials() {
  return (
    <section className="relative z-10 px-4 sm:px-5 py-16 md:py-28">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">
              TRUSTED BY BUSINESSES
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-3">
              What people are saying
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
              Small businesses and freelancers across Ghana use Invoica every day.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <blockquote className="group cursor-default">
                <span className="block text-3xl font-serif leading-none text-primary/20 select-none mb-2 transition-colors duration-300 group-hover:text-primary">&ldquo;</span>
                <p className="text-sm italic text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300 group-hover:text-primary">
                  {t.quote}
                </p>
                <footer className="mt-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300 group-hover:text-primary">{t.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300 group-hover:text-primary/60">{t.role}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [navDark, setNavDark] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;
    // Shrink the observation area to just the navbar strip (top 56px).
    // rootMargin: top=0, right=0, bottom=-(viewportHeight - 56px), left=0
    // This way the banner only "intersects" when it overlaps the navbar itself.
    const updateMargin = () => {
      const vh = window.innerHeight;
      obs.disconnect();
      obs = new IntersectionObserver(
        ([entry]) => setNavDark(entry.isIntersecting),
        { rootMargin: `0px 0px -${vh - 56}px 0px`, threshold: 0 }
      );
      obs.observe(el);
    };
    let obs = new IntersectionObserver(
      ([entry]) => setNavDark(entry.isIntersecting),
      { rootMargin: `0px 0px -${window.innerHeight - 56}px 0px`, threshold: 0 }
    );
    obs.observe(el);
    window.addEventListener("resize", updateMargin);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", updateMargin);
    };
  }, []);

  const appHref = "/invoice/new/company";

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WaveBackground />

      {/* Nav */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
          navDark
            ? mounted && resolvedTheme !== "dark"
              ? "bg-[#7c3aed]/90 border-white/10"
              : "bg-[#1e0a3c]/90 border-white/10"
            : "bg-background/80 border-border/50"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/images/logo-full-colored-lightmode.svg"
              alt="invoica"
              width={100}
              height={28}
              className={`w-[70px] md:w-[100px] h-auto transition-all duration-300 ${
                navDark ? "brightness-0 invert" : "dark:brightness-0 dark:invert"
              }`}
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
                  className={`text-sm transition-colors hidden sm:block px-2 ${
                    navDark
                      ? "text-white/60 hover:text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
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
      <section className="relative z-10 max-w-6xl mx-auto px-5 pt-14 sm:pt-24 pb-4 sm:pb-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-[42px] font-semibold tracking-tight leading-[1.15] animate-fade-in-up">
            Invoice clients in minutes,
            <br className="hidden sm:block" /> not <RotatingWord />.
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg animate-fade-in-up-delay-1">
            Fill in the details, add your MoMo or bank info, pick a design,
            send. Supports 9 currencies including GHS, USD, EUR, and GBP.
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
      <section className="relative z-10 max-w-6xl mx-auto px-5 pt-8 sm:pt-12 pb-16 sm:pb-24">
        <div className="animate-fade-in-up-delay-3">
          <DemoInvoice />
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Payment showcase */}
      <section className="relative z-10 px-4 sm:px-5 py-16 md:py-28">
        <div className="max-w-6xl mx-auto">
          {/* Header row */}
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">
                  PAYMENT COLLECTION
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  Get paid your way
                </h2>
                <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-md">
                  Add your Mobile Money or bank details directly to the invoice.
                  Your client sees exactly how to pay you.
                </p>
              </div>
              <Button asChild size="sm" className="shrink-0 w-fit">
                <Link href={isAuthenticated ? appHref : "/login"}>
                  Try it now
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </Reveal>

          {/* Two feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Reveal delay={0.08} scale className="flex">
              <div className="group flex-1 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] p-5 sm:p-6 flex gap-4 items-start">
                <Smartphone className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:animate-[icon-shake_0.5s_ease-in-out]" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Mobile Money
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    MTN MoMo, Telecel Cash, or AirtelTigo Money.
                    Pick your provider, enter your number, done.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.16} scale className="flex">
              <div className="group flex-1 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] p-5 sm:p-6 flex gap-4 items-start">
                <Landmark className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:animate-[icon-shake_0.5s_ease-in-out]" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Bank Transfer
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    13 Ghanaian banks — GCB, Ecobank, Stanbic, and more.
                    Account number, branch, and SWIFT code included.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Large dark banner */}
          <Reveal delay={0.1} scale>
            <div
              ref={bannerRef}
              className="relative rounded-2xl overflow-hidden"
              style={{ backgroundImage: `url('/images/${mounted && resolvedTheme !== "dark" ? "slide1-light" : "slide1"}.svg')`, backgroundSize: "cover", backgroundPosition: "center bottom" }}
            >
              <div className="relative z-10 px-6 pt-12 pb-10 sm:px-10 sm:pt-16 sm:pb-14 md:px-12 md:pt-20 md:pb-16">
                <BannerSlideshow />

                {/* Stats row */}
                <div className="flex gap-10 sm:gap-14 mt-8 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-2xl font-semibold text-white tabular-nums">3</p>
                    <p className="text-[11px] text-white/40 mt-0.5">MoMo providers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white tabular-nums">13</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Ghanaian banks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white tabular-nums">9</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Currencies</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Mascot */}
      <section className="relative z-10 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-5 py-14 sm:py-20 flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
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
