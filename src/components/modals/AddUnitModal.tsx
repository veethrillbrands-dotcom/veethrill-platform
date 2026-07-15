"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Home, CheckCircle } from "lucide-react";

interface Props { onClose: () => void; }

export function AddUnitModal({ onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    propertyId: "", unitNumber: "", floor: "1", bedrooms: "2", bathrooms: "1",
    sqMeters: "", monthlyRent: "", depositAmount: "", nightlyRate: "", isShortlet: false,
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/properties").then((r) => r.json()).then(setProperties).catch(() => {});
  }, []);

  async function handleSubmit() {
    if (!form.propertyId || !form.unitNumber || !form.monthlyRent || !form.depositAmount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, floor: Number(form.floor), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms) }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { onClose(); router.refresh(); }, 1600);
      } else {
        setSaving(false);
      }
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
        <div className="text-[17px] font-bold text-gray-900">Unit Added!</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="flex items-center gap-3">
            <Home size={20} className="text-yellow-400" />
            <div className="text-[15px] font-bold text-white">Add New Unit</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Property *</label>
            <select value={form.propertyId} onChange={(e) => set("propertyId", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
              <option value="">Select property…</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Unit Number *</label>
              <input value={form.unitNumber} onChange={(e) => set("unitNumber", e.target.value)}
                placeholder="e.g. 4B, Penthouse"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Floor</label>
              <input type="number" min="0" value={form.floor} onChange={(e) => set("floor", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Bedrooms *</label>
              <input type="number" min="0" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Bathrooms *</label>
              <input type="number" min="0" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Size (m²)</label>
              <input type="number" value={form.sqMeters} onChange={(e) => set("sqMeters", e.target.value)}
                placeholder="e.g. 65"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Monthly Rent (₦) *</label>
              <input type="number" value={form.monthlyRent} onChange={(e) => set("monthlyRent", e.target.value)}
                placeholder="e.g. 250000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Security Deposit (₦) *</label>
              <input type="number" value={form.depositAmount} onChange={(e) => set("depositAmount", e.target.value)}
                placeholder="e.g. 500000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <input type="checkbox" id="isShortlet" checked={form.isShortlet} onChange={(e) => set("isShortlet", e.target.checked)}
              className="w-4 h-4 accent-yellow-500 cursor-pointer" />
            <label htmlFor="isShortlet" className="text-[12.5px] font-semibold text-gray-700 cursor-pointer">Shortlet / serviced apartment</label>
          </div>

          {form.isShortlet && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Nightly Rate (₦)</label>
              <input type="number" value={form.nightlyRate} onChange={(e) => set("nightlyRate", e.target.value)}
                placeholder="e.g. 35000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !form.propertyId || !form.unitNumber || !form.monthlyRent || !form.depositAmount}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "✓ Add Unit"}
          </button>
        </div>
      </div>
    </div>
  );
}
