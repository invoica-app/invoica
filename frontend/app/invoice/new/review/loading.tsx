import { WizardHeader } from "@/components/wizard-header";

function Bar({ className }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

export default function ReviewLoading() {
  return (
    <>
      <WizardHeader stepLabel="Step 5 of 5" />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 space-y-2">
            <Bar className="h-5 w-36" />
            <Bar className="h-3.5 w-72 opacity-60" />
          </div>

          {/* Amount + date */}
          <div className="flex justify-between items-baseline mb-6">
            <Bar className="h-8 w-32" />
            <Bar className="h-3.5 w-24" />
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Bar className="h-3 w-16" />
              <Bar className="h-4 w-36" />
              <Bar className="h-3 w-44 opacity-60" />
              <Bar className="h-3 w-28 opacity-60" />
            </div>
            <div className="space-y-2">
              <Bar className="h-3 w-10" />
              <Bar className="h-4 w-32" />
              <Bar className="h-3 w-40 opacity-60" />
            </div>
          </div>

          {/* Line items table */}
          <div className="border border-border rounded-lg overflow-hidden mb-6">
            <div className="bg-muted/40 px-3 py-3">
              <div className="grid grid-cols-4 gap-3">
                <Bar className="h-2.5 w-20" />
                <Bar className="h-2.5 w-8" />
                <Bar className="h-2.5 w-10" />
                <Bar className="h-2.5 w-14 ml-auto" />
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-3 py-3 border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                <div className="grid grid-cols-4 gap-3">
                  <Bar className="h-4 w-full" />
                  <Bar className="h-4 w-8" />
                  <Bar className="h-4 w-14" />
                  <Bar className="h-4 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="w-48 ml-auto space-y-2">
              <div className="flex justify-between">
                <Bar className="h-3.5 w-16" />
                <Bar className="h-3.5 w-20" />
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <Bar className="h-4 w-12" />
                <Bar className="h-4 w-24" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <Bar className="h-9 w-32 rounded-lg" />
            <Bar className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </>
  );
}
