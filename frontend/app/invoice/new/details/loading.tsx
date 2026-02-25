import { WizardHeader } from "@/components/wizard-header";

function Bar({ className }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

export default function DetailsLoading() {
  return (
    <>
      <WizardHeader stepLabel="Step 2 of 5" />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-2">
            <Bar className="h-5 w-40" />
            <Bar className="h-3.5 w-72 opacity-60" />
          </div>

          {/* Invoice meta */}
          <section className="space-y-4">
            <Bar className="h-3 w-24" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Bar className="h-3 w-16" />
                  <Bar className="h-10 w-full" />
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-border/40" />

          {/* Bill to */}
          <section className="space-y-4">
            <Bar className="h-3 w-16" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Bar className="h-3 w-20" />
                  <Bar className="h-10 w-full" />
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-border/40" />

          {/* Line items */}
          <section className="space-y-4">
            <div className="flex justify-between">
              <Bar className="h-3 w-20" />
              <Bar className="h-3.5 w-16" />
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/40 px-3 py-3">
                <div className="grid grid-cols-[1fr_72px_100px_100px] gap-3">
                  <Bar className="h-2.5 w-20" />
                  <Bar className="h-2.5 w-8" />
                  <Bar className="h-2.5 w-10" />
                  <Bar className="h-2.5 w-14 ml-auto" />
                </div>
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-3 py-3 border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                  <div className="grid grid-cols-[1fr_72px_100px_100px] gap-3">
                    <Bar className="h-4 w-full" />
                    <Bar className="h-4 w-10" />
                    <Bar className="h-4 w-14" />
                    <Bar className="h-4 w-16 ml-auto" />
                  </div>
                </div>
              ))}
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
