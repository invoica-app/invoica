"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvoiceStore } from "@/lib/store";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import { Upload, Loader2, X } from "lucide-react";

export default function CompanyInfoPage() {
  const router = useRouter();
  const store = useInvoiceStore();
  const api = useAuthenticatedApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    companyName: store.companyName,
    address: store.address,
    city: store.city,
    zipCode: store.zipCode,
    country: store.country,
    phone: store.phone,
    companyEmail: store.companyEmail,
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(store.companyLogo);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

    // Show local preview immediately via base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoUrl(base64);
      store.updateCompany({ companyLogo: base64 });
    };
    reader.readAsDataURL(file);

    // Also try API upload for a clean remote URL
    setUploading(true);
    try {
      const result = await api.uploadLogo(file);
      setLogoUrl(result.url);
      store.updateCompany({ companyLogo: result.url });
    } catch {
      // base64 fallback already set above
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    store.updateCompany({ companyLogo: null });
  };

  const handleNext = () => {
    store.updateCompany(formData);
    router.push("/invoice/new/details");
  };

  return (
    <>
      <WizardHeader stepLabel="Step 1 of 5" />

      <div className="flex-1 p-4 md:p-8 bg-secondary overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-3xl font-semibold mb-1 md:mb-2">Company Information</h1>
            <p className="text-sm text-muted-foreground">
              Enter your business details that will appear on the invoice.
            </p>
          </div>

          <div className="bg-card rounded-xl shadow-sm p-4 md:p-8 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              {/* Company Logo */}
              <div>
                <Label className="mb-2 md:mb-3 block text-sm text-muted-foreground">Company Logo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {logoUrl ? (
                  <div className="relative border-2 border-border rounded-lg p-4 flex items-center justify-center">
                    <img
                      src={logoUrl}
                      alt="Company logo"
                      className="object-contain max-h-40 max-w-full"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 md:p-10 text-center hover:border-primary transition-colors cursor-pointer group"
                  >
                    {uploading ? (
                      <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {uploading ? "Uploading..." : "Upload Logo"}
                    </p>
                  </div>
                )}
                {uploadError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <Label htmlFor="companyName" className="mb-2 md:mb-3 block text-sm text-muted-foreground">
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              {/* Address */}
              <div>
                <Label htmlFor="address" className="mb-2 md:mb-3 block text-sm text-muted-foreground">
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full"
                  placeholder="123 Business St"
                />
              </div>

              {/* City and Zip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="city" className="mb-2 md:mb-3 block text-sm text-muted-foreground">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full"
                    placeholder="Tech City"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode" className="mb-2 md:mb-3 block text-sm text-muted-foreground">
                    Zip / Postal Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    className="w-full"
                    placeholder="10001"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <Label htmlFor="country" className="mb-2 md:mb-3 block text-sm text-muted-foreground">
                  Country
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full"
                  placeholder="USA"
                />
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="phone" className="mb-2 md:mb-3 block text-sm text-muted-foreground">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-2 md:mb-3 block text-sm text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, companyEmail: e.target.value })
                    }
                    className="w-full"
                    placeholder="billing@acme.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6 md:mt-8">
            <Button variant="outline" asChild>
              <Link href="/invoice/new/welcome">Back</Link>
            </Button>
            <Button onClick={handleNext}>Next Step</Button>
          </div>
        </div>
      </div>
    </>
  );
}
