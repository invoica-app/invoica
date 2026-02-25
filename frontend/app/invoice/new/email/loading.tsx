import { WizardHeader } from "@/components/wizard-header";

function Bar({ className }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

export default function EmailLoading() {
  return (
    <>
      <WizardHeader stepLabel="Step 4 of 5" />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 space-y-2">
            <Bar className="h-5 w-32" />
            <Bar className="h-3.5 w-72 opacity-60" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <Bar className="h-3 w-8" />
                <Bar className="h-10 w-full" />
              </div>
              <div className="space-y-1.5">
                <Bar className="h-3 w-16" />
                <Bar className="h-10 w-full" />
              </div>
              <div className="space-y-1.5">
                <Bar className="h-3 w-16" />
                <Bar className="h-40 w-full rounded-lg" />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Bar className="h-3 w-16" />
              <div className="border border-border rounded-lg h-80 animate-pulse bg-muted/30" />
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
