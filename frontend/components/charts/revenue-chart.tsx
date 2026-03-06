"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { RevenueByMonthEntry } from "@/lib/types";
import { formatMoney } from "@/lib/currency";

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

function formatMonth(ym: string): string {
  const month = ym.split("-")[1];
  return MONTH_LABELS[month] || month;
}

interface Props {
  data: RevenueByMonthEntry[];
  currencies: string[];
}

export function RevenueChart({ data, currencies }: Props) {
  const [currency, setCurrency] = useState(currencies[0] || "USD");

  const chartData = useMemo(() => {
    return data
      .filter((d) => d.currency === currency)
      .map((d) => ({ month: formatMonth(d.month), total: d.total }));
  }, [data, currency]);

  const isEmpty = chartData.length === 0;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium">Revenue</p>
        {currencies.length > 1 && (
          <div className="flex gap-0.5 bg-muted rounded-md p-0.5">
            {currencies.map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                  currency === c
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="h-[220px]">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="h-px w-32 border-t border-dashed border-border mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">
                Revenue data will appear here as you create invoices
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatMoney(v, currency).replace(/\.00$/, "")}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [formatMoney(Number(value), currency), "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 3 }}
                activeDot={{ r: 5 }}
                fill="url(#revenueGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
