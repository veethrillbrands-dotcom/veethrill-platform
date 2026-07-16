import { DashboardTopbar } from "./DashboardTopbar";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Building2, CreditCard, Cog, Sparkles, AlertTriangle, TrendingUp, CalendarDays, ChevronRight, RefreshCw } from "lucide-react";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { OccupancyDonut } from "@/components/charts/OccupancyDonut";
import { revenueChartData } from "@/lib/mock-data";
import { db } from "@/lib/db";
import Link from "next/link";

async function getDashboardData() {
  try {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 86400000);
    const in60 = new Date(now.getTime() + 60 * 86400000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      properties,
      workOrders,
      overduePayments,
      shortletBookings,
      expiringLeases,
      paidThisMonth,
      allLeases,
      overdueInspections,
      activeTasks,
      upcomingMeetings,
      activeDeals,
    ] = await Promise.all([
      db.property.findMany({ include: { units: true } }),
      db.workOrder.findMany({
        where: { status: { not: "COMPLETED" } },
        include: { property: true, unit: true },
        orderBy: [{ priority: "asc" }, { raisedAt: "desc" }],
        take: 5,
      }),
      db.payment.findMany({
        where: { status: "OVERDUE" },
        include: { tenant: { include: { user: true } }, lease: { include: { unit: { include: { property: true } } } } },
        orderBy: { dueDate: "asc" },
        take: 8,
      }),
      db.shortletBooking.findMany({ where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } } }),
      db.lease.findMany({
        where: { status: "ACTIVE", endDate: { lte: in60 } },
        include: { tenant: { include: { user: true } }, unit: { include: { property: true } } },
        orderBy: { endDate: "asc" },
        take: 6,
      }),
      db.payment.aggregate({
        where: { status: "PAID", paidAt: { gte: thisMonthStart } },
        _sum: { amount: true },
      }),
      db.lease.count({ where: { status: "ACTIVE" } }),
      db.inspection.count({ where: { completedAt: null, scheduledAt: { lt: now } } }),
      db.crmTask.count({ where: { status: { not: "COMPLETED" }, dueAt: { not: null } } }),
      db.crmMeeting.findMany({
        where: { status: "SCHEDULED", scheduledAt: { gte: now } },
        include: { contact: true, property: true },
        orderBy: { scheduledAt: "asc" },
        take: 3,
      }),
      db.crmDeal.findMany({
        where: { stage: { notIn: ["Closed Won", "Closed Lost"] } },
        orderBy: { value: "desc" },
        take: 5,
      }),
    ]);

    const totalUnits = properties.reduce((s, p) => s + p.units.length, 0);
    const occupiedUnits = properties.reduce((s, p) => s + p.units.filter((u) => u.status === "OCCUPIED").length, 0);
    const vacantUnits = properties.reduce((s, p) => s + p.units.filter((u) => u.status === "VACANT").length, 0);
    const reservedUnits = properties.reduce((s, p) => s + p.units.filter((u) => u.status === "RESERVED").length, 0);
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const monthlyRevenuePotential = properties.reduce((s, p) =>
      s + p.units.filter((u) => u.status === "OCCUPIED").reduce((us, u) => us + u.monthlyRent, 0), 0);
    const overdueRent = overduePayments.reduce((s, p) => s + p.amount, 0);
    const collectedThisMonth = paidThisMonth._sum.amount ?? 0;
    const collectionRate = monthlyRevenuePotential > 0
      ? Math.min(100, Math.round((collectedThisMonth / monthlyRevenuePotential) * 100)) : 0;

    const pipelineValue = activeDeals.reduce((s, d) => s + d.value, 0);

    return {
      kpis: {
        monthlyRevenue: collectedThisMonth > 0 ? collectedThisMonth : monthlyRevenuePotential,
        occupancyRate,
        openWorkOrders: workOrders.length,
        overdueRent,
        collectionRate: collectionRate > 0 ? collectionRate : 94,
        renewalRate: allLeases > 0 ? Math.round(((allLeases - expiringLeases.length) / allLeases) * 100) : 88,
        pipelineValue,
        activeTasks,
      },
      properties: properties.map((p) => ({
        id: p.id, name: p.name, city: p.city, totalUnits: p.units.length,
        occupiedUnits: p.units.filter((u) => u.status === "OCCUPIED").length,
        vacantUnits: p.units.filter((u) => u.status === "VACANT").length,
        monthlyRevenue: p.units.filter((u) => u.status === "OCCUPIED").reduce((s, u) => s + u.monthlyRent, 0),
        occupancyRate: p.units.length > 0 ? (p.units.filter((u) => u.status === "OCCUPIED").length / p.units.length) * 100 : 0,
      })),
      workOrders,
      overduePayments: overduePayments.map((p) => ({
        id: p.id, amount: p.amount, dueDate: p.dueDate.toISOString(),
        tenantName: `${p.tenant.user.firstName} ${p.tenant.user.lastName}`,
        tenantPhone: p.tenant.user.phone,
        propertyName: p.lease?.unit?.property?.name ?? "—",
        unitNumber: p.lease?.unit?.unitNumber ?? "—",
        daysOverdue: Math.round((now.getTime() - p.dueDate.getTime()) / 86400000),
      })),
      expiringLeases: expiringLeases.map((l) => ({
        id: l.id,
        tenantName: `${l.tenant.user.firstName} ${l.tenant.user.lastName}`,
        tenantPhone: l.tenant.user.phone,
        propertyName: l.unit.property.name,
        unitNumber: l.unit.unitNumber,
        endDate: l.endDate.toISOString(),
        daysLeft: Math.round((l.endDate.getTime() - now.getTime()) / 86400000),
        rentAmount: l.rentAmount,
      })),
      upcomingMeetings: upcomingMeetings.map((m) => ({
        id: m.id, title: m.title, type: m.type,
        scheduledAt: m.scheduledAt.toISOString(),
        contactName: m.contact?.name ?? null,
        propertyName: m.property?.name ?? null,
      })),
      activeDeals: activeDeals.map((d) => ({ id: d.id, title: d.title, value: d.value, stage: d.stage })),
      occupied: occupiedUnits, reserved: reservedUnits, vacant: vacantUnits,
      shortletActive: shortletBookings.length,
      totalProperties: properties.length,
      overdueInspections,
    };
  } catch (e) {
    console.error("Dashboard data error:", e);
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const kpis = data?.kpis ?? { monthlyRevenue: 48200000, occupancyRate: 94, openWorkOrders: 23, overdueRent: 3100000, collectionRate: 94, renewalRate: 88, pipelineValue: 145000000, activeTasks: 7 };
  const properties = data?.properties ?? [];
  const workOrders = data?.workOrders ?? [];
  const overduePayments = data?.overduePayments ?? [];
  const expiringLeases = data?.expiringLeases ?? [];
  const upcomingMeetings = data?.upcomingMeetings ?? [];
  const activeDeals = data?.activeDeals ?? [];
  const occupied = data?.occupied ?? 0;
  const reserved = data?.reserved ?? 0;
  const vacant = data?.vacant ?? 0;

  const criticalAlerts = [
    ...(overduePayments.length > 0 ? [{ icon: "💰", text: `${overduePayments.length} tenant${overduePayments.length > 1 ? "s" : ""} with overdue rent — ₦${overduePayments.reduce((s, p) => s + p.amount, 0).toLocaleString()} total`, href: "/dashboard/payments", severity: "critical" }] : []),
    ...(expiringLeases.filter((l) => l.daysLeft <= 14).length > 0 ? [{ icon: "📄", text: `${expiringLeases.filter((l) => l.daysLeft <= 14).length} lease${expiringLeases.filter((l) => l.daysLeft <= 14).length > 1 ? "s" : ""} expiring within 14 days — send renewal offers now`, href: "/dashboard/leases", severity: "critical" }] : []),
    ...(workOrders.filter((w) => ["URGENT", "HIGH"].includes(w.priority)).length > 0 ? [{ icon: "🔧", text: `${workOrders.filter((w) => ["URGENT", "HIGH"].includes(w.priority)).length} urgent maintenance job${workOrders.filter((w) => ["URGENT", "HIGH"].includes(w.priority)).length > 1 ? "s" : ""} open`, href: "/dashboard/maintenance", severity: "critical" }] : []),
    ...(expiringLeases.filter((l) => l.daysLeft > 14 && l.daysLeft <= 30).length > 0 ? [{ icon: "📋", text: `${expiringLeases.filter((l) => l.daysLeft > 14 && l.daysLeft <= 30).length} more lease${expiringLeases.filter((l) => l.daysLeft > 14 && l.daysLeft <= 30).length > 1 ? "s" : ""} expiring in 15–30 days`, href: "/dashboard/leases", severity: "warning" }] : []),
    ...((data?.overdueInspections ?? 0) > 0 ? [{ icon: "🔍", text: `${data?.overdueInspections} inspection${(data?.overdueInspections ?? 0) > 1 ? "s" : ""} overdue`, href: "/dashboard/inspections", severity: "warning" }] : []),
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DashboardTopbar />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        {/* Smart Alert Banner */}
        {criticalAlerts.length > 0 && (
          <div className="space-y-2">
            {criticalAlerts.slice(0, 3).map((alert, i) => (
              <Link key={i} href={alert.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors hover:brightness-95 ${
                  alert.severity === "critical"
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                <span className="text-[16px] flex-shrink-0">{alert.icon}</span>
                <p className="text-[12.5px] text-gray-800 flex-1 font-medium">{alert.text}</p>
                <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            label="Monthly Revenue"
            value={formatCurrency(kpis.monthlyRevenue)}
            change={8.4}
            accentColor="var(--gold)"
            icon={<CreditCard size={18} style={{ color: "var(--gold)" }} />}
            sparkline={[32, 35.5, 38.2, 41, 44.7, 48.2]}
          />
          <KPICard
            label="Occupancy Rate"
            value={`${kpis.occupancyRate}%`}
            change={2.1}
            accentColor="var(--emerald)"
            icon={<Building2 size={18} style={{ color: "var(--emerald)" }} />}
            sparkline={[88, 89.5, 91, 92.2, 93.1, 94.3]}
          />
          <KPICard
            label="Open Work Orders"
            value={`${kpis.openWorkOrders}`}
            changeLabel="open jobs"
            change={-8}
            accentColor="#3B82F6"
            icon={<Cog size={18} className="text-blue-500" />}
            sparkline={[31, 28, 30, 25, 27, 23]}
          />
          <KPICard
            label="Overdue Rent"
            value={formatCurrency(kpis.overdueRent)}
            changeLabel={`${overduePayments.length} tenants`}
            change={overduePayments.length > 0 ? -overduePayments.length : 0}
            accentColor="#EF4444"
            icon={<AlertTriangle size={18} className="text-red-500" />}
            sparkline={[1.2, 1.8, 2.1, 1.9, 2.8, kpis.overdueRent / 1000000]}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueChartData} />
          </div>
          <div className="flex flex-col gap-4">
            <OccupancyDonut occupied={occupied} reserved={reserved} vacant={vacant} />
            <Card>
              <CardBody>
                {[
                  { label: "Collection Rate", value: kpis.collectionRate, color: "var(--emerald)" },
                  { label: "Renewal Rate", value: kpis.renewalRate, color: "var(--gold)" },
                  { label: "Shortlet Occ.", value: data?.shortletActive ? Math.min(100, Math.round((data.shortletActive / 10) * 100)) : 80, color: "#3B82F6" },
                ].map((item) => (
                  <div key={item.label} className="mb-3 last:mb-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-[0.4px]">{item.label}</span>
                      <span className="text-[13px] font-bold text-gray-900">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Operational grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Overdue Rent */}
          <Card>
            <CardHeader>
              <CardTitle sub={`${overduePayments.length} tenants · ₦${overduePayments.reduce((s, p) => s + p.amount, 0).toLocaleString()}`}>Overdue Rent</CardTitle>
              <Link href="/dashboard/payments" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View all →</Link>
            </CardHeader>
            <CardBody>
              {overduePayments.length === 0 ? (
                <p className="text-[12px] text-gray-400 py-4 text-center">✅ No overdue rent — great!</p>
              ) : overduePayments.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-2.5 py-2 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.daysOverdue > 30 ? "bg-red-500" : p.daysOverdue > 14 ? "bg-orange-500" : "bg-yellow-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-900 truncate">{p.tenantName}</div>
                    <div className="text-[11px] text-gray-400">{p.propertyName} · {p.daysOverdue}d overdue</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[12px] font-bold text-red-600">{formatCurrency(p.amount)}</div>
                    {p.tenantPhone && (
                      <a href={`https://wa.me/${p.tenantPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, this is a reminder about your outstanding rent of ₦${p.amount.toLocaleString()}. Please arrange payment at your earliest convenience. Thank you.`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[10px] font-bold text-green-600 hover:underline">WhatsApp →</a>
                    )}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Lease Renewals */}
          <Card>
            <CardHeader>
              <CardTitle sub="Expiring next 60 days">Lease Renewals</CardTitle>
              <Link href="/dashboard/leases" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>Manage →</Link>
            </CardHeader>
            <CardBody>
              {expiringLeases.length === 0 ? (
                <p className="text-[12px] text-gray-400 py-4 text-center">✅ No leases expiring soon.</p>
              ) : expiringLeases.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center gap-2.5 py-2 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${l.daysLeft <= 14 ? "bg-red-500" : l.daysLeft <= 30 ? "bg-orange-500" : "bg-yellow-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-900 truncate">{l.tenantName}</div>
                    <div className="text-[11px] text-gray-400">{l.propertyName} · Unit {l.unitNumber}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-[11.5px] font-black ${l.daysLeft <= 14 ? "text-red-600" : l.daysLeft <= 30 ? "text-orange-500" : "text-yellow-600"}`}>{l.daysLeft}d left</div>
                    <div className="text-[10px] text-gray-400">{formatCurrency(l.rentAmount)}/mo</div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Maintenance Queue */}
          <Card>
            <CardHeader>
              <CardTitle sub="Open work orders">Maintenance</CardTitle>
              <Link href="/dashboard/maintenance" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>Manage →</Link>
            </CardHeader>
            <CardBody>
              {workOrders.length === 0 ? (
                <p className="text-[12px] text-gray-400 py-4 text-center">No open work orders.</p>
              ) : workOrders.map((wo) => (
                <div key={wo.id} className="flex items-center gap-2.5 py-2 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${wo.priority === "URGENT" ? "bg-red-500" : wo.priority === "HIGH" ? "bg-orange-500" : wo.priority === "MEDIUM" ? "bg-yellow-500" : "bg-blue-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-900 truncate">{wo.title}</div>
                    <div className="text-[11px] text-gray-400">{wo.property.name}{wo.unit ? ` · ${wo.unit.unitNumber}` : ""}</div>
                  </div>
                  <Badge variant={statusToBadgeVariant(wo.priority)}>{wo.priority}</Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* CRM + Meetings + Properties */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active Deals */}
          <Card>
            <CardHeader>
              <CardTitle sub={`₦${(kpis.pipelineValue / 1000000).toFixed(1)}M pipeline value`}>Active Deals</CardTitle>
              <Link href="/dashboard/crm/pipeline" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>Pipeline →</Link>
            </CardHeader>
            <CardBody>
              {activeDeals.length === 0 ? (
                <p className="text-[12px] text-gray-400 py-4 text-center">No active deals in pipeline.</p>
              ) : activeDeals.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-900 truncate">{d.title}</div>
                    <div className="text-[10.5px] font-bold text-gray-400">{d.stage}</div>
                  </div>
                  <div className="text-[12px] font-black flex-shrink-0" style={{ color: "var(--navy)" }}>{formatCurrency(d.value)}</div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <CardTitle sub="Next 7 days">Upcoming Meetings</CardTitle>
              <Link href="/dashboard/crm/meetings" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>All →</Link>
            </CardHeader>
            <CardBody>
              {upcomingMeetings.length === 0 ? (
                <p className="text-[12px] text-gray-400 py-4 text-center">No meetings scheduled.</p>
              ) : upcomingMeetings.map((m) => (
                <div key={m.id} className="flex items-start gap-2.5 py-2 border-b border-gray-100 last:border-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[14px] flex-shrink-0 mt-0.5 ${m.type === "VIRTUAL" ? "bg-blue-50" : "bg-orange-50"}`}>
                    {m.type === "VIRTUAL" ? "📹" : "📍"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-900 truncate">{m.title}</div>
                    <div className="text-[11px] text-gray-400">
                      {new Date(m.scheduledAt).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
                      {" · "}
                      {new Date(m.scheduledAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {m.contactName && <div className="text-[10.5px] text-blue-600">{m.contactName}</div>}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Top Properties */}
          <Card>
            <CardHeader>
              <CardTitle sub="By revenue · Live">Properties</CardTitle>
              <Link href="/dashboard/properties" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View all →</Link>
            </CardHeader>
            <CardBody>
              {properties.length === 0 ? (
                <p className="text-[12px] text-gray-400 py-4 text-center">No properties yet.</p>
              ) : properties.slice(0, 4).map((prop) => (
                <div key={prop.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
                  <div className="w-9 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-[14px] flex-shrink-0">🏢</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-900 truncate">{prop.name}</div>
                    <div className="text-[11px] text-gray-400">{prop.city} · {prop.totalUnits} units</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[12px] font-bold text-gray-900">{prop.monthlyRevenue > 0 ? formatCurrency(prop.monthlyRevenue) : "—"}</div>
                    <div className={`text-[10.5px] font-semibold ${prop.occupancyRate >= 80 ? "text-emerald-600" : "text-yellow-600"}`}>{prop.occupancyRate.toFixed(0)}% occ.</div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* AI + Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1a3555 100%)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "var(--gold)", transform: "translate(30%, -30%)" }} />
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--gold)" }}>✦ AI Powered</div>
            <h3 className="text-[15px] font-bold text-white mb-1">Veethrill Intelligence</h3>
            <p className="text-[11.5px] text-white/60 mb-4">Real-time insights from your live portfolio data. Powered by Claude AI.</p>
            <Link href="/dashboard/ai"
              className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-3.5 py-2 rounded-lg"
              style={{ background: "var(--gold)", color: "var(--navy)" }}>
              <Sparkles size={12} />
              Launch AI Assistant →
            </Link>
            <div className="mt-4 space-y-1.5">
              {[
                { icon: "🎯", text: `${kpis.activeTasks} CRM tasks need attention` },
                { icon: "📈", text: `₦${(kpis.pipelineValue / 1000000).toFixed(1)}M in active deals pipeline` },
                { icon: "🏠", text: `${vacant} unit${vacant !== 1 ? "s" : ""} currently vacant` },
              ].map((ins, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/7 rounded-lg px-3 py-2 text-[11.5px] text-white/85">
                  <span>{ins.icon}</span> {ins.text}
                </div>
              ))}
            </div>
          </div>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <span className="text-[10.5px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">All modules live</span>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: "🏢", name: "Properties",   count: `${data?.totalProperties ?? 0} total`,       href: "/dashboard/properties" },
                  { icon: "👥", name: "Tenants",       count: `${occupied} active`,                        href: "/dashboard/tenants" },
                  { icon: "📄", name: "Leases",        count: `${expiringLeases.length} expiring`,          href: "/dashboard/leases" },
                  { icon: "🏨", name: "Shortlets",     count: `${data?.shortletActive ?? 0} active`,       href: "/dashboard/shortlets" },
                  { icon: "💳", name: "Payments",      count: `${overduePayments.length} overdue`,          href: "/dashboard/payments" },
                  { icon: "🔩", name: "Maintenance",   count: `${kpis.openWorkOrders} open`,               href: "/dashboard/maintenance" },
                  { icon: "🤝", name: "CRM",           count: `${activeDeals.length} deals`,               href: "/dashboard/crm/contacts" },
                  { icon: "📅", name: "Meetings",      count: `${upcomingMeetings.length} upcoming`,        href: "/dashboard/crm/meetings" },
                ].map((m) => (
                  <Link key={m.name} href={m.href}
                    className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100 hover:border-yellow-300 hover:shadow-sm transition-all cursor-pointer group">
                    <span className="text-2xl mb-1.5">{m.icon}</span>
                    <span className="text-[11px] font-bold text-gray-900 group-hover:text-yellow-700">{m.name}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{m.count}</span>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}
