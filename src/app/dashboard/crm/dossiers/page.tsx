"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { X, FileText, TrendingUp, MapPin, Building2 } from "lucide-react";

type Dossier = {
  id: string; title: string; type: string; location: string; totalUnits: number; priceFrom: number;
  priceTo: number; developer: string; completionDate: string; yieldEstimate: number;
  status: string; highlights: string; targetInvestor: string; createdAt: string;
};

const SEED: Dossier[] = [
  { id: "1", title: "Ikoyi Waterfront Towers", type: "Luxury Residential", location: "Ikoyi, Lagos", totalUnits: 48, priceFrom: 250000000, priceTo: 850000000, developer: "Eko Landmark Devs", completionDate: "2027-Q2", yieldEstimate: 8.5, status: "Active", highlights: "Panoramic ocean views, smart home automation, penthouse collection", targetInvestor: "HNI / Diaspora", createdAt: "2026-01-10" },
  { id: "2", title: "Lekki Tech District Hub", type: "Mixed-Use Commercial", location: "Lekki Phase 2, Lagos", totalUnits: 120, priceFrom: 35000000, priceTo: 180000000, developer: "FutureBuild NG", completionDate: "2026-Q4", yieldEstimate: 11.2, status: "Active", highlights: "Co-working, retail, and residential blend; on Lekki-Epe Expressway", targetInvestor: "Corporate / Institutional", createdAt: "2026-02-15" },
  { id: "3", title: "Abuja Garden Estates", type: "Affordable Residential", location: "Lugbe, Abuja", totalUnits: 200, priceFrom: 18000000, priceTo: 45000000, developer: "Capital Homes Ltd", completionDate: "2028-Q1", yieldEstimate: 6.0, status: "Sold Out", highlights: "Solar-powered, government-approved estate, good transport links", targetInvestor: "Middle Income / NHF", createdAt: "2026-03-01" },
  { id: "4", title: "Port Harcourt Shoreline", type: "Shortlet/Hospitality", location: "GRA Phase 2, Port Harcourt", totalUnits: 32, priceFrom: 45000000, priceTo: 90000000, developer: "Rivers Realty", completionDate: "2027-Q1", yieldEstimate: 14.0, status: "Coming Soon", highlights: "Serviced apartments for corporate guests and oil sector workers", targetInvestor: "Diaspora / HNI", createdAt: "2026-04-20" },
];

const TYPES = ["Luxury Residential", "Mixed-Use Commercial", "Affordable Residential", "Shortlet/Hospitality", "Industrial", "Land"];
const STATUS_BADGE: Record<string, "success" | "info" | "warning" | "error" | "default"> = {
  Active: "success", "Coming Soon": "info", "Sold Out": "default", Archived: "error",
};

function AddDossierModal({ onAdd, onClose }: { onAdd: (d: Dossier) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: "", type: "Luxury Residential", location: "", totalUnits: "", priceFrom: "", priceTo: "",
    developer: "", completionDate: "", yieldEstimate: "", targetInvestor: "HNI / Diaspora", highlights: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    onAdd({
      ...form, id: Date.now().toString(), totalUnits: Number(form.totalUnits),
      priceFrom: Number(form.priceFrom), priceTo: Number(form.priceTo),
      yieldEstimate: Number(form.yieldEstimate), status: "Active",
      createdAt: new Date().toISOString().split("T")[0],
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Create Investment Dossier</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Development Name</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Location</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Total Units</label>
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
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Developer</label>
              <input value={form.developer} onChange={(e) => set("developer", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Completion</label>
              <input placeholder="e.g. 2027-Q2" value={form.completionDate} onChange={(e) => set("completionDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Est. Yield (%)</label>
              <input type="number" step="0.1" value={form.yieldEstimate} onChange={(e) => set("yieldEstimate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Target Investor</label>
              <select value={form.targetInvestor} onChange={(e) => set("targetInvestor", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {["HNI / Diaspora", "Middle Income / NHF", "Corporate / Institutional", "Retail", "All"].map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Key Highlights</label>
            <textarea value={form.highlights} onChange={(e) => set("highlights", e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={!form.title || !form.location}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            ✓ Create Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>(SEED);
  const [adding, setAdding] = useState(false);

  const activeDossiers = dossiers.filter((d) => d.status === "Active");
  const totalValue = dossiers.reduce((s, d) => s + d.totalUnits * d.priceFrom, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Investment Dossiers" action={{ label: "New Dossier", onClick: () => setAdding(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Dossiers", value: dossiers.length, icon: <FileText size={16} />, color: "var(--navy)" },
            { label: "Active Listings", value: activeDossiers.length, icon: <Building2 size={16} />, color: "var(--emerald)" },
            { label: "Portfolio Value", value: formatCurrency(totalValue), icon: <TrendingUp size={16} />, color: "var(--gold)" },
            { label: "Locations", value: new Set(dossiers.map((d) => d.location.split(",")[1]?.trim())).size, icon: <MapPin size={16} />, color: "#3B82F6" },
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

        <div className="grid grid-cols-2 gap-4">
          {dossiers.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[15px] font-bold text-gray-900">{d.title}</div>
                  <div className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={12} />{d.location}</div>
                </div>
                <Badge variant={STATUS_BADGE[d.status] ?? "default"}>{d.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-gray-400 mb-0.5">Units</div>
                  <div className="text-[14px] font-black" style={{ color: "var(--navy)" }}>{d.totalUnits}</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-gray-400 mb-0.5">Est. Yield</div>
                  <div className="text-[14px] font-black text-emerald-600">{d.yieldEstimate}%</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-gray-400 mb-0.5">Completion</div>
                  <div className="text-[12px] font-bold text-yellow-700">{d.completionDate}</div>
                </div>
              </div>
              <div className="text-[12px] text-gray-700 mb-1">
                <span className="font-semibold" style={{ color: "var(--emerald)" }}>{formatCurrency(d.priceFrom)}</span>
                <span className="text-gray-400"> — </span>
                <span className="font-semibold" style={{ color: "var(--navy)" }}>{formatCurrency(d.priceTo)}</span>
              </div>
              <div className="text-[11.5px] text-gray-500 mb-2">👤 {d.developer} · 🎯 {d.targetInvestor}</div>
              <div className="text-[11.5px] text-gray-400 italic">{d.highlights}</div>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle sub="Comparison view">Dossier Comparison Table</CardTitle></CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Development", "Type", "Location", "Units", "Price Range", "Yield", "Developer", "Completion", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dossiers.map((d) => (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 pl-5 text-[13px] font-semibold text-gray-900">{d.title}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{d.type}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{d.location}</td>
                      <td className="px-4 py-3 text-[12.5px] font-semibold text-gray-900">{d.totalUnits}</td>
                      <td className="px-4 py-3 text-[11.5px] text-gray-700">{formatCurrency(d.priceFrom)} – {formatCurrency(d.priceTo)}</td>
                      <td className="px-4 py-3 text-[13px] font-black" style={{ color: "var(--emerald)" }}>{d.yieldEstimate}%</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{d.developer}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{d.completionDate}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_BADGE[d.status] ?? "default"}>{d.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
      {adding && <AddDossierModal onAdd={(d) => setDossiers((prev) => [d, ...prev])} onClose={() => setAdding(false)} />}
    </div>
  );
}
