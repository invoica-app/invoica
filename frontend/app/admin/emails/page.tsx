"use client";

import { NothingDey } from "@/components/nothing-dey";

const skeletonRows = Array.from({ length: 5 });

export default function AdminEmailsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-semibold mb-0.5">Email Logs</h1>
          <p className="text-sm text-muted-foreground">Track email delivery status.</p>
        </div>

        {/* Skeleton table */}
        <div className="border border-border rounded-lg overflow-hidden mb-8 opacity-40 pointer-events-none select-none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Recipient</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Invoice #</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Subject</th>
                  <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {skeletonRows.map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5"><div className="h-3 bg-muted rounded w-32" /></td>
                    <td className="px-4 py-2.5"><div className="h-3 bg-muted rounded w-20" /></td>
                    <td className="px-4 py-2.5"><div className="h-3 bg-muted rounded w-48" /></td>
                    <td className="px-4 py-2.5 text-center"><div className="h-3 bg-muted rounded w-16 mx-auto" /></td>
                    <td className="px-4 py-2.5"><div className="h-3 bg-muted rounded w-28" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty state */}
        <div className="text-center py-8">
          <div className="mb-6 flex justify-center">
            <NothingDey className="w-[140px] h-[158px]" />
          </div>
          <p className="font-[family-name:var(--font-amatica)] text-2xl font-bold text-foreground mb-2">
            Coming Soon
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Email delivery tracking will be available once email sending is implemented.
          </p>
        </div>
      </div>
    </div>
  );
}
