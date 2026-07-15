import { UnitsTopbar, UnitsTable } from "./UnitsClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Home, CheckCircle, XCircle, Clock } from "lucide-react";

async function getUnits() {
  return db.unit.findMany({
    include: { property: true, leases: { where: { status: "ACTIVE" }, include: { tenant: { include: { user: true } } } } },
    orderBy: [{ propertyId: "asc" }, { unitNumber: "asc" }],
  });
}

export default async function UnitsPage() {
  const units = await getUnits();
  const occupied = units.filter((u) => u.status === "OCCUPIED").length;
  const vacant = units.filter((u) => u.status === "VACANT").length;
  const totalRevenue = units.filter((u) => u.status === "OCCUPIED").reduce((s, u) => s + u.monthlyRent, 0);

  const serializable = units.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    leases: u.leases.map((l) => ({
      ...l,
      startDate: l.startDate.toISOString(),
      endDate: l.endDate.toISOString(),
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <UnitsTopbar />
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
            <CardTitle sub={`${units.length} units — hover row for actions, click status to change`}>Unit Directory</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <UnitsTable units={serializable as any} />
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
