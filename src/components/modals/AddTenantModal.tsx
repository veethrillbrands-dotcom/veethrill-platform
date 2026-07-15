"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Users, CheckCircle } from "lucide-react";

interface Props { onClose: () => void; }

export function AddTenantModal({ onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    employerName: "", emergencyContact: "", emergencyPhone: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setSaving(true);
    try {
      await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setTimeout(() => { onClose(); router.refresh(); }, 1800);
    } catch {
      setSaving(false);
    }
  }

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <div className="text-[17px] font-bold text-gray-900">Tenant Added!</div>
        <div className="text-[13px] text-gray-500">Refreshing tenant directory...</div>
      </div>
    </div>
  );

  const isValid = form.firstName && form.lastName && form.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="flex items-center gap-3">
            <Users size={20} className="text-yellow-400" />
            <div>
              <div className="text-[15px] font-bold text-white">Add New Tenant</div>
              <div className="text-[11px] text-white/50">Fill in tenant details</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "firstName", label: "First Name *", placeholder: "Chidi" },
              { key: "lastName", label: "Last Name *", placeholder: "Okafor" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{f.label}</label>
                <input value={form[f.key as keyof typeof form]} onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
              </div>
            ))}
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Email Address *</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              placeholder="chidi.okafor@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Phone Number</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
              placeholder="+234 803 456 7890"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Employer / Company</label>
            <input value={form.employerName} onChange={(e) => set("employerName", e.target.value)}
              placeholder="Dangote Group"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Emergency Contact</label>
              <input value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)}
                placeholder="Mrs. Adaeze Okafor"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Emergency Phone</label>
              <input value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)}
                placeholder="+234 803 999 8888"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving || !isValid}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Saving..." : "✓ Add Tenant"}
          </button>
        </div>
      </div>
    </div>
  );
}
