"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useInvoiceStore } from "@/lib/store";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const wizardSteps = [
  { href: "/invoice/new/company", label: "Company Info", icon: Building2 },
  { href: "/invoice/new/details", label: "Invoice Details", icon: FileText },
  { href: "/invoice/new/design", label: "Select Design", icon: Palette },
  { href: "/invoice/new/email", label: "Email Details", icon: Mail },
  { href: "/invoice/new/review", label: "Send Invoice", icon: Send },
];

const mobileNavItems = [
  { href: "/invoice/new/history", label: "History", icon: ClipboardList },
  { href: "/invoice/new/company", label: "Create", icon: Plus },
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

function hasDraftData(state: ReturnType<typeof useInvoiceStore.getState>): boolean {
  return !!(
    state.companyName ||
    state.clientEmail ||
    state.lineItems.length > 0 ||
    state.invoiceNumber
  );
}

export function WizardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const reset = useInvoiceStore((state) => state.reset);
  const [showPopover, setShowPopover] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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

  const handleNewInvoice = (e: React.MouseEvent) => {
    const state = useInvoiceStore.getState();
    if (hasDraftData(state)) {
      e.preventDefault();
      setShowDraftDialog(true);
      return;
    }
    reset();
  };

  const confirmDiscard = () => {
    setShowDraftDialog(false);
    reset();
    router.push("/invoice/new/company");
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const expanded = !collapsed;

  return (
    <>
      <ConfirmDialog
        open={showDraftDialog}
        onCancel={() => setShowDraftDialog(false)}
        onConfirm={confirmDiscard}
        title="Discard current draft?"
        description="You have unsaved invoice data. Starting fresh will clear your current progress. This can't be undone."
        confirmLabel="Discard & start new"
        cancelLabel="Keep editing"
        variant="destructive"
      />

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex bg-card border-r border-border py-5 flex-col shrink-0 h-screen sticky top-0 overflow-y-auto transition-all duration-200",
          expanded ? "w-[240px] px-4" : "w-[60px] px-2"
        )}
      >
        {/* Top row: logo + collapse toggle */}
        <div className={cn("flex items-center mb-5", expanded ? "justify-between px-2" : "justify-center")}>
          {expanded && (
            <Link href="/" className="text-lg font-semibold tracking-tight">
              invoica
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/50 transition-colors"
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* New Invoice CTA */}
        <Link
          href="/invoice/new/company"
          onClick={handleNewInvoice}
          className={cn(
            "flex items-center justify-center gap-2 mb-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors",
            expanded ? "px-4 py-2" : "py-2"
          )}
          title={collapsed ? "New invoice" : undefined}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {expanded && "New invoice"}
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5">
          <SidebarLink
            href="/invoice/new/history"
            icon={ClipboardList}
            label="Invoice History"
            active={pathname === "/invoice/new/history"}
            collapsed={collapsed}
          />

          <div className={cn("my-2.5 border-t border-border/60", expanded ? "mx-2.5" : "mx-1")} />

          {wizardSteps.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              collapsed={collapsed}
            />
          ))}

          <div className={cn("my-2.5 border-t border-border/60", expanded ? "mx-2.5" : "mx-1")} />

          <SidebarLink
            href="/invoice/new/settings"
            icon={Settings}
            label="Settings"
            active={pathname === "/invoice/new/settings"}
            collapsed={collapsed}
          />
        </nav>

        {/* Theme Toggle */}
        <div className="pt-3 border-t border-border/60">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center w-full rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors",
              expanded ? "gap-3 px-2.5 py-2" : "justify-center py-2"
            )}
            title={collapsed ? (mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode") : undefined}
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 shrink-0" />
            )}
            {expanded && (mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode")}
          </button>
        </div>

        {/* User Profile */}
        <div className="mt-1 pt-3 border-t border-border/60 relative" ref={popoverRef}>
          {showPopover && (
            <div
              className={cn(
                "absolute bottom-full mb-2 bg-card rounded-lg shadow-lg border border-border p-2 z-50",
                expanded ? "left-0 right-0" : "left-0 w-48"
              )}
            >
              <div className="px-2.5 py-2 mb-1">
                <p className="text-sm font-medium truncate">{user?.name || "Guest"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "guest@invoica.app"}</p>
              </div>
              <div className="border-t border-border/60 pt-1">
                <Link
                  href="/invoice/new/settings"
                  onClick={() => setShowPopover(false)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors w-full"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log out
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowPopover(!showPopover)}
            className={cn(
              "flex items-center w-full rounded-lg hover:bg-accent/50 transition-colors",
              expanded ? "gap-2.5 px-2 py-2" : "justify-center py-2"
            )}
            title={collapsed ? (user?.name || "Guest") : undefined}
          >
            {isGuest ? (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[11px] font-medium shrink-0">
                G
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-[11px] shrink-0">
                {initials}
              </div>
            )}
            {expanded && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{user?.name || "Guest"}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">Free</p>
                </div>
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border px-2 py-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href === "/invoice/new/company" &&
              ["/invoice/new/company", "/invoice/new/details", "/invoice/new/design", "/invoice/new/email"].includes(pathname));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-lg text-sm transition-colors",
        collapsed ? "justify-center py-2" : "gap-3 px-2.5 py-2",
        active
          ? "text-foreground bg-accent font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && label}
    </Link>
  );
}
