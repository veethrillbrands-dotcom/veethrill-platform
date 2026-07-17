"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { formatCurrency } from "@/lib/utils";
import {
  X, Plus, Trash2, Settings, ChevronDown, GripVertical,
  Edit3, Check, ChevronRight, TrendingUp, LayoutGrid, Upload,
} from "lucide-react";
import { BulkUploadModal } from "@/components/modals/BulkUploadModal";

// ─── Types ───────────────────────────────────────────────────────────────────

type Stage = {
  id: string; name: string; order: number; color: string;
  probability: number; isWon: boolean; isLost: boolean;
};

type Pipeline = {
  id: string; name: string; description: string | null;
  isDefault: boolean; color: string;
  stages: Stage[];
  _count: { deals: number };
};

type Deal = {
  id: string; title: string; contactName: string; value: number;
  stage: string; probability: number; dueDate: string | null;
  notes: string | null; productType: string | null;
  pipelineId: string | null; pipelineStageId: string | null;
  contact: { id: string; name: string } | null;
  pipelineStage: Stage | null;
};

// ─── Stage settings modal ────────────────────────────────────────────────────

function PipelineSettingsModal({ pipeline, onClose, onUpdated }: {
  pipeline: Pipeline; onClose: () => void; onUpdated: () => void;
}) {
  const [stages, setStages] = useState<Stage[]>(pipeline.stages);
  const [pipelineName, setPipelineName] = useState(pipeline.name);
  const [saving, setSaving] = useState(false);
  const [newStage, setNewStage] = useState({ name: "", color: "#6B7280", probability: "30" });
  const [addingStage, setAddingStage] = useState(false);

  async function saveStage(stage: Stage, field: string, val: string | number | boolean) {
    setStages((prev) => prev.map((s) => s.id === stage.id ? { ...s, [field]: val } : s));
    await fetch(`/api/crm/pipelines/${pipeline.id}/stages/${stage.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: val }),
    });
  }

  async function addStage() {
    if (!newStage.name) return;
    setSaving(true);
    const res = await fetch(`/api/crm/pipelines/${pipeline.id}/stages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStage.name, color: newStage.color, probability: Number(newStage.probability) }),
    });
    const s = await res.json();
    setStages((prev) => [...prev, s]);
    setNewStage({ name: "", color: "#6B7280", probability: "30" });
    setAddingStage(false);
    setSaving(false);
  }

  async function deleteStage(stageId: string) {
    if (stages.length <= 1) return;
    await fetch(`/api/crm/pipelines/${pipeline.id}/stages/${stageId}`, { method: "DELETE" });
    setStages((prev) => prev.filter((s) => s.id !== stageId));
  }

  async function savePipelineName() {
    await fetch(`/api/crm/pipelines/${pipeline.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pipelineName }),
    });
    onUpdated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Pipeline Settings</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Pipeline name */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Pipeline Name</label>
            <div className="flex gap-2">
              <input value={pipelineName} onChange={(e) => setPipelineName(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-yellow-400" />
              <button onClick={savePipelineName}
                className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-white" style={{ background: "var(--emerald)" }}>
                Save
              </button>
            </div>
          </div>

          {/* Stages */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Stages ({stages.length})</div>
            <div className="space-y-2">
              {stages.map((stage) => (
                <div key={stage.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl group">
                  <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
                  <input type="color" value={stage.color}
                    onChange={(e) => saveStage(stage, "color", e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer flex-shrink-0 p-0.5" />
                  <input value={stage.name}
                    onChange={(e) => { setStages((prev) => prev.map((s) => s.id === stage.id ? { ...s, name: e.target.value } : s)); }}
                    onBlur={(e) => saveStage(stage, "name", e.target.value)}
                    className="flex-1 bg-transparent text-[13px] font-semibold outline-none border-b border-transparent focus:border-gray-300" />
                  <input type="number" min="0" max="100" value={stage.probability}
                    onChange={(e) => { setStages((prev) => prev.map((s) => s.id === stage.id ? { ...s, probability: Number(e.target.value) } : s)); }}
                    onBlur={(e) => saveStage(stage, "probability", Number(e.target.value))}
                    className="w-12 text-center bg-transparent text-[11.5px] font-bold outline-none border-b border-transparent focus:border-gray-300" />
                  <span className="text-[10px] text-gray-400 flex-shrink-0">%</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button title="Won stage"
                      onClick={() => saveStage(stage, "isWon", !stage.isWon)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${stage.isWon ? "bg-emerald-100 border-emerald-200 text-emerald-700" : "border-gray-200 text-gray-400 hover:bg-gray-100"}`}>
                      Won
                    </button>
                    <button title="Lost stage"
                      onClick={() => saveStage(stage, "isLost", !stage.isLost)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${stage.isLost ? "bg-red-100 border-red-200 text-red-700" : "border-gray-200 text-gray-400 hover:bg-gray-100"}`}>
                      Lost
                    </button>
                  </div>
                  {stages.length > 1 && (
                    <button onClick={() => deleteStage(stage.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-100 transition-all">
                      <Trash2 size={11} className="text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {addingStage ? (
              <div className="mt-2 flex items-center gap-2 p-3 border-2 border-dashed border-yellow-300 rounded-xl bg-yellow-50">
                <input type="color" value={newStage.color}
                  onChange={(e) => setNewStage((f) => ({ ...f, color: e.target.value }))}
                  className="w-7 h-7 rounded-lg border-0 cursor-pointer flex-shrink-0 p-0.5" />
                <input value={newStage.name} onChange={(e) => setNewStage((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Stage name" autoFocus
                  className="flex-1 bg-transparent text-[13px] font-semibold outline-none" />
                <input type="number" min="0" max="100" value={newStage.probability}
                  onChange={(e) => setNewStage((f) => ({ ...f, probability: e.target.value }))}
                  className="w-12 text-center bg-transparent text-[11.5px] font-bold outline-none" />
                <span className="text-[10px] text-gray-400">%</span>
                <button onClick={addStage} disabled={saving || !newStage.name}
                  className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center disabled:opacity-40">
                  <Check size={13} className="text-white" />
                </button>
                <button onClick={() => setAddingStage(false)}
                  className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center">
                  <X size={13} className="text-gray-500" />
                </button>
              </div>
            ) : (
              <button onClick={() => setAddingStage(true)}
                className="mt-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-[12px] font-bold text-gray-400 hover:border-gray-300 hover:text-gray-500 flex items-center justify-center gap-1.5">
                <Plus size={13} /> Add Stage
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Pipeline Modal ───────────────────────────────────────────────────

function CreatePipelineModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Pipeline) => void }) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [useDefault, setUseDefault] = useState(true);

  async function save() {
    if (!name) return;
    setSaving(true);
    const res = await fetch("/api/crm/pipelines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, stages: useDefault ? [] : [] }),
    });
    const p = await res.json();
    setSaving(false);
    onCreated(p);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">New Pipeline</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Pipeline Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
              placeholder="e.g. Shortlet Enquiries, Property Management"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              placeholder="What kind of deals does this pipeline track?"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <input type="checkbox" id="useDefault" checked={useDefault} onChange={(e) => setUseDefault(e.target.checked)}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor="useDefault" className="text-[12.5px] font-semibold text-blue-800 cursor-pointer">
              Start with real estate default stages (you can customise later)
            </label>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600">Cancel</button>
          <button onClick={save} disabled={saving || !name}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--navy)" }}>
            {saving ? "Creating…" : "Create Pipeline"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Deal Modal ───────────────────────────────────────────────────────────

function AddDealModal({ pipeline, contacts, onClose, onCreated }: {
  pipeline: Pipeline;
  contacts: { id: string; name: string; type: string }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const firstStage = pipeline.stages[0];
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", contactName: "", contactId: "", value: "",
    pipelineStageId: firstStage?.id ?? "",
    productType: "", dueDate: "", notes: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title || !form.contactName) return;
    setSaving(true);
    await fetch("/api/crm/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, pipelineId: pipeline.id }),
    });
    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Deal to {pipeline.name}</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Deal Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} autoFocus
              placeholder="e.g. 3-bed apartment at Lekki Phase 1"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Contact *</label>
            {contacts.length > 0 ? (
              <select value={form.contactId}
                onChange={(e) => {
                  const c = contacts.find((c) => c.id === e.target.value);
                  set("contactId", e.target.value);
                  if (c) set("contactName", c.name);
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                <option value="">— Select contact or type name —</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
              </select>
            ) : null}
            <input value={form.contactName} onChange={(e) => { set("contactName", e.target.value); set("contactId", ""); }}
              placeholder={contacts.length > 0 ? "Or type contact name manually" : "Contact name *"}
              className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Deal Value (₦)</label>
              <input type="number" value={form.value} onChange={(e) => set("value", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Expected Close</label>
              <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Stage</label>
            <div className="grid grid-cols-2 gap-2">
              {pipeline.stages.map((s) => (
                <button key={s.id} type="button" onClick={() => set("pipelineStageId", s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-[12px] font-bold transition-all text-left ${form.pipelineStageId === s.id ? "border-yellow-400 bg-yellow-50" : "border-gray-100 hover:border-gray-200 text-gray-600"}`}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Product Type</label>
            <select value={form.productType} onChange={(e) => set("productType", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
              <option value="">— None / General —</option>
              {["Sale", "Rent", "Land Acquisition", "Advisory", "REIT", "Investment", "Buy-Back", "Training", "Subscriber", "Dossier"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600">Cancel</button>
          <button onClick={save} disabled={saving || !form.title || !form.contactName}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "✓ Add Deal"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Deal Card ────────────────────────────────────────────────────────────────

function DealCard({ deal, stages, onMove, onDelete }: {
  deal: Deal; stages: Stage[];
  onMove: (id: string, stageId: string) => void;
  onDelete: (id: string) => void;
}) {
  const stage = stages.find((s) => s.id === deal.pipelineStageId) ?? stages[0];
  const isOverdue = deal.dueDate && new Date(deal.dueDate) < new Date();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm group relative hover:shadow-md transition-shadow">
      <button onClick={() => onDelete(deal.id)}
        className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all">
        <Trash2 size={10} className="text-red-400" />
      </button>

      <div className="text-[12.5px] font-bold text-gray-900 mb-1 leading-tight pr-5">{deal.title}</div>
      <div className="text-[11px] text-gray-400 mb-2 truncate">{deal.contactName}</div>

      {deal.value > 0 && (
        <div className="text-[13px] font-black mb-2" style={{ color: stage?.color ?? "#6B7280" }}>
          {formatCurrency(deal.value)}
        </div>
      )}

      <div className="mb-2.5">
        <div className="flex justify-between text-[9.5px] text-gray-400 mb-1">
          <span>Close probability</span><span>{stage?.probability ?? deal.probability}%</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${stage?.probability ?? deal.probability}%`, background: stage?.color ?? "#6B7280" }} />
        </div>
      </div>

      {isOverdue && (
        <div className="text-[10px] font-bold text-red-600 mb-1.5">
          ⚠ Due {new Date(deal.dueDate!).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
        </div>
      )}

      {deal.notes && <div className="text-[10.5px] text-gray-400 mb-2 line-clamp-2">{deal.notes}</div>}

      <select value={deal.pipelineStageId ?? ""} onChange={(e) => onMove(deal.id, e.target.value)}
        className="w-full text-[10.5px] border border-gray-100 rounded-lg px-2 py-1.5 bg-gray-50 outline-none cursor-pointer">
        {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewPipeline, setShowNewPipeline] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [pipelineDropdown, setPipelineDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePipeline = pipelines.find((p) => p.id === activePipelineId) ?? pipelines[0];

  const loadPipelines = useCallback(async () => {
    const res = await fetch("/api/crm/pipelines");
    const data: Pipeline[] = await res.json();
    setPipelines(data);
    if (!activePipelineId && data.length > 0) setActivePipelineId(data[0].id);
  }, [activePipelineId]);

  const loadDeals = useCallback(async (pipelineId: string) => {
    setLoading(true);
    const res = await fetch(`/api/crm/deals?pipelineId=${pipelineId}`);
    setDeals(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPipelines();
    fetch("/api/crm/contacts").then((r) => r.json()).then(setContacts);
  }, []);

  useEffect(() => {
    if (activePipelineId) loadDeals(activePipelineId);
  }, [activePipelineId, loadDeals]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPipelineDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function moveDeal(id: string, pipelineStageId: string) {
    setDeals((prev) => prev.map((d) => d.id === id ? { ...d, pipelineStageId } : d));
    await fetch(`/api/crm/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipelineStageId }),
    });
  }

  async function deleteDeal(id: string) {
    await fetch(`/api/crm/deals/${id}`, { method: "DELETE" });
    setDeals((prev) => prev.filter((d) => d.id !== id));
  }

  if (!activePipeline) return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Pipeline" />
      <div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div>
    </div>
  );

  const stages = activePipeline.stages;
  const wonStageIds = stages.filter((s) => s.isWon).map((s) => s.id);
  const lostStageIds = stages.filter((s) => s.isLost).map((s) => s.id);

  const activeDeals = deals.filter((d) => !wonStageIds.includes(d.pipelineStageId ?? "") && !lostStageIds.includes(d.pipelineStageId ?? ""));
  const pipelineValue = activeDeals.reduce((s, d) => s + d.value, 0);
  const wonDeals = deals.filter((d) => wonStageIds.includes(d.pipelineStageId ?? ""));
  const closedValue = wonDeals.reduce((s, d) => s + d.value, 0);
  const weightedValue = activeDeals.reduce((d, deal) => {
    const stageProb = stages.find((s) => s.id === deal.pipelineStageId)?.probability ?? deal.probability;
    return d + deal.value * (stageProb / 100);
  }, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Pipeline"
        action={{ label: "Add Deal", onClick: () => setShowAddDeal(true) }}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Pipeline selector bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-3 flex-shrink-0">
          {/* Pipeline dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setPipelineDropdown((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-[13px] font-bold text-gray-800 bg-white transition-colors">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: activePipeline.color }} />
              {activePipeline.name}
              <span className="text-[10px] font-normal text-gray-400 ml-1">({activePipeline._count.deals})</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {pipelineDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl border border-gray-100 shadow-lg z-20 overflow-hidden">
                {pipelines.map((p) => (
                  <button key={p.id} onClick={() => { setActivePipelineId(p.id); setPipelineDropdown(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-left hover:bg-gray-50 transition-colors ${p.id === activePipelineId ? "bg-yellow-50 text-yellow-800" : "text-gray-700"}`}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-[10px] text-gray-400">{p._count.deals}</span>
                    {p.id === activePipelineId && <Check size={13} className="text-yellow-600 flex-shrink-0" />}
                  </button>
                ))}
                <div className="border-t border-gray-100">
                  <button onClick={() => { setShowNewPipeline(true); setPipelineDropdown(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-[12.5px] font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                    <Plus size={13} /> New Pipeline
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-[12px] font-bold text-gray-600 transition-colors">
            <Settings size={13} /> Stages
          </button>
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-[12px] font-bold text-gray-600 transition-colors">
            <Upload size={13} /> Import Deals
          </button>

          <div className="ml-auto flex items-center gap-4 text-right">
            <div className="hidden sm:block">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pipeline Value</div>
              <div className="text-[13px] font-black" style={{ color: "var(--gold)" }}>{formatCurrency(pipelineValue)}</div>
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Weighted</div>
              <div className="text-[13px] font-black text-blue-600">{formatCurrency(weightedValue)}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Won</div>
              <div className="text-[13px] font-black" style={{ color: "var(--emerald)" }}>{formatCurrency(closedValue)}</div>
            </div>
          </div>
        </div>

        {/* Kanban */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-[13px]">Loading deals…</div>
        ) : (
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-3 p-4 sm:p-6 h-full min-h-0" style={{ minWidth: `${stages.length * 220}px` }}>
              {stages.map((stage) => {
                const stageDeals = deals.filter((d) => d.pipelineStageId === stage.id);
                const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
                return (
                  <div key={stage.id} className="flex flex-col flex-shrink-0 w-52">
                    {/* Column header */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                        <span className="text-[11.5px] font-black text-gray-700 truncate">{stage.name}</span>
                        <span className="ml-auto text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{stageDeals.length}</span>
                        {stage.isWon && <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">WON</span>}
                        {stage.isLost && <span className="text-[9px] font-black text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">LOST</span>}
                      </div>
                      {stageValue > 0 && (
                        <div className="text-[10px] font-bold pl-4" style={{ color: stage.color }}>
                          {formatCurrency(stageValue)}
                        </div>
                      )}
                      <div className="mt-1.5 h-0.5 rounded-full" style={{ background: stage.color, opacity: 0.3 }} />
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                      {stageDeals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} stages={stages}
                          onMove={moveDeal} onDelete={deleteDeal} />
                      ))}
                      <button onClick={() => setShowAddDeal(true)}
                        className="w-full py-2 rounded-xl border border-dashed border-gray-200 text-gray-300 hover:text-gray-400 hover:border-gray-300 transition-colors flex items-center justify-center">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showAddDeal && (
        <AddDealModal
          pipeline={activePipeline}
          contacts={contacts}
          onClose={() => setShowAddDeal(false)}
          onCreated={() => loadDeals(activePipelineId!)}
        />
      )}
      {showSettings && (
        <PipelineSettingsModal
          pipeline={activePipeline}
          onClose={() => setShowSettings(false)}
          onUpdated={() => { loadPipelines(); loadDeals(activePipelineId!); }}
        />
      )}
      {showNewPipeline && (
        <CreatePipelineModal
          onClose={() => setShowNewPipeline(false)}
          onCreated={(p) => { setPipelines((prev) => [...prev, p]); setActivePipelineId(p.id); }}
        />
      )}
      {showImport && (
        <BulkUploadModal
          defaultEntity="deals"
          onClose={() => setShowImport(false)}
          onImported={() => { loadDeals(activePipelineId!); setShowImport(false); }}
        />
      )}
    </div>
  );
}
