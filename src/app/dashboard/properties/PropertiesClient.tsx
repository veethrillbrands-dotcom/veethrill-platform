"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AddPropertyModal } from "@/components/modals/AddPropertyModal";
import { Pencil, Trash2, X, CheckCircle } from "lucide-react";

type Property = {
  id: string; name: string; type: string; address: string; city: string; state: string;
  description: string | null; status: string; occupancy?: number; monthlyRevenue?: number;
};

export function PropertiesTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Properties" action={{ label: "Add Property", onClick: () => setOpen(true) }} />
      {open && <AddPropertyModal onClose={() => setOpen(false)} />}
    </>
  );
}

function EditPropertyModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: property.name, address: property.address, city: property.city, state: property.state, description: property.description ?? "", status: property.status ?? "ACTIVE" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    await fetch(`/api/properties/${property.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSuccess(true);
    setTimeout(() => { onClose(); router.refresh(); }, 1200);
  }

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle size={32} className="text-emerald-600" /></div>
        <div className="text-[17px] font-bold text-gray-900">Property Updated!</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Edit Property</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Property Name", key: "name", placeholder: "e.g. Veethrill Towers" },
            { label: "Street Address", key: "address", placeholder: "15 Adeola Odeku Street" },
            { label: "City", key: "city", placeholder: "Victoria Island" },
            { label: "State", key: "state", placeholder: "Lagos" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              <input value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          ))}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
              {["ACTIVE", "INACTIVE", "UNDER_RENOVATION", "SOLD"].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          {(property.occupancy !== undefined || property.monthlyRevenue !== undefined) && (
            <div className="grid grid-cols-2 gap-3">
              {property.occupancy !== undefined && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Occupancy</div>
                  <div className="text-[18px] font-black text-gray-900">{property.occupancy}%</div>
                  <div className="text-[10px] text-gray-400">computed from units</div>
                </div>
              )}
              {property.monthlyRevenue !== undefined && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Monthly Revenue</div>
                  <div className="text-[15px] font-black text-gray-900">
                    ₦{property.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-400">from occupied units</div>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.name}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "✓ Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PropertyRowActions({ property }: { property: Property }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${property.name}"? This will remove all associated data.`)) return;
    setDeleting(true);
    await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button onClick={() => setEditing(true)} title="Edit property"
          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
          <Pencil size={12} className="text-blue-600" />
        </button>
        <button onClick={handleDelete} disabled={deleting} title="Delete property"
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
          <Trash2 size={12} className="text-red-500" />
        </button>
      </div>
      {editing && <EditPropertyModal property={property} onClose={() => setEditing(false)} />}
    </>
  );
}
