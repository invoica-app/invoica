"use client";

import { useEffect, useState } from "react";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSettingsStore } from "@/lib/settings-store";
import { useAuth } from "@/lib/auth";
import { handleSignOut } from "@/lib/sign-out";
import { useTheme } from "next-themes";
import { CURRENCIES } from "@/lib/currency";
import {
  LogOut,
  Sun,
  Moon,
  Monitor,
  Check,
  MessageSquare,
  Building2,
  Hash,
  Mail,
  Palette,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppFooter } from "@/components/app-footer";
import { HydrationGuard } from "@/components/hydration-guard";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { SettingsSkeleton } from "./loading";

const fonts = [
  { value: "Inter", label: "Inter" },
  { value: "Satoshi", label: "Satoshi" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Courier New", label: "Courier New" },
];

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function avatarUrl(seed: string, size = 40): string {
  return `https://api.navii.dev/avatar/${encodeURIComponent(seed)}?size=${size}`;
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-muted-foreground mb-1.5"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const settings = useSettingsStore();
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const seed = user?.email || user?.name || "guest";

  return (
    <HydrationGuard fallback={<SettingsSkeleton />}>
      <WizardHeader stepLabel="Settings" />

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-0.5">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Preferences and defaults for your invoices.
            </p>
          </div>

          <div className="space-y-4">
            {/* Account */}
            <section className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3">
                  {authLoading ? (
                    <div className="w-11 h-11 rounded-full bg-muted animate-pulse shrink-0" />
                  ) : (
                    <img
                      src={avatarUrl(seed)}
                      alt={user?.name || "Guest"}
                      className="w-11 h-11 rounded-full shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {authLoading ? (
                      <>
                        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-40 bg-muted/60 rounded animate-pulse mt-1.5" />
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold truncate">{user?.name || "Guest"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email || "guest@invoica.app"}</p>
                      </>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Log out</span>
                  </Button>
                </div>
              </div>
            </section>

            {/* Theme */}
            <Section icon={Sun} title="Appearance">
              {mounted && (
                <div className="flex gap-2">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-2 px-4 py-3 rounded-lg border text-sm transition-all",
                          isActive
                            ? "border-primary bg-primary/5 text-foreground font-medium shadow-sm"
                            : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </Section>

            {/* Invoice theme */}
            <Section icon={Palette} title="Invoice Theme" description="Colors and fonts for your invoices">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="defColor" className="block text-xs font-medium text-muted-foreground mb-1.5">Primary color</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="defColor"
                      type="color"
                      value={settings.defaultColor}
                      onChange={(e) => settings.updateSettings({ defaultColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0"
                    />
                    <Input
                      value={settings.defaultColor}
                      onChange={(e) => settings.updateSettings({ defaultColor: e.target.value })}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
                <Field label="Default font" htmlFor="defFont">
                  <select
                    id="defFont"
                    value={settings.defaultFont}
                    onChange={(e) => settings.updateSettings({ defaultFont: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border/60 bg-muted/30 text-sm shadow-sm transition-all duration-200 hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:bg-background"
                  >
                    {fonts.map((f) => (
                      <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Default currency" htmlFor="defCurrency">
                  <select
                    id="defCurrency"
                    value={settings.defaultCurrency}
                    onChange={(e) => settings.updateSettings({ defaultCurrency: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border/60 bg-muted/30 text-sm shadow-sm transition-all duration-200 hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:bg-background"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol}) — {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </Section>

            {/* Company defaults */}
            <Section icon={Building2} title="Company Info" description="Auto-fills when creating new invoices">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company name" htmlFor="defCompanyName">
                  <Input id="defCompanyName" value={settings.defaultCompanyName} onChange={(e) => settings.updateSettings({ defaultCompanyName: e.target.value })} placeholder="Your Company" />
                </Field>
                <Field label="Email" htmlFor="defCompanyEmail">
                  <Input id="defCompanyEmail" type="email" value={settings.defaultCompanyEmail} onChange={(e) => settings.updateSettings({ defaultCompanyEmail: e.target.value })} placeholder="billing@company.com" />
                </Field>
                <Field label="Address" htmlFor="defAddress">
                  <Input id="defAddress" value={settings.defaultAddress} onChange={(e) => settings.updateSettings({ defaultAddress: e.target.value })} placeholder="123 Main St" />
                </Field>
                <Field label="City" htmlFor="defCity">
                  <Input id="defCity" value={settings.defaultCity} onChange={(e) => settings.updateSettings({ defaultCity: e.target.value })} placeholder="City" />
                </Field>
                <Field label="Zip" htmlFor="defZip">
                  <Input id="defZip" value={settings.defaultZipCode} onChange={(e) => settings.updateSettings({ defaultZipCode: e.target.value })} placeholder="10001" />
                </Field>
                <Field label="Country" htmlFor="defCountry">
                  <Input id="defCountry" value={settings.defaultCountry} onChange={(e) => settings.updateSettings({ defaultCountry: e.target.value })} placeholder="USA" />
                </Field>
                <Field label="Phone" htmlFor="defPhone">
                  <Input id="defPhone" value={settings.defaultPhone} onChange={(e) => settings.updateSettings({ defaultPhone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </Field>
              </div>
            </Section>

            {/* Invoice numbering */}
            <Section icon={Hash} title="Invoice Numbering">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Prefix" htmlFor="prefix">
                  <Input id="prefix" value={settings.invoicePrefix} onChange={(e) => settings.updateSettings({ invoicePrefix: e.target.value })} placeholder="INV-" />
                </Field>
                <Field label="Initial number" htmlFor="nextNum">
                  <Input id="nextNum" type="number" value={settings.nextInvoiceNumber} onChange={(e) => settings.updateSettings({ nextInvoiceNumber: parseInt(e.target.value) || 1 })} min={1} />
                </Field>
              </div>
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                <ChevronRight className="w-3 h-3 shrink-0" />
                Next invoice: <span className="font-semibold text-foreground">{settings.getNextInvoiceNumber()}</span>
              </div>
            </Section>

            {/* Email defaults */}
            <Section icon={Mail} title="Email Defaults" description="Template for invoice emails">
              <div className="space-y-4">
                <Field label="Default subject" htmlFor="defSubject">
                  <Input id="defSubject" value={settings.defaultEmailSubject} onChange={(e) => settings.updateSettings({ defaultEmailSubject: e.target.value })} placeholder="Invoice {number} from {company}" />
                </Field>
                <Field label="Default message" htmlFor="defMessage">
                  <Textarea id="defMessage" value={settings.defaultEmailMessage} onChange={(e) => settings.updateSettings({ defaultEmailMessage: e.target.value })} rows={5} placeholder="Hi,&#10;&#10;Please find attached..." />
                </Field>
              </div>
            </Section>

            {/* Feedback — mobile only */}
            <section className="md:hidden rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold">Feedback</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFeedbackOpen(true)}
                className="gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Send Feedback
              </Button>
            </section>
          </div>

          {/* Auto-save note */}
          <div className="flex items-center justify-center gap-1.5 mt-6 pb-4 text-xs text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            Settings save automatically
          </div>
        </div>
      </div>

      <AppFooter />

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </HydrationGuard>
  );
}
