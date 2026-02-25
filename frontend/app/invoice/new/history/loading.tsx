import { WizardHeader } from "@/components/wizard-header";

function Bar({ className }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

export default function HistoryLoading() {
  return (
    <>
      <WizardHeader stepLabel="Invoice History" />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 space-y-2">
            <Bar className="h-5 w-24" />
            <Bar className="h-3.5 w-56 opacity-60" />
          </div>

          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-lg border border-border"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Bar className="h-4 w-20" />
                    <Bar className="h-4 w-12" />
                  </div>
                  <Bar className="h-3 w-40 opacity-60" />
                </div>
                <Bar className="h-4 w-16 ml-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
