"use client";

import { useState, useEffect } from "react";
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
import { Save, LogOut, Sun, Moon, Monitor } from "lucide-react";
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
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <WizardHeader stepLabel="Settings" />

      <div className="flex-1 p-4 md:p-8 bg-secondary overflow-auto">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-3xl font-semibold mb-1 md:mb-2">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account and application preferences.
            </p>
          </div>

          {/* Theme */}
          <div className="bg-card rounded-xl shadow-sm p-4 md:p-6 border border-border">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Theme</h2>
            <p className="text-sm text-muted-foreground mb-3 md:mb-4">Choose your preferred appearance.</p>
            {mounted && (
              <div className="flex gap-2 md:gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        "flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border-2 text-sm font-medium transition-colors",
                        theme === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Default Currency */}
          <div className="bg-card rounded-xl shadow-sm p-4 md:p-6 border border-border">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Default Currency</h2>
            <div className="max-w-xs">
              <Label htmlFor="currency" className="mb-2 block text-sm text-muted-foreground">Currency</Label>
              <select
                id="currency"
                value={settings.defaultCurrency}
                onChange={(e) => settings.updateSettings({ defaultCurrency: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Default Company Info */}
          <div className="bg-card rounded-xl shadow-sm p-4 md:p-6 border border-border">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Default Company Info</h2>
            <p className="text-sm text-muted-foreground mb-3 md:mb-4">These will auto-fill when creating new invoices.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defCompanyName" className="mb-2 block text-sm text-muted-foreground">Company Name</Label>
                <Input
                  id="defCompanyName"
                  value={settings.defaultCompanyName}
                  onChange={(e) => settings.updateSettings({ defaultCompanyName: e.target.value })}
                  placeholder="Your Company"
                />
              </div>
              <div>
                <Label htmlFor="defCompanyEmail" className="mb-2 block text-sm text-muted-foreground">Email</Label>
                <Input
                  id="defCompanyEmail"
                  type="email"
                  value={settings.defaultCompanyEmail}
                  onChange={(e) => settings.updateSettings({ defaultCompanyEmail: e.target.value })}
                  placeholder="billing@company.com"
                />
              </div>
              <div>
                <Label htmlFor="defAddress" className="mb-2 block text-sm text-muted-foreground">Address</Label>
                <Input
                  id="defAddress"
                  value={settings.defaultAddress}
                  onChange={(e) => settings.updateSettings({ defaultAddress: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="defCity" className="mb-2 block text-sm text-muted-foreground">City</Label>
                <Input
                  id="defCity"
                  value={settings.defaultCity}
                  onChange={(e) => settings.updateSettings({ defaultCity: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="defZip" className="mb-2 block text-sm text-muted-foreground">Zip Code</Label>
                <Input
                  id="defZip"
                  value={settings.defaultZipCode}
                  onChange={(e) => settings.updateSettings({ defaultZipCode: e.target.value })}
                  placeholder="10001"
                />
              </div>
              <div>
                <Label htmlFor="defCountry" className="mb-2 block text-sm text-muted-foreground">Country</Label>
                <Input
                  id="defCountry"
                  value={settings.defaultCountry}
                  onChange={(e) => settings.updateSettings({ defaultCountry: e.target.value })}
                  placeholder="USA"
                />
              </div>
              <div>
                <Label htmlFor="defPhone" className="mb-2 block text-sm text-muted-foreground">Phone</Label>
                <Input
                  id="defPhone"
                  value={settings.defaultPhone}
                  onChange={(e) => settings.updateSettings({ defaultPhone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Invoice Numbering */}
          <div className="bg-card rounded-xl shadow-sm p-4 md:p-6 border border-border">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Invoice Numbering</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prefix" className="mb-2 block text-sm text-muted-foreground">Prefix</Label>
                <Input
                  id="prefix"
                  value={settings.invoicePrefix}
                  onChange={(e) => settings.updateSettings({ invoicePrefix: e.target.value })}
                  placeholder="INV-"
                />
              </div>
              <div>
                <Label htmlFor="nextNum" className="mb-2 block text-sm text-muted-foreground">Next Number</Label>
                <Input
                  id="nextNum"
                  type="number"
                  value={settings.nextInvoiceNumber}
                  onChange={(e) => settings.updateSettings({ nextInvoiceNumber: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Next invoice: <span className="font-medium">{settings.getNextInvoiceNumber()}</span>
            </p>
          </div>

          {/* Email Defaults */}
          <div className="bg-card rounded-xl shadow-sm p-4 md:p-6 border border-border">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Email Defaults</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="defSubject" className="mb-2 block text-sm text-muted-foreground">Default Subject</Label>
                <Input
                  id="defSubject"
                  value={settings.defaultEmailSubject}
                  onChange={(e) => settings.updateSettings({ defaultEmailSubject: e.target.value })}
                  placeholder="Invoice {number} from {company}"
                />
              </div>
              <div>
                <Label htmlFor="defMessage" className="mb-2 block text-sm text-muted-foreground">Default Message</Label>
                <Textarea
                  id="defMessage"
                  value={settings.defaultEmailMessage}
                  onChange={(e) => settings.updateSettings({ defaultEmailMessage: e.target.value })}
                  rows={5}
                  placeholder="Hi,&#10;&#10;Please find attached the invoice for our recent services.&#10;&#10;Thanks"
                />
              </div>
            </div>
          </div>

          {/* Theme Defaults */}
          <div className="bg-card rounded-xl shadow-sm p-4 md:p-6 border border-border">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Theme Defaults</h2>
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
                  className="w-full h-10 px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {fonts.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="bg-card rounded-xl shadow-sm p-4 md:p-6 border border-border">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Account</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name || "Guest User"}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{user?.email || "guest@invoica.app"}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </Button>
          </div>

          {/* Save button */}
          <div className="flex justify-end pb-8">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              {saved ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
