"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { X, DollarSign, CheckCircle, Clock, TrendingUp, Trash2 } from "lucide-react";

type Commission = {
  id: string; agent: string; property: string; dealValue: number; commissionRate: number;
  commissionAmount: number; status: string; type: string; saleDate: string | null; paidDate: string | null;
};

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "info"> = {
  Paid: "success", Pending: "warning", Overdue: "error", "Partially Paid": "info",
};

function AddCommissionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ agent: "", property: "", dealValue: "", commissionRate: "3", type: "Sale", saleDate: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const amount = Number(form.dealValue) * (Number(form.commissionRate) / 100);

  async function save() {
    if (!form.agent || !form.dealValue) return;
    setSaving(true);
    await fetch("/api/crm/commissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); onCreated(); onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Log Commission</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {[{ label: "Agent Name", key: "agent" }, { label: "Property / Deal", key: "property" }].map(({ label, key }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              <input value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Deal Value (₦)</label>
              <input type="number" value={form.dealValue} onChange={(e) => set("dealValue", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Rate (%)</label>
              <input type="number" value={form.commissionRate} onChange={(e) => set("commissionRate", e.target.value)} step="0.5"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          {amount > 0 && (
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <div className="text-[11px] text-gray-500">Commission Amount</div>
              <div className="text-[18px] font-black" style={{ color: "var(--emerald)" }}>{formatCurrency(amount)}</div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {["Sale", "Referral", "Rental", "Management", "Consultancy"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Sale Date</label>
              <input type="date" value={form.saleDate} onChange={(e) => set("saleDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.agent || !form.dealValue}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "✓ Log Commission"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/crm/commissions");
    setCommissions(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markPaid(id: string) {
    await fetch(`/api/crm/commissions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Paid" }) });
    load();
  }

  async function del(id: string) {
    await fetch(`/api/crm/commissions/${id}`, { method: "DELETE" });
    load();
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} commission records?`)) return;
    await Promise.all([...selected].map((id) => fetch(`/api/crm/commissions/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    load();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAll() {
    setSelected(commissions.length === selected.size && commissions.every((c) => selected.has(c.id)) ? new Set() : new Set(commissions.map((c) => c.id)));
  }

  const totalEarned = commissions.filter((c) => c.status === "Paid").reduce((s, c) => s + c.commissionAmount, 0);
  const totalPending = commissions.filter((c) => c.status !== "Paid").reduce((s, c) => s + c.commissionAmount, 0);
  const allChecked = commissions.length > 0 && commissions.every((c) => selected.has(c.id));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Commission Log" action={{ label: "Log Commission", onClick: () => setAdding(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Commissions", value: commissions.length, icon: <TrendingUp size={16} />, color: "var(--navy)" },
            { label: "Earned (Paid)", value: formatCurrency(totalEarned), icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Pending Payout", value: formatCurrency(totalPending), icon: <Clock size={16} />, color: "var(--gold)" },
            { label: "Total Value", value: formatCurrency(totalEarned + totalPending), icon: <DollarSign size={16} />, color: "#3B82F6" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-[16px] font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <span className="text-[13px] font-semibold text-red-700">{selected.size} selected</span>
            <button onClick={bulkDelete} className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg">
              <Trash2 size={12} />Delete Selected
            </button>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-red-500">Clear</button>
          </div>
        )}

        <Card>
          <CardHeader><CardTitle sub={`${commissions.length} commission records`}>Commission Register</CardTitle></CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pl-5 pr-2 py-3 w-8">
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                    </th>
                    {["Agent", "Property / Deal", "Deal Value", "Rate", "Commission", "Type", "Sale Date", "Status", ""].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={10} className="text-center text-gray-400 py-10 text-[13px]">Loading…</td></tr>
                  ) : commissions.length === 0 ? (
                    <tr><td colSpan={10} className="text-center text-gray-400 py-10 text-[13px]">No commissions logged yet.</td></tr>
                  ) : commissions.map((c) => (
                    <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50/50 group ${selected.has(c.id) ? "bg-blue-50/40" : ""}`}>
                      <td className="pl-5 pr-2 py-3">
                        <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                      </td>
                      <td className="px-4 py-3 text-[13px] font-semibold text-gray-900">{c.agent}</td>
                      <td className="px-4 py-3 text-[12.5px] text-gray-700">{c.property}</td>
                      <td className="px-4 py-3 text-[12.5px] font-semibold text-gray-900">{formatCurrency(c.dealValue)}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{c.commissionRate}%</td>
                      <td className="px-4 py-3 text-[13px] font-black" style={{ color: "var(--emerald)" }}>{formatCurrency(c.commissionAmount)}</td>
                      <td className="px-4 py-3"><span className="text-[10.5px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.type}</span></td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{c.saleDate ? new Date(c.saleDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_BADGE[c.status] ?? "default"}>{c.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {c.status !== "Paid" && (
                            <button onClick={() => markPaid(c.id)}
                              className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap">
                              Mark Paid
                            </button>
                          )}
                          <button onClick={() => del(c.id)}
                            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center">
                            <Trash2 size={11} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
      {adding && <AddCommissionModal onClose={() => setAdding(false)} onCreated={load} />}
    </div>
  );
}
