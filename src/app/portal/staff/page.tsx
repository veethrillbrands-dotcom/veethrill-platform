import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import {
  Wrench, AlertTriangle, Clock, Users, Building2,
  FileText, Star, TrendingUp, Phone, Mail, MessageCircle,
  CheckCircle2, Circle,
} from "lucide-react";

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-blue-100 text-blue-700",
  ROUTINE: "bg-gray-100 text-gray-600",
};

const INV_STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-500",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
  SENT: "bg-indigo-100 text-indigo-700",
  PAID: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-500",
};

export default async function StaffPortalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    myContacts,
    properties,
    activeTenants,
    teamMembers,
    openWorkOrders,
    pendingInspections,
    recentInvoices,
    allInvoices,
    myTasks,
  ] = await Promise.all([
    db.crmContact.findMany({
      where: { createdByUserId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.property.findMany({
      include: {
        units: { include: { leases: { where: { status: "ACTIVE" } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.tenant.findMany({
      include: {
        user: true,
        leases: {
          where: { status: "ACTIVE" },
          include: { unit: { include: { property: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.crmTeamMember.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    db.workOrder.findMany({
      where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } },
      include: { property: true, unit: true },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      take: 5,
    }),
    db.inspection.findMany({
      where: { completedAt: null },
      include: { property: true, unit: true },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    db.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.invoice.findMany({ select: { status: true, total: true } }),
    db.crmTask.findMany({
      where: { assignedToUserId: user.id, status: { not: "CANCELLED" } },
      include: { contact: { select: { id: true, name: true } } },
      orderBy: [{ dueAt: "asc" }, { priority: "asc" }],
      take: 10,
    }),
  ]);

  const totalContacts = await db.crmContact.count({ where: { createdByUserId: user.id } });
  const totalWorkOrders = await db.workOrder.count({ where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } } });
  const overdueInspections = pendingInspections.filter((i) => new Date(i.scheduledAt) < today).length;
  const urgentJobs = openWorkOrders.filter((w) => ["URGENT", "HIGH"].includes(w.priority)).length;
  const totalUnits = properties.reduce((s, p) => s + p.units.length, 0);
  const occupiedUnits = properties.reduce((s, p) => s + p.units.filter((u) => u.leases.length > 0).length, 0);
  const pendingInvoicesAmt = allInvoices.filter((i) => !["PAID", "CANCELLED"].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const paidInvoicesAmt = allInvoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0);

  const TYPE_COLORS: Record<string, string> = {
    Prospect: "bg-blue-100 text-blue-700",
    Client: "bg-emerald-100 text-emerald-700",
    Developer: "bg-purple-100 text-purple-700",
    Agent: "bg-yellow-100 text-yellow-700",
    HNI: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="Staff Dashboard" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        {/* Welcome banner */}
        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, var(--navy), #1a3a5c)" }}>
          <div className="text-[13px] text-white/60">Welcome back</div>
          <div className="text-[22px] font-black mt-0.5">{user.firstName} {user.lastName}</div>
          <div className="text-[13px] text-white/60 mt-1">Property Staff · Veethrill Realty</div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "My Contacts", value: totalContacts, icon: <Users size={15} />, color: "var(--navy)" },
            { label: "Properties", value: properties.length, icon: <Building2 size={15} />, color: "#3B82F6" },
            { label: "Active Tenants", value: activeTenants.length, icon: <Users size={15} />, color: "var(--emerald)" },
            { label: "Team Members", value: teamMembers.length, icon: <Star size={15} />, color: "var(--gold)" },
            { label: "Open Work Orders", value: totalWorkOrders, icon: <Wrench size={15} />, color: urgentJobs > 0 ? "#EF4444" : "var(--gold)" },
            { label: "Urgent / High", value: urgentJobs, icon: <AlertTriangle size={15} />, color: urgentJobs > 0 ? "#EF4444" : "var(--emerald)" },
            { label: "Overdue Inspections", value: overdueInspections, icon: <Clock size={15} />, color: overdueInspections > 0 ? "#EF4444" : "var(--emerald)" },
            { label: "Pending Invoices", value: formatCurrency(pendingInvoicesAmt), icon: <FileText size={15} />, color: "var(--navy)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-[15px] font-black text-gray-900">{k.value}</div>
            </div>
          ))}
        </div>

        {/* My Contacts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="font-bold text-gray-900 text-[14px]">My Contacts ({totalContacts})</div>
            <a href="/portal/staff/contacts" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View all →</a>
          </div>
          {myContacts.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-[13px]">No contacts created yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {myContacts.map((c) => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[13px] font-semibold text-gray-900">{c.name}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[c.type] ?? "bg-gray-100 text-gray-600"}`}>{c.type}</span>
                    </div>
                    {c.company && <div className="text-[11.5px] text-gray-400">{c.company}</div>}
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {c.phone && (
                      <>
                        <a href={`tel:${c.phone}`} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center"><Phone size={11} className="text-blue-600" /></a>
                        <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${c.name.split(" ")[0]}, this is ${user.firstName} from Veethrill Realty.`)}`}
                          target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center">
                          <MessageCircle size={11} className="text-green-600" />
                        </a>
                      </>
                    )}
                    {c.email && <a href={`mailto:${c.email}`} className="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center"><Mail size={11} className="text-purple-600" /></a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Properties overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="font-bold text-gray-900 text-[14px]">Properties ({properties.length})</div>
            <a href="/portal/staff/properties" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View all →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {properties.slice(0, 5).map((p) => {
              const occ = p.units.filter((u) => u.leases.length > 0).length;
              const pct = p.units.length > 0 ? Math.round((occ / p.units.length) * 100) : 0;
              return (
                <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center text-lg flex-shrink-0">🏢</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 truncate">{p.name}</div>
                    <div className="text-[11.5px] text-gray-400">{p.city} · {p.units.length} units</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[12px] font-bold" style={{ color: pct >= 80 ? "var(--emerald)" : "var(--gold)" }}>{pct}% occ.</div>
                    <div className="text-[11px] text-gray-400">{occ}/{p.units.length} units</div>
                  </div>
                </div>
              );
            })}
            {properties.length === 0 && <div className="text-center text-gray-400 py-8 text-[13px]">No properties found.</div>}
          </div>
        </div>

        {/* Tenants / Accounts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="font-bold text-gray-900 text-[14px]">Active Tenants</div>
            <a href="/portal/staff/tenants" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Tenant", "Property · Unit", "Rent", "KYC"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTenants.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8 text-[13px]">No active tenants.</td></tr>
                ) : activeTenants.map((t) => {
                  const lease = t.leases[0];
                  return (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-semibold text-gray-900">{t.user.firstName} {t.user.lastName}</div>
                        <div className="text-[11px] text-gray-400">{t.user.email}</div>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-gray-600">
                        {lease ? `${lease.unit.property.name} · Unit ${lease.unit.unitNumber}` : "—"}
                      </td>
                      <td className="px-5 py-3 text-[12.5px] font-bold" style={{ color: "var(--navy)" }}>
                        {lease ? formatCurrency(lease.rentAmount) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.kycStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-700" :
                          t.kycStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"}`}>{t.kycStatus}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agents / Team */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="font-bold text-gray-900 text-[14px]">Agents & Team ({teamMembers.length})</div>
            <a href="/portal/staff/agents" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View all →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {teamMembers.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-[13px]">No team members added yet.</div>
            ) : teamMembers.map((m) => {
              const pct = m.target > 0 ? Math.min(100, Math.round((m.achieved / m.target) * 100)) : 0;
              return (
                <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--gold), #b8960a)", color: "var(--navy)" }}>
                    {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900">{m.name}</div>
                    <div className="text-[11.5px] text-gray-400">{m.role}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[12px] font-bold" style={{ color: pct >= 80 ? "var(--emerald)" : "var(--gold)" }}>{pct}%</div>
                    <div className="text-[10.5px] text-gray-400">{formatCurrency(m.achieved)} / {formatCurrency(m.target)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Open Work Orders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="font-bold text-gray-900 text-[14px]">Open Work Orders</div>
              <a href="/portal/staff/work-orders" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View all →</a>
            </div>
            <div className="divide-y divide-gray-50">
              {openWorkOrders.length === 0 ? (
                <div className="text-center text-gray-400 py-6 text-[13px]">All clear!</div>
              ) : openWorkOrders.map((w) => (
                <div key={w.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-900 truncate">{w.title}</div>
                    <div className="text-[11px] text-gray-400">{w.property.name}{w.unit ? ` · Unit ${w.unit.unitNumber}` : ""}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${PRIORITY_COLOR[w.priority] ?? "bg-gray-100"}`}>{w.priority}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Inspections */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="font-bold text-gray-900 text-[14px]">Pending Inspections</div>
              <a href="/portal/staff/inspections" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View all →</a>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingInspections.length === 0 ? (
                <div className="text-center text-gray-400 py-6 text-[13px]">No pending inspections.</div>
              ) : pendingInspections.map((i) => {
                const overdue = new Date(i.scheduledAt) < today;
                return (
                  <div key={i.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold text-gray-900 truncate">{i.property.name}{i.unit ? ` · Unit ${i.unit.unitNumber}` : ""}</div>
                      <div className="text-[11px] text-gray-400">{i.type} inspection</div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                      <div className={`text-[11.5px] font-semibold ${overdue ? "text-red-600" : "text-gray-600"}`}>{new Date(i.scheduledAt).toLocaleDateString("en-GB")}</div>
                      {overdue && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">LATE</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="font-bold text-gray-900 text-[14px]">Recent Invoices</div>
            <div className="flex items-center gap-4">
              <div className="text-[12px] text-gray-500">Paid: <span className="font-bold text-emerald-600">{formatCurrency(paidInvoicesAmt)}</span></div>
              <a href="/portal/staff/invoices" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View all →</a>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Invoice #", "Recipient", "Amount", "Status"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8 text-[13px]">No invoices yet.</td></tr>
                ) : recentInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-[12.5px] font-bold text-gray-900">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-[12.5px] text-gray-600">{inv.recipientName}</td>
                    <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(inv.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${INV_STATUS_COLOR[inv.status] ?? "bg-gray-100 text-gray-600"}`}>{inv.status.replace("_", " ")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Tasks */}
        {(() => {
          const now = new Date();
          const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
          const overdueTasks = myTasks.filter((t) => t.status !== "COMPLETED" && t.dueAt && new Date(t.dueAt) < now);
          const todayTasks = myTasks.filter((t) => t.status !== "COMPLETED" && t.dueAt && new Date(t.dueAt) >= now && new Date(t.dueAt) <= todayEnd);
          const TASK_PRIORITY_COLOR: Record<string, string> = { URGENT: "text-red-600 bg-red-50", HIGH: "text-orange-600 bg-orange-50", MEDIUM: "text-blue-600 bg-blue-50", LOW: "text-gray-500 bg-gray-50" };
          return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="font-bold text-gray-900 text-[14px]">My Tasks ({myTasks.filter((t) => t.status !== "COMPLETED").length} pending)</div>
                <div className="flex items-center gap-2">
                  {overdueTasks.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                      <AlertTriangle size={10} /> {overdueTasks.length} overdue
                    </span>
                  )}
                  {todayTasks.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                      <Clock size={10} /> {todayTasks.length} due today
                    </span>
                  )}
                </div>
              </div>
              {myTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-[13px]">No tasks assigned.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {myTasks.map((t) => {
                    const isDone = t.status === "COMPLETED";
                    const isOverdue = !isDone && t.dueAt && new Date(t.dueAt) < now;
                    const isDueToday = !isDone && t.dueAt && new Date(t.dueAt) >= now && new Date(t.dueAt) <= todayEnd;
                    return (
                      <div key={t.id} className={`px-5 py-3 flex items-center gap-3 ${isOverdue ? "bg-red-50/30" : ""}`}>
                        <div className={isDone ? "text-emerald-500" : "text-gray-300"}>
                          {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] font-semibold ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>{t.title}</div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TASK_PRIORITY_COLOR[t.priority] ?? "bg-gray-50 text-gray-500"}`}>{t.priority}</span>
                            {t.contact && <span className="text-[11px] text-blue-600">{t.contact.name}</span>}
                            {t.dueAt && (
                              <span className={`flex items-center gap-1 text-[10.5px] ${isOverdue ? "text-red-600 font-bold" : isDueToday ? "text-orange-600 font-semibold" : "text-gray-400"}`}>
                                <Clock size={9} />
                                {new Date(t.dueAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                                {isOverdue && " · OVERDUE"}{isDueToday && " · TODAY"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
}
