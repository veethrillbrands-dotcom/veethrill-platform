import { Topbar } from "@/components/layout/Topbar";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { mockKPIs, mockProperties, mockWorkOrders, revenueChartData, occupancyTrendData } from "@/lib/mock-data";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Building2, Users, CreditCard, Cog, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { OccupancyDonut } from "@/components/charts/OccupancyDonut";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Executive Dashboard" action={{ label: "Add Property" }} />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Alert Banner */}
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
          <p className="text-[12.5px] text-gray-800 flex-1">
            <strong>3 leases expiring</strong> in the next 30 days — send renewal offers to avoid vacancies.
          </p>
          <span className="text-[11.5px] font-semibold cursor-pointer" style={{ color: "var(--gold)" }}>View Leases →</span>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            label="Monthly Revenue"
            value={formatCurrency(mockKPIs.monthlyRevenue)}
            change={mockKPIs.revenueChange}
            accentColor="var(--gold)"
            icon={<CreditCard size={18} style={{ color: "var(--gold)" }} />}
            sparkline={[32, 35.5, 38.2, 41, 44.7, 48.2]}
          />
          <KPICard
            label="Occupancy Rate"
            value={`${mockKPIs.occupancyRate}%`}
            change={mockKPIs.occupancyChange}
            accentColor="var(--emerald)"
            icon={<Building2 size={18} style={{ color: "var(--emerald)" }} />}
            sparkline={[88, 89.5, 91, 92.2, 93.1, 94.3]}
          />
          <KPICard
            label="Open Work Orders"
            value={`${mockKPIs.openWorkOrders}`}
            changeLabel="↓ 8 resolved"
            change={-8}
            accentColor="#3B82F6"
            icon={<Cog size={18} className="text-blue-500" />}
            sparkline={[31, 28, 30, 25, 27, 23]}
          />
          <KPICard
            label="Overdue Rent"
            value={formatCurrency(mockKPIs.overdueRent)}
            changeLabel="↑ 4 tenants"
            change={-4}
            accentColor="#EF4444"
            icon={<AlertTriangle size={18} className="text-red-500" />}
            sparkline={[1.2, 1.8, 2.1, 1.9, 2.8, 3.1]}
          />
        </div>

        {/* Revenue Chart + Occupancy */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <RevenueChart data={revenueChartData} />
          </div>
          <div className="flex flex-col gap-4">
            <OccupancyDonut occupied={294} reserved={10} vacant={8} />
            <Card>
              <CardBody>
                {[
                  { label: "Collection Rate", value: mockKPIs.collectionRate, color: "var(--emerald)" },
                  { label: "Renewal Rate", value: mockKPIs.renewalRate, color: "var(--gold)" },
                  { label: "Shortlet Occ.", value: 90, color: "#3B82F6" },
                ].map((item) => (
                  <div key={item.label} className="mb-3 last:mb-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-[0.4px]">{item.label}</span>
                      <span className="text-[13px] font-bold text-gray-900">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Properties + Maintenance + Activity */}
        <div className="grid grid-cols-3 gap-4">
          {/* Top Properties */}
          <Card>
            <CardHeader>
              <CardTitle sub="By revenue · June 2026">Top Properties</CardTitle>
              <a href="/dashboard/properties" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View all →</a>
            </CardHeader>
            <CardBody>
              {mockProperties.slice(0, 4).map((prop) => (
                <div key={prop.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-9 rounded-lg bg-yellow-50 flex items-center justify-center text-lg flex-shrink-0">🏢</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-900 truncate">{prop.name}</div>
                    <div className="text-[11px] text-gray-400">{prop.city} · {prop.totalUnits} units</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-gray-900">{formatCurrency(prop.monthlyRevenue / 1000000)}M</div>
                    <div className={`text-[10.5px] font-semibold ${prop.occupancyRate >= 90 ? "text-emerald-600" : "text-yellow-600"}`}>
                      {prop.occupancyRate.toFixed(0)}% occ.
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Maintenance Queue */}
          <Card>
            <CardHeader>
              <CardTitle sub="Open work orders">Maintenance Queue</CardTitle>
              <a href="/dashboard/maintenance" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>Manage →</a>
            </CardHeader>
            <CardBody>
              {mockWorkOrders.map((wo) => (
                <div key={wo.id} className="flex items-center gap-2.5 py-2 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    wo.priority === "URGENT" ? "bg-red-500" :
                    wo.priority === "HIGH" ? "bg-orange-500" :
                    wo.priority === "MEDIUM" ? "bg-yellow-500" :
                    wo.priority === "LOW" ? "bg-blue-500" : "bg-gray-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-900 truncate">{wo.title}</div>
                    <div className="text-[11px] text-gray-400">{wo.propertyName}{wo.unitNumber ? ` · ${wo.unitNumber}` : ""}</div>
                  </div>
                  <Badge variant={statusToBadgeVariant(wo.priority)}>{wo.priority}</Badge>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <span className="text-[11.5px] font-semibold cursor-pointer" style={{ color: "var(--gold)" }}>View all →</span>
            </CardHeader>
            <CardBody>
              {[
                { icon: "💰", title: "Rent paid — ₦350,000", sub: "Chidi Okafor · Unit 7C", time: "2m ago", bg: "bg-emerald-50" },
                { icon: "📄", title: "Lease renewed · 2 yrs", sub: "Ngozi Adeyemi · Unit 3A", time: "18m ago", bg: "bg-yellow-50" },
                { icon: "👤", title: "New tenant onboarded", sub: "Emeka Bello · Unit 5B", time: "1h ago", bg: "bg-blue-50" },
                { icon: "🔩", title: "Work order raised", sub: "AC failure · Unit 4B", time: "2h ago", bg: "bg-red-50" },
                { icon: "🏠", title: "Shortlet check-in", sub: "Sarah Johnson · Suite 2B", time: "3h ago", bg: "bg-purple-50" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-100 last:border-0">
                  <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center text-sm flex-shrink-0 mt-0.5`}>{a.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-gray-900">{a.title}</div>
                    <div className="text-[11px] text-gray-400">{a.sub}</div>
                  </div>
                  <div className="text-[10.5px] text-gray-400 whitespace-nowrap">{a.time}</div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* AI + Modules */}
        <div className="grid grid-cols-3 gap-4">
          {/* AI Card */}
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "var(--gold)", transform: "translate(30%, -30%)" }} />
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--gold)" }}>✦ AI Powered</div>
            <h3 className="text-[15px] font-bold text-white mb-1">Veethrill Intelligence</h3>
            <p className="text-[11.5px] text-white/60 mb-4">Real-time insights from your portfolio data</p>
            <a href="/dashboard/ai"
              className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-3.5 py-2 rounded-lg"
              style={{ background: "var(--gold)", color: "var(--navy)" }}>
              <Sparkles size={12} />
              Launch AI Assistant →
            </a>
            <div className="mt-4 space-y-2">
              {[
                "📉 Unit 8C in Lekki has 60-day vacancy risk",
                "💡 SMS reminders boost collection by 18%",
                "🔧 PH generator 94% failure risk in 45 days",
              ].map((insight, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/7 rounded-lg px-3 py-2 text-[11.5px] text-white/85">
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* Module Grid */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Platform Modules</CardTitle>
              <span className="text-[10.5px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">15 Active</span>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: "🏢", name: "Properties", count: "47 total", href: "/dashboard/properties" },
                  { icon: "👥", name: "Tenants", count: "312 active", href: "/dashboard/tenants" },
                  { icon: "📄", name: "Leases", count: "298 live", href: "/dashboard/leases" },
                  { icon: "🏨", name: "Shortlets", count: "18 active", href: "/dashboard/shortlets" },
                  { icon: "💳", name: "Payments", count: "₦48.2M", href: "/dashboard/payments" },
                  { icon: "🔩", name: "Maintenance", count: "23 open", href: "/dashboard/maintenance" },
                  { icon: "📒", name: "Accounting", count: "P&L live", href: "/dashboard/accounting" },
                  { icon: "🗂️", name: "Documents", count: "1,204 files", href: "/dashboard/documents" },
                ].map((m) => (
                  <a key={m.name} href={m.href}
                    className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100 hover:border-yellow-300 hover:shadow-sm transition-all cursor-pointer group">
                    <span className="text-2xl mb-1.5">{m.icon}</span>
                    <span className="text-[11px] font-bold text-gray-900 group-hover:text-yellow-700">{m.name}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{m.count}</span>
                  </a>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}
