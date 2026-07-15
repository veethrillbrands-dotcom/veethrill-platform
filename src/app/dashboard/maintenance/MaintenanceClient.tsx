"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AddWorkOrderModal } from "@/components/modals/AddWorkOrderModal";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Trash2 } from "lucide-react";

const PRIORITY_DOT: Record<string, string> = {
  URGENT: "bg-red-500", HIGH: "bg-orange-500", MEDIUM: "bg-yellow-500", LOW: "bg-blue-400", ROUTINE: "bg-gray-300",
};
const PRIORITY_BADGE: Record<string, "error" | "warning" | "default" | "info" | "success"> = {
  URGENT: "error", HIGH: "warning", MEDIUM: "default", LOW: "info", ROUTINE: "default",
};
const STATUS_BADGE: Record<string, "success" | "info" | "warning" | "default" | "error"> = {
  COMPLETED: "success", IN_PROGRESS: "info", ASSIGNED: "warning", OPEN: "default", CANCELLED: "error",
};
const STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

type WorkOrder = {
  id: string; title: string; description: string; category: string; priority: string;
  status: string; slaHours: number; estimatedCost: number | null;
  property: { name: string };
  unit: { unitNumber: string } | null;
};

export function MaintenanceTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Maintenance" action={{ label: "New Work Order", onClick: () => setOpen(true) }} />
      {open && <AddWorkOrderModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function WorkOrdersTable({ orders }: { orders: WorkOrder[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setLoading(id);
    await fetch(`/api/maintenance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    setEditingStatus(null);
    router.refresh();
  }

  async function deleteOrder(id: string) {
    if (!confirm("Delete this work order?")) return;
    setLoading(id + "_del");
    await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {["", "Work Order", "Property · Unit", "Category", "Priority", "Status", "SLA", "Est. Cost", ""].map((h) => (
              <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan={9} className="text-center text-gray-400 py-10 text-[13px]">No work orders. Great job! 🎉</td></tr>
          ) : orders.map((wo) => (
            <tr key={wo.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
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
              <td className="px-4 py-3"><Badge variant={PRIORITY_BADGE[wo.priority] ?? "default"}>{wo.priority}</Badge></td>
              <td className="px-4 py-3">
                {editingStatus === wo.id ? (
                  <select autoFocus defaultValue={wo.status}
                    onChange={(e) => updateStatus(wo.id, e.target.value)}
                    onBlur={() => setEditingStatus(null)}
                    className="text-[11.5px] border border-yellow-400 rounded-lg px-2 py-1 bg-white outline-none">
                    {STATUSES.map((s) => <option key={s}>{s.replace("_", " ")}</option>)}
                  </select>
                ) : (
                  <button onClick={() => setEditingStatus(wo.id)} title="Click to update status">
                    <Badge variant={STATUS_BADGE[wo.status] ?? "default"}>{wo.status.replace("_", " ")}</Badge>
                  </button>
                )}
              </td>
              <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">
                {wo.slaHours < 24 ? `${wo.slaHours}h` : `${Math.round(wo.slaHours / 24)}d`}
              </td>
              <td className="px-4 py-3 text-[12px] font-semibold text-gray-900">
                {wo.estimatedCost ? formatCurrency(wo.estimatedCost) : "—"}
              </td>
              <td className="px-4 py-3">
                <button onClick={() => deleteOrder(wo.id)} disabled={loading === wo.id + "_del"}
                  title="Delete"
                  className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={12} className="text-red-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
