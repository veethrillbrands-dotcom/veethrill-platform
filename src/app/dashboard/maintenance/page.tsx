import { MaintenanceTopbar } from "./MaintenanceClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Wrench, AlertTriangle, Clock, CheckCircle } from "lucide-react";

async function getWorkOrders() {
  return db.workOrder.findMany({
    include: { property: true, unit: true, vendor: { include: { user: true } } },
    orderBy: [{ priority: "asc" }, { raisedAt: "desc" }],
  });
}

const PRIORITY_DOT: Record<string, string> = {
  URGENT: "bg-red-500", HIGH: "bg-orange-500", MEDIUM: "bg-yellow-500",
  LOW: "bg-blue-400", ROUTINE: "bg-gray-300",
};
const PRIORITY_BADGE: Record<string, "error" | "warning" | "default" | "info" | "success"> = {
  URGENT: "error", HIGH: "warning", MEDIUM: "default", LOW: "info", ROUTINE: "default",
};
const STATUS_BADGE: Record<string, "success" | "info" | "warning" | "default" | "error"> = {
  COMPLETED: "success", IN_PROGRESS: "info", ASSIGNED: "warning", OPEN: "default", CANCELLED: "error",
};

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

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Open Orders", value: open, icon: <Wrench size={16} />, color: "#3B82F6" },
            { label: "In Progress", value: inProgress, icon: <Clock size={16} />, color: "var(--gold)" },
            { label: "Urgent", value: urgent, icon: <AlertTriangle size={16} />, color: "#EF4444" },
            { label: "Est. Cost", value: formatCurrency(totalEstimated), icon: <CheckCircle size={16} />, color: "var(--emerald)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>
                {k.icon}
              </div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Work Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle sub={`${orders.length} total work orders`}>Work Order Queue</CardTitle>
            <button className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              Filter
            </button>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["", "Work Order", "Property · Unit", "Category", "Priority", "Status", "SLA", "Est. Cost"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-gray-400 py-10 text-[13px]">No work orders. Great job! 🎉</td></tr>
                  ) : orders.map((wo) => (
                    <tr key={wo.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="pl-5 pr-2 py-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT[wo.priority] ?? "bg-gray-300"}`} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-semibold text-gray-900">{wo.title}</div>
                        <div className="text-[11px] text-gray-400 max-w-[220px] truncate">{wo.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[12px] font-semibold text-gray-900">{wo.property.name}</div>
                        {wo.unit && <div className="text-[11px] text-gray-400">Unit {wo.unit.unitNumber}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{wo.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={PRIORITY_BADGE[wo.priority] ?? "default"}>{wo.priority}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[wo.status] ?? "default"}>{wo.status.replace("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">
                        {wo.slaHours < 24 ? `${wo.slaHours}h` : `${Math.round(wo.slaHours / 24)}d`}
                      </td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-gray-900">
                        {wo.estimatedCost ? formatCurrency(wo.estimatedCost) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
