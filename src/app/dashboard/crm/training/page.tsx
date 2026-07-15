"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, BookOpen, Users, CheckCircle, Clock } from "lucide-react";

type Program = {
  id: string; title: string; category: string; trainer: string; targetRole: string;
  startDate: string; endDate: string; status: string; enrolled: number; capacity: number; venue: string; description: string;
};

const SEED: Program[] = [
  { id: "1", title: "Advanced Sales Negotiation", category: "Sales", trainer: "Amara Okonkwo", targetRole: "Senior Agent", startDate: "2026-07-20", endDate: "2026-07-22", status: "Upcoming", enrolled: 8, capacity: 12, venue: "Lekki Conference Room", description: "Closing high-value residential and commercial deals." },
  { id: "2", title: "CRM & Lead Management", category: "Technology", trainer: "Ngozi Hassan", targetRole: "Agent", startDate: "2026-08-05", endDate: "2026-08-05", status: "Upcoming", enrolled: 14, capacity: 20, venue: "Online (Zoom)", description: "Using the platform CRM tools, pipeline management, and follow-up cadence." },
  { id: "3", title: "Property Valuation Masterclass", category: "Technical", trainer: "Chukwu Eze", targetRole: "All", startDate: "2026-06-10", endDate: "2026-06-12", status: "Completed", enrolled: 10, capacity: 10, venue: "VI Head Office", description: "Market comps, income approach, and residual land value techniques." },
  { id: "4", title: "Compliance & AML Training", category: "Legal", trainer: "External Trainer", targetRole: "All", startDate: "2026-09-01", endDate: "2026-09-01", status: "Upcoming", enrolled: 0, capacity: 30, venue: "Online (Zoom)", description: "Anti-money laundering obligations and property sector regulations in Nigeria." },
  { id: "5", title: "Luxury Client Experience", category: "Sales", trainer: "Fatima Bello", targetRole: "Senior Agent", startDate: "2026-07-01", endDate: "2026-07-02", status: "In Progress", enrolled: 6, capacity: 8, venue: "Ikoyi Show Apartment", description: "High-touch service delivery for HNI and diaspora clients." },
];

const CATS = ["Sales", "Technology", "Technical", "Legal", "HR", "Marketing"];
const STATUS_BADGE: Record<string, "success" | "info" | "warning" | "default"> = {
  Completed: "success", "In Progress": "info", Upcoming: "warning", Cancelled: "default",
};

function AddProgramModal({ onAdd, onClose }: { onAdd: (p: Program) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: "", category: "Sales", trainer: "", targetRole: "All", startDate: "", endDate: "",
    venue: "", capacity: "20", description: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    onAdd({ ...form, id: Date.now().toString(), status: "Upcoming", enrolled: 0, capacity: Number(form.capacity) });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Training Program</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Program Title</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Target Role</label>
              <select value={form.targetRole} onChange={(e) => set("targetRole", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {["All", "Agent", "Senior Agent", "Sales Manager", "Sales Director", "Admin", "Operations Manager"].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Trainer</label>
              <input value={form.trainer} onChange={(e) => set("trainer", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Capacity</label>
              <input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Venue</label>
            <input value={form.venue} onChange={(e) => set("venue", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={!form.title || !form.startDate}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            ✓ Add Program
          </button>
        </div>
      </div>
    </div>
  );
}

const CAT_COLORS: Record<string, string> = {
  Sales: "bg-blue-100 text-blue-700", Technology: "bg-purple-100 text-purple-700",
  Technical: "bg-orange-100 text-orange-700", Legal: "bg-red-100 text-red-700",
  HR: "bg-teal-100 text-teal-700", Marketing: "bg-yellow-100 text-yellow-700",
};

export default function TrainingPage() {
  const [programs, setPrograms] = useState<Program[]>(SEED);
  const [adding, setAdding] = useState(false);

  const upcoming = programs.filter((p) => p.status === "Upcoming").length;
  const inProgress = programs.filter((p) => p.status === "In Progress").length;
  const completed = programs.filter((p) => p.status === "Completed").length;
  const totalEnrolled = programs.reduce((s, p) => s + p.enrolled, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Training Programs" action={{ label: "Add Program", onClick: () => setAdding(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Upcoming", value: upcoming, icon: <Clock size={16} />, color: "var(--gold)" },
            { label: "In Progress", value: inProgress, icon: <BookOpen size={16} />, color: "#3B82F6" },
            { label: "Completed", value: completed, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Total Enrolled", value: totalEnrolled, icon: <Users size={16} />, color: "var(--navy)" },
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

        <div className="grid grid-cols-3 gap-4">
          {programs.filter((p) => p.status !== "Completed").map((p) => {
            const fillPct = p.capacity > 0 ? Math.round((p.enrolled / p.capacity) * 100) : 0;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${CAT_COLORS[p.category] ?? "bg-gray-100 text-gray-600"}`}>{p.category}</span>
                  <Badge variant={STATUS_BADGE[p.status] ?? "default"}>{p.status}</Badge>
                </div>
                <div className="text-[14px] font-bold text-gray-900 mb-1">{p.title}</div>
                <div className="text-[12px] text-gray-500 mb-3">{p.description}</div>
                <div className="text-[11.5px] text-gray-600 space-y-0.5 mb-3">
                  <div>👤 {p.trainer}</div>
                  <div>🎯 {p.targetRole}</div>
                  <div>📍 {p.venue}</div>
                  <div>📅 {p.startDate} {p.endDate !== p.startDate ? `→ ${p.endDate}` : ""}</div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">Enrolled</span>
                    <span className="font-bold text-gray-700">{p.enrolled} / {p.capacity}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: fillPct >= 90 ? "#EF4444" : fillPct >= 60 ? "var(--gold)" : "var(--emerald)" }} />
                  </div>
                </div>
                <button
                  onClick={() => setPrograms((prev) => prev.map((x) => x.id === p.id ? { ...x, enrolled: Math.min(x.enrolled + 1, x.capacity) } : x))}
                  disabled={p.enrolled >= p.capacity}
                  className="mt-3 w-full py-2 rounded-xl text-[11.5px] font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  + Enrol
                </button>
              </div>
            );
          })}
        </div>

        <Card>
          <CardHeader><CardTitle sub="All training programs">Program Register</CardTitle></CardHeader>
          <CardBody noPad>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Program", "Category", "Trainer", "Target", "Dates", "Venue", "Enrolled", "Status"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 pl-5">
                      <div className="text-[13px] font-semibold text-gray-900">{p.title}</div>
                      <div className="text-[11px] text-gray-400 max-w-[200px] truncate">{p.description}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${CAT_COLORS[p.category] ?? "bg-gray-100"}`}>{p.category}</span></td>
                    <td className="px-4 py-3 text-[12.5px] text-gray-700">{p.trainer}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{p.targetRole}</td>
                    <td className="px-4 py-3 text-[11.5px] text-gray-600 whitespace-nowrap">{p.startDate}{p.endDate !== p.startDate ? ` → ${p.endDate}` : ""}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{p.venue}</td>
                    <td className="px-4 py-3 text-[12.5px] font-semibold text-gray-900">{p.enrolled}/{p.capacity}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_BADGE[p.status] ?? "default"}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

      </div>
      {adding && <AddProgramModal onAdd={(p) => setPrograms((prev) => [p, ...prev])} onClose={() => setAdding(false)} />}
    </div>
  );
}
