"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { X, Building2, TrendingUp, MapPin, Users, Trash2 } from "lucide-react";

type Dossier = {
  id: string; title: string; type: string; location: string; totalUnits: number;
  priceFrom: number; priceTo: number; developer: string; completionDate: string | null;
  yieldEstimate: number; targetInvestor: string | null; highlights: string | null;
  requesterName: string | null; amountPaid: number | null; status: string;
};

const DOSSIER_STATUSES = [
  "Active", "Coming Soon", "In Progress", "Sent", "Approved", "Paid",
  "Complimentary", "Pending Payment", "Modifying", "Completed", "Sold",
];

const STATUS_BADGE: Record<string, "success" | "warning" | "default" | "info"> = {
  Active: "success", "Coming Soon": "warning", Sold: "default",
  Paid: "success", Approved: "info", "In Progress": "info",
  "Pending Payment": "warning", Modifying: "warning",
};

function AddDossierModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", type: "Residential", location: "", developer: "", totalUnits: "0",
    priceFrom: "", priceTo: "", yieldEstimate: "0", completionDate: "", targetInvestor: "",
    highlights: "", requesterName: "", amountPaid: "", status: "Active",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title || !form.location) return;
    setSaving(true);
    await fetch("/api/crm/dossiers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); onCreated(); onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Investment Dossier</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Project Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {["Residential", "Commercial", "Mixed-Use", "Industrial", "Retail", "Land"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {DOSSIER_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Location *</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Developer</label>
              <input value={form.developer} onChange={(e) => set("developer", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Units</label>
              <input type="number" value={form.totalUnits} onChange={(e) => set("totalUnits", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Price From (₦)</label>
              <input type="number" value={form.priceFrom} onChange={(e) => set("priceFrom", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Price To (₦)</label>
              <input type="number" value={form.priceTo} onChange={(e) => set("priceTo", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Yield Estimate (%)</label>
              <input type="number" step="0.5" value={form.yieldEstimate} onChange={(e) => set("yieldEstimate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Completion Date</label>
              <input value={form.completionDate} onChange={(e) => set("completionDate", e.target.value)} placeholder="Q4 2026"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Target Investor</label>
            <input value={form.targetInvestor ?? ""} onChange={(e) => set("targetInvestor", e.target.value)} placeholder="e.g. HNI, Diaspora, Institutional"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Requester Name</label>
              <input value={form.requesterName} onChange={(e) => set("requesterName", e.target.value)} placeholder="Who requested this dossier?"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Amount Paid (₦)</label>
              <input type="number" value={form.amountPaid} onChange={(e) => set("amountPaid", e.target.value)} placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Key Highlights</label>
            <textarea value={form.highlights ?? ""} onChange={(e) => set("highlights", e.target.value)} rows={2}
              placeholder="Bullet points separated by commas"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.title || !form.location}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--navy)" }}>
            {saving ? "Saving…" : "✓ Add Dossier"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/crm/dossiers");
    setDossiers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function del(id: string) {
    if (!confirm("Delete this dossier?")) return;
    await fetch(`/api/crm/dossiers/${id}`, { method: "DELETE" });
    load();
  }

  const totalValue = dossiers.reduce((s, d) => s + d.priceTo, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Investment Dossiers" action={{ label: "Add Dossier", onClick: () => setAdding(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Dossiers", value: dossiers.filter((d) => d.status === "Active").length, icon: <Building2 size={16} />, color: "var(--navy)" },
            { label: "Total Units", value: dossiers.reduce((s, d) => s + d.totalUnits, 0), icon: <Users size={16} />, color: "var(--gold)" },
            { label: "Portfolio Value", value: formatCurrency(totalValue), icon: <TrendingUp size={16} />, color: "var(--emerald)" },
            { label: "Locations", value: new Set(dossiers.map((d) => d.location)).size, icon: <MapPin size={16} />, color: "#3B82F6" },
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
          <div className="text-center text-gray-400 py-12 text-[13px]">Loading…</div>
        ) : dossiers.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-[13px]">No investment dossiers yet.</div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {dossiers.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group relative">
                <button onClick={() => del(d.id)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-opacity bg-white/80 backdrop-blur-sm z-10">
                  <Trash2 size={12} className="text-red-500" />
                </button>

                <div className="h-2" style={{ background: d.status === "Active" ? "var(--emerald)" : d.status === "Coming Soon" ? "var(--gold)" : "#94A3B8" }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3 pr-6">
                    <div>
                      <div className="text-[14px] font-black text-gray-900 leading-tight">{d.title}</div>
                      <div className="text-[11.5px] text-gray-400 mt-0.5 flex items-center gap-1"><MapPin size={10} />{d.location}</div>
                    </div>
                    <Badge variant={STATUS_BADGE[d.status] ?? "default"}>{d.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: "Type", value: d.type },
                      { label: "Developer", value: d.developer || "—" },
                      { label: "Units", value: d.totalUnits },
                      { label: "Completion", value: d.completionDate || "TBC" },
                      { label: "Target", value: d.targetInvestor || "All" },
                      { label: "Yield", value: `${d.yieldEstimate}% p.a.` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-2.5">
                        <div className="text-[9.5px] font-bold uppercase tracking-wider text-gray-400">{label}</div>
                        <div className="text-[11.5px] font-semibold text-gray-800 mt-0.5 truncate">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Price Range</div>
                    <div className="text-[13px] font-black" style={{ color: "var(--navy)" }}>
                      {formatCurrency(d.priceFrom)} – {formatCurrency(d.priceTo)}
                    </div>
                  </div>

                  {(d.requesterName || d.amountPaid) && (
                    <div className="mt-3 border-t border-gray-100 pt-3 grid grid-cols-2 gap-2">
                      {d.requesterName && (
                        <div>
                          <div className="text-[9.5px] font-bold uppercase tracking-wider text-gray-400">Requester</div>
                          <div className="text-[11.5px] font-semibold text-gray-800 mt-0.5 truncate">{d.requesterName}</div>
                        </div>
                      )}
                      {d.amountPaid != null && (
                        <div>
                          <div className="text-[9.5px] font-bold uppercase tracking-wider text-gray-400">Amount Paid</div>
                          <div className="text-[11.5px] font-semibold text-emerald-600 mt-0.5">{formatCurrency(d.amountPaid)}</div>
                        </div>
                      )}
                    </div>
                  )}
                  {d.highlights && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Highlights</div>
                      <div className="flex flex-wrap gap-1">
                        {d.highlights.split(",").map((h) => (
                          <span key={h} className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{h.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      {adding && <AddDossierModal onClose={() => setAdding(false)} onCreated={load} />}
    </div>
  );
}
