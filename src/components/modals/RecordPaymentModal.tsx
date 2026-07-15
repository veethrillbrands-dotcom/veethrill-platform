"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, CreditCard, CheckCircle } from "lucide-react";

interface Props { onClose: () => void; }

const METHODS = ["PAYSTACK", "FLUTTERWAVE", "STRIPE", "BANK_TRANSFER", "CASH"];
const TYPES = ["RENT", "DEPOSIT", "MAINTENANCE_FEE", "SHORTLET", "LATE_FEE", "OTHER"];

export function RecordPaymentModal({ onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tenants, setTenants] = useState<{ id: string; user: { firstName: string; lastName: string }; leases: { id: string; unit: { unitNumber: string; property: { name: string } } }[] }[]>([]);

  const [form, setForm] = useState({
    tenantId: "", leaseId: "", amount: "", type: "RENT",
    method: "BANK_TRANSFER", dueDate: new Date().toISOString().split("T")[0], notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/tenants").then((r) => r.json()).then(setTenants).catch(() => {});
  }, []);

  const selectedTenant = tenants.find((t) => t.id === form.tenantId);

  async function handleSubmit() {
    if (!form.tenantId || !form.amount || !form.type || !form.method) return;
    setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
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
        <div className="text-[17px] font-bold text-gray-900">Payment Recorded!</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="flex items-center gap-3">
            <CreditCard size={20} className="text-yellow-400" />
            <div className="text-[15px] font-bold text-white">Record Payment</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Tenant *</label>
            <select value={form.tenantId} onChange={(e) => { set("tenantId", e.target.value); set("leaseId", ""); }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
              <option value="">Select tenant…</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.user.firstName} {t.user.lastName}</option>
              ))}
            </select>
          </div>

          {selectedTenant?.leases?.length ? (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Lease / Unit</label>
              <select value={form.leaseId} onChange={(e) => set("leaseId", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
                <option value="">No specific lease</option>
                {selectedTenant.leases.map((l) => (
                  <option key={l.id} value={l.id}>Unit {l.unit.unitNumber} — {l.unit.property.name}</option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Amount (₦) *</label>
              <input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)}
                placeholder="e.g. 250000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Payment Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button key={t} onClick={() => set("type", t)}
                  className={`py-2 px-3 rounded-xl border text-[11.5px] font-semibold transition-colors ${form.type === t ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Method *</label>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map((m) => (
                <button key={m} onClick={() => set("method", m)}
                  className={`py-2 px-3 rounded-xl border text-[11.5px] font-semibold transition-colors ${form.method === m ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {m.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Notes</label>
            <input value={form.notes} onChange={(e) => set("notes", e.target.value)}
              placeholder="Optional notes…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !form.tenantId || !form.amount}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "✓ Record Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
