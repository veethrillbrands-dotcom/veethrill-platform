"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { X, Bell, TrendingUp, Users, MapPin } from "lucide-react";

type Subscription = {
  id: string; subscriber: string; email: string; phone: string; type: string;
  interests: string[]; budget: string; preferredLocations: string; frequency: string;
  status: string; subscribedAt: string; lastNotified: string;
};

const SEED: Subscription[] = [
  { id: "1", subscriber: "Chief Emeka Eze", email: "c.eze@ezegroup.ng", phone: "+234 803 111 2222", type: "HNI", interests: ["Luxury Residential", "Commercial"], budget: "₦200M+", preferredLocations: "Ikoyi, VI", frequency: "Immediate", status: "Active", subscribedAt: "2026-01-15", lastNotified: "2026-07-10" },
  { id: "2", subscriber: "Marcus Chen", email: "m.chen@globalinv.com", phone: "+44 7700 900100", type: "Diaspora", interests: ["Shortlet/Hospitality", "Luxury Residential"], budget: "₦50M–₦150M", preferredLocations: "Lekki, V.I", frequency: "Weekly", status: "Active", subscribedAt: "2026-03-20", lastNotified: "2026-07-08" },
  { id: "3", subscriber: "Ngozi Hassan", email: "ngozi.h@gmail.com", phone: "+234 802 333 4444", type: "Prospect", interests: ["Affordable Residential"], budget: "₦20M–₦50M", preferredLocations: "Lugbe, Kuje", frequency: "Weekly", status: "Active", subscribedAt: "2026-05-01", lastNotified: "2026-07-08" },
  { id: "4", subscriber: "Alhaji Musa Bello", email: "musa.bello@hotmail.com", phone: "+234 802 777 8888", type: "Prospect", interests: ["Commercial", "Mixed-Use"], budget: "₦80M–₦200M", preferredLocations: "Abuja CBD, Wuse", frequency: "Monthly", status: "Paused", subscribedAt: "2026-02-10", lastNotified: "2026-06-01" },
];

const PROPERTY_TYPES = ["Luxury Residential", "Affordable Residential", "Commercial", "Mixed-Use", "Shortlet/Hospitality", "Land", "Industrial"];
const STATUS_BADGE: Record<string, "success" | "warning" | "default"> = { Active: "success", Paused: "warning", Unsubscribed: "default" };
const TYPE_COLORS: Record<string, string> = {
  HNI: "bg-red-100 text-red-700", Diaspora: "bg-teal-100 text-teal-700",
  Prospect: "bg-blue-100 text-blue-700", Client: "bg-emerald-100 text-emerald-700", Corporate: "bg-orange-100 text-orange-700",
};

function AddSubscriptionModal({ onAdd, onClose }: { onAdd: (s: Subscription) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    subscriber: "", email: "", phone: "", type: "Prospect",
    interests: [] as string[], budget: "", preferredLocations: "", frequency: "Weekly",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function toggleInterest(t: string) {
    setForm((f) => ({ ...f, interests: f.interests.includes(t) ? f.interests.filter((i) => i !== t) : [...f.interests, t] }));
  }

  function save() {
    onAdd({ ...form, id: Date.now().toString(), status: "Active", subscribedAt: new Date().toISOString().split("T")[0], lastNotified: "" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Market Subscription</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Subscriber Name</label>
            <input value={form.subscriber} onChange={(e) => set("subscriber", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Phone</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {["Prospect", "Client", "HNI", "Diaspora", "Corporate"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Alert Frequency</label>
              <select value={form.frequency} onChange={(e) => set("frequency", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {["Immediate", "Daily", "Weekly", "Monthly"].map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Property Interests</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((t) => (
                <button key={t} onClick={() => toggleInterest(t)}
                  className={`text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${form.interests.includes(t) ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Budget Range</label>
              <input placeholder="e.g. ₦50M–₦150M" value={form.budget} onChange={(e) => set("budget", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Preferred Locations</label>
              <input placeholder="e.g. Lekki, Ikoyi" value={form.preferredLocations} onChange={(e) => set("preferredLocations", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={!form.subscriber || !form.email}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            ✓ Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>(SEED);
  const [adding, setAdding] = useState(false);

  function toggleStatus(id: string) {
    setSubs((prev) => prev.map((s) => s.id === id ? { ...s, status: s.status === "Active" ? "Paused" : "Active" } : s));
  }

  const active = subs.filter((s) => s.status === "Active").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Market Subscriptions" action={{ label: "Add Subscription", onClick: () => setAdding(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Subscribers", value: subs.length, icon: <Users size={16} />, color: "var(--navy)" },
            { label: "Active", value: active, icon: <Bell size={16} />, color: "var(--emerald)" },
            { label: "Paused", value: subs.length - active, icon: <Bell size={16} />, color: "var(--gold)" },
            { label: "Locations Tracked", value: new Set(subs.flatMap((s) => s.preferredLocations.split(",").map((l) => l.trim()))).size, icon: <MapPin size={16} />, color: "#3B82F6" },
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

        <Card>
          <CardHeader><CardTitle sub={`${subs.length} subscribers — manage market alert preferences`}>Subscriber List</CardTitle></CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Subscriber", "Type", "Interests", "Budget", "Locations", "Frequency", "Last Notified", "Status", ""].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 pl-5">
                        <div className="text-[13px] font-semibold text-gray-900">{s.subscriber}</div>
                        <div className="text-[11px] text-gray-400">{s.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[s.type] ?? "bg-gray-100 text-gray-600"}`}>{s.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.interests.slice(0, 2).map((i) => (
                            <span key={i} className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{i}</span>
                          ))}
                          {s.interests.length > 2 && <span className="text-[10px] text-gray-400">+{s.interests.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-gray-700">{s.budget}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600"><div className="flex items-center gap-1"><MapPin size={10} />{s.preferredLocations}</div></td>
                      <td className="px-4 py-3">
                        <span className="text-[10.5px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.frequency}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-500">{s.lastNotified || "—"}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_BADGE[s.status] ?? "default"}>{s.status}</Badge></td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleStatus(s.id)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
                          {s.status === "Active" ? "Pause" : "Resume"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
      {adding && <AddSubscriptionModal onAdd={(s) => setSubs((prev) => [s, ...prev])} onClose={() => setAdding(false)} />}
    </div>
  );
}
