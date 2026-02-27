"use client";

export function DemoInvoice() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow behind the invoice in dark mode */}
      <div className="absolute -inset-4 rounded-2xl bg-primary/[0.07] blur-2xl dark:block hidden" />

      {/* The "paper" */}
      <div className="relative bg-white rounded-lg shadow-sm ring-1 ring-gray-950/5 dark:ring-white/10 dark:shadow-lg dark:shadow-primary/5 overflow-hidden text-gray-900 text-[13px]">
        {/* Top color bar */}
        <div className="h-1 bg-violet-600" />

        <div className="p-6 sm:p-8">
          {/* Header row */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-base font-semibold text-gray-900">
                Kwame Studio
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                12 Osu Badu St, Accra
              </p>
              <p className="text-gray-500 text-xs">kwame@studio.co</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                Invoice
              </p>
              <p className="font-medium mt-0.5">#INV-001</p>
            </div>
          </div>

          {/* Bill to + dates */}
          <div className="flex flex-wrap gap-x-16 gap-y-4 mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">
                Bill to
              </p>
              <p className="font-medium">Sarah Chen</p>
              <p className="text-gray-500 text-xs">Bloom Agency</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">
                Issued
              </p>
              <p>Jan 15, 2025</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">
                Due
              </p>
              <p>Feb 14, 2025</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left font-medium text-gray-500 pb-2 text-xs">
                  Description
                </th>
                <th className="text-right font-medium text-gray-500 pb-2 text-xs">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3">Brand Identity Design</td>
                <td className="py-3 text-right tabular-nums">$2,400.00</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3">Website Mockups</td>
                <td className="py-3 text-right tabular-nums">$1,800.00</td>
              </tr>
            </tbody>
          </table>

          {/* Footer: Payment details + Total */}
          <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-200">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">
                Payment Details
              </p>
              <p className="text-xs font-medium text-gray-700">MTN Mobile Money</p>
              <p className="text-xs text-gray-500">Kwame Mensah</p>
              <p className="text-xs text-gray-500">+233 24 123 4567</p>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                Total
              </span>
              <span className="text-lg font-semibold tabular-nums">
                $4,200.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
