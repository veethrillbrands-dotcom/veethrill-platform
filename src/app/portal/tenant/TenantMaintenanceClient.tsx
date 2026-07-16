"use client";

import { useState, useEffect, useCallback } from "react";
import { Wrench, Plus, X, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type WorkOrder = {
  id: string; title: string; description: string; category: string;
  priority: string; status: string; createdAt: string; completedAt: string | null;
  rating: number | null; review: string | null; estimatedCost: number | null; actualCost: number | null;
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onClick={() => onChange(s)} type="button">
          <Star size={20} className={s <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
        </button>
      ))}
    </div>
  );
}

function RateModal({ order, onClose, onDone }: { order: WorkOrder; onClose: () => void; onDone: () => void }) {
  const [rating, setRating] = useState(order.rating ?? 0);
  const [review, setReview] = useState(order.review ?? "");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!rating) return;
    setSaving(true);
    await fetch(`/api/portal/work-orders/${order.id}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, review }),
    });
    setSaving(false);
    onDone();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Rate this Job</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-[13px] font-semibold text-gray-800">{order.title}</div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Your Rating</div>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Leave a Review (optional)</div>
            <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={3} placeholder="How was the job done?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600">Cancel</button>
          <button onClick={submit} disabled={!rating || saving}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--emerald)" }}>
            {saving ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RaiseModal({ tenantId, propertyId, unitId, onClose, onDone }: { tenantId: string; propertyId: string; unitId: string; onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", category: "Plumbing", priority: "MEDIUM" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    if (!form.title || !form.description) return;
    setSaving(true);
    await fetch("/api/portal/work-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, propertyId, unitId, tenantId }),
    });
    setSaving(false);
    onDone();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Report an Issue</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Title", key: "title", placeholder: "e.g. Leaking tap in bathroom" },
            { label: "Description", key: "description", placeholder: "Describe the issue in detail…" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              {key === "description"
                ? <textarea value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)} rows={3} placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-yellow-400 resize-none" />
                : <input value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-yellow-400" />}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-yellow-400">
                {["Plumbing", "Electrical", "AC & Cooling", "Structural", "Pest Control", "Security", "Cleaning", "Other"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-yellow-400">
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600">Cancel</button>
          <button onClick={submit} disabled={!form.title || !form.description || saving}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--emerald)" }}>
            {saving ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TenantMaintenanceClient({ tenantId, propertyId, unitId }: { tenantId: string; propertyId: string; unitId: string }) {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [raising, setRaising] = useState(false);
  const [rating, setRating] = useState<WorkOrder | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const res = await fetch(`/api/portal/work-orders?tenantId=${tenantId}`);
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

  const STATUS_COLOR: Record<string, string> = {
    OPEN: "bg-blue-100 text-blue-700", ASSIGNED: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-orange-100 text-orange-700", COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench size={15} className="text-gray-400" />
          <div className="font-bold text-gray-900 text-[14px]">Maintenance Requests</div>
        </div>
        {tenantId && (
          <button onClick={() => setRaising(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-white" style={{ background: "var(--emerald)" }}>
            <Plus size={13} /> Report Issue
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-8 text-[13px]">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-[13px] font-semibold text-gray-600">No maintenance requests</div>
          <div className="text-[11.5px] text-gray-400 mt-0.5">Report an issue if something needs attention</div>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {orders.map((o) => (
            <div key={o.id} className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-[13px] font-semibold text-gray-900">{o.title}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[o.status] ?? "bg-gray-100 text-gray-600"}`}>{o.status.replace("_", " ")}</span>
                </div>
                <div className="text-[11.5px] text-gray-500 mt-0.5">{o.category} · {o.priority} priority</div>
                {o.status === "COMPLETED" && o.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={11} className={s <= o.rating! ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                    ))}
                    {o.review && <span className="text-[11px] text-gray-500 ml-1">"{o.review}"</span>}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-[11px] text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-GB")}</div>
                {o.status === "COMPLETED" && !o.rating && (
                  <button onClick={() => setRating(o)}
                    className="flex items-center gap-1 text-[11px] font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 px-2.5 py-1 rounded-lg transition-colors">
                    <Star size={11} /> Rate Job
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {raising && <RaiseModal tenantId={tenantId} propertyId={propertyId} unitId={unitId} onClose={() => setRaising(false)} onDone={load} />}
      {rating && <RateModal order={rating} onClose={() => setRating(null)} onDone={load} />}
    </div>
  );
}
