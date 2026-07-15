"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Users, UserCheck, Building2, Globe } from "lucide-react";
import { getInitials } from "@/lib/utils";

type Contact = {
  id: string; name: string; type: string; email: string; phone: string;
  company: string; location: string; source: string; notes: string; createdAt: string;
};

const TYPES = ["Prospect", "Client", "Developer", "Agent", "Partner", "Corporate", "Diaspora", "HNI"];
const TYPE_COLORS: Record<string, string> = {
  Prospect: "bg-blue-100 text-blue-700", Client: "bg-emerald-100 text-emerald-700",
  Developer: "bg-purple-100 text-purple-700", Agent: "bg-yellow-100 text-yellow-700",
  Partner: "bg-indigo-100 text-indigo-700", Corporate: "bg-orange-100 text-orange-700",
  Diaspora: "bg-teal-100 text-teal-700", HNI: "bg-red-100 text-red-700",
};

const SEED: Contact[] = [
  { id: "1", name: "Chief Emeka Eze", type: "HNI", email: "c.eze@ezegroup.ng", phone: "+234 803 111 2222", company: "Eze Group", location: "Lagos", source: "Referral", notes: "Interested in Ikoyi luxury units", createdAt: "2026-01-15" },
  { id: "2", name: "Mrs. Adaeze Okafor", type: "Client", email: "adaeze.o@gmail.com", phone: "+234 807 333 4444", company: "", location: "Abuja", source: "Walk-in", notes: "Purchased 2 units in Maitama", createdAt: "2026-03-20" },
  { id: "3", name: "GlobalRealty International", type: "Corporate", email: "info@globalrealty.com", phone: "+234 901 555 6666", company: "GlobalRealty", location: "London", source: "LinkedIn", notes: "Diaspora investment arm", createdAt: "2026-04-10" },
  { id: "4", name: "Alhaji Musa Bello", type: "Prospect", email: "musa.bello@hotmail.com", phone: "+234 802 777 8888", company: "", location: "Kano", source: "Social Media", notes: "Looking for commercial property", createdAt: "2026-05-08" },
];

function AddContactModal({ onAdd, onClose }: { onAdd: (c: Contact) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", type: "Prospect", email: "", phone: "", company: "", location: "", source: "Direct", notes: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    onAdd({ ...form, id: Date.now().toString(), createdAt: new Date().toISOString().split("T")[0] });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Contact</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Full Name</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Contact name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Contact Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Source</label>
              <select value={form.source} onChange={(e) => set("source", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {["Direct", "Referral", "Social Media", "LinkedIn", "Walk-in", "Event", "Website", "Other"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {[
            { label: "Email", key: "email", type: "email" }, { label: "Phone", key: "phone" },
            { label: "Company / Organization", key: "company" }, { label: "Location", key: "location" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              <input type={type ?? "text"} value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          ))}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={!form.name}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            ✓ Add Contact
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(SEED);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const visible = contacts.filter((c) => {
    const matchType = filter === "All" || c.type === filter;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="CRM Contacts" action={{ label: "Add Contact", onClick: () => setAdding(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Contacts", value: contacts.length, icon: <Users size={16} />, color: "var(--navy)" },
            { label: "Clients", value: contacts.filter((c) => c.type === "Client").length, icon: <UserCheck size={16} />, color: "var(--emerald)" },
            { label: "Prospects", value: contacts.filter((c) => c.type === "Prospect").length, icon: <Globe size={16} />, color: "var(--gold)" },
            { label: "HNI / Corporate", value: contacts.filter((c) => ["HNI", "Corporate"].includes(c.type)).length, icon: <Building2 size={16} />, color: "#3B82F6" },
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

        <div className="flex items-center gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts…"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-yellow-400 w-64" />
          <div className="flex gap-1.5 flex-wrap">
            {["All", ...TYPES].map((t) => (
              <button key={t} onClick={() => setFilter(t)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors ${filter === t ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                style={filter === t ? { background: "var(--navy)" } : {}}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle sub={`${visible.length} contacts`}>Contact Directory</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Contact", "Type", "Company", "Phone", "Location", "Source", "Notes"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-gray-400 py-10 text-[13px]">No contacts found.</td></tr>
                  ) : visible.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 pl-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, var(--gold), #b8960a)", color: "var(--navy)" }}>
                            {getInitials(c.name)}
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold text-gray-900">{c.name}</div>
                            <div className="text-[11px] text-gray-400">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[c.type] ?? "bg-gray-100 text-gray-600"}`}>{c.type}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{c.company || "—"}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{c.phone}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{c.location}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10.5px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.source}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-500 max-w-[200px] truncate">{c.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
      {adding && <AddContactModal onAdd={(c) => setContacts((prev) => [c, ...prev])} onClose={() => setAdding(false)} />}
    </div>
  );
}
