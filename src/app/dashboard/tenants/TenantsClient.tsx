"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AddTenantModal } from "@/components/modals/AddTenantModal";
import { Pencil, Trash2, X, CheckCircle } from "lucide-react";

type Tenant = {
  id: string; employerName: string | null; emergencyContact: string | null; emergencyPhone: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
};

export function TenantsTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Tenants" action={{ label: "Add Tenant", onClick: () => setOpen(true) }} />
      {open && <AddTenantModal onClose={() => setOpen(false)} />}
    </>
  );
}

function EditTenantModal({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    firstName: tenant.user.firstName, lastName: tenant.user.lastName,
    phone: tenant.user.phone ?? "", employerName: tenant.employerName ?? "",
    emergencyContact: tenant.emergencyContact ?? "", emergencyPhone: tenant.emergencyPhone ?? "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    await fetch(`/api/tenants/${tenant.id}`, {
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
        <div className="text-[17px] font-bold text-gray-900">Tenant Updated!</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Edit Tenant</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">First Name</label>
              <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Last Name</label>
              <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          {[
            { label: "Phone", key: "phone", placeholder: "+234 xxx xxx xxxx" },
            { label: "Employer", key: "employerName", placeholder: "e.g. Dangote Group" },
            { label: "Emergency Contact", key: "emergencyContact", placeholder: "Contact name" },
            { label: "Emergency Phone", key: "emergencyPhone", placeholder: "+234 xxx xxx xxxx" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              <input value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          ))}
        </div>
        <div className="px-6 pb-6 flex gap-3">
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

export function TenantRowActions({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete tenant "${tenant.user.firstName} ${tenant.user.lastName}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/tenants/${tenant.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button onClick={() => setEditing(true)} title="Edit tenant"
          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
          <Pencil size={12} className="text-blue-600" />
        </button>
        <button onClick={handleDelete} disabled={deleting} title="Delete tenant"
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
          <Trash2 size={12} className="text-red-500" />
        </button>
      </div>
      {editing && <EditTenantModal tenant={tenant} onClose={() => setEditing(false)} />}
    </>
  );
}
