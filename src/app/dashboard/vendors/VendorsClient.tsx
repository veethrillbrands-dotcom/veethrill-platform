"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { X, CheckCircle, Trash2, Star } from "lucide-react";

type Vendor = {
  id: string; companyName: string; specialization: string[]; rating: number; isVerified: boolean;
  bankName: string | null; bankAccount: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
  workOrders: { id: string }[];
};

function AddVendorModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [specInput, setSpecInput] = useState("");
  const [form, setForm] = useState({
    companyName: "", firstName: "", lastName: "", email: "", phone: "",
    specialization: [] as string[], bankName: "", bankAccount: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function addSpec() {
    if (!specInput.trim()) return;
    setForm((f) => ({ ...f, specialization: [...f.specialization, specInput.trim()] }));
    setSpecInput("");
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/vendors", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, specialization: form.specialization.length ? form.specialization : ["General"] }),
    });
    if (res.ok) { setSuccess(true); setTimeout(() => { onClose(); router.refresh(); }, 1200); }
    else setSaving(false);
  }

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        <CheckCircle size={32} className="text-emerald-600" />
        <div className="text-[17px] font-bold text-gray-900">Vendor Added!</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Vendor</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Company Name</label>
            <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Apex Electrical"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Contact First Name</label>
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
            { label: "Email", key: "email", type: "email" }, { label: "Phone", key: "phone" },
            { label: "Bank Name", key: "bankName" }, { label: "Bank Account", key: "bankAccount" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              <input type={type ?? "text"} value={form[key as keyof typeof form] as string} onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          ))}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Specializations</label>
            <div className="flex gap-2 mb-2">
              <input value={specInput} onChange={(e) => setSpecInput(e.target.value)} placeholder="e.g. Electrical"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpec(); }}}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-yellow-400" />
              <button onClick={addSpec} className="px-3 py-2 rounded-xl text-[12px] font-bold text-white" style={{ background: "var(--navy)" }}>Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.specialization.map((s, i) => (
                <span key={i} className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  {s}
                  <button onClick={() => setForm((f) => ({ ...f, specialization: f.specialization.filter((_, j) => j !== i) }))} className="text-blue-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.companyName || !form.email}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Adding…" : "✓ Add Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VendorsTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Vendor Management" action={{ label: "Add Vendor", onClick: () => setOpen(true) }} />
      {open && <AddVendorModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={11} className={rating >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
      ))}
      <span className="text-[11.5px] font-bold text-gray-700 ml-1">{rating > 0 ? rating.toFixed(1) : "N/A"}</span>
    </div>
  );
}

export function VendorRowActions({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove vendor "${vendor.companyName}"?`)) return;
    setDeleting(true);
    await fetch(`/api/vendors/${vendor.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function toggleVerify() {
    await fetch(`/api/vendors/${vendor.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !vendor.isVerified }),
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={toggleVerify} title={vendor.isVerified ? "Unverify" : "Verify vendor"}
        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${vendor.isVerified ? "bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700" : "bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700"}`}>
        {vendor.isVerified ? "✓ Verified" : "Verify"}
      </button>
      <button onClick={handleDelete} disabled={deleting} title="Remove vendor"
        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
        <Trash2 size={12} className="text-red-500" />
      </button>
    </div>
  );
}
