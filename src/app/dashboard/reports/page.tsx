"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Download, FileText, TrendingUp, Building2, Users, CreditCard, Wrench, Calendar, ChevronRight } from "lucide-react";

const REPORT_TEMPLATES = [
  {
    category: "Financial",
    icon: "💰",
    color: "var(--gold)",
    reports: [
      { name: "Monthly Revenue Report", desc: "Rent collected, shortlet income, late fees by property", freq: "Monthly" },
      { name: "P&L Statement", desc: "Income vs expenses, NOI, net profit breakdown", freq: "Monthly" },
      { name: "Cash Flow Forecast", desc: "90-day projection based on active leases and pending payments", freq: "On-demand" },
      { name: "Owner Remittance Statement", desc: "Net income per owner after management fees", freq: "Monthly" },
    ],
  },
  {
    category: "Occupancy",
    icon: "🏢",
    color: "var(--emerald)",
    reports: [
      { name: "Occupancy Rate Report", desc: "Current and historical occupancy by property and unit type", freq: "Weekly" },
      { name: "Vacancy Analysis", desc: "Days vacant, rent loss, reasons for vacancy", freq: "Monthly" },
      { name: "Lease Expiry Report", desc: "Upcoming lease expirations with renewal probability scores", freq: "Monthly" },
    ],
  },
  {
    category: "Maintenance",
    icon: "🔧",
    color: "#3B82F6",
    reports: [
      { name: "Work Order Summary", desc: "Open, in-progress, and completed orders with SLA compliance", freq: "Weekly" },
      { name: "Maintenance Cost Report", desc: "Spend by category, property, and vendor", freq: "Monthly" },
      { name: "Vendor Performance Report", desc: "Ratings, response times, and cost efficiency per vendor", freq: "Quarterly" },
    ],
  },
  {
    category: "Tenants",
    icon: "👥",
    color: "#8B5CF6",
    reports: [
      { name: "Tenant Portfolio Report", desc: "KYC status, payment history, and lease information", freq: "Monthly" },
      { name: "Rent Collection Report", desc: "Collection rates, overdue accounts, and payment methods", freq: "Monthly" },
      { name: "Tenant Satisfaction Summary", desc: "Maintenance response times, complaint resolution rates", freq: "Quarterly" },
    ],
  },
];

const RECENT_REPORTS = [
  { name: "June 2026 Revenue Report", generated: "Jul 5, 2026", type: "Financial", size: "1.2 MB", format: "PDF" },
  { name: "Q2 2026 P&L Statement", generated: "Jul 5, 2026", type: "Financial", size: "890 KB", format: "PDF" },
  { name: "July Occupancy Snapshot", generated: "Jul 15, 2026", type: "Occupancy", size: "440 KB", format: "PDF" },
  { name: "Vendor Performance — Q2", generated: "Jul 1, 2026", type: "Maintenance", size: "620 KB", format: "PDF" },
  { name: "Chidi Okafor Rent History", generated: "Jul 10, 2026", type: "Tenant", size: "210 KB", format: "PDF" },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Financial: <CreditCard size={14} />,
  Occupancy: <Building2 size={14} />,
  Maintenance: <Wrench size={14} />,
  Tenant: <Users size={14} />,
};

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  function generate(name: string) {
    setGenerating(name);
    setTimeout(() => setGenerating(null), 2000);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Reports" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Header Banner */}
        <div className="rounded-2xl p-5 flex items-center gap-5" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1a3555 100%)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--gold)15" }}>
            <TrendingUp size={22} style={{ color: "var(--gold)" }} />
          </div>
          <div className="flex-1">
            <h2 className="text-[16px] font-bold text-white">Report Centre</h2>
            <p className="text-[12px] text-white/60 mt-0.5">Generate, schedule, and download reports for your portfolio. All reports are auto-populated from live data.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-bold"
            style={{ background: "var(--gold)", color: "var(--navy)" }}>
            <Calendar size={13} /> Schedule Reports
          </button>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-2 gap-4">
          {REPORT_TEMPLATES.map((cat) => (
            <Card key={cat.category}>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{cat.icon}</span>
                  <CardTitle sub={`${cat.reports.length} report templates`}>{cat.category} Reports</CardTitle>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {cat.reports.map((r) => (
                    <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => generate(r.name)}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}15`, color: cat.color }}>
                        <FileText size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-semibold text-gray-900">{r.name}</div>
                        <div className="text-[11px] text-gray-400 truncate">{r.desc}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full whitespace-nowrap">{r.freq}</span>
                        {generating === r.name ? (
                          <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle sub="Recently generated reports">Report History</CardTitle>
            <button className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              View All
            </button>
          </CardHeader>
          <CardBody noPad>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Report Name", "Type", "Generated", "Size", ""].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_REPORTS.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                          <FileText size={14} className="text-red-500" />
                        </div>
                        <span className="text-[13px] font-semibold text-gray-900">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
                        {ICON_MAP[r.type]} {r.type}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">{r.generated}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">{r.size}</td>
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                        <Download size={12} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
