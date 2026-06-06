import { WizardHeader } from "@/components/wizard-header";

function Bar({ className }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

export { SettingsSkeleton as default };

export function SettingsSkeleton() {
  return (
    <>
      <WizardHeader stepLabel="Settings" />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 space-y-2">
            <Bar className="h-5 w-20" />
            <Bar className="h-3.5 w-64 opacity-60" />
          </div>

          <div className="space-y-4">
            {/* Account */}
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <Bar className="h-4 w-28" />
                  <Bar className="h-3 w-40 opacity-60" />
                </div>
              </div>
            </section>

            {/* Invoice theme */}
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Bar className="w-8 h-8 rounded-lg" />
                <div className="space-y-1">
                  <Bar className="h-3.5 w-24" />
                  <Bar className="h-3 w-44 opacity-60" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Bar className="h-3 w-20" />
                    <Bar className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </section>

            {/* Company defaults */}
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Bar className="w-8 h-8 rounded-lg" />
                <div className="space-y-1">
                  <Bar className="h-3.5 w-24" />
                  <Bar className="h-3 w-48 opacity-60" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Bar className="h-3 w-20" />
                    <Bar className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </section>

            {/* Invoice numbering */}
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Bar className="w-8 h-8 rounded-lg" />
                <Bar className="h-3.5 w-32" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Bar className="h-3 w-14" />
                  <Bar className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Bar className="h-3 w-20" />
                  <Bar className="h-10 w-full rounded-lg" />
                </div>
              </div>
            </section>

            {/* Email defaults */}
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Bar className="w-8 h-8 rounded-lg" />
                <div className="space-y-1">
                  <Bar className="h-3.5 w-24" />
                  <Bar className="h-3 w-40 opacity-60" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Bar className="h-3 w-24" />
                  <Bar className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Bar className="h-3 w-24" />
                  <Bar className="h-24 w-full rounded-lg" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
