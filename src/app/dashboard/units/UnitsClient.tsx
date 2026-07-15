"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AddUnitModal } from "@/components/modals/AddUnitModal";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, Wrench, Home, Pencil, Trash2 } from "lucide-react";

type Unit = {
  id: string; unitNumber: string; floor: number; bedrooms: number; bathrooms: number;
  sqMeters: number | null; monthlyRent: number; depositAmount: number; nightlyRate: number | null;
  status: string;
  property: { name: string };
  leases: { tenant: { user: { firstName: string; lastName: string } } }[];
};

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
const STATUSES = ["VACANT", "OCCUPIED", "RESERVED", "MAINTENANCE", "SHORTLET"];

export function UnitsTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Units" action={{ label: "Add Unit", onClick: () => setOpen(true) }} />
      {open && <AddUnitModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function UnitsTable({ units }: { units: Unit[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setLoading(id);
    await fetch(`/api/units/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    setEditingStatus(null);
    router.refresh();
  }

  async function deleteUnit(id: string) {
    if (!confirm("Delete this unit? This cannot be undone.")) return;
    setLoading(id + "_del");
    await fetch(`/api/units/${id}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {["Unit", "Property", "Beds/Baths", "Size", "Rent / Nightly", "Tenant", "Status", ""].map((h) => (
              <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {units.map((u) => {
            const tenant = u.leases[0]?.tenant;
            return (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 group">
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
                  {u.nightlyRate
                    ? <div className="text-[12px] font-bold text-purple-700">{formatCurrency(u.nightlyRate)}/night</div>
                    : <div className="text-[13px] font-bold text-gray-900">{formatCurrency(u.monthlyRent)}/mo</div>}
                  <div className="text-[11px] text-gray-400">Dep: {formatCurrency(u.depositAmount)}</div>
                </td>
                <td className="px-4 py-3 text-[12px] text-gray-700">
                  {tenant ? `${tenant.user.firstName} ${tenant.user.lastName}` : "—"}
                </td>
                <td className="px-4 py-3">
                  {editingStatus === u.id ? (
                    <select autoFocus defaultValue={u.status}
                      onChange={(e) => updateStatus(u.id, e.target.value)}
                      onBlur={() => setEditingStatus(null)}
                      className="text-[11.5px] border border-yellow-400 rounded-lg px-2 py-1 bg-white outline-none">
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    <button onClick={() => setEditingStatus(u.id)} title="Click to change status">
                      <Badge variant={STATUS_BADGE[u.status] ?? "default"}>{u.status}</Badge>
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingStatus(u.id)} title="Edit status"
                      className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center">
                      <Pencil size={12} className="text-blue-600" />
                    </button>
                    <button onClick={() => deleteUnit(u.id)} disabled={loading === u.id + "_del"} title="Delete unit"
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center">
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
