"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, FileText, CheckCircle } from "lucide-react";

interface Props { onClose: () => void; }

export function AddLeaseModal({ onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tenants, setTenants] = useState<{ id: string; user: { firstName: string; lastName: string } }[]>([]);
  const [units, setUnits] = useState<{ id: string; unitNumber: string; monthlyRent: number; property: { name: string } }[]>([]);

  const [form, setForm] = useState({
    unitId: "", tenantId: "", startDate: "", endDate: "",
    rentAmount: "", depositAmount: "", autoRenew: false, escalationRate: "10",
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/tenants").then((r) => r.json()).then((d) => setTenants(d.tenants ?? []));
    fetch("/api/properties").then((r) => r.json()).then((d) => {
      const allUnits = (d.properties ?? []).flatMap((p: { units: { id: string; unitNumber: string; monthlyRent: number; status: string }[], name: string }) =>
        (p.units ?? []).filter((u: { status: string }) => u.status === "VACANT").map((u: { id: string; unitNumber: string; monthlyRent: number; status: string }) => ({ ...u, property: { name: p.name } }))
      );
      setUnits(allUnits);
    });
  }, []);

  function onUnitChange(unitId: string) {
    const unit = units.find((u) => u.id === unitId);
    if (unit) set("rentAmount", String(unit.monthlyRent));
    set("unitId", unitId);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      await fetch("/api/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rentAmount: Number(form.rentAmount), depositAmount: Number(form.depositAmount), escalationRate: Number(form.escalationRate) }),
      });
      setSuccess(true);
      setTimeout(() => { onClose(); router.refresh(); }, 1800);
    } catch { setSaving(false); }
  }

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <div className="text-[17px] font-bold text-gray-900">Lease Created!</div>
        <div className="text-[13px] text-gray-500">Unit status updated to Occupied.</div>
      </div>
    </div>
  );

  const isValid = form.unitId && form.tenantId && form.startDate && form.endDate && form.rentAmount && form.depositAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-yellow-400" />
            <div>
              <div className="text-[15px] font-bold text-white">Create New Lease</div>
              <div className="text-[11px] text-white/50">Assign unit to tenant</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Vacant Unit *</label>
            <select value={form.unitId} onChange={(e) => onUnitChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
              <option value="">Select unit…</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.property.name} — Unit {u.unitNumber} (₦{u.monthlyRent.toLocaleString()}/mo)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Tenant *</label>
            <select value={form.tenantId} onChange={(e) => set("tenantId", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
              <option value="">Select tenant…</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.user.firstName} {t.user.lastName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">End Date *</label>
              <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Monthly Rent (₦) *</label>
              <input type="number" value={form.rentAmount} onChange={(e) => set("rentAmount", e.target.value)}
                placeholder="350000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Deposit (₦) *</label>
              <input type="number" value={form.depositAmount} onChange={(e) => set("depositAmount", e.target.value)}
                placeholder="700000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Annual Escalation (%)</label>
              <input type="number" value={form.escalationRate} onChange={(e) => set("escalationRate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div onClick={() => set("autoRenew", !form.autoRenew)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.autoRenew ? "" : "bg-gray-200"}`}
                  style={{ background: form.autoRenew ? "var(--emerald)" : "" }}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.autoRenew ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-[12.5px] font-semibold text-gray-700">Auto-Renew</span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !isValid}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "var(--navy)" }}>
            {saving ? "Creating…" : "✓ Create Lease"}
          </button>
        </div>
      </div>
    </div>
  );
}
