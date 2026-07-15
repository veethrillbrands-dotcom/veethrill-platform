"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { formatCurrency } from "@/lib/utils";
import { X, Plus } from "lucide-react";

const STAGES = ["Enquiry", "Qualified", "Site Visit", "Negotiation", "Offer Sent", "Under Contract", "Completed", "Lost"];
const STAGE_COLORS: Record<string, string> = {
  Enquiry: "#94A3B8", Qualified: "#3B82F6", "Site Visit": "#8B5CF6", Negotiation: "#F59E0B",
  "Offer Sent": "#F97316", "Under Contract": "#10B981", Completed: "var(--emerald)", Lost: "#EF4444",
};

type Deal = { id: string; title: string; contact: string; value: number; stage: string; probability: number; dueDate: string; notes: string };

const SEED: Deal[] = [
  { id: "1", title: "Ikoyi Penthouse Sale", contact: "Chief Emeka Eze", value: 350000000, stage: "Negotiation", probability: 70, dueDate: "2026-08-30", notes: "Awaiting financing confirmation" },
  { id: "2", title: "Lekki 3BR Purchase", contact: "Mrs. Adaeze Okafor", value: 85000000, stage: "Under Contract", probability: 90, dueDate: "2026-07-25", notes: "Docs being processed" },
  { id: "3", title: "VI Office Complex", contact: "GlobalRealty Int.", value: 1200000000, stage: "Site Visit", probability: 40, dueDate: "2026-09-15", notes: "Second site visit scheduled" },
  { id: "4", title: "Abuja 2BR Investment", contact: "Alhaji Musa Bello", value: 55000000, stage: "Qualified", probability: 60, dueDate: "2026-08-01", notes: "Interested in off-plan" },
  { id: "5", title: "Shortlet Unit Block", contact: "Marcus Chen", value: 420000000, stage: "Enquiry", probability: 20, dueDate: "2026-10-01", notes: "Diaspora client, initial inquiry" },
];

function AddDealModal({ onAdd, onClose }: { onAdd: (d: Deal) => void; onClose: () => void }) {
  const [form, setForm] = useState({ title: "", contact: "", value: "", stage: "Enquiry", probability: "30", dueDate: "", notes: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    onAdd({ ...form, id: Date.now().toString(), value: Number(form.value), probability: Number(form.probability) });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Deal</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          {[{ label: "Deal Title", key: "title" }, { label: "Contact Name", key: "contact" }].map(({ label, key }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              <input value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Deal Value (₦)</label>
              <input type="number" value={form.value} onChange={(e) => set("value", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Probability (%)</label>
              <input type="number" min="0" max="100" value={form.probability} onChange={(e) => set("probability", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Stage</label>
            <select value={form.stage} onChange={(e) => set("stage", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Expected Close Date</label>
            <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={!form.title || !form.contact}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            ✓ Add Deal
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(SEED);
  const [adding, setAdding] = useState(false);

  const pipelineValue = deals.filter((d) => d.stage !== "Lost").reduce((s, d) => s + d.value, 0);
  const weightedValue = deals.filter((d) => d.stage !== "Lost").reduce((s, d) => s + d.value * (d.probability / 100), 0);
  const closedValue = deals.filter((d) => d.stage === "Completed").reduce((s, d) => s + d.value, 0);

  function moveDeal(dealId: string, newStage: string) {
    setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: newStage } : d));
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Sales Pipeline" action={{ label: "Add Deal", onClick: () => setAdding(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Deals", value: deals.filter((d) => d.stage !== "Lost").length, color: "var(--navy)" },
            { label: "Pipeline Value", value: formatCurrency(pipelineValue), color: "var(--gold)" },
            { label: "Weighted Value", value: formatCurrency(weightedValue), color: "#3B82F6" },
            { label: "Closed Value", value: formatCurrency(closedValue), color: "var(--emerald)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[18px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
            return (
              <div key={stage} className="flex-shrink-0 w-52">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STAGE_COLORS[stage] }} />
                  <span className="text-[11px] font-bold text-gray-700 truncate">{stage}</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{stageDeals.length}</span>
                </div>
                {stageValue > 0 && (
                  <div className="text-[10px] font-semibold px-1 mb-1.5" style={{ color: STAGE_COLORS[stage] }}>
                    {formatCurrency(stageValue)}
                  </div>
                )}
                <div className="space-y-2 min-h-[60px]">
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                      <div className="text-[12px] font-bold text-gray-900 mb-1 leading-tight">{deal.title}</div>
                      <div className="text-[10.5px] text-gray-400 mb-2">{deal.contact}</div>
                      <div className="text-[12px] font-black mb-2" style={{ color: STAGE_COLORS[stage] }}>
                        {formatCurrency(deal.value)}
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-[9.5px] text-gray-400 mb-0.5">
                          <span>Probability</span><span>{deal.probability}%</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${deal.probability}%`, background: STAGE_COLORS[stage] }} />
                        </div>
                      </div>
                      <select
                        value={deal.stage}
                        onChange={(e) => moveDeal(deal.id, e.target.value)}
                        className="w-full text-[10px] border border-gray-100 rounded-lg px-2 py-1 bg-gray-50 outline-none">
                        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                  <button onClick={() => { setAdding(true); }} className="w-full py-2 rounded-xl border border-dashed border-gray-200 text-gray-300 hover:text-gray-400 hover:border-gray-300 transition-colors flex items-center justify-center">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
      {adding && <AddDealModal onAdd={(d) => setDeals((prev) => [d, ...prev])} onClose={() => setAdding(false)} />}
    </div>
  );
}
