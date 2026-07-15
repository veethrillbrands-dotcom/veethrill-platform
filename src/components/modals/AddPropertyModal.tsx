"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Building2, MapPin, CheckCircle } from "lucide-react";

interface Props { onClose: () => void; }

const PROPERTY_TYPES = [
  { value: "RESIDENTIAL", label: "Residential", emoji: "🏘️" },
  { value: "LUXURY_RESIDENTIAL", label: "Luxury Residential", emoji: "💎" },
  { value: "COMMERCIAL", label: "Commercial", emoji: "🏢" },
  { value: "MIXED_USE", label: "Mixed Use", emoji: "🏙️" },
  { value: "SHORTLET", label: "Shortlet / Service Apartment", emoji: "🏨" },
];

const STATES = ["Lagos", "Abuja", "Rivers", "Kano", "Oyo", "Delta", "Enugu", "Anambra", "Kaduna", "Ogun"];

export function AddPropertyModal({ onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "", type: "RESIDENTIAL", address: "", city: "",
    state: "Lagos", description: "", totalUnits: 1,
  });

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setSaving(true);
    try {
      await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setTimeout(() => { onClose(); router.refresh(); }, 1800);
    } catch {
      setSaving(false);
    }
  }

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <div className="text-[17px] font-bold text-gray-900">Property Added!</div>
        <div className="text-[13px] text-gray-500">Redirecting to portfolio...</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-yellow-400" />
            <div>
              <div className="text-[15px] font-bold text-white">Add New Property</div>
              <div className="text-[11px] text-white/50">Step {step} of 2</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="h-1 bg-gray-100">
          <div className="h-full transition-all" style={{ width: `${step * 50}%`, background: "var(--gold)" }} />
        </div>

        <div className="p-6 space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Property Name *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Veethrill Towers, Lekki Gardens"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100" />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Property Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <button key={t.value} onClick={() => set("type", t.value)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors ${form.type === t.value ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <span className="text-lg">{t.emoji}</span>
                      <span className={`text-[12px] font-semibold ${form.type === t.value ? "text-yellow-700" : "text-gray-700"}`}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  placeholder="Brief description of the property..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Street Address *</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3.5 text-gray-400" />
                  <input value={form.address} onChange={(e) => set("address", e.target.value)}
                    placeholder="15 Adeola Odeku Street"
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">City *</label>
                  <input value={form.city} onChange={(e) => set("city", e.target.value)}
                    placeholder="Victoria Island"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">State *</label>
                  <select value={form.state} onChange={(e) => set("state", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 bg-white">
                    {STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Number of Units</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => set("totalUnits", Math.max(1, Number(form.totalUnits) - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold">−</button>
                  <span className="text-[22px] font-black text-gray-900 w-12 text-center">{form.totalUnits}</span>
                  <button onClick={() => set("totalUnits", Number(form.totalUnits) + 1)}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold">+</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          {step === 2 && (
            <button onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">
              Back
            </button>
          )}
          {step === 1 ? (
            <button onClick={() => setStep(2)} disabled={!form.name}
              className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 transition-opacity"
              style={{ background: "var(--navy)" }}>
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving || !form.address || !form.city}
              className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
              style={{ background: "var(--emerald)" }}>
              {saving ? "Saving..." : "✓ Add Property"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
