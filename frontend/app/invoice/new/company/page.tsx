"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountrySelect } from "@/components/ui/country-select";
import { useInvoiceStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { Upload, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
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
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function CompanyInfoPage() {
  const router = useRouter();
  const api = useAuthenticatedApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    companyName,
    address,
    city,
    zipCode,
    country,
    phone,
    companyEmail,
    companyLogo,
  } = useInvoiceStore(
    useShallow((s) => ({
      companyName: s.companyName,
      address: s.address,
      city: s.city,
      zipCode: s.zipCode,
      country: s.country,
      phone: s.phone,
      companyEmail: s.companyEmail,
      companyLogo: s.companyLogo,
    }))
  );
  const updateCompany = useInvoiceStore((s) => s.updateCompany);

  const [formData, setFormData] = useState({
    companyName,
    address,
    city,
    zipCode,
    country,
    phone,
    companyEmail,
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(companyLogo);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File must be smaller than 5MB.");
      return;
    }

    setUploadError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoUrl(base64);
      updateCompany({ companyLogo: base64 });
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const result = await api.uploadLogo(file);
      setLogoUrl(result.url);
      updateCompany({ companyLogo: result.url });
    } catch {
      // base64 fallback already set
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    updateCompany({ companyLogo: null });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.companyName.trim()) e.companyName = "Required";
    if (!formData.address.trim()) e.address = "Required";
    if (!formData.city.trim()) e.city = "Required";
    if (!formData.zipCode.trim()) e.zipCode = "Required";
    if (!formData.country.trim()) e.country = "Required";
    if (!formData.phone.trim()) e.phone = "Required";
    if (!formData.companyEmail.trim()) {
      e.companyEmail = "Required";
    } else if (!isValidEmail(formData.companyEmail)) {
      e.companyEmail = "Enter a valid email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    updateCompany(formData);
    router.push("/invoice/new/details");
  };

  return (
    <>
      <WizardHeader stepLabel="Step 1 of 5" />

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-0.5">Company Information</h1>
            <p className="text-sm text-muted-foreground">
              Your business details for the invoice header.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Logo */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Company logo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {logoUrl ? (
                  <div className="relative border border-border rounded-lg p-4 flex items-center justify-center bg-card h-[120px]">
                    <img
                      src={logoUrl}
                      alt="Company logo"
                      className="object-contain max-h-20 max-w-full"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="border border-dashed border-border rounded-lg h-[120px] flex flex-col items-center justify-center hover:border-muted-foreground/40 transition-colors cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 mb-1.5 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 mb-1.5 text-muted-foreground" />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {uploading ? "Uploading..." : "Upload logo"}
                    </p>
                  </div>
                )}
                {uploadError && (
                  <p className="mt-1.5 text-xs text-destructive">{uploadError}</p>
                )}
              </div>

              {/* Company Name */}
              <Field label="Company name" htmlFor="companyName" error={errors.companyName}>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => {
                    setFormData({ ...formData, companyName: e.target.value });
                    clearError("companyName");
                  }}
                  placeholder="Acme Corp"
                  className={cn(errors.companyName && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20")}
                />
              </Field>
            </div>

            <Field label="Address" htmlFor="address" error={errors.address}>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => { setFormData({ ...formData, address: e.target.value }); clearError("address"); }}
                placeholder="123 Business St"
                className={cn(errors.address && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20")}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="City" htmlFor="city" error={errors.city}>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => { setFormData({ ...formData, city: e.target.value }); clearError("city"); }}
                  placeholder="Tech City"
                  className={cn(errors.city && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20")}
                />
              </Field>
              <Field label="Zip / Postal code" htmlFor="zipCode" error={errors.zipCode}>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => { setFormData({ ...formData, zipCode: e.target.value }); clearError("zipCode"); }}
                  placeholder="10001"
                  className={cn(errors.zipCode && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20")}
                />
              </Field>
            </div>

            <Field label="Country" error={errors.country}>
              <CountrySelect
                value={formData.country}
                onChange={(val) => { setFormData({ ...formData, country: val }); clearError("country"); }}
                error={!!errors.country}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Phone" htmlFor="phone" error={errors.phone}>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); clearError("phone"); }}
                  placeholder="+1 (555) 123-4567"
                  className={cn(errors.phone && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20")}
                />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.companyEmail}>
                <Input
                  id="email"
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => { setFormData({ ...formData, companyEmail: e.target.value }); clearError("companyEmail"); }}
                  placeholder="billing@acme.com"
                  className={cn(errors.companyEmail && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20")}
                />
              </Field>
            </div>
          </div>

          <div className="flex justify-between mt-6 pt-6 border-t border-border/50">
            <Button variant="ghost" asChild>
              <Link href="/invoice/new/history">Back</Link>
            </Button>
            <Button onClick={handleNext}>Continue</Button>
          </div>
        </div>
      </div>
    </>
  );
}
