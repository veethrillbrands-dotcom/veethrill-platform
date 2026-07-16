import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { Building2, Home } from "lucide-react";

export default async function OwnerPropertiesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const properties = await db.property.findMany({
    include: {
      units: {
        include: {
          leases: { where: { status: "ACTIVE" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalUnits = properties.reduce((s, p) => s + p.units.length, 0);
  const occupied = properties.reduce((s, p) => s + p.units.filter((u) => u.leases.length > 0).length, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="My Properties" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Properties", value: properties.length, icon: <Building2 size={14} />, color: "var(--navy)" },
            { label: "Total Units", value: totalUnits, icon: <Home size={14} />, color: "#3B82F6" },
            { label: "Occupied", value: occupied, icon: <Home size={14} />, color: "var(--emerald)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-[18px] font-black text-gray-900">{k.value}</div>
            </div>
          ))}
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏢</div>
            <div className="text-[16px] font-bold text-gray-700">No Properties Yet</div>
            <div className="text-[13px] text-gray-400 mt-2">Your properties will appear here once linked to your account.</div>
          </div>
        ) : properties.map((p) => {
          const occupiedUnits = p.units.filter((u) => u.leases.length > 0);
          const occupancyPct = p.units.length > 0 ? Math.round((occupiedUnits.length / p.units.length) * 100) : 0;
          const monthlyRevenue = occupiedUnits.reduce((s, u) => s + u.monthlyRent, 0);

          return (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-xl flex-shrink-0">🏢</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-[15px]">{p.name}</div>
                  <div className="text-[12px] text-gray-400">{p.address}, {p.city}</div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-black" style={{ color: "var(--navy)" }}>{formatCurrency(monthlyRevenue)}<span className="text-[10px] text-gray-400 font-normal">/mo</span></div>
                  <div className="text-[11px] font-bold" style={{ color: occupancyPct >= 80 ? "var(--emerald)" : "var(--gold)" }}>{occupancyPct}% occupied</div>
                </div>
              </div>

              <div className="px-5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-bold text-gray-500">Occupancy</div>
                  <div className="text-[11px] text-gray-500">{occupiedUnits.length} / {p.units.length} units</div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${occupancyPct}%`, background: occupancyPct >= 80 ? "var(--emerald)" : "var(--gold)" }} />
                </div>
              </div>

              {p.units.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {p.units.map((u) => {
                    const lease = u.leases[0];
                    return (
                      <div key={u.id} className="px-5 py-2.5 flex items-center justify-between">
                        <div className="text-[12.5px] font-semibold text-gray-800">Unit {u.unitNumber} · {u.bedrooms}bd</div>
                        <div className="flex items-center gap-3">
                          <div className="text-[12px] text-gray-600">{formatCurrency(u.monthlyRent)}/mo</div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lease ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                            {lease ? "Occupied" : "Vacant"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
