"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AddTenantModal } from "@/components/modals/AddTenantModal";
import { Pencil, Trash2, X, CheckCircle, CheckSquare, MessageCircle, Phone, Mail } from "lucide-react";

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
    const res = await fetch(`/api/tenants/${tenant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setSaving(false); return; }
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


type TenantRow = {
  id: string; kycStatus: string; employerName: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
  activeUnit: string | null; activeProperty: string | null;
};

export function TenantsTable({ tenants }: { tenants: TenantRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  function toggleSelect(id: string) { setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleAll() { setSelected(tenants.length > 0 && tenants.every((t) => selected.has(t.id)) ? new Set() : new Set(tenants.map((t) => t.id))); }
  const allChecked = tenants.length > 0 && tenants.every((t) => selected.has(t.id));

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} tenants? This cannot be undone.`)) return;
    await Promise.all([...selected].map((id) => fetch(`/api/tenants/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    router.refresh();
  }

  async function deleteTenant(id: string, name: string) {
    if (!confirm(`Delete tenant "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/tenants/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const KYC_COLORS: Record<string, string> = {
    VERIFIED: "bg-emerald-100 text-emerald-700", PENDING: "bg-yellow-100 text-yellow-700", REJECTED: "bg-red-100 text-red-700",
  };

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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
              {["Tenant", "Contact", "Unit", "Property", "KYC", "Employer", "Lease Status", ""].map((h) => (
                <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-gray-400 py-10 text-[13px]">No tenants yet.</td></tr>
            ) : tenants.map((t) => (
              <tr key={t.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors group ${selected.has(t.id) ? "bg-blue-50/40" : ""}`}>
                <td className="pl-5 pr-2 py-3">
                  <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--gold), #b8960a)", color: "var(--navy)" }}>
                      {getInitials(`${t.user.firstName} ${t.user.lastName}`)}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-gray-900">{t.user.firstName} {t.user.lastName}</div>
                      <div className="text-[11px] text-gray-400">{t.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-gray-600">{t.user.phone ?? "—"}</td>
                <td className="px-4 py-3 text-[12px] font-semibold text-gray-900">{t.activeUnit ? `Unit ${t.activeUnit}` : "—"}</td>
                <td className="px-4 py-3 text-[12px] text-gray-600">{t.activeProperty ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${KYC_COLORS[t.kycStatus] ?? "bg-gray-100 text-gray-600"}`}>{t.kycStatus}</span>
                </td>
                <td className="px-4 py-3 text-[12px] text-gray-600">{t.employerName ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${t.activeUnit ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {t.activeUnit ? "ACTIVE" : "NO LEASE"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.user.phone && (
                      <a href={`tel:${t.user.phone}`} title={`Call ${t.user.firstName}`}
                        className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
                        <Phone size={12} className="text-blue-600" />
                      </a>
                    )}
                    <a href={`mailto:${t.user.email}?subject=Veethrill Realty — Message for ${t.user.firstName}`}
                      title={`Email ${t.user.firstName}`}
                      className="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition-colors">
                      <Mail size={12} className="text-purple-600" />
                    </a>
                    {t.user.phone && (
                      <a href={`https://wa.me/${t.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${t.user.firstName}, this is Veethrill Realty. We'd like to reach out regarding your tenancy. Please feel free to respond here.`)}`}
                        target="_blank" rel="noopener noreferrer" title="WhatsApp"
                        className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors">
                        <MessageCircle size={12} className="text-green-600" />
                      </a>
                    )}
                    <button onClick={() => setEditingId(t.id)} title="Edit tenant"
                      className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                      <Pencil size={12} className="text-gray-500" />
                    </button>
                    <button onClick={() => deleteTenant(t.id, `${t.user.firstName} ${t.user.lastName}`)} title="Delete tenant"
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingId && (() => {
        const t = tenants.find((x) => x.id === editingId)!;
        return <EditTenantModal tenant={{ id: t.id, employerName: t.employerName, emergencyContact: null, emergencyPhone: null, user: t.user }} onClose={() => { setEditingId(null); router.refresh(); }} />;
      })()}
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
