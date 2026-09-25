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

function EditUnitModal({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    unitNumber: unit.unitNumber, floor: String(unit.floor),
    bedrooms: String(unit.bedrooms), bathrooms: String(unit.bathrooms),
    sqMeters: unit.sqMeters != null ? String(unit.sqMeters) : "",
    monthlyRent: String(unit.monthlyRent), depositAmount: String(unit.depositAmount),
    nightlyRate: unit.nightlyRate != null ? String(unit.nightlyRate) : "",
    status: unit.status,
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    await fetch(`/api/units/${unit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        floor: Number(form.floor), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms),
        sqMeters: form.sqMeters ? Number(form.sqMeters) : null,
        monthlyRent: Number(form.monthlyRent), depositAmount: Number(form.depositAmount),
        nightlyRate: form.nightlyRate ? Number(form.nightlyRate) : null,
      }),
    });
    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Edit Unit {unit.unitNumber}</div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-[22px] leading-none">×</button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Unit Number</label>
              <input value={form.unitNumber} onChange={(e) => set("unitNumber", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Floor</label>
              <input type="number" value={form.floor} onChange={(e) => set("floor", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Bedrooms</label>
              <input type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Bathrooms</label>
              <input type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Size (m²)</label>
              <input type="number" value={form.sqMeters} onChange={(e) => set("sqMeters", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Monthly Rent (₦)</label>
              <input type="number" value={form.monthlyRent} onChange={(e) => set("monthlyRent", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Deposit (₦)</label>
              <input type="number" value={form.depositAmount} onChange={(e) => set("depositAmount", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Nightly Rate (₦, optional)</label>
              <input type="number" value={form.nightlyRate} onChange={(e) => set("nightlyRate", e.target.value)}
                placeholder="Leave blank if not shortlet"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none bg-white">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "✓ Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UnitsTable({ units }: { units: Unit[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

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
    <>
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
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingUnit(u)} title="Edit unit"
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
    {editingUnit && <EditUnitModal unit={editingUnit} onClose={() => setEditingUnit(null)} />}
    </>
  );
}
