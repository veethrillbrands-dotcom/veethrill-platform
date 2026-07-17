"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AddWorkOrderModal } from "@/components/modals/AddWorkOrderModal";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Trash2, User, CheckSquare } from "lucide-react";

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
  status: string; slaHours: number; estimatedCost: number | null; completionNotes?: string | null;
  property: { name: string };
  unit: { unitNumber: string } | null;
  vendor: { user: { firstName: string; lastName: string }; companyName: string | null } | null;
};

function parseExtVendor(notes?: string | null): string | null {
  if (!notes) return null;
  const m = notes.match(/^\[EXT_VENDOR:([^|\]]+)(?:\|([^\]]+))?\]/);
  return m ? m[1] + (m[2] ? ` (${m[2]})` : "") : null;
}

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
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) { setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleAll() { setSelected(orders.length > 0 && orders.every((o) => selected.has(o.id)) ? new Set() : new Set(orders.map((o) => o.id))); }
  const allChecked = orders.length > 0 && orders.every((o) => selected.has(o.id));

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} work orders?`)) return;
    await Promise.all([...selected].map((id) => fetch(`/api/maintenance/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    router.refresh();
  }

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
    <div>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">
          <CheckSquare size={14} className="text-red-600" />
          <span className="text-[13px] font-semibold text-red-700">{selected.size} selected</span>
          <button onClick={bulkDelete} className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">
            <Trash2 size={12} />Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="text-[12px] text-red-500 hover:text-red-700">Clear</button>
        </div>
      )}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="pl-5 pr-2 py-3 w-8">
              <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-yellow-500" />
            </th>
            {["", "Work Order", "Property · Unit", "Category", "Priority", "Vendor", "Status", "SLA", "Est. Cost", ""].map((h) => (
              <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan={11} className="text-center text-gray-400 py-10 text-[13px]">No work orders. Great job! 🎉</td></tr>
          ) : orders.map((wo) => {
            const vendorName = wo.vendor
              ? (wo.vendor.companyName || `${wo.vendor.user.firstName} ${wo.vendor.user.lastName}`)
              : parseExtVendor(wo.completionNotes)
              ? `${parseExtVendor(wo.completionNotes)} (ext.)`
              : null;

            return (
              <tr key={wo.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors group ${selected.has(wo.id) ? "bg-blue-50/40" : ""}`}>
                <td className="pl-5 pr-2 py-3">
                  <input type="checkbox" checked={selected.has(wo.id)} onChange={() => toggleSelect(wo.id)} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                </td>
                <td className="pr-2 py-3">
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
                  {vendorName ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User size={10} className="text-blue-600" />
                      </div>
                      <span className="text-[11.5px] font-semibold text-gray-700 max-w-[110px] truncate">{vendorName}</span>
                    </div>
                  ) : (
                    <span className="text-[11.5px] text-gray-300">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingStatus === wo.id ? (
                    <select autoFocus defaultValue={wo.status}
                      onChange={(e) => updateStatus(wo.id, e.target.value)}
                      onBlur={() => setEditingStatus(null)}
                      className="text-[11.5px] border border-yellow-400 rounded-lg px-2 py-1 bg-white outline-none">
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
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
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
}
