"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, CheckCircle } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";

type Entry = {
  id: string; date: string; description: string; category: string;
  amount: number; type: string; reference: string | null; notes: string | null;
};

const CATEGORIES = [
  "Rent", "Shortlet", "Maintenance", "Payroll", "Insurance", "Utilities",
  "Technology", "Marketing", "Legal", "Tax", "Facility", "Other",
];

function NewEntryModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "", category: "Rent", amount: "", type: "credit", reference: "", notes: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.description || !form.amount) return;
    setSaving(true); setError("");
    const res = await fetch("/api/accounting/entries", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setSuccess(true); setTimeout(() => { onCreated(); onClose(); }, 1000); }
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save entry");
      setSaving(false);
    }
  }

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        <CheckCircle size={32} className="text-emerald-600" />
        <div className="text-[17px] font-bold text-gray-900">Entry Saved!</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">New Accounting Entry</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Type</label>
              <div className="flex gap-2">
                {[{ key: "credit", label: "Income" }, { key: "debit", label: "Expense" }].map(({ key, label }) => (
                  <button key={key} onClick={() => set("type", key)}
                    className={`flex-1 py-2.5 rounded-xl text-[12.5px] font-bold border transition-colors ${form.type === key
                      ? key === "credit" ? "bg-emerald-500 text-white border-emerald-500" : "bg-red-500 text-white border-red-500"
                      : "border-gray-200 text-gray-600"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Description *</label>
            <input value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="e.g. Rent payment — Chidi Okafor"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Amount (₦) *</label>
              <input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)}
                placeholder="e.g. 350000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Reference / Receipt No.</label>
            <input value={form.reference} onChange={(e) => set("reference", e.target.value)}
              placeholder="Optional"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-[12.5px] text-red-700">{error}</div>}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.description || !form.amount}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "var(--emerald)" }}>
            <Plus size={14} /> {saving ? "Saving…" : "Save Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AccountingTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Accounting" action={{ label: "New Entry", onClick: () => setOpen(true) }} />
      {open && <NewEntryModal onClose={() => setOpen(false)} onCreated={() => window.location.reload()} />}
    </>
  );
}

export function NewEntryButton({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors flex-shrink-0"
        style={{ background: "var(--gold)", color: "var(--navy)" }}>
        <Plus size={14} /> New Entry
      </button>
      {open && <NewEntryModal onClose={() => setOpen(false)} onCreated={onCreated} />}
    </>
  );
}

export function ManualLedger() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/accounting/entries");
    if (res.ok) setEntries(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  if (entries.length === 0 && !open) return (
    <div className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
      <span className="text-[12.5px]">No manual entries yet.</span>
      <button onClick={() => setOpen(true)}
        className="text-[12px] font-bold px-3 py-1.5 rounded-lg"
        style={{ background: "var(--gold)", color: "var(--navy)" }}>
        + Add First Entry
      </button>
      {open && <NewEntryModal onClose={() => setOpen(false)} onCreated={load} />}
    </div>
  );

  const income = entries.filter((e) => e.type === "credit").reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter((e) => e.type === "debit").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div>
          <div className="text-[13px] font-bold text-gray-900">Manual Entries</div>
          <div className="text-[11px] text-gray-400">{entries.length} entries · +₦{income.toLocaleString()} / −₦{expense.toLocaleString()}</div>
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg"
          style={{ background: "var(--gold)", color: "var(--navy)" }}>
          <Plus size={12} /> Add Entry
        </button>
      </div>
      <div className="overflow-x-auto max-h-56 overflow-y-auto">
        <table className="w-full">
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-2.5 pl-5 text-[11.5px] text-gray-500 whitespace-nowrap">
                  {new Date(e.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                </td>
                <td className="px-4 py-2.5 text-[12px] text-gray-900 max-w-[220px] truncate">{e.description}</td>
                <td className="px-4 py-2.5">
                  <span className="text-[10.5px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e.category}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-[13px] font-black ${e.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                    {e.type === "credit" ? "+" : "−"}₦{e.amount.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && <NewEntryModal onClose={() => setOpen(false)} onCreated={load} />}
    </div>
  );
}
