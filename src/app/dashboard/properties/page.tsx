import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Building2, MapPin, TrendingUp } from "lucide-react";

async function getProperties() {
  return db.property.findMany({
    include: { units: true },
    orderBy: { createdAt: "asc" },
  });
}

const TYPE_EMOJI: Record<string, string> = {
  RESIDENTIAL: "🏘️", COMMERCIAL: "🏢", MIXED_USE: "🏙️",
  SHORTLET: "🏨", LUXURY_RESIDENTIAL: "💎",
};

export default async function PropertiesPage() {
  const properties = await getProperties();

  const enriched = properties.map((p) => {
    const total = p.units.length;
    const occupied = p.units.filter((u) => u.status === "OCCUPIED").length;
    const vacant = p.units.filter((u) => u.status === "VACANT").length;
    const monthlyRevenue = p.units.filter((u) => u.status === "OCCUPIED").reduce((s, u) => s + u.monthlyRent, 0);
    const occupancy = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { ...p, total, occupied, vacant, monthlyRevenue, occupancy };
  });

  const totalRevenue = enriched.reduce((s, p) => s + p.monthlyRevenue, 0);
  const avgOccupancy = enriched.length > 0 ? Math.round(enriched.reduce((s, p) => s + p.occupancy, 0) / enriched.length) : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Properties" action={{ label: "Add Property" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Summary KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Properties", value: enriched.length, color: "var(--navy)" },
            { label: "Total Units", value: enriched.reduce((s, p) => s + p.total, 0), color: "var(--emerald)" },
            { label: "Avg Occupancy", value: `${avgOccupancy}%`, color: "var(--gold)" },
            { label: "Monthly Revenue", value: formatCurrency(totalRevenue), color: "#3B82F6" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[22px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle sub={`${enriched.length} properties across Nigeria`}>Property Portfolio</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Property", "Type", "Location", "Units", "Occupancy", "Monthly Revenue", "Health", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enriched.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 pl-5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{TYPE_EMOJI[p.type] ?? "🏢"}</span>
                          <div>
                            <div className="text-[13px] font-semibold text-gray-900">{p.name}</div>
                            <div className="text-[11px] text-gray-400">{p.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {p.type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-[12px] text-gray-600 whitespace-nowrap">
                          <MapPin size={11} className="text-gray-400" />
                          {p.city}, {p.state}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[12px] text-gray-900 font-medium">{p.total} total</div>
                        <div className="text-[11px] text-gray-400">{p.occupied} occ · {p.vacant} vac</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width: `${p.occupancy}%`,
                              background: p.occupancy >= 90 ? "var(--emerald)" : p.occupancy >= 70 ? "var(--gold)" : "#EF4444"
                            }} />
                          </div>
                          <span className="text-[12px] font-bold text-gray-900">{p.occupancy}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-bold text-gray-900">
                          {p.monthlyRevenue > 0 ? formatCurrency(p.monthlyRevenue) : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={12} className={p.healthScore >= 90 ? "text-emerald-500" : "text-yellow-500"} />
                          <span className={`text-[12px] font-bold ${p.healthScore >= 90 ? "text-emerald-600" : "text-yellow-600"}`}>
                            {p.healthScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.status === "ACTIVE" ? "success" : "default"}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-3 gap-4">
          {enriched.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{TYPE_EMOJI[p.type] ?? "🏢"}</span>
                  <div>
                    <div className="text-[13px] font-bold text-gray-900">{p.name}</div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1">
                      <MapPin size={10} /> {p.city}, {p.state}
                    </div>
                  </div>
                </div>
                <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p.healthScore >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-yellow-50 text-yellow-700"}`}>
                  {p.healthScore}%
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Units", value: p.total },
                  { label: "Occupied", value: p.occupied },
                  { label: "Occupancy", value: `${p.occupancy}%` },
                ].map((s) => (
                  <div key={s.label} className="text-center bg-gray-50 rounded-xl p-2">
                    <div className="text-[14px] font-black text-gray-900">{s.value}</div>
                    <div className="text-[9.5px] text-gray-400 font-semibold uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">Monthly Revenue</div>
                  <div className="text-[14px] font-black" style={{ color: "var(--navy)" }}>
                    {p.monthlyRevenue > 0 ? formatCurrency(p.monthlyRevenue) : "—"}
                  </div>
                </div>
                <Building2 size={16} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
