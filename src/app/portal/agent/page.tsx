import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { Users, TrendingUp, CreditCard, MessageCircle, Phone, Mail, CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";

export default async function AgentPortalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  // Agent only sees contacts they created
  const [contacts, deals, commissions, trainings, tasks] = await Promise.all([
    db.crmContact.findMany({
      where: { createdByUserId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.crmDeal.findMany({
      orderBy: { createdAt: "desc" }, take: 10,
    }),
    db.crmCommission.findMany({
      where: { agentUserId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    db.crmTrainingProgram.findMany({ orderBy: { startDate: "asc" }, take: 5 }),
    db.crmTask.findMany({
      where: { assignedToUserId: user.id, status: { not: "CANCELLED" } },
      include: { contact: { select: { id: true, name: true } } },
      orderBy: [{ dueAt: "asc" }, { priority: "asc" }],
      take: 15,
    }),
  ]);

  const totalCommission = commissions.filter((c) => c.status === "Paid").reduce((s, c) => s + c.commissionAmount, 0);
  const pendingCommission = commissions.filter((c) => c.status === "Pending").reduce((s, c) => s + c.commissionAmount, 0);

  const TYPE_COLORS: Record<string, string> = {
    Prospect: "bg-blue-100 text-blue-700", Client: "bg-emerald-100 text-emerald-700",
    Developer: "bg-purple-100 text-purple-700", Agent: "bg-yellow-100 text-yellow-700",
    HNI: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PortalTopbar title="Agent Dashboard" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, var(--navy), #1a3a5c)" }}>
          <div className="text-[13px] text-white/60">Welcome back</div>
          <div className="text-[22px] font-black mt-0.5">{user.firstName} {user.lastName}</div>
          <div className="text-[13px] text-white/60 mt-1">Sales Agent · Veethrill Realty</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "My Contacts", value: contacts.length, icon: <Users size={15} />, color: "var(--navy)" },
            { label: "Active Deals", value: deals.filter((d) => !["Closed Won", "Closed Lost"].includes(d.stage)).length, icon: <TrendingUp size={15} />, color: "#3B82F6" },
            { label: "Commission Paid", value: formatCurrency(totalCommission), icon: <CreditCard size={15} />, color: "var(--emerald)" },
            { label: "Pending Commission", value: formatCurrency(pendingCommission), icon: <CreditCard size={15} />, color: "var(--gold)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-[16px] font-black text-gray-900">{k.value}</div>
            </div>
          ))}
        </div>

        {/* My Contacts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">My Contacts ({contacts.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Name", "Type", "Phone", "Email", "Contact"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-8 text-[13px]">No contacts yet. Add contacts from the admin panel.</td></tr>
                ) : contacts.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 group">
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">{c.name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[c.type] ?? "bg-gray-100 text-gray-600"}`}>{c.type}</span>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-gray-600">{c.phone ?? "—"}</td>
                    <td className="px-5 py-3 text-[12px] text-gray-600">{c.email ?? "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {c.phone && (
                          <>
                            <a href={`tel:${c.phone}`} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center"><Phone size={11} className="text-blue-600" /></a>
                            <a href={`https://wa.me/${c.phone.replace(/\D/g,"")}?text=${encodeURIComponent(`Hi ${c.name.split(" ")[0]}, this is ${user.firstName} from Veethrill Realty.`)}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center"><MessageCircle size={11} className="text-green-600" /></a>
                          </>
                        )}
                        {c.email && <a href={`mailto:${c.email}`} className="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center"><Mail size={11} className="text-purple-600" /></a>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commissions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">My Commissions</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Property", "Deal Value", "Rate", "Commission", "Status"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commissions.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-8 text-[13px]">No commissions recorded yet.</td></tr>
                ) : commissions.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50">
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">{c.property}</td>
                    <td className="px-5 py-3 text-[12.5px] text-gray-600">{formatCurrency(c.dealValue)}</td>
                    <td className="px-5 py-3 text-[12.5px] text-gray-600">{c.commissionRate}%</td>
                    <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--emerald)" }}>{formatCurrency(c.commissionAmount)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${c.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>{c.status}</span>
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
          const overdueTasks = tasks.filter((t) => t.status !== "COMPLETED" && t.dueAt && new Date(t.dueAt) < now);
          const todayTasks = tasks.filter((t) => t.status !== "COMPLETED" && t.dueAt && new Date(t.dueAt) >= now && new Date(t.dueAt) <= todayEnd);
          const PRIORITY_COLOR: Record<string, string> = { URGENT: "text-red-600 bg-red-50", HIGH: "text-orange-600 bg-orange-50", MEDIUM: "text-blue-600 bg-blue-50", LOW: "text-gray-500 bg-gray-50" };
          return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="font-bold text-gray-900 text-[14px]">My Tasks & Reminders ({tasks.filter((t) => t.status !== "COMPLETED").length} pending)</div>
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
              {tasks.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-[13px]">No tasks assigned. Create tasks from the CRM.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {tasks.map((t) => {
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
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[t.priority] ?? "bg-gray-50 text-gray-500"}`}>{t.priority}</span>
                            {t.contact && <span className="text-[11px] text-blue-600">{t.contact.name}</span>}
                            {t.dueAt && (
                              <span className={`flex items-center gap-1 text-[10.5px] ${isOverdue ? "text-red-600 font-bold" : isDueToday ? "text-orange-600 font-semibold" : "text-gray-400"}`}>
                                <Clock size={9} />
                                {new Date(t.dueAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                                {" "}
                                {new Date(t.dueAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                                {isOverdue && " · OVERDUE"}
                                {isDueToday && " · TODAY"}
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

        {/* Upcoming Training */}
        {trainings.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Upcoming Training</div>
            <div className="divide-y divide-gray-50">
              {trainings.map((t) => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-gray-900">{t.title}</div>
                    <div className="text-[11.5px] text-gray-400">{t.trainer} · {t.venue ?? "Online"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-bold text-gray-700">{new Date(t.startDate).toLocaleDateString("en-GB")}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === "Upcoming" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
