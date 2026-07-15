"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AddLeaseModal } from "@/components/modals/AddLeaseModal";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { XCircle, RefreshCw, Eye, X, FileText } from "lucide-react";

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  ACTIVE: "success", PENDING: "warning", EXPIRED: "error", TERMINATED: "error", RENEWED: "info",
};

type Lease = {
  id: string; startDate: string; endDate: string; rentAmount: number; depositAmount: number;
  autoRenew: boolean; status: string; specialTerms?: string | null;
  unit: { unitNumber: string; property: { name: string; address?: string } };
  tenant: { user: { firstName: string; lastName: string; email: string; phone?: string | null } };
};

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function LeaseDetailModal({ lease, onClose }: { lease: Lease; onClose: () => void }) {
  const days = daysUntil(lease.endDate);
  const expiring = lease.status === "ACTIVE" && days <= 60;
  const durationMonths = Math.round((new Date(lease.endDate).getTime() - new Date(lease.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-yellow-400" />
            <div>
              <div className="text-[15px] font-bold text-white">Lease Agreement</div>
              <div className="text-[11px] text-white/50">Unit {lease.unit.unitNumber} · {lease.unit.property.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Status banner */}
          <div className={`rounded-xl p-3 flex items-center justify-between ${expiring ? "bg-red-50" : lease.status === "ACTIVE" ? "bg-emerald-50" : "bg-gray-50"}`}>
            <div className={`text-[13px] font-bold ${expiring ? "text-red-700" : lease.status === "ACTIVE" ? "text-emerald-700" : "text-gray-700"}`}>
              {expiring ? `⚠️ Expiring in ${days} days` : `Lease ${lease.status}`}
            </div>
            <Badge variant={STATUS_BADGE[lease.status] ?? "default"}>{lease.status}</Badge>
          </div>

          {/* Tenant */}
          <section>
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-2">Tenant</div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <div className="text-[14px] font-bold text-gray-900">{lease.tenant.user.firstName} {lease.tenant.user.lastName}</div>
              <div className="text-[12.5px] text-gray-600">{lease.tenant.user.email}</div>
              {lease.tenant.user.phone && <div className="text-[12.5px] text-gray-600">{lease.tenant.user.phone}</div>}
            </div>
          </section>

          {/* Property */}
          <section>
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-2">Property</div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-[14px] font-bold text-gray-900">Unit {lease.unit.unitNumber} — {lease.unit.property.name}</div>
              {lease.unit.property.address && <div className="text-[12.5px] text-gray-500 mt-0.5">{lease.unit.property.address}</div>}
            </div>
          </section>

          {/* Financial & Dates */}
          <section>
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-2">Financial Terms</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Monthly Rent", value: formatCurrency(lease.rentAmount), highlight: true },
                { label: "Security Deposit", value: formatCurrency(lease.depositAmount), highlight: false },
                { label: "Start Date", value: formatDate(lease.startDate), highlight: false },
                { label: "End Date", value: formatDate(lease.endDate), highlight: false },
                { label: "Duration", value: `${durationMonths} months`, highlight: false },
                { label: "Auto-Renew", value: lease.autoRenew ? "Yes" : "No", highlight: false },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{item.label}</div>
                  <div className={`text-[14px] font-black ${item.highlight ? "text-emerald-600" : "text-gray-800"}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          {lease.specialTerms && (
            <section>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-2">Special Terms</div>
              <div className="bg-yellow-50 rounded-xl p-4 text-[13px] text-gray-700">{lease.specialTerms}</div>
            </section>
          )}
        </div>

        <div className="px-6 pb-6 flex-shrink-0">
          <button onClick={onClose} className="w-full py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

export function LeasesTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Leases" action={{ label: "New Lease", onClick: () => setOpen(true) }} />
      {open && <AddLeaseModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function LeasesTable({ leases }: { leases: Lease[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [viewingLease, setViewingLease] = useState<Lease | null>(null);

  async function updateLease(id: string, data: object) {
    setLoading(id);
    await fetch(`/api/leases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["Tenant", "Unit · Property", "Start", "End", "Rent/month", "Deposit", "Auto-renew", "Status", ""].map((h) => (
                <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leases.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-gray-400 py-10 text-[13px]">No leases found.</td></tr>
            ) : leases.map((l) => {
              const days = daysUntil(l.endDate);
              const expiring = l.status === "ACTIVE" && days <= 60;
              return (
                <tr key={l.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors group ${expiring ? "bg-red-50/30" : ""}`}>
                  <td className="px-4 py-3 pl-5">
                    <div className="text-[13px] font-semibold text-gray-900">{l.tenant.user.firstName} {l.tenant.user.lastName}</div>
                    <div className="text-[11px] text-gray-400">{l.tenant.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[12px] font-semibold text-gray-900">Unit {l.unit.unitNumber}</div>
                    <div className="text-[11px] text-gray-400">{l.unit.property.name}</div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">{formatDate(l.startDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`text-[12px] font-semibold ${expiring ? "text-red-600" : "text-gray-600"}`}>{formatDate(l.endDate)}</div>
                    {expiring && <div className="text-[10px] text-red-500 font-bold">{days}d left</div>}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-black" style={{ color: "var(--navy)" }}>{formatCurrency(l.rentAmount)}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-600">{formatCurrency(l.depositAmount)}</td>
                  <td className="px-4 py-3">
                    {l.autoRenew
                      ? <span className="text-[10.5px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Auto ↻</span>
                      : <span className="text-[10.5px] text-gray-400">Manual</span>}
                  </td>
                  <td className="px-4 py-3"><Badge variant={STATUS_BADGE[l.status] ?? "default"}>{l.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewingLease(l)} title="View Details"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[10.5px] font-semibold text-blue-700 transition-colors">
                        <Eye size={10} />View
                      </button>
                      {l.status === "ACTIVE" && (
                        <>
                          <button onClick={() => updateLease(l.id, {
                            status: "RENEWED",
                            endDate: new Date(new Date(l.endDate).setFullYear(new Date(l.endDate).getFullYear() + 1)).toISOString(),
                          })} disabled={loading === l.id} title="Renew 1 year"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[10.5px] font-semibold text-emerald-700 transition-colors">
                            <RefreshCw size={10} />Renew
                          </button>
                          <button onClick={() => { if (confirm("Terminate this lease?")) updateLease(l.id, { status: "TERMINATED" }); }}
                            disabled={loading === l.id} title="Terminate"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[10.5px] font-semibold text-red-600 transition-colors">
                            <XCircle size={10} />End
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {viewingLease && <LeaseDetailModal lease={viewingLease} onClose={() => setViewingLease(null)} />}
    </>
  );
}
