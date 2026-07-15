import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/kpi-card";
import { mockProperties } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Building2, MapPin, Home } from "lucide-react";

export default function PropertiesPage() {
  const totalUnits = mockProperties.reduce((s, p) => s + p.totalUnits, 0);
  const occupiedUnits = mockProperties.reduce((s, p) => s + p.occupiedUnits, 0);
  const totalRevenue = mockProperties.reduce((s, p) => s + p.monthlyRevenue, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Property Portfolio" action={{ label: "Add Property" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Total Properties" value={`${mockProperties.length}`} accentColor="var(--navy)" icon={<Building2 size={18} className="text-gray-700" />} />
          <KPICard label="Total Units" value={`${totalUnits}`} accentColor="var(--emerald)" icon={<Home size={18} style={{ color: "var(--emerald)" }} />} />
          <KPICard label="Occupied Units" value={`${occupiedUnits}`} change={2.1} accentColor="var(--gold)" />
          <KPICard label="Monthly Revenue" value={formatCurrency(totalRevenue)} change={12.4} accentColor="var(--gold)" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle sub={`${mockProperties.length} properties across Nigeria`}>All Properties</CardTitle>
            <div className="flex gap-2">
              <select className="text-[12px] border border-gray-100 px-3 py-1.5 rounded-lg outline-none text-gray-600 bg-white">
                <option>All Cities</option>
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Port Harcourt</option>
              </select>
              <select className="text-[12px] border border-gray-100 px-3 py-1.5 rounded-lg outline-none text-gray-600 bg-white">
                <option>All Types</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Shortlet</option>
              </select>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Property", "Location", "Type", "Units", "Occupancy", "Health Score", "Monthly Revenue", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.5px] border-b border-gray-100 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-yellow-50/30 transition-colors border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-base">🏢</div>
                        <div>
                          <div className="text-[12.5px] font-semibold text-gray-900">{prop.name}</div>
                          <div className="text-[10.5px] text-gray-400">{prop.type.replace("_", " ")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-[12px] text-gray-600">
                        <MapPin size={11} className="text-gray-400" />
                        {prop.city}, {prop.state}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{prop.type.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-[12.5px] font-medium text-gray-900">{prop.totalUnits}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${prop.occupancyRate}%`, background: prop.occupancyRate >= 90 ? "var(--emerald)" : prop.occupancyRate >= 75 ? "var(--gold)" : "#EF4444" }} />
                        </div>
                        <span className={`text-[12px] font-semibold ${prop.occupancyRate >= 90 ? "text-emerald-600" : "text-yellow-600"}`}>{prop.occupancyRate.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] font-bold ${prop.healthScore >= 90 ? "text-emerald-600" : prop.healthScore >= 75 ? "text-yellow-600" : "text-red-500"}`}>{prop.healthScore}/100</span>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] font-bold text-gray-900">{formatCurrency(prop.monthlyRevenue)}</td>
                    <td className="px-4 py-3"><Badge variant={statusToBadgeVariant(prop.status)}>{prop.status}</Badge></td>
                    <td className="px-4 py-3">
                      <button className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
