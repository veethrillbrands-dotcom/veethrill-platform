"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { X, Trash2, Users, Target, TrendingUp, CheckCircle } from "lucide-react";

const ROLES = ["Managing Director", "Sales Director", "Sales Manager", "Senior Agent", "Agent", "Marketing Coordinator", "Operations Manager", "Finance Officer", "Legal Counsel", "Admin", "Intern"];
const ROLE_COLORS: Record<string, string> = {
  "Managing Director": "bg-red-100 text-red-700", "Sales Director": "bg-purple-100 text-purple-700",
  "Sales Manager": "bg-blue-100 text-blue-700", "Senior Agent": "bg-indigo-100 text-indigo-700",
  "Agent": "bg-yellow-100 text-yellow-700", "Marketing Coordinator": "bg-teal-100 text-teal-700",
  "Operations Manager": "bg-orange-100 text-orange-700", "Finance Officer": "bg-emerald-100 text-emerald-700",
  "Legal Counsel": "bg-gray-100 text-gray-700", "Admin": "bg-gray-100 text-gray-600", "Intern": "bg-gray-50 text-gray-500",
};

type Member = { id: string; name: string; role: string; email: string; phone: string | null; target: number; achieved: number; active: boolean };

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function AddMemberModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", role: "Agent", email: "", phone: "", target: "", achieved: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.name || !form.email) return;
    setSaving(true);
    await fetch("/api/crm/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); onCreated(); onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Team Member</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {[{ label: "Full Name *", key: "name" }, { label: "Email *", key: "email" }, { label: "Phone", key: "phone" }].map(({ label, key }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              <input value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          ))}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Role</label>
            <select value={form.role} onChange={(e) => set("role", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Annual Target (₦)</label>
              <input type="number" value={form.target} onChange={(e) => set("target", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">YTD Achieved (₦)</label>
              <input type="number" value={form.achieved} onChange={(e) => set("achieved", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.name || !form.email}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "✓ Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditAchievedModal({ member, onClose, onSaved }: { member: Member; onClose: () => void; onSaved: () => void }) {
  const [value, setValue] = useState(String(member.achieved));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/crm/team/${member.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ achieved: Number(value) }) });
    setSaving(false); onSaved(); onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80">
        <div className="text-[14px] font-bold text-gray-900 mb-4">Update Achievement — {member.name}</div>
        <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 mb-4" />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold text-gray-600">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white" style={{ background: "var(--emerald)" }}>
            {saving ? "…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/crm/team");
    setMembers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/crm/team/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    load();
  }

  async function del(id: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/crm/team/${id}`, { method: "DELETE" });
    load();
  }

  const totalTarget = members.reduce((s, m) => s + m.target, 0);
  const totalAchieved = members.reduce((s, m) => s + m.achieved, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Team & Agents" action={{ label: "Add Member", onClick: () => setAdding(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Team Members", value: members.length, icon: <Users size={16} />, color: "var(--navy)" },
            { label: "Active Agents", value: members.filter((m) => ["Agent", "Senior Agent"].includes(m.role) && m.active).length, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Total Target", value: formatCurrency(totalTarget), icon: <Target size={16} />, color: "var(--gold)" },
            { label: "Total Achieved", value: formatCurrency(totalAchieved), icon: <TrendingUp size={16} />, color: "#3B82F6" },
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

        {loading ? (
          <div className="text-center text-gray-400 py-12 text-[13px]">Loading team…</div>
        ) : members.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-[13px]">No team members yet. Add your first agent.</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              {members.map((m) => {
                const pct = m.target > 0 ? Math.min(100, Math.round((m.achieved / m.target) * 100)) : 0;
                return (
                  <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm group relative">
                    <button onClick={() => del(m.id)}
                      className="absolute top-3 right-3 w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-opacity">
                      <Trash2 size={11} className="text-red-400" />
                    </button>
                    <div className="flex items-start gap-3 mb-4 pr-6">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-[12px] flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)", color: "var(--gold)" }}>
                        {getInitials(m.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold text-gray-900 truncate">{m.name}</div>
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[m.role] ?? "bg-gray-100 text-gray-600"}`}>{m.role}</span>
                      </div>
                      <button onClick={() => toggleActive(m.id, m.active)}>
                        <Badge variant={m.active ? "success" : "default"}>{m.active ? "Active" : "Inactive"}</Badge>
                      </button>
                    </div>
                    <div className="text-[12px] text-gray-500 space-y-0.5 mb-4">
                      <div>{m.email}</div>
                      {m.phone && <div>{m.phone}</div>}
                    </div>
                    {m.target > 0 && (
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-gray-400">Sales Target</span>
                          <span className="font-bold" style={{ color: pct >= 80 ? "var(--emerald)" : pct >= 50 ? "var(--gold)" : "#EF4444" }}>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? "var(--emerald)" : pct >= 50 ? "var(--gold)" : "#EF4444" }} />
                        </div>
                        <div className="flex justify-between text-[10.5px] text-gray-400">
                          <span>{formatCurrency(m.achieved)}</span>
                          <button onClick={() => setEditing(m)} className="text-blue-500 hover:underline">Update</button>
                          <span>{formatCurrency(m.target)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Card>
              <CardHeader><CardTitle sub="Full team directory">Team Directory</CardTitle></CardHeader>
              <CardBody noPad>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Member", "Role", "Email", "Target", "Achieved", "Attainment", "Status", ""].map((h) => (
                        <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => {
                      const pct = m.target > 0 ? Math.round((m.achieved / m.target) * 100) : 0;
                      return (
                        <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50 group">
                          <td className="px-4 py-3 pl-5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)", color: "var(--gold)" }}>
                                {getInitials(m.name)}
                              </div>
                              <span className="text-[13px] font-semibold text-gray-900">{m.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[m.role] ?? "bg-gray-100 text-gray-600"}`}>{m.role}</span>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-gray-600">{m.email}</td>
                          <td className="px-4 py-3 text-[12.5px] font-semibold text-gray-700">{m.target > 0 ? formatCurrency(m.target) : "—"}</td>
                          <td className="px-4 py-3 text-[13px] font-bold" style={{ color: "var(--emerald)" }}>{m.achieved > 0 ? formatCurrency(m.achieved) : "—"}</td>
                          <td className="px-4 py-3">
                            {m.target > 0 ? (
                              <span className={`text-[11.5px] font-bold ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-yellow-600" : "text-red-500"}`}>{pct}%</span>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={m.active ? "success" : "default"}>{m.active ? "Active" : "Inactive"}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => del(m.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={12} className="text-red-500" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </>
        )}

      </div>
      {adding && <AddMemberModal onClose={() => setAdding(false)} onCreated={load} />}
      {editing && <EditAchievedModal member={editing} onClose={() => setEditing(null)} onSaved={load} />}
    </div>
  );
}
