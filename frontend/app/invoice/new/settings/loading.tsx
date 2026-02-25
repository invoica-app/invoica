import { WizardHeader } from "@/components/wizard-header";

function Bar({ className }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

export default function SettingsLoading() {
  return (
    <>
      <WizardHeader stepLabel="Settings" />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 space-y-2">
            <Bar className="h-5 w-20" />
            <Bar className="h-3.5 w-64 opacity-60" />
          </div>

          <div className="space-y-8">
            {/* Theme */}
            <section>
              <Bar className="h-3 w-14 mb-3" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Bar key={i} className="h-10 w-24 rounded-lg" />
                ))}
              </div>
            </section>

            {/* Currency */}
            <section>
              <Bar className="h-3 w-28 mb-3" />
              <Bar className="h-10 w-60 rounded-lg" />
            </section>

            {/* Company defaults */}
            <section>
              <Bar className="h-3 w-36 mb-1" />
              <Bar className="h-3 w-56 opacity-60 mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Bar className="h-3 w-20" />
                    <Bar className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </section>

            {/* Invoice numbering */}
            <section>
              <Bar className="h-3 w-32 mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Bar className="h-3 w-14" />
                  <Bar className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Bar className="h-3 w-20" />
                  <Bar className="h-10 w-full" />
                </div>
              </div>
            </section>

            {/* Account */}
            <section>
              <Bar className="h-3 w-16 mb-3" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1.5">
                  <Bar className="h-3.5 w-28" />
                  <Bar className="h-3 w-40 opacity-60" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
