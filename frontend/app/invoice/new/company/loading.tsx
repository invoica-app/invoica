import { WizardHeader } from "@/components/wizard-header";

function Bar({ className }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

export default function CompanyLoading() {
  return (
    <>
      <WizardHeader stepLabel="Step 1 of 5" />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 space-y-2">
            <Bar className="h-5 w-48" />
            <Bar className="h-3.5 w-72 opacity-60" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo placeholder */}
            <div className="h-[120px] rounded-lg border-2 border-dashed border-muted animate-pulse" />
            {/* Company name */}
            <div className="space-y-1.5">
              <Bar className="h-3 w-24" />
              <Bar className="h-10 w-full" />
            </div>
          </div>

          {/* Address */}
          <div className="mt-4 space-y-1.5">
            <Bar className="h-3 w-16" />
            <Bar className="h-10 w-full" />
          </div>

          {/* City + Zip */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Bar className="h-3 w-12" />
              <Bar className="h-10 w-full" />
            </div>
            <div className="space-y-1.5">
              <Bar className="h-3 w-8" />
              <Bar className="h-10 w-full" />
            </div>
          </div>

          {/* Country */}
          <div className="mt-4 space-y-1.5">
            <Bar className="h-3 w-16" />
            <Bar className="h-10 w-full" />
          </div>

          {/* Phone + Email */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Bar className="h-3 w-14" />
              <Bar className="h-10 w-full" />
            </div>
            <div className="space-y-1.5">
              <Bar className="h-3 w-12" />
              <Bar className="h-10 w-full" />
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
            <Bar className="h-9 w-16 rounded-lg" />
            <Bar className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </>
  );
}
