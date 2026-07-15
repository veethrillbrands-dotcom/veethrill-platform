"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { X, DollarSign, CheckCircle, Clock, TrendingUp } from "lucide-react";

type Commission = {
  id: string; agent: string; property: string; dealValue: number; commissionRate: number;
  commissionAmount: number; status: string; type: string; saleDate: string; paidDate: string;
};

const SEED: Commission[] = [
  { id: "1", agent: "Fatima Bello", property: "Ikoyi Penthouse", dealValue: 350000000, commissionRate: 3, commissionAmount: 10500000, status: "Paid", type: "Sale", saleDate: "2026-05-20", paidDate: "2026-06-01" },
  { id: "2", agent: "Emeka Adeyemi", property: "Lekki 3BR Unit", dealValue: 85000000, commissionRate: 2.5, commissionAmount: 2125000, status: "Pending", type: "Sale", saleDate: "2026-07-01", paidDate: "" },
  { id: "3", agent: "Chukwu Eze", property: "VI Office Complex", dealValue: 1200000000, commissionRate: 2, commissionAmount: 24000000, status: "Partially Paid", type: "Sale", saleDate: "2026-04-15", paidDate: "2026-05-01" },
  { id: "4", agent: "Fatima Bello", property: "Abuja Residences", dealValue: 55000000, commissionRate: 3, commissionAmount: 1650000, status: "Overdue", type: "Referral", saleDate: "2026-03-10", paidDate: "" },
  { id: "5", agent: "Emeka Adeyemi", property: "Lekki Shortlet Block", dealValue: 420000000, commissionRate: 1.5, commissionAmount: 6300000, status: "Paid", type: "Referral", saleDate: "2026-06-12", paidDate: "2026-06-25" },
];

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "info"> = {
  Paid: "success", Pending: "warning", Overdue: "error", "Partially Paid": "info",
};

function AddCommissionModal({ onAdd, onClose }: { onAdd: (c: Commission) => void; onClose: () => void }) {
  const [form, setForm] = useState({ agent: "", property: "", dealValue: "", commissionRate: "3", type: "Sale", saleDate: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const amount = Number(form.dealValue) * (Number(form.commissionRate) / 100);

  function save() {
    onAdd({
      id: Date.now().toString(), agent: form.agent, property: form.property,
      dealValue: Number(form.dealValue), commissionRate: Number(form.commissionRate),
      commissionAmount: amount, status: "Pending", type: form.type, saleDate: form.saleDate, paidDate: "",
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Log Commission</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Agent Name", key: "agent" }, { label: "Property / Deal", key: "property" },
          ].map(({ label, key }) => (
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
                {["Sale", "Referral", "Rental", "Management", "Consultancy"].map((t) => <option key={t} value={t}>{t}</option>)}
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
          <button onClick={save} disabled={!form.agent || !form.dealValue}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            ✓ Log Commission
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>(SEED);
  const [adding, setAdding] = useState(false);

  function markPaid(id: string) {
    setCommissions((prev) => prev.map((c) => c.id === id ? { ...c, status: "Paid", paidDate: new Date().toISOString().split("T")[0] } : c));
  }

  const totalEarned = commissions.filter((c) => c.status === "Paid").reduce((s, c) => s + c.commissionAmount, 0);
  const totalPending = commissions.filter((c) => c.status !== "Paid").reduce((s, c) => s + c.commissionAmount, 0);

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

        <Card>
          <CardHeader><CardTitle sub={`${commissions.length} commission records`}>Commission Register</CardTitle></CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Agent", "Property / Deal", "Deal Value", "Rate", "Commission", "Type", "Sale Date", "Status", ""].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 pl-5 text-[13px] font-semibold text-gray-900">{c.agent}</td>
                      <td className="px-4 py-3 text-[12.5px] text-gray-700">{c.property}</td>
                      <td className="px-4 py-3 text-[12.5px] font-semibold text-gray-900">{formatCurrency(c.dealValue)}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{c.commissionRate}%</td>
                      <td className="px-4 py-3 text-[13px] font-black" style={{ color: "var(--emerald)" }}>{formatCurrency(c.commissionAmount)}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10.5px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.type}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{c.saleDate || "—"}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_BADGE[c.status] ?? "default"}>{c.status}</Badge></td>
                      <td className="px-4 py-3">
                        {c.status !== "Paid" && (
                          <button onClick={() => markPaid(c.id)}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap">
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
      {adding && <AddCommissionModal onAdd={(c) => setCommissions((prev) => [c, ...prev])} onClose={() => setAdding(false)} />}
    </div>
  );
}
