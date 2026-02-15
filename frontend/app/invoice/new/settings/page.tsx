"use client";

import { useEffect, useState } from "react";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettingsStore } from "@/lib/settings-store";
import { useAuth } from "@/lib/auth";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { CURRENCIES } from "@/lib/currency";
import { LogOut, Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function SettingsPage() {
  const settings = useSettingsStore();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <WizardHeader stepLabel="Settings" />

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-5">
            <h1 className="text-lg font-semibold mb-0.5">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Preferences and defaults for your invoices.
            </p>
          </div>

          <div className="space-y-8">
            {/* Theme */}
            <section>
              <h2 className="text-sm font-medium mb-3">Theme</h2>
              {mounted && (
                <div className="flex gap-2">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors",
                          theme === option.value
                            ? "border-primary bg-primary/5 text-foreground font-medium"
                            : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Currency */}
            <section>
              <h2 className="text-sm font-medium mb-3">Default Currency</h2>
              <div className="max-w-xs">
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => settings.updateSettings({ defaultCurrency: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Company defaults */}
            <section>
              <h2 className="text-sm font-medium mb-1">Default Company Info</h2>
              <p className="text-xs text-muted-foreground mb-3">Auto-fills when creating new invoices.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defCompanyName" className="mb-2 block text-sm text-muted-foreground">Company Name</Label>
                  <Input id="defCompanyName" value={settings.defaultCompanyName} onChange={(e) => settings.updateSettings({ defaultCompanyName: e.target.value })} placeholder="Your Company" />
                </div>
                <div>
                  <Label htmlFor="defCompanyEmail" className="mb-2 block text-sm text-muted-foreground">Email</Label>
                  <Input id="defCompanyEmail" type="email" value={settings.defaultCompanyEmail} onChange={(e) => settings.updateSettings({ defaultCompanyEmail: e.target.value })} placeholder="billing@company.com" />
                </div>
                <div>
                  <Label htmlFor="defAddress" className="mb-2 block text-sm text-muted-foreground">Address</Label>
                  <Input id="defAddress" value={settings.defaultAddress} onChange={(e) => settings.updateSettings({ defaultAddress: e.target.value })} placeholder="123 Main St" />
                </div>
                <div>
                  <Label htmlFor="defCity" className="mb-2 block text-sm text-muted-foreground">City</Label>
                  <Input id="defCity" value={settings.defaultCity} onChange={(e) => settings.updateSettings({ defaultCity: e.target.value })} placeholder="City" />
                </div>
                <div>
                  <Label htmlFor="defZip" className="mb-2 block text-sm text-muted-foreground">Zip</Label>
                  <Input id="defZip" value={settings.defaultZipCode} onChange={(e) => settings.updateSettings({ defaultZipCode: e.target.value })} placeholder="10001" />
                </div>
                <div>
                  <Label htmlFor="defCountry" className="mb-2 block text-sm text-muted-foreground">Country</Label>
                  <Input id="defCountry" value={settings.defaultCountry} onChange={(e) => settings.updateSettings({ defaultCountry: e.target.value })} placeholder="USA" />
                </div>
                <div>
                  <Label htmlFor="defPhone" className="mb-2 block text-sm text-muted-foreground">Phone</Label>
                  <Input id="defPhone" value={settings.defaultPhone} onChange={(e) => settings.updateSettings({ defaultPhone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </section>

            {/* Invoice numbering */}
            <section>
              <h2 className="text-sm font-medium mb-3">Invoice Numbering</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prefix" className="mb-2 block text-sm text-muted-foreground">Prefix</Label>
                  <Input id="prefix" value={settings.invoicePrefix} onChange={(e) => settings.updateSettings({ invoicePrefix: e.target.value })} placeholder="INV-" />
                </div>
                <div>
                  <Label htmlFor="nextNum" className="mb-2 block text-sm text-muted-foreground">Next Number</Label>
                  <Input id="nextNum" type="number" value={settings.nextInvoiceNumber} onChange={(e) => settings.updateSettings({ nextInvoiceNumber: parseInt(e.target.value) || 1 })} min={1} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Next invoice: <span className="font-medium text-foreground">{settings.getNextInvoiceNumber()}</span>
              </p>
            </section>

            {/* Email defaults */}
            <section>
              <h2 className="text-sm font-medium mb-3">Email Defaults</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="defSubject" className="mb-2 block text-sm text-muted-foreground">Default Subject</Label>
                  <Input id="defSubject" value={settings.defaultEmailSubject} onChange={(e) => settings.updateSettings({ defaultEmailSubject: e.target.value })} placeholder="Invoice {number} from {company}" />
                </div>
                <div>
                  <Label htmlFor="defMessage" className="mb-2 block text-sm text-muted-foreground">Default Message</Label>
                  <Textarea id="defMessage" value={settings.defaultEmailMessage} onChange={(e) => settings.updateSettings({ defaultEmailMessage: e.target.value })} rows={5} placeholder="Hi,&#10;&#10;Please find attached..." />
                </div>
              </div>
            </section>

            {/* Theme defaults */}
            <section>
              <h2 className="text-sm font-medium mb-3">Invoice Theme</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defColor" className="mb-2 block text-sm text-muted-foreground">Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="defColor"
                      type="color"
                      value={settings.defaultColor}
                      onChange={(e) => settings.updateSettings({ defaultColor: e.target.value })}
                      className="w-10 h-10 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={settings.defaultColor}
                      onChange={(e) => settings.updateSettings({ defaultColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="defFont" className="mb-2 block text-sm text-muted-foreground">Default Font</Label>
                  <select
                    id="defFont"
                    value={settings.defaultFont}
                    onChange={(e) => settings.updateSettings({ defaultFont: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {fonts.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Account */}
            <section>
              <h2 className="text-sm font-medium mb-3">Account</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                  {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{user?.name || "Guest"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "guest@invoica.app"}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </Button>
            </section>
          </div>

          {/* Auto-save note */}
          <div className="flex items-center justify-center gap-1.5 mt-8 pb-4 text-xs text-muted-foreground">
            <Check className="w-3.5 h-3.5" />
            Settings save automatically
          </div>
        </div>
      </div>
    </>
  );
}
