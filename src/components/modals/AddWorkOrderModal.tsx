"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Wrench, CheckCircle, User, Building } from "lucide-react";

interface Props { onClose: () => void; }

const CATEGORIES = ["HVAC", "Electrical", "Plumbing", "Structural", "Facility", "Electronics", "Mechanical", "Other"];
const PRIORITIES = ["URGENT", "HIGH", "MEDIUM", "LOW", "ROUTINE"];
const PRIORITY_COLORS: Record<string, string> = { URGENT: "#EF4444", HIGH: "#F97316", MEDIUM: "#EAB308", LOW: "#3B82F6", ROUTINE: "#9CA3AF" };

export function AddWorkOrderModal({ onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [properties, setProperties] = useState<{ id: string; name: string; units: { id: string; unitNumber: string }[] }[]>([]);
  const [vendors, setVendors] = useState<{ id: string; companyName: string; specialization: string[]; user: { firstName: string; lastName: string } }[]>([]);
  const [vendorMode, setVendorMode] = useState<"none" | "registered" | "outsourced">("none");

  const [form, setForm] = useState({
    propertyId: "", unitId: "", title: "", description: "",
    category: "HVAC", priority: "MEDIUM", estimatedCost: "", slaHours: "24",
    vendorId: "", outsourcedVendorName: "", outsourcedVendorPhone: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/properties").then((r) => r.json()).then((d) => setProperties(d.properties ?? []));
    fetch("/api/vendors").then((r) => r.json()).then((d) => setVendors(d.vendors ?? d ?? []));
  }, []);

  const selectedProp = properties.find((p) => p.id === form.propertyId);

  async function handleSubmit() {
    setSaving(true);
    try {
      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          propertyId: form.propertyId,
          unitId: form.unitId || undefined,
          category: form.category,
          priority: form.priority,
          estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
          slaHours: Number(form.slaHours),
          vendorId: vendorMode === "registered" && form.vendorId ? form.vendorId : undefined,
          outsourcedVendorName: vendorMode === "outsourced" ? form.outsourcedVendorName : undefined,
          outsourcedVendorPhone: vendorMode === "outsourced" ? form.outsourcedVendorPhone : undefined,
          status: vendorMode !== "none" ? "ASSIGNED" : "OPEN",
        }),
      });
      setSuccess(true);
      setTimeout(() => { onClose(); router.refresh(); }, 1800);
    } catch { setSaving(false); }
  }

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <div className="text-[17px] font-bold text-gray-900">Work Order Created!</div>
        <div className="text-[13px] text-gray-500">Added to the maintenance queue.</div>
      </div>
    </div>
  );

  const isValid = form.propertyId && form.title && form.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[95vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="flex items-center gap-3">
            <Wrench size={20} className="text-yellow-400" />
            <div>
              <div className="text-[15px] font-bold text-white">New Work Order</div>
              <div className="text-[11px] text-white/50">Log a maintenance request</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. AC unit failure Unit 7C"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Property *</label>
              <select value={form.propertyId} onChange={(e) => { set("propertyId", e.target.value); set("unitId", ""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
                <option value="">Select…</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Unit (optional)</label>
              <select value={form.unitId} onChange={(e) => set("unitId", e.target.value)}
                disabled={!form.propertyId}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white disabled:opacity-50">
                <option value="">None / Common Area</option>
                {(selectedProp?.units ?? []).map((u) => (
                  <option key={u.id} value={u.id}>Unit {u.unitNumber}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Description *</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the issue in detail…" rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => set("category", c)}
                  className={`text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${form.category === c ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => set("priority", p)}
                  className={`flex-1 text-[11px] font-bold py-2 rounded-xl border transition-colors ${form.priority === p ? "text-white border-transparent" : "border-gray-200 text-gray-600"}`}
                  style={{ background: form.priority === p ? PRIORITY_COLORS[p] : "" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Est. Cost (₦)</label>
              <input type="number" value={form.estimatedCost} onChange={(e) => set("estimatedCost", e.target.value)}
                placeholder="120000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">SLA (hours)</label>
              <input type="number" value={form.slaHours} onChange={(e) => set("slaHours", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Vendor Assignment */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Assign Vendor (optional)</label>
            <div className="flex gap-2 mb-3">
              {[
                { key: "none" as const, label: "No Vendor" },
                { key: "registered" as const, label: "Registered Vendor", icon: <Building size={12} /> },
                { key: "outsourced" as const, label: "Outsourced", icon: <User size={12} /> },
              ].map(({ key, label, icon }) => (
                <button key={key} onClick={() => setVendorMode(key)}
                  className={`flex items-center gap-1.5 flex-1 py-2 px-3 rounded-xl border text-[11.5px] font-semibold transition-colors ${vendorMode === key ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {icon}<span>{label}</span>
                </button>
              ))}
            </div>

            {vendorMode === "registered" && (
              <select value={form.vendorId} onChange={(e) => set("vendorId", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
                <option value="">Select registered vendor…</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName || `${v.user.firstName} ${v.user.lastName}`}
                    {v.specialization?.length ? ` — ${v.specialization.slice(0, 2).join(", ")}` : ""}
                  </option>
                ))}
              </select>
            )}

            {vendorMode === "outsourced" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Vendor Name</label>
                  <input value={form.outsourcedVendorName} onChange={(e) => set("outsourcedVendorName", e.target.value)}
                    placeholder="Vendor / contractor name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Phone</label>
                  <input value={form.outsourcedVendorPhone} onChange={(e) => set("outsourcedVendorPhone", e.target.value)}
                    placeholder="+234 …"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
                </div>
              </div>
            )}
          </div>

          {vendorMode !== "none" && (
            <div className="bg-blue-50 rounded-xl px-4 py-2.5 text-[12px] text-blue-700 flex items-center gap-2">
              <CheckCircle size={14} />
              Work order will be created with status <strong>ASSIGNED</strong>.
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 flex gap-3 flex-shrink-0 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !isValid}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "#EF4444" }}>
            {saving ? "Creating…" : "🔧 Create Work Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
