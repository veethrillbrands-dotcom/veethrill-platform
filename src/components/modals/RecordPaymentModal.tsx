"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, CreditCard, CheckCircle, FileText, Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props { onClose: () => void; }

const METHODS = ["PAYSTACK", "FLUTTERWAVE", "STRIPE", "BANK_TRANSFER", "CASH"];
const TYPES = ["RENT", "DEPOSIT", "MAINTENANCE_FEE", "SHORTLET", "LATE_FEE", "OTHER"];

type Receipt = {
  reference: string; tenantName: string; amount: number; totalAmount: number; status: string;
  type: string; method: string; dueDate: string; paidAt: string; property: string;
};

function ReceiptModal({ receipt, onClose }: { receipt: Receipt; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-yellow-400" />
            <div className="text-[15px] font-bold text-white">Payment Receipt</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6">
          {/* Receipt header */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Veethrill Realty</div>
            <div className="text-[13px] text-gray-500">Official Payment Receipt</div>
          </div>

          {/* Receipt body */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden mb-4">
            <div className="bg-gray-50 px-4 py-2.5">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Receipt No.</div>
              <div className="text-[13px] font-mono font-bold text-gray-900">{receipt.reference}</div>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: "Tenant", value: receipt.tenantName },
                { label: "Property", value: receipt.property || "—" },
                { label: "Payment Type", value: receipt.type.replace("_", " ") },
                { label: "Payment Method", value: receipt.method.replace("_", " ") },
                { label: "Due Date", value: formatDate(receipt.dueDate) },
                { label: "Paid On", value: receipt.paidAt ? formatDate(receipt.paidAt) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-[11.5px] text-gray-400">{label}</span>
                  <span className="text-[12.5px] font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amount block */}
          <div className={`rounded-2xl p-4 mb-4 ${receipt.status === "PARTIAL" ? "bg-yellow-50" : "bg-emerald-50"}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[12px] text-gray-500">Amount Paid</span>
              <span className="text-[22px] font-black" style={{ color: receipt.status === "PARTIAL" ? "var(--gold)" : "var(--emerald)" }}>
                {formatCurrency(receipt.amount)}
              </span>
            </div>
            {receipt.status === "PARTIAL" && receipt.totalAmount > receipt.amount && (
              <div className="flex justify-between items-center">
                <span className="text-[11.5px] text-orange-600 font-semibold">Balance Outstanding</span>
                <span className="text-[14px] font-bold text-orange-600">{formatCurrency(receipt.totalAmount - receipt.amount)}</span>
              </div>
            )}
            <div className="mt-2 inline-block">
              <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${receipt.status === "PARTIAL" ? "bg-yellow-200 text-yellow-800" : "bg-emerald-200 text-emerald-800"}`}>
                {receipt.status}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => window.print()}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[12.5px] font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
              <Printer size={14} />Print
            </button>
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold text-white flex items-center justify-center"
              style={{ background: "var(--emerald)" }}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecordPaymentModal({ onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [tenants, setTenants] = useState<{ id: string; user: { firstName: string; lastName: string }; leases: { id: string; unit: { unitNumber: string; property: { name: string } }; rentAmount: number }[] }[]>([]);
  const [isPartial, setIsPartial] = useState(false);

  const [form, setForm] = useState({
    tenantId: "", leaseId: "", amount: "", totalAmount: "", type: "RENT",
    method: "BANK_TRANSFER", dueDate: new Date().toISOString().split("T")[0], notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/tenants").then((r) => r.json()).then(setTenants).catch(() => {});
  }, []);

  const selectedTenant = tenants.find((t) => t.id === form.tenantId);
  const selectedLease = selectedTenant?.leases.find((l) => l.id === form.leaseId);

  useEffect(() => {
    if (selectedLease && !form.totalAmount) {
      set("totalAmount", selectedLease.rentAmount.toString());
      if (!form.amount) set("amount", selectedLease.rentAmount.toString());
    }
  }, [form.leaseId]);

  async function handleSubmit() {
    if (!form.tenantId || !form.amount || !form.type || !form.method) return;
    setSaving(true);
    try {
      const amountPaid = Number(form.amount);
      const totalDue = form.totalAmount ? Number(form.totalAmount) : amountPaid;
      const status = isPartial && amountPaid < totalDue ? "PARTIAL" : "PAID";

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: amountPaid, totalAmount: totalDue, status }),
      });

      if (res.ok) {
        const data = await res.json();
        const tenant = selectedTenant?.user;
        const property = selectedLease ? `Unit ${selectedLease.unit.unitNumber} — ${selectedLease.unit.property.name}` : "";
        setReceipt({
          reference: data.reference ?? `REF-${Date.now().toString(36).toUpperCase()}`,
          tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : "Tenant",
          amount: amountPaid, totalAmount: totalDue, status,
          type: form.type, method: form.method, dueDate: form.dueDate,
          paidAt: new Date().toISOString(), property,
        });
        setSaving(false);
        router.refresh();
      } else {
        setSaving(false);
      }
    } catch {
      setSaving(false);
    }
  }

  if (receipt) {
    return <ReceiptModal receipt={receipt} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[95vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="flex items-center gap-3">
            <CreditCard size={20} className="text-yellow-400" />
            <div className="text-[15px] font-bold text-white">Record Payment</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Tenant *</label>
            <select value={form.tenantId} onChange={(e) => { set("tenantId", e.target.value); set("leaseId", ""); set("totalAmount", ""); set("amount", ""); }}
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
                  <option key={l.id} value={l.id}>Unit {l.unit.unitNumber} — {l.unit.property.name} ({formatCurrency(l.rentAmount)}/mo)</option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Partial payment toggle */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <button onClick={() => setIsPartial(!isPartial)}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isPartial ? "bg-yellow-400" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isPartial ? "left-5" : "left-0.5"}`} />
            </button>
            <div>
              <div className="text-[12.5px] font-semibold text-gray-800">Partial Payment</div>
              <div className="text-[11px] text-gray-400">Record a partial payment — remaining balance will be outstanding</div>
            </div>
          </div>

          <div className={`grid gap-3 ${isPartial ? "grid-cols-2" : "grid-cols-1"}`}>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                {isPartial ? "Amount Paid (₦) *" : "Amount (₦) *"}
              </label>
              <input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)}
                placeholder="e.g. 250000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            {isPartial && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Total Due (₦)</label>
                <input type="number" value={form.totalAmount} onChange={(e) => set("totalAmount", e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
              </div>
            )}
          </div>

          {isPartial && form.amount && form.totalAmount && Number(form.amount) < Number(form.totalAmount) && (
            <div className="bg-yellow-50 rounded-xl p-3 flex justify-between items-center">
              <span className="text-[12px] text-yellow-700 font-semibold">Balance Outstanding</span>
              <span className="text-[14px] font-black text-yellow-700">{formatCurrency(Number(form.totalAmount) - Number(form.amount))}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Due Date</label>
            <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
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

        <div className="px-6 pb-6 pt-2 flex gap-3 flex-shrink-0 border-t border-gray-100">
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
