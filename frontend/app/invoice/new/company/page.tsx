"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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

    setUploading(true);
    setUploadError(null);
    try {
      const result = await api.uploadLogo(file);
      setLogoUrl(result.url);
      store.updateCompany({ companyLogo: result.url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
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
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Company Information</h1>
            <p className="text-gray-600">
              Enter your business details that will appear on the invoice.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Company Logo */}
              <div>
                <Label className="mb-3 block text-gray-700">Company Logo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {logoUrl ? (
                  <div className="relative border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center">
                    <Image
                      src={logoUrl}
                      alt="Company logo"
                      width={160}
                      height={160}
                      className="object-contain max-h-40"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-10 text-center hover:border-primary transition-colors cursor-pointer group"
                  >
                    {uploading ? (
                      <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-primary transition-colors" />
                    )}
                    <p className="text-sm text-gray-500">
                      {uploading ? "Uploading..." : "Upload Logo"}
                    </p>
                  </div>
                )}
                {uploadError && (
                  <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <Label htmlFor="companyName" className="mb-3 block text-gray-700">
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

            <div className="space-y-6">
              {/* Address */}
              <div>
                <Label htmlFor="address" className="mb-3 block text-gray-700">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city" className="mb-3 block text-gray-700">
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
                  <Label htmlFor="zipCode" className="mb-3 block text-gray-700">
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
                <Label htmlFor="country" className="mb-3 block text-gray-700">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone" className="mb-3 block text-gray-700">
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
                  <Label htmlFor="email" className="mb-3 block text-gray-700">
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
          <div className="flex justify-between mt-8">
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
