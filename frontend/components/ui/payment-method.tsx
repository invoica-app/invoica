"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";
import { Info, Smartphone, Landmark } from "lucide-react";
import type { PaymentMethodType, MomoProvider } from "@/lib/types";
import type { PhoneCountry } from "@/lib/phone-countries";

/** MTN: yellow rounded rect with black oval + black "MTN" text */
function MtnLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 20" className={className} aria-hidden="true">
      <rect width="36" height="20" rx="4" fill="#FFC300" />
      <ellipse cx="18" cy="10" rx="13" ry="7.5" fill="none" stroke="#000" strokeWidth="1.8" />
      <text x="18" y="14" textAnchor="middle" fontWeight="900" fontSize="10" fontFamily="Arial, sans-serif" fill="#000">
        MTN
      </text>
    </svg>
  );
}

/** Telecel: red circle with white "t" cutout */
function TelecelLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#E30613" />
      <text x="10" y="15" textAnchor="middle" fontWeight="700" fontSize="14" fontFamily="Arial, sans-serif" fill="#fff">
        t
      </text>
    </svg>
  );
}

/** AirtelTigo: navy top with red wavy bottom, white "at" */
function AirtelTigoLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <rect width="20" height="20" rx="4" fill="#1B2B6B" />
      <path d="M0 12 Q5 9 10 12 Q15 15 20 12 L20 20 Q15 17 10 20 Q5 23 0 20 Z" fill="#E30613" />
      <text x="10" y="13" textAnchor="middle" fontWeight="700" fontSize="10" fontFamily="Arial, sans-serif" fill="#fff">
        at
      </text>
    </svg>
  );
}

const PROVIDER_LOGOS: Record<MomoProvider, React.FC<{ className?: string }>> = {
  mtn: MtnLogo,
  telecel: TelecelLogo,
  airteltigo: AirtelTigoLogo,
};

const MOMO_PROVIDERS: {
  id: MomoProvider;
  label: string;
  color: string;
  activeBg: string;
  placeholder: string;
}[] = [
  { id: "mtn", label: "MTN MoMo", color: "border-yellow-400", activeBg: "bg-yellow-400/10", placeholder: "24 123 4567" },
  { id: "telecel", label: "Telecel Cash", color: "border-red-500", activeBg: "bg-red-500/10", placeholder: "20 123 4567" },
  { id: "airteltigo", label: "AirtelTigo", color: "border-blue-500", activeBg: "bg-blue-500/10", placeholder: "27 123 4567" },
];

const GHANAIAN_BANKS = [
  "GCB Bank",
  "Ecobank Ghana",
  "Stanbic Bank",
  "Absa Bank Ghana",
  "Fidelity Bank",
  "CalBank",
  "Zenith Bank Ghana",
  "Republic Bank",
  "Societe Generale Ghana",
  "First National Bank",
  "Standard Chartered",
  "Access Bank Ghana",
  "UBA Ghana",
];

interface PaymentMethodProps {
  method: PaymentMethodType;
  momoProvider: MomoProvider;
  momoAccountName: string;
  momoNumber: string;
  momoCountryCode: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankSwiftCode: string;
  onChange: (data: Partial<{
    paymentMethod: PaymentMethodType;
    momoProvider: MomoProvider;
    momoAccountName: string;
    momoNumber: string;
    momoCountryCode: string;
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankBranch: string;
    bankSwiftCode: string;
  }>) => void;
}

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-muted-foreground mb-1.5"
      >
        {label}
        {optional && <span className="ml-1 opacity-50">optional</span>}
      </label>
      {children}
    </div>
  );
}

export function PaymentMethod({
  method,
  momoProvider,
  momoAccountName,
  momoNumber,
  momoCountryCode,
  bankName,
  bankAccountName,
  bankAccountNumber,
  bankBranch,
  bankSwiftCode,
  onChange,
}: PaymentMethodProps) {
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleMethodChange = (m: PaymentMethodType) => {
    if (m === method) return;
    setVisible(false);
    setAnimating(true);
    setTimeout(() => {
      onChange({ paymentMethod: m });
      setVisible(true);
      setTimeout(() => setAnimating(false), 200);
    }, 150);
  };

  return (
    <div className="space-y-4">
      {/* Segmented control */}
      <div className="flex rounded-lg border border-border/60 bg-muted/30 p-0.5">
        <button
          type="button"
          onClick={() => handleMethodChange("momo")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all duration-200",
            method === "momo"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Smartphone className="w-4 h-4" />
          Mobile Money
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange("bank")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all duration-200",
            method === "bank"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Landmark className="w-4 h-4" />
          Bank Transfer
        </button>
      </div>

      {/* Fields with transition */}
      <div
        className={cn(
          "transition-all duration-200",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        )}
      >
        {method === "momo" ? (
          <MomoFields
            provider={momoProvider}
            accountName={momoAccountName}
            number={momoNumber}
            countryCode={momoCountryCode}
            onChange={onChange}
          />
        ) : (
          <BankFields
            bankName={bankName}
            accountName={bankAccountName}
            accountNumber={bankAccountNumber}
            branch={bankBranch}
            swiftCode={bankSwiftCode}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}

function MomoFields({
  provider,
  accountName,
  number,
  countryCode,
  onChange,
}: {
  provider: MomoProvider;
  accountName: string;
  number: string;
  countryCode: string;
  onChange: PaymentMethodProps["onChange"];
}) {
  return (
    <div className="space-y-4">
      {/* Provider chips */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          Provider
        </label>
        <div className="flex gap-2">
          {MOMO_PROVIDERS.map((p) => {
            const Logo = PROVIDER_LOGOS[p.id];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ momoProvider: p.id })}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all duration-200",
                  provider === p.id
                    ? `${p.color} ${p.activeBg} text-foreground`
                    : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
                )}
              >
                <Logo className={cn("shrink-0", p.id === "mtn" ? "w-7 h-4" : "w-4 h-4")} />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Account name" htmlFor="momoAccountName">
        <Input
          id="momoAccountName"
          value={accountName}
          onChange={(e) => onChange({ momoAccountName: e.target.value })}
          placeholder="e.g. Kwame Asante"
        />
      </Field>

      <Field label="MoMo number">
        <PhoneInput
          countryCode={countryCode}
          value={number}
          onChange={(val) => onChange({ momoNumber: val })}
          onCountryChange={(c: PhoneCountry) => onChange({ momoCountryCode: c.iso })}
          placeholder={MOMO_PROVIDERS.find((p) => p.id === provider)?.placeholder ?? "24 123 4567"}
        />
      </Field>

      {/* Info hint */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
        <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          This will appear on the invoice as your MoMo payment details for your client.
        </p>
      </div>
    </div>
  );
}

function BankFields({
  bankName,
  accountName,
  accountNumber,
  branch,
  swiftCode,
  onChange,
}: {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  swiftCode: string;
  onChange: PaymentMethodProps["onChange"];
}) {
  return (
    <div className="space-y-4">
      <Field label="Bank name" htmlFor="bankName">
        <select
          id="bankName"
          value={bankName}
          onChange={(e) => onChange({ bankName: e.target.value })}
          className="flex h-10 w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm shadow-sm transition-all duration-200 hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:bg-background"
        >
          <option value="">Select your bank</option>
          {GHANAIAN_BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Account name" htmlFor="bankAccountName">
        <Input
          id="bankAccountName"
          value={accountName}
          onChange={(e) => onChange({ bankAccountName: e.target.value })}
          placeholder="e.g. Kwame Asante"
        />
      </Field>

      <Field label="Account number" htmlFor="bankAccountNumber">
        <Input
          id="bankAccountNumber"
          value={accountNumber}
          onChange={(e) => onChange({ bankAccountNumber: e.target.value })}
          placeholder="0012345678901"
          className="font-mono"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Branch" htmlFor="bankBranch" optional>
          <Input
            id="bankBranch"
            value={branch}
            onChange={(e) => onChange({ bankBranch: e.target.value })}
            placeholder="e.g. Accra Main"
          />
        </Field>
        <Field label="SWIFT code" htmlFor="bankSwiftCode" optional>
          <Input
            id="bankSwiftCode"
            value={swiftCode}
            onChange={(e) =>
              onChange({ bankSwiftCode: e.target.value.toUpperCase() })
            }
            placeholder="e.g. GHCBGHAC"
            className="font-mono uppercase"
          />
        </Field>
      </div>

      {/* Info hint */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
        <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Bank details will be displayed on the invoice for wire/bank transfers.
        </p>
      </div>
    </div>
  );
}
