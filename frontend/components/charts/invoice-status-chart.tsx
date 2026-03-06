"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "hsl(var(--muted-foreground))" },
  SENT: { label: "Sent", color: "hsl(217 91% 60%)" },
  PAID: { label: "Paid", color: "hsl(160 60% 45%)" },
  CANCELLED: { label: "Cancelled", color: "hsl(0 72% 51%)" },
};

interface Props {
  data: Record<string, number>;
}

export function InvoiceStatusChart({ data }: Props) {
  const { chartData, total } = useMemo(() => {
    const entries = Object.entries(data)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: STATUS_CONFIG[status]?.label || status,
        value: count,
        color: STATUS_CONFIG[status]?.color || "hsl(var(--muted))",
      }));
    const sum = entries.reduce((acc, e) => acc + e.value, 0);
    return { chartData: entries, total: sum };
  }, [data]);

  const isEmpty = total === 0;

  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm font-medium mb-4">Invoice Status</p>
      <div className="flex flex-col items-center">
        <div className="h-[160px] w-[160px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={isEmpty ? [{ name: "Empty", value: 1 }] : chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={isEmpty ? 0 : 2}
                dataKey="value"
                stroke="none"
              >
                {isEmpty ? (
                  <Cell fill="hsl(var(--muted))" />
                ) : (
                  chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-semibold tabular-nums">{total}</span>
            <span className="text-[11px] text-muted-foreground">
              {total === 1 ? "Invoice" : "Invoices"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = data[status] || 0;
            if (count === 0 && isEmpty) return null;
            return (
              <div key={status} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-muted-foreground">{config.label}</span>
                <span className="text-xs font-medium tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
