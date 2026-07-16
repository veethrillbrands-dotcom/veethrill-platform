import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { Building2, Home, Wrench, Search } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-gray-100 text-gray-500",
  UNDER_RENOVATION: "bg-orange-100 text-orange-700",
  SOLD: "bg-red-100 text-red-700",
};

export default async function StaffPropertiesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const properties = await db.property.findMany({
    include: {
      units: {
        include: { leases: { where: { status: "ACTIVE" } } },
      },
      workOrders: { where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } } },
      inspections: { where: { completedAt: null } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalUnits = properties.reduce((s, p) => s + p.units.length, 0);
  const occupiedUnits = properties.reduce((s, p) => s + p.units.filter((u) => u.leases.length > 0).length, 0);
  const totalOpenJobs = properties.reduce((s, p) => s + p.workOrders.length, 0);
  const totalInspections = properties.reduce((s, p) => s + p.inspections.length, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PortalTopbar title="Properties" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Properties", value: properties.length, icon: <Building2 size={14} />, color: "var(--navy)" },
            { label: "Total Units", value: totalUnits, icon: <Home size={14} />, color: "#3B82F6" },
            { label: "Open Jobs", value: totalOpenJobs, icon: <Wrench size={14} />, color: totalOpenJobs > 0 ? "var(--gold)" : "var(--emerald)" },
            { label: "Pending Inspections", value: totalInspections, icon: <Search size={14} />, color: totalInspections > 0 ? "var(--gold)" : "var(--emerald)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Occupancy summary bar */}
        {totalUnits > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-gray-900 text-[14px]">Portfolio Occupancy</div>
              <div className="text-[13px] font-black" style={{ color: "var(--emerald)" }}>
                {Math.round((occupiedUnits / totalUnits) * 100)}%
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((occupiedUnits / totalUnits) * 100)}%`, background: "var(--emerald)" }} />
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-gray-400">
              <span>{occupiedUnits} occupied</span>
              <span>{totalUnits - occupiedUnits} vacant</span>
            </div>
          </div>
        )}

        {properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🏢</div>
            <div className="text-[15px] font-bold text-gray-700">No Properties</div>
          </div>
        ) : properties.map((p) => {
          const occ = p.units.filter((u) => u.leases.length > 0).length;
          const pct = p.units.length > 0 ? Math.round((occ / p.units.length) * 100) : 0;
          const monthlyRev = p.units.filter((u) => u.leases.length > 0).reduce((s, u) => s + u.monthlyRent, 0);

          return (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-xl flex-shrink-0">🏢</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-gray-900 text-[15px]">{p.name}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? "bg-gray-100 text-gray-600"}`}>{p.status.replace("_", " ")}</span>
                  </div>
                  <div className="text-[12px] text-gray-400">{p.address}, {p.city} · {p.type.replace("_", " ")}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[14px] font-black" style={{ color: "var(--navy)" }}>{formatCurrency(monthlyRev)}<span className="text-[10px] text-gray-400 font-normal">/mo</span></div>
                  <div className="text-[11px] font-bold" style={{ color: pct >= 80 ? "var(--emerald)" : "var(--gold)" }}>{pct}% occupied</div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                {[
                  { label: "Units", value: p.units.length },
                  { label: "Occupied", value: occ },
                  { label: "Open Jobs", value: p.workOrders.length },
                  { label: "Inspections", value: p.inspections.length },
                ].map((s) => (
                  <div key={s.label} className="px-4 py-3 text-center">
                    <div className="text-[16px] font-black text-gray-900">{s.value}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Occupancy bar */}
              {p.units.length > 0 && (
                <div className="px-5 py-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? "var(--emerald)" : "var(--gold)" }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
