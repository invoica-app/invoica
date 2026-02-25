import { WizardHeader } from "@/components/wizard-header";

function Bar({ className }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

export { DesignSkeleton as default };

export function DesignSkeleton() {
  return (
    <>
      <WizardHeader stepLabel="Step 3 of 5" />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 space-y-2">
            <Bar className="h-5 w-44" />
            <Bar className="h-3.5 w-64 opacity-60" />
          </div>

          {/* Color */}
          <section className="mb-8">
            <Bar className="h-3 w-12 mb-3" />
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              ))}
            </div>
          </section>

          {/* Font */}
          <section className="mb-8">
            <Bar className="h-3 w-10 mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Bar key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </section>

          {/* Preview */}
          <section className="mb-8">
            <Bar className="h-3 w-16 mb-3" />
            <div className="border border-border rounded-lg p-6 space-y-4">
              <div className="flex justify-between">
                <Bar className="h-5 w-32" />
                <Bar className="h-5 w-20" />
              </div>
              <Bar className="h-3 w-24 opacity-60" />
              <div className="flex justify-end">
                <Bar className="h-7 w-28" />
              </div>
            </div>
          </section>

          {/* Nav buttons */}
          <div className="flex justify-between pt-6 border-t border-border/50">
            <Bar className="h-9 w-16 rounded-lg" />
            <Bar className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </>
  );
}
