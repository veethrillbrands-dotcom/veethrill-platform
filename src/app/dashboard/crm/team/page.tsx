"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { getInitials, formatCurrency } from "@/lib/utils";
import { X, CheckCircle } from "lucide-react";

const ROLES = ["Managing Director", "Sales Director", "Sales Manager", "Senior Agent", "Agent", "Marketing Coordinator", "Operations Manager", "Finance Officer", "Legal Counsel", "Admin", "Intern"];
const ROLE_COLORS: Record<string, string> = {
  "Managing Director": "bg-red-100 text-red-700", "Sales Director": "bg-purple-100 text-purple-700",
  "Sales Manager": "bg-blue-100 text-blue-700", "Senior Agent": "bg-indigo-100 text-indigo-700",
  "Agent": "bg-yellow-100 text-yellow-700", "Marketing Coordinator": "bg-teal-100 text-teal-700",
  "Operations Manager": "bg-orange-100 text-orange-700", "Finance Officer": "bg-emerald-100 text-emerald-700",
  "Legal Counsel": "bg-gray-100 text-gray-700", "Admin": "bg-gray-100 text-gray-600", "Intern": "bg-gray-50 text-gray-500",
};

type Member = { id: string; name: string; role: string; email: string; phone: string; target: number; achieved: number; active: boolean };

const SEED: Member[] = [
  { id: "1", name: "Amara Okonkwo", role: "Managing Director", email: "amara@veethrill.com", phone: "+234 803 100 1000", target: 500000000, achieved: 420000000, active: true },
  { id: "2", name: "Chukwu Eze", role: "Sales Director", email: "chukwu@veethrill.com", phone: "+234 807 200 2000", target: 300000000, achieved: 285000000, active: true },
  { id: "3", name: "Fatima Bello", role: "Senior Agent", email: "fatima@veethrill.com", phone: "+234 812 300 3000", target: 150000000, achieved: 134000000, active: true },
  { id: "4", name: "Emeka Adeyemi", role: "Agent", email: "emeka@veethrill.com", phone: "+234 816 400 4000", target: 80000000, achieved: 52000000, active: true },
  { id: "5", name: "Ngozi Hassan", role: "Marketing Coordinator", email: "ngozi@veethrill.com", phone: "+234 802 500 5000", target: 0, achieved: 0, active: true },
];

function AddMemberModal({ onAdd, onClose }: { onAdd: (m: Member) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", role: "Agent", email: "", phone: "", target: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    onAdd({ ...form, id: Date.now().toString(), target: Number(form.target), achieved: 0, active: true });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Team Member</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {[{ label: "Full Name", key: "name" }, { label: "Email", key: "email", type: "email" }, { label: "Phone", key: "phone" }].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              <input type={type ?? "text"} value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          ))}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Role</label>
            <select value={form.role} onChange={(e) => set("role", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Annual Sales Target (₦)</label>
            <input type="number" value={form.target} onChange={(e) => set("target", e.target.value)} placeholder="e.g. 100000000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={!form.name || !form.email}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            ✓ Add Member
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(SEED);
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Team & Agents" action={{ label: "Add Member", onClick: () => setAdding(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Team Members", value: members.length },
            { label: "Active Agents", value: members.filter((m) => ["Agent", "Senior Agent"].includes(m.role)).length },
            { label: "Total Target", value: formatCurrency(members.reduce((s, m) => s + m.target, 0)) },
            { label: "Total Achieved", value: formatCurrency(members.reduce((s, m) => s + m.achieved, 0)) },
          ].map((k, i) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[18px] font-black" style={{ color: ["var(--navy)", "var(--gold)", "var(--emerald)", "#3B82F6"][i] }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {members.map((m) => {
            const pct = m.target > 0 ? Math.min(100, Math.round((m.achieved / m.target) * 100)) : 0;
            return (
              <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-[12px] flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)", color: "var(--gold)" }}>
                    {getInitials(m.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-gray-900">{m.name}</div>
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[m.role] ?? "bg-gray-100 text-gray-600"}`}>{m.role}</span>
                  </div>
                  <Badge variant={m.active ? "success" : "default"}>{m.active ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="text-[12px] text-gray-500 space-y-0.5 mb-3">
                  <div>{m.email}</div>
                  <div>{m.phone}</div>
                </div>
                {m.target > 0 && (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-gray-400">Sales Target</span>
                      <span className="font-bold" style={{ color: pct >= 80 ? "var(--emerald)" : pct >= 50 ? "var(--gold)" : "#EF4444" }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${pct}%`,
                        background: pct >= 80 ? "var(--emerald)" : pct >= 50 ? "var(--gold)" : "#EF4444"
                      }} />
                    </div>
                    <div className="flex justify-between text-[10.5px] text-gray-400 mt-1">
                      <span>{formatCurrency(m.achieved)} achieved</span>
                      <span>{formatCurrency(m.target)} target</span>
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
                  {["Member", "Role", "Email", "Target", "Achieved", "Attainment"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const pct = m.target > 0 ? Math.round((m.achieved / m.target) * 100) : 0;
                  return (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 pl-5 text-[13px] font-semibold text-gray-900">{m.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[m.role] ?? "bg-gray-100 text-gray-600"}`}>{m.role}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{m.email}</td>
                      <td className="px-4 py-3 text-[12.5px] font-semibold text-gray-700">{m.target > 0 ? formatCurrency(m.target) : "—"}</td>
                      <td className="px-4 py-3 text-[13px] font-bold" style={{ color: "var(--emerald)" }}>{m.achieved > 0 ? formatCurrency(m.achieved) : "—"}</td>
                      <td className="px-4 py-3">
                        {m.target > 0 ? (
                          <span className={`text-[11.5px] font-bold ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-yellow-600" : "text-red-500"}`}>{pct}%</span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>

      </div>
      {adding && <AddMemberModal onAdd={(m) => setMembers((prev) => [...prev, m])} onClose={() => setAdding(false)} />}
    </div>
  );
}
