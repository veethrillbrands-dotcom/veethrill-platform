import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, TrendingUp } from "lucide-react";

export default async function AgentCommissionsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const commissions = await db.crmCommission.findMany({
    where: { agentUserId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const paid = commissions.filter((c) => c.status === "Paid");
  const pending = commissions.filter((c) => c.status === "Pending");
  const totalPaid = paid.reduce((s, c) => s + c.commissionAmount, 0);
  const totalPending = pending.reduce((s, c) => s + c.commissionAmount, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PortalTopbar title="My Commissions" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Earned", value: formatCurrency(totalPaid), icon: <CreditCard size={14} />, color: "var(--emerald)" },
            { label: "Pending", value: formatCurrency(totalPending), icon: <TrendingUp size={14} />, color: "var(--gold)" },
            { label: "Paid Deals", value: paid.length, icon: <CreditCard size={14} />, color: "var(--navy)" },
            { label: "Pending Deals", value: pending.length, icon: <TrendingUp size={14} />, color: "#EF4444" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-[15px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Commission History</div>
          {commissions.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-[13px]">No commissions recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Property", "Deal Value", "Rate", "Commission", "Date", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">{c.property}</td>
                      <td className="px-5 py-3 text-[12.5px] text-gray-600">{formatCurrency(c.dealValue)}</td>
                      <td className="px-5 py-3 text-[12.5px] text-gray-600">{c.commissionRate}%</td>
                      <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--emerald)" }}>{formatCurrency(c.commissionAmount)}</td>
                      <td className="px-5 py-3 text-[12px] text-gray-600">{new Date(c.createdAt).toLocaleDateString("en-GB")}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${c.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
