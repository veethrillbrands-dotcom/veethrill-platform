import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/kpi-card";
import { mockWorkOrders } from "@/lib/mock-data";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";
import type { WorkOrderPriority } from "@/lib/types";
import { Cog, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  URGENT: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-blue-100 text-blue-700",
  ROUTINE: "bg-gray-100 text-gray-600",
};

const PRIORITY_DOT: Record<WorkOrderPriority, string> = {
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-blue-500",
  ROUTINE: "bg-gray-300",
};

export default function MaintenancePage() {
  const urgent = mockWorkOrders.filter((w) => w.priority === "URGENT").length;
  const open = mockWorkOrders.filter((w) => w.status === "OPEN").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Maintenance Management" action={{ label: "New Work Order" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-5 gap-4">
          <KPICard label="Urgent" value={`${urgent}`} accentColor="#EF4444" icon={<AlertTriangle size={16} className="text-red-500" />} />
          <KPICard label="High Priority" value="6" accentColor="#F97316" />
          <KPICard label="Open (Unassigned)" value={`${open}`} accentColor="#3B82F6" />
          <KPICard label="SLA Met" value="87%" change={3.2} accentColor="var(--emerald)" icon={<CheckCircle size={16} style={{ color: "var(--emerald)" }} />} />
          <KPICard label="Avg Resolution" value="18h" accentColor="var(--gold)" icon={<Clock size={16} style={{ color: "var(--gold)" }} />} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle sub={`${mockWorkOrders.length} total · 8 urgent`}>Work Orders</CardTitle>
            <div className="flex gap-2">
              <select className="text-[12px] border border-gray-100 px-3 py-1.5 rounded-lg outline-none text-gray-600 bg-white">
                <option>All Priorities</option>
                <option>Urgent</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
                <option>Routine</option>
              </select>
              <select className="text-[12px] border border-gray-100 px-3 py-1.5 rounded-lg outline-none text-gray-600 bg-white">
                <option>All Properties</option>
              </select>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Issue", "Property / Unit", "Category", "Priority", "Assigned To", "Raised", "SLA", "Est. Cost", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.5px] border-b border-gray-100 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockWorkOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-yellow-50/30 border-b border-gray-100 last:border-0 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[wo.priority]}`} />
                        <div>
                          <div className="text-[12.5px] font-semibold text-gray-900">{wo.title}</div>
                          <div className="text-[11px] text-gray-400 max-w-[200px] truncate">{wo.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[12px] font-medium text-gray-900">{wo.propertyName}</div>
                      {wo.unitNumber && <div className="text-[11px] text-gray-400">Unit {wo.unitNumber}</div>}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{wo.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full ${PRIORITY_COLORS[wo.priority]}`}>{wo.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{wo.assignedVendorName ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-[11.5px] text-gray-500">{formatRelativeTime(wo.raisedAt)}</td>
                    <td className="px-4 py-3 text-[11.5px] text-gray-600">{wo.slaHours}h</td>
                    <td className="px-4 py-3 text-[12px] font-medium text-gray-900">
                      {wo.estimatedCost ? formatCurrency(wo.estimatedCost) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3"><Badge variant={statusToBadgeVariant(wo.status)}>{wo.status.replace("_", " ")}</Badge></td>
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
