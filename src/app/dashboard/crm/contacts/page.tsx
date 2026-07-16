"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Users, UserCheck, Building2, Globe, Trash2, MessageCircle, Phone, Mail, ChevronRight, Upload } from "lucide-react";
import { BulkUploadModal } from "@/components/modals/BulkUploadModal";
import { getInitials } from "@/lib/utils";

type Contact = {
  id: string; name: string; type: string; email: string | null; phone: string | null;
  company: string | null; location: string | null; source: string | null; notes: string | null;
  createdAt: string;
};

const TYPES = ["Prospect", "Client", "Developer", "Agent", "Partner", "Corporate", "Diaspora", "HNI"];
const TYPE_COLORS: Record<string, string> = {
  Prospect: "bg-blue-100 text-blue-700", Client: "bg-emerald-100 text-emerald-700",
  Developer: "bg-purple-100 text-purple-700", Agent: "bg-yellow-100 text-yellow-700",
  Partner: "bg-indigo-100 text-indigo-700", Corporate: "bg-orange-100 text-orange-700",
  Diaspora: "bg-teal-100 text-teal-700", HNI: "bg-red-100 text-red-700",
};

function AddContactModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Prospect", email: "", phone: "", company: "", location: "", source: "Direct", notes: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/crm/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Contact</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Full Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Contact Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Source</label>
              <select value={form.source} onChange={(e) => set("source", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {["Direct", "Referral", "Social Media", "LinkedIn", "Walk-in", "Event", "Website", "Other"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {[
            { label: "Email", key: "email" }, { label: "Phone", key: "phone" },
            { label: "Company", key: "company" }, { label: "Location", key: "location" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              <input value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)}
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
          <button onClick={save} disabled={saving || !form.name}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "✓ Add Contact"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/crm/contacts");
    setContacts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteContact(id: string) {
    await fetch(`/api/crm/contacts/${id}`, { method: "DELETE" });
    load();
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} contacts?`)) return;
    await Promise.all([...selected].map((id) => fetch(`/api/crm/contacts/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    load();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAll() {
    setSelected(visible.length === selected.size && visible.every((c) => selected.has(c.id)) ? new Set() : new Set(visible.map((c) => c.id)));
  }

  const visible = contacts.filter((c) => {
    const matchType = filter === "All" || c.type === filter;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email ?? "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const allChecked = visible.length > 0 && visible.every((c) => selected.has(c.id));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="CRM Contacts" action={{ label: "+ Add Contact", onClick: () => setAdding(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <button onClick={() => setImporting(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex-shrink-0">
            <Upload size={13} /> Import CSV
          </button>
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

        {selected.size > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <span className="text-[13px] font-semibold text-red-700">{selected.size} selected</span>
            <button onClick={bulkDelete} className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">
              <Trash2 size={12} />Delete Selected
            </button>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-red-500 hover:text-red-700">Clear</button>
          </div>
        )}

        <Card>
          <CardHeader><CardTitle sub={`${visible.length} contacts`}>Contact Directory</CardTitle></CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pl-5 pr-2 py-3 w-8">
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                    </th>
                    {["Contact", "Type", "Company", "Phone", "Location", "Source", "Notes", "Actions"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="text-center text-gray-400 py-10 text-[13px]">Loading…</td></tr>
                  ) : visible.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-gray-400 py-10 text-[13px]">No contacts found.</td></tr>
                  ) : visible.map((c) => (
                    <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors group ${selected.has(c.id) ? "bg-blue-50/40" : ""}`}>
                      <td className="pl-5 pr-2 py-3">
                        <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/crm/contacts/${c.id}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, var(--gold), #b8960a)", color: "var(--navy)" }}>
                            {getInitials(c.name)}
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold text-gray-900 hover:underline">{c.name}</div>
                            <div className="text-[11px] text-gray-400">{c.email ?? "—"}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[c.type] ?? "bg-gray-100 text-gray-600"}`}>{c.type}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{c.company ?? "—"}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{c.phone ?? "—"}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{c.location ?? "—"}</td>
                      <td className="px-4 py-3"><span className="text-[10.5px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.source ?? "—"}</span></td>
                      <td className="px-4 py-3 text-[12px] text-gray-500 max-w-[200px] truncate">{c.notes ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/dashboard/crm/contacts/${c.id}`}
                            className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors" title="View profile">
                            <ChevronRight size={12} className="text-gray-500" />
                          </Link>
                          {c.phone && (
                            <a href={`tel:${c.phone}`}
                              className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors" title={`Call ${c.name}`}>
                              <Phone size={12} className="text-blue-600" />
                            </a>
                          )}
                          {c.email && (
                            <a href={`mailto:${c.email}?subject=Veethrill Realty — Message for ${c.name}`}
                              className="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition-colors" title={`Email ${c.name}`}>
                              <Mail size={12} className="text-purple-600" />
                            </a>
                          )}
                          {c.phone && (
                            <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${c.name.split(" ")[0]}, this is the Veethrill Realty team. How can we assist you today?`)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors" title="WhatsApp">
                              <MessageCircle size={12} className="text-green-600" />
                            </a>
                          )}
                          <button onClick={() => deleteContact(c.id)}
                            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                            <Trash2 size={12} className="text-red-500" />
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
      {adding && <AddContactModal onClose={() => setAdding(false)} onCreated={load} />}
      {importing && (
        <BulkUploadModal
          defaultEntity="contacts"
          onClose={() => setImporting(false)}
          onImported={() => { load(); setImporting(false); }}
        />
      )}
    </div>
  );
}
