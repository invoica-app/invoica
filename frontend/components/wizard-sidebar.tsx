"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  ClipboardList,
  Building2,
  FileText,
  Palette,
  Mail,
  Send,
  Settings,
  Plus,
  LogOut,
  ChevronUp,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useInvoiceStore } from "@/lib/store";

const wizardSteps = [
  { href: "/invoice/new/company", label: "Company Info", icon: Building2 },
  { href: "/invoice/new/details", label: "Invoice Details", icon: FileText },
  { href: "/invoice/new/design", label: "Select Design", icon: Palette },
  { href: "/invoice/new/email", label: "Email Details", icon: Mail },
  { href: "/invoice/new/review", label: "Send Invoice", icon: Send },
  { href: "/invoice/new/settings", label: "Settings", icon: Settings },
];

const mobileNavItems = [
  { href: "/invoice/new/history", label: "History", icon: ClipboardList },
  { href: "/invoice/new/company", label: "Company", icon: Building2 },
  { href: "/invoice/new/details", label: "Details", icon: FileText },
  { href: "/invoice/new/design", label: "Design", icon: Palette },
  { href: "/invoice/new/email", label: "Email", icon: Mail },
  { href: "/invoice/new/review", label: "Send", icon: Send },
  { href: "/invoice/new/settings", label: "Settings", icon: Settings },
];

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function WizardSidebar() {
  const pathname = usePathname();
  const { user, isGuest } = useAuth();
  const reset = useInvoiceStore((state) => state.reset);
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const initials = getInitials(user?.name);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    }
    if (showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPopover]);

  const handleNewInvoice = () => {
    reset();
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[260px] bg-secondary border-r border-border p-6 flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold">Invoica</h1>
        </div>

        {/* New Invoice CTA */}
        <Link
          href="/invoice/new/company"
          onClick={handleNewInvoice}
          className="flex items-center justify-center gap-2 px-4 py-2.5 mb-4 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {/* Invoice History */}
          <Link
            href="/invoice/new/history"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors relative",
              pathname === "/invoice/new/history"
                ? "text-primary bg-primary/8"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {pathname === "/invoice/new/history" && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r" />
            )}
            <ClipboardList className="w-5 h-5" />
            Invoice History
          </Link>

          <div className="my-3 border-t border-border" />

          {/* Wizard Steps */}
          {wizardSteps.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors relative",
                  isActive
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r" />
                )}
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            {mounted && resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* User Profile + Logout */}
        <div className="mt-2 pt-4 border-t border-border relative" ref={popoverRef}>
          {showPopover && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card rounded-lg shadow-lg border border-border p-3 z-50">
              <div className="mb-3 pb-3 border-b border-border">
                <p className="font-medium text-sm">{user?.name || "Guest"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "guest@invoica.app"}</p>
              </div>
              <Link
                href="/invoice/new/settings"
                onClick={() => setShowPopover(false)}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded-md transition-colors w-full"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-500/10 rounded-md transition-colors w-full mt-1"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
          <button
            onClick={() => setShowPopover(!showPopover)}
            className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            {isGuest ? (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium shrink-0">
                G
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Guest"}</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 py-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-[56px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
