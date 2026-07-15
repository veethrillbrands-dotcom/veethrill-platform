"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
  data: { month: string; revenue: number; target: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg">
        <p className="text-[11px] font-bold text-gray-500 mb-1">{label} 2026</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-[12px] font-semibold" style={{ color: p.color }}>
            {p.name === "revenue" ? "Collected" : "Target"}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle sub="Monthly collection vs target · Jan–Jun 2026">Revenue Trend</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--gold)" }} />
            Collected
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />
            Target
          </div>
        </div>
      </CardHeader>
      <div className="px-4 py-4">
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `₦${(v / 1000000).toFixed(0)}M`}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false} tickLine={false} width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="revenue" name="revenue"
              stroke="var(--gold)" strokeWidth={2.5}
              fill="var(--gold)" fillOpacity={0.08}
            />
            <Line
              type="monotone" dataKey="target" name="target"
              stroke="#D1D5DB" strokeWidth={1.5} strokeDasharray="5 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
