"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { CollectionsData } from "@/lib/types";
import { formatMoney } from "@/lib/currency";

interface Props {
  data: CollectionsData;
}

export function CollectionsChart({ data }: Props) {
  const { collected, outstanding, currency } = data;
  const total = collected + outstanding;
  const isEmpty = total === 0;

  const chartData = [
    { name: "Collected", value: collected },
    { name: "Outstanding", value: outstanding },
  ];

  const collectedColor = "hsl(160 60% 45%)";
  const outstandingColor = "hsl(25 95% 53%)";
  const colors = [collectedColor, outstandingColor];

  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;

  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm font-medium mb-4">Collections</p>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-[200px]">
          <div className="flex gap-3 mb-3">
            <div className="w-16 h-24 rounded border border-dashed border-border" />
            <div className="w-16 h-24 rounded border border-dashed border-border" />
          </div>
          <p className="text-xs text-muted-foreground">No payment data yet</p>
        </div>
      ) : (
        <>
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="30%">
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(v) => formatMoney(Number(v), currency)}
                    style={{ fontSize: 11, fontWeight: 500, fill: "hsl(var(--foreground))" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            You&apos;ve collected {pct}% of invoiced amount this month
          </p>
        </>
      )}
    </div>
  );
}
