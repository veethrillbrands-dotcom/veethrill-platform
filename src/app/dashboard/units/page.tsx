import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Home, CheckCircle, XCircle, Clock, Wrench } from "lucide-react";

async function getUnits() {
  return db.unit.findMany({
    include: { property: true, leases: { where: { status: "ACTIVE" }, include: { tenant: { include: { user: true } } } } },
    orderBy: [{ propertyId: "asc" }, { unitNumber: "asc" }],
  });
}

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  OCCUPIED: "success", VACANT: "warning", RESERVED: "info", MAINTENANCE: "error", SHORTLET: "default",
};
const STATUS_ICON: Record<string, React.ReactNode> = {
  OCCUPIED: <CheckCircle size={13} className="text-emerald-500" />,
  VACANT: <XCircle size={13} className="text-yellow-500" />,
  RESERVED: <Clock size={13} className="text-blue-500" />,
  MAINTENANCE: <Wrench size={13} className="text-red-500" />,
  SHORTLET: <Home size={13} className="text-purple-500" />,
};

export default async function UnitsPage() {
  const units = await getUnits();
  const occupied = units.filter((u) => u.status === "OCCUPIED").length;
  const vacant = units.filter((u) => u.status === "VACANT").length;
  const totalRevenue = units.filter((u) => u.status === "OCCUPIED").reduce((s, u) => s + u.monthlyRent, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Units" action={{ label: "Add Unit" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Units", value: units.length, icon: <Home size={16} />, color: "var(--navy)" },
            { label: "Occupied", value: occupied, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Vacant", value: vacant, icon: <XCircle size={16} />, color: "#EF4444" },
            { label: "Monthly Revenue", value: formatCurrency(totalRevenue), icon: <Clock size={16} />, color: "var(--gold)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle sub={`${units.length} units across all properties`}>Unit Directory</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Unit", "Property", "Beds/Baths", "Size", "Rent/Night Rate", "Tenant", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => {
                    const tenant = u.leases[0]?.tenant;
                    return (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 pl-5">
                          <div className="flex items-center gap-2">
                            {STATUS_ICON[u.status] ?? <Home size={13} className="text-gray-400" />}
                            <span className="text-[13px] font-semibold text-gray-900">{u.unitNumber}</span>
                          </div>
                          <div className="text-[11px] text-gray-400 ml-5">Floor {u.floor}</div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-700">{u.property.name}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-700">{u.bedrooms}bd / {u.bathrooms}ba</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{u.sqMeters ? `${u.sqMeters}m²` : "—"}</td>
                        <td className="px-4 py-3">
                          {u.nightlyRate ? (
                            <div>
                              <div className="text-[12px] font-bold text-purple-700">{formatCurrency(u.nightlyRate)}/night</div>
                            </div>
                          ) : (
                            <div className="text-[13px] font-bold text-gray-900">{formatCurrency(u.monthlyRent)}/mo</div>
                          )}
                          <div className="text-[11px] text-gray-400">Deposit: {formatCurrency(u.depositAmount)}</div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-700">
                          {tenant ? `${tenant.user.firstName} ${tenant.user.lastName}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_BADGE[u.status] ?? "default"}>{u.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
