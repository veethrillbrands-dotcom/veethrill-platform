"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { X, Bell, Users, CheckCircle, PauseCircle, Trash2, CheckSquare } from "lucide-react";

type Subscription = {
  id: string; subscriber: string; email: string; phone: string | null; type: string;
  interests: string[]; budget: string | null; preferredLocations: string | null;
  frequency: string; status: string; lastNotified: string | null; createdAt: string;
};

const INTEREST_OPTIONS = ["Apartments", "Duplexes", "Land", "Commercial", "Shortlets", "Off-plan", "Luxury", "Affordable"];
const STATUS_BADGE: Record<string, "success" | "warning" | "default"> = {
  Active: "success", Paused: "warning", Unsubscribed: "default",
};

function AddSubscriptionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subscriber: "", email: "", phone: "", type: "Prospect", budget: "", preferredLocations: "", frequency: "Weekly" });
  const [interests, setInterests] = useState<string[]>([]);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  function toggleInterest(i: string) { setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]); }

  async function save() {
    if (!form.subscriber || !form.email) return;
    setSaving(true);
    await fetch("/api/crm/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, interests }) });
    setSaving(false); onCreated(); onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Subscriber</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Subscriber Name *</label>
              <input value={form.subscriber} onChange={(e) => set("subscriber", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Phone</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {["Prospect", "Client", "Investor", "Partner"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Frequency</label>
              <select value={form.frequency} onChange={(e) => set("frequency", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {["Daily", "Weekly", "Bi-weekly", "Monthly"].map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Budget</label>
              <input value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="e.g. ₦30M–₦60M"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Preferred Locations</label>
            <input value={form.preferredLocations} onChange={(e) => set("preferredLocations", e.target.value)} placeholder="e.g. Lekki, VI, Ikoyi"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Property Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((i) => (
                <button key={i} type="button" onClick={() => toggleInterest(i)}
                  className={`text-[11.5px] font-semibold px-3 py-1.5 rounded-xl border transition-colors ${interests.includes(i) ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.subscriber || !form.email}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--navy)" }}>
            {saving ? "Saving…" : "✓ Add Subscriber"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/crm/subscriptions");
    setSubs(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(id: string, status: string) {
    const next = status === "Active" ? "Paused" : "Active";
    await fetch(`/api/crm/subscriptions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    load();
  }

  async function del(id: string) {
    await fetch(`/api/crm/subscriptions/${id}`, { method: "DELETE" });
    load();
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} subscribers?`)) return;
    await Promise.all([...selected].map((id) => fetch(`/api/crm/subscriptions/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    load();
  }

  function toggleSelect(id: string) { setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleAll() { setSelected(subs.length > 0 && subs.every((s) => selected.has(s.id)) ? new Set() : new Set(subs.map((s) => s.id))); }
  const allChecked = subs.length > 0 && subs.every((s) => selected.has(s.id));

  const active = subs.filter((s) => s.status === "Active").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Market Alert Subscribers" action={{ label: "Add Subscriber", onClick: () => setAdding(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Subscribers", value: subs.length, icon: <Users size={16} />, color: "var(--navy)" },
            { label: "Active", value: active, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Paused", value: subs.filter((s) => s.status === "Paused").length, icon: <PauseCircle size={16} />, color: "var(--gold)" },
            { label: "Unsubscribed", value: subs.filter((s) => s.status === "Unsubscribed").length, icon: <Bell size={16} />, color: "#EF4444" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <CheckSquare size={14} className="text-red-600" />
            <span className="text-[13px] font-semibold text-red-700">{selected.size} selected</span>
            <button onClick={bulkDelete} className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg">
              <Trash2 size={12} />Delete Selected
            </button>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-red-500 hover:text-red-700">Clear</button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pl-5 pr-2 py-3 w-8">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                </th>
                {["Subscriber", "Type", "Interests", "Budget", "Locations", "Frequency", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center text-gray-400 py-12 text-[13px]">Loading…</td></tr>
              ) : subs.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-gray-400 py-12 text-[13px]">No subscribers yet.</td></tr>
              ) : subs.map((s) => (
                <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50/50 group ${selected.has(s.id) ? "bg-blue-50/40" : ""}`}>
                  <td className="pl-5 pr-2 py-3">
                    <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-semibold text-gray-900">{s.subscriber}</div>
                    <div className="text-[11px] text-gray-400">{s.email}</div>
                    {s.phone && <div className="text-[11px] text-gray-400">{s.phone}</div>}
                  </td>
                  <td className="px-4 py-3"><span className="text-[10.5px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.type}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {s.interests.slice(0, 3).map((i) => (
                        <span key={i} className="text-[9.5px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{i}</span>
                      ))}
                      {s.interests.length > 3 && <span className="text-[9.5px] text-gray-400">+{s.interests.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-600">{s.budget || "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-600 max-w-[140px] truncate">{s.preferredLocations || "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-600">{s.frequency}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_BADGE[s.status] ?? "default"}>{s.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleStatus(s.id, s.status)}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 whitespace-nowrap">
                        {s.status === "Active" ? "Pause" : "Activate"}
                      </button>
                      <button onClick={() => del(s.id)}
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

      </div>
      {adding && <AddSubscriptionModal onClose={() => setAdding(false)} onCreated={load} />}
    </div>
  );
}
