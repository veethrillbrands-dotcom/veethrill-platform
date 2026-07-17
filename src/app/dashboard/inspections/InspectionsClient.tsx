"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Property = { id: string; name: string };
type Unit = { id: string; unitNumber: string };
type Inspection = {
  id: string; type: string; scheduledAt: string; completedAt: string | null;
  inspectorId: string | null; findings: string | null; rating: number | null;
  property: { name: string }; unit: { unitNumber: string } | null;
};

const STATUS_BADGE: Record<string, "success" | "info" | "warning"> = {
  COMPLETED: "success", SCHEDULED: "info", PENDING: "warning",
};

function getStatus(insp: Inspection) {
  if (insp.completedAt) return "COMPLETED";
  const now = new Date();
  if (new Date(insp.scheduledAt) > now) return "SCHEDULED";
  return "PENDING";
}

function AddInspectionModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string; type: string }[]>([]);
  const [form, setForm] = useState({
    propertyId: "", unitId: "", type: "Routine", scheduledAt: "", inspectorId: "", findings: "", rating: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/properties").then((r) => r.json()).then(setProperties);
    fetch("/api/crm/contacts").then((r) => r.json()).then((data) => setContacts(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!form.propertyId) { setUnits([]); return; }
    fetch("/api/units").then((r) => r.json()).then((all: Array<{ id: string; unitNumber: string; propertyId: string }>) =>
      setUnits(all.filter((u) => u.propertyId === form.propertyId))
    );
  }, [form.propertyId]);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/inspections", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, rating: form.rating ? Number(form.rating) : null }),
    });
    if (res.ok) { setSuccess(true); setTimeout(() => { onClose(); router.refresh(); }, 1200); }
    else setSaving(false);
  }

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        <CheckCircle size={32} className="text-emerald-600" />
        <div className="text-[17px] font-bold text-gray-900">Inspection Scheduled!</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Schedule Inspection</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Property</label>
            <select value={form.propertyId} onChange={(e) => { set("propertyId", e.target.value); set("unitId", ""); }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              <option value="">Select property…</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Unit (optional)</label>
            <select value={form.unitId} onChange={(e) => set("unitId", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              <option value="">Entire property</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.unitNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Inspection Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              {["Routine", "Move-in", "Move-out", "Maintenance", "Turnover", "Annual", "Emergency"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Scheduled Date</label>
            <input type="date" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Inspector</label>
            {contacts.length > 0 ? (
              <select value={form.inspectorId} onChange={(e) => set("inspectorId", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
                <option value="">Select inspector or type name below…</option>
                {contacts.map((c) => <option key={c.id} value={c.name}>{c.name} ({c.type})</option>)}
              </select>
            ) : null}
            <input value={form.inspectorId} onChange={(e) => set("inspectorId", e.target.value)}
              placeholder="Type inspector name…"
              className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 ${contacts.length > 0 ? "mt-2" : ""}`} />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Initial Findings</label>
            <textarea value={form.findings} onChange={(e) => set("findings", e.target.value)} rows={3}
              placeholder="Optional pre-inspection notes..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.propertyId || !form.scheduledAt}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Scheduling…" : "✓ Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompleteInspectionModal({ inspection, onClose }: { inspection: Inspection; onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ findings: inspection.findings ?? "", rating: String(inspection.rating ?? ""), damageReport: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    await fetch(`/api/inspections/${inspection.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, completedAt: new Date().toISOString(), rating: form.rating ? Number(form.rating) : null }),
    });
    onClose(); router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Complete Inspection</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-[12px] text-gray-500">{inspection.property.name} {inspection.unit ? `· ${inspection.unit.unitNumber}` : ""} · {inspection.type}</div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Findings</label>
            <textarea value={form.findings} onChange={(e) => set("findings", e.target.value)} rows={3}
              placeholder="Describe condition and findings..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Damage Report (optional)</label>
            <textarea value={form.damageReport} onChange={(e) => set("damageReport", e.target.value)} rows={2}
              placeholder="List any damages observed..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Condition Rating (1–10)</label>
            <input type="number" min="1" max="10" step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)}
              placeholder="e.g. 8.5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.findings}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "✓ Mark Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function InspectionsTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Inspections" action={{ label: "Schedule Inspection", onClick: () => setOpen(true) }} />
      {open && <AddInspectionModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function InspectionCard({ inspection }: { inspection: Inspection }) {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const status = getStatus(inspection);

  async function handleDelete() {
    if (!confirm("Delete this inspection?")) return;
    setDeleting(true);
    await fetch(`/api/inspections/${inspection.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[13px] font-bold text-gray-900">{inspection.property.name}</div>
            <div className="text-[11.5px] text-gray-400">{inspection.unit?.unitNumber ?? "Full Property"}</div>
          </div>
          <Badge variant={STATUS_BADGE[status] ?? "default"}>{status}</Badge>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{inspection.type}</span>
        </div>
        <div className="space-y-1.5 text-[12px] text-gray-600 mb-3">
          <div>📅 Scheduled: <strong>{formatDate(inspection.scheduledAt)}</strong></div>
          <div>👤 {inspection.inspectorId ?? "Inspector not assigned"}</div>
          {inspection.findings && <div className="text-[11px] text-gray-500 italic truncate">"{inspection.findings}"</div>}
        </div>
        <div className="flex gap-2">
          {status !== "COMPLETED" && (
            <button onClick={() => setCompleting(true)} className="flex-1 py-2 rounded-xl text-[11.5px] font-bold text-white" style={{ background: "var(--emerald)" }}>
              Complete →
            </button>
          )}
          <button onClick={handleDelete} disabled={deleting}
            className="py-2 px-3 rounded-xl text-[11.5px] font-bold border border-red-100 text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {completing && <CompleteInspectionModal inspection={inspection} onClose={() => setCompleting(false)} />}
    </>
  );
}

export function InspectionRowActions({ inspection }: { inspection: Inspection }) {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const status = getStatus(inspection);

  async function handleDelete() {
    if (!confirm("Delete this inspection?")) return;
    setDeleting(true);
    await fetch(`/api/inspections/${inspection.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {status !== "COMPLETED" && (
          <button onClick={() => setCompleting(true)} title="Mark complete"
            className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors">
            <Pencil size={12} className="text-emerald-600" />
          </button>
        )}
        <button onClick={handleDelete} disabled={deleting} title="Delete"
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
          <Trash2 size={12} className="text-red-500" />
        </button>
      </div>
      {completing && <CompleteInspectionModal inspection={inspection} onClose={() => setCompleting(false)} />}
    </>
  );
}
