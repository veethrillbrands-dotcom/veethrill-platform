"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Building2, Users, CreditCard, Wrench } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 32400000, expenses: 8200000, noi: 24200000 },
  { month: "Feb", revenue: 34100000, expenses: 7800000, noi: 26300000 },
  { month: "Mar", revenue: 36800000, expenses: 9100000, noi: 27700000 },
  { month: "Apr", revenue: 38200000, expenses: 8600000, noi: 29600000 },
  { month: "May", revenue: 41500000, expenses: 10200000, noi: 31300000 },
  { month: "Jun", revenue: 44700000, expenses: 9400000, noi: 35300000 },
  { month: "Jul", revenue: 48200000, expenses: 11100000, noi: 37100000 },
];

const occupancyData = [
  { month: "Jan", residential: 86, commercial: 92, shortlet: 74 },
  { month: "Feb", residential: 88, commercial: 91, shortlet: 80 },
  { month: "Mar", residential: 89, commercial: 93, shortlet: 83 },
  { month: "Apr", residential: 91, commercial: 94, shortlet: 79 },
  { month: "May", residential: 92, commercial: 92, shortlet: 88 },
  { month: "Jun", residential: 93, commercial: 95, shortlet: 91 },
  { month: "Jul", residential: 94, commercial: 96, shortlet: 90 },
];

const propertyPerf = [
  { name: "Veethrill Towers", revenue: 14700000, occ: 80 },
  { name: "Lekki Gardens", revenue: 8300000, occ: 67 },
  { name: "Lekki Shortlets", revenue: 4800000, occ: 90 },
  { name: "Abuja Heights", revenue: 9600000, occ: 50 },
  { name: "Ikoyi Residences", revenue: 12000000, occ: 50 },
  { name: "PH Business Park", revenue: 6200000, occ: 0 },
];

const expenseBreakdown = [
  { name: "Maintenance", value: 38, color: "#EF4444" },
  { name: "Utilities", value: 24, color: "#F59E0B" },
  { name: "Management", value: 18, color: "#3B82F6" },
  { name: "Insurance", value: 12, color: "#8B5CF6" },
  { name: "Other", value: 8, color: "#6B7280" },
];

const fmt = (v: number) => `₦${(v / 1000000).toFixed(1)}M`;

export default function AnalyticsPage() {
  const kpis = [
    { label: "Portfolio Value", value: "₦4.2B", change: +12.4, icon: <Building2 size={16} />, color: "var(--navy)" },
    { label: "Monthly Revenue", value: "₦48.2M", change: +8.4, icon: <CreditCard size={16} />, color: "var(--gold)" },
    { label: "Net Operating Income", value: "₦37.1M", change: +5.2, icon: <TrendingUp size={16} />, color: "var(--emerald)" },
    { label: "Avg Cap Rate", value: "8.7%", change: +0.3, icon: <Users size={16} />, color: "#3B82F6" },
    { label: "Total Units", value: "15", change: 0, icon: <Building2 size={16} />, color: "#8B5CF6" },
    { label: "Maintenance Cost", value: "₦11.1M", change: -3.2, icon: <Wrench size={16} />, color: "#EF4444" },
    { label: "Collection Rate", value: "94%", change: +2.1, icon: <TrendingUp size={16} />, color: "var(--emerald)" },
    { label: "Days to Lease", value: "18 days", change: -4, icon: <CreditCard size={16} />, color: "var(--gold)" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Analytics & Reports" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>
                  {k.icon}
                </div>
              </div>
              <div className="text-[20px] font-black text-gray-900">{k.value}</div>
              {k.change !== 0 && (
                <div className={`flex items-center gap-1 text-[11px] font-semibold mt-1 ${k.change > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {k.change > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {k.change > 0 ? "+" : ""}{k.change}% vs last month
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Revenue vs NOI Chart */}
        <Card>
          <CardHeader>
            <CardTitle sub="Revenue, expenses and net operating income · Jan–Jul 2026">Revenue & NOI Trend</CardTitle>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#D4AF37] inline-block" /> Revenue</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#1E8E5A] inline-block" /> NOI</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block" /> Expenses</span>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="noiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E8E5A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1E8E5A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={52} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #E5E7EB" }} />
                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                <Area type="monotone" dataKey="noi" stroke="#1E8E5A" strokeWidth={2} fill="url(#noiGrad)" name="NOI" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={1.5} dot={false} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Occupancy Trend + Expense Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle sub="By property type · Jan–Jul 2026">Occupancy Rate Trend</CardTitle>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={occupancyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #E5E7EB" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="residential" stroke="#0B1F3A" strokeWidth={2} dot={false} name="Residential" />
                    <Line type="monotone" dataKey="commercial" stroke="#D4AF37" strokeWidth={2} dot={false} name="Commercial" />
                    <Line type="monotone" dataKey="shortlet" stroke="#1E8E5A" strokeWidth={2} dot={false} name="Shortlet" />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle sub="Jul 2026">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {expenseBreakdown.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {expenseBreakdown.map((e) => (
                  <div key={e.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                      <span className="text-[11px] text-gray-600">{e.name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-900">{e.value}%</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Property Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle sub="Revenue and occupancy by property">Property Performance</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Property", "Monthly Revenue", "Occupancy", "Performance Bar", "vs Target"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {propertyPerf.map((p) => {
                    const target = 90;
                    const diff = p.occ - target;
                    return (
                      <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 pl-5 text-[13px] font-semibold text-gray-900">{p.name}</td>
                        <td className="px-4 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(p.revenue)}</td>
                        <td className="px-4 py-3 text-[13px] font-bold" style={{ color: p.occ >= 80 ? "var(--emerald)" : p.occ >= 60 ? "var(--gold)" : "#EF4444" }}>{p.occ}%</td>
                        <td className="px-4 py-3">
                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{
                              width: `${p.occ}%`,
                              background: p.occ >= 80 ? "var(--emerald)" : p.occ >= 60 ? "var(--gold)" : "#EF4444"
                            }} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11.5px] font-bold ${diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {diff >= 0 ? "+" : ""}{diff}pp
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Revenue by Property Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle sub="Monthly revenue contribution per property">Revenue by Property</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={propertyPerf} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={48} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #E5E7EB" }} />
                <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} fill="#D4AF37" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
