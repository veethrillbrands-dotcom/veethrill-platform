import { MaintenanceTopbar, WorkOrdersTable } from "./MaintenanceClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Wrench, AlertTriangle, Clock, CheckCircle } from "lucide-react";

async function getWorkOrders() {
  return db.workOrder.findMany({
    include: { property: true, unit: true, vendor: { include: { user: true } } },
    orderBy: [{ priority: "asc" }, { raisedAt: "desc" }],
  });
}

export default async function MaintenancePage() {
  const orders = await getWorkOrders();

  const open = orders.filter((w) => w.status === "OPEN").length;
  const inProgress = orders.filter((w) => w.status === "IN_PROGRESS").length;
  const urgent = orders.filter((w) => w.priority === "URGENT").length;
  const totalEstimated = orders.reduce((s, w) => s + (w.estimatedCost ?? 0), 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <MaintenanceTopbar />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Open Orders", value: open, icon: <Wrench size={16} />, color: "#3B82F6" },
            { label: "In Progress", value: inProgress, icon: <Clock size={16} />, color: "var(--gold)" },
            { label: "Urgent", value: urgent, icon: <AlertTriangle size={16} />, color: "#EF4444" },
            { label: "Est. Cost", value: formatCurrency(totalEstimated), icon: <CheckCircle size={16} />, color: "var(--emerald)" },
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
            <CardTitle sub={`${orders.length} total work orders — click status badge to update`}>Work Order Queue</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <WorkOrdersTable orders={orders as any} />
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
