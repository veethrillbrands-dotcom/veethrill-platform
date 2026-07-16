import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, TrendingUp, Building2 } from "lucide-react";

export default async function OwnerRevenuePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const [properties, payments] = await Promise.all([
    db.property.findMany({
      include: {
        units: {
          include: {
            leases: { where: { status: "ACTIVE" } },
          },
        },
      },
    }),
    db.payment.findMany({
      where: { status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 20,
      include: { lease: { include: { unit: { include: { property: true } } } } },
    }),
  ]);

  const totalMonthlyRent = properties.reduce((s, p) => s + p.units.filter((u) => u.leases.length > 0).reduce((us, u) => us + u.monthlyRent, 0), 0);
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalUnits = properties.reduce((s, p) => s + p.units.length, 0);
  const occupiedUnits = properties.reduce((s, p) => s + p.units.filter((u) => u.leases.length > 0).length, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PortalTopbar title="Revenue Overview" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Monthly Rent Roll", value: formatCurrency(totalMonthlyRent), icon: <CreditCard size={14} />, color: "var(--navy)" },
            { label: "Total Collected", value: formatCurrency(totalCollected), icon: <TrendingUp size={14} />, color: "var(--emerald)" },
            { label: "Properties", value: properties.length, icon: <Building2 size={14} />, color: "#3B82F6" },
            { label: "Occupancy", value: `${totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0}%`, icon: <Building2 size={14} />, color: "var(--gold)" },
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

        {/* Per-property breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Revenue by Property</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Property", "Units", "Occupied", "Monthly Rent", "Occupancy"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => {
                  const occ = p.units.filter((u) => u.leases.length > 0);
                  const rev = occ.reduce((s, u) => s + u.monthlyRent, 0);
                  const pct = p.units.length > 0 ? Math.round((occ.length / p.units.length) * 100) : 0;
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">{p.name}</td>
                      <td className="px-5 py-3 text-[12.5px] text-gray-600">{p.units.length}</td>
                      <td className="px-5 py-3 text-[12.5px] text-gray-600">{occ.length}</td>
                      <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--emerald)" }}>{formatCurrency(rev)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? "var(--emerald)" : "var(--gold)" }} />
                          </div>
                          <span className="text-[11px] font-bold text-gray-600">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Recent Collections</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Property · Unit", "Type", "Paid Date", "Amount"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8 text-[13px]">No payments collected yet.</td></tr>
                ) : payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-[12.5px] font-semibold text-gray-900">{p.lease?.unit?.property.name ?? "—"} · Unit {p.lease?.unit?.unitNumber ?? "—"}</td>
                    <td className="px-5 py-3 text-[12.5px] text-gray-600">{p.type}</td>
                    <td className="px-5 py-3 text-[12.5px] text-gray-600">{p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
