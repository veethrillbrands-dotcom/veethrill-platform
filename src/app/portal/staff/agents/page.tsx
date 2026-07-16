import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { Users, TrendingUp, Phone, Mail, MessageCircle } from "lucide-react";

export default async function StaffAgentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const [teamMembers, commissions] = await Promise.all([
    db.crmTeamMember.findMany({ orderBy: { createdAt: "desc" } }),
    db.crmCommission.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const active = teamMembers.filter((m) => m.active);
  const inactive = teamMembers.filter((m) => !m.active);
  const totalTarget = active.reduce((s, m) => s + m.target, 0);
  const totalAchieved = active.reduce((s, m) => s + m.achieved, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PortalTopbar title="Agents & Team" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Active Agents", value: active.length, icon: <Users size={14} />, color: "var(--navy)" },
            { label: "Inactive", value: inactive.length, icon: <Users size={14} />, color: "var(--gold)" },
            { label: "Team Target", value: formatCurrency(totalTarget), icon: <TrendingUp size={14} />, color: "#3B82F6" },
            { label: "Team Achieved", value: formatCurrency(totalAchieved), icon: <TrendingUp size={14} />, color: "var(--emerald)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-[14px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Team performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Team Performance ({teamMembers.length})</div>
          {teamMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-[13px]">No team members added yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {teamMembers.map((m) => {
                const pct = m.target > 0 ? Math.min(100, Math.round((m.achieved / m.target) * 100)) : 0;
                return (
                  <div key={m.id} className="px-5 py-4 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] flex-shrink-0"
                        style={{ background: m.active ? "linear-gradient(135deg, var(--gold), #b8960a)" : "#e5e7eb", color: m.active ? "var(--navy)" : "#9ca3af" }}>
                        {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-[13px] font-bold text-gray-900">{m.name}</div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                            {m.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="text-[11.5px] text-gray-400">{m.role}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[13px] font-black" style={{ color: pct >= 80 ? "var(--emerald)" : pct >= 50 ? "var(--gold)" : "#EF4444" }}>{pct}%</div>
                        <div className="text-[10.5px] text-gray-400">{formatCurrency(m.achieved)} / {formatCurrency(m.target)}</div>
                      </div>
                    </div>
                    {m.target > 0 && (
                      <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: pct >= 80 ? "var(--emerald)" : pct >= 50 ? "var(--gold)" : "#EF4444" }} />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.phone && (
                        <>
                          <a href={`tel:${m.phone}`} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center" title="Call">
                            <Phone size={11} className="text-blue-600" />
                          </a>
                          <a href={`https://wa.me/${m.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${m.name.split(" ")[0]}, this is ${user.firstName} from Veethrill Realty.`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center" title="WhatsApp">
                            <MessageCircle size={11} className="text-green-600" />
                          </a>
                        </>
                      )}
                      <a href={`mailto:${m.email}`} className="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center" title="Email">
                        <Mail size={11} className="text-purple-600" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent commissions */}
        {commissions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Recent Commissions</div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Agent", "Property", "Deal Value", "Commission", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">{c.agent}</td>
                      <td className="px-5 py-3 text-[12.5px] text-gray-600">{c.property}</td>
                      <td className="px-5 py-3 text-[12.5px] text-gray-600">{formatCurrency(c.dealValue)}</td>
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
        )}

      </div>
    </div>
  );
}
