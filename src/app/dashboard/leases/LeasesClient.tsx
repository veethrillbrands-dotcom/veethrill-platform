"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AddLeaseModal } from "@/components/modals/AddLeaseModal";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { XCircle, RefreshCw } from "lucide-react";

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  ACTIVE: "success", PENDING: "warning", EXPIRED: "error", TERMINATED: "error", RENEWED: "info",
};

type Lease = {
  id: string; startDate: string; endDate: string; rentAmount: number; depositAmount: number;
  autoRenew: boolean; status: string;
  unit: { unitNumber: string; property: { name: string } };
  tenant: { user: { firstName: string; lastName: string; email: string } };
};

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
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
                    {l.status === "ACTIVE" && (
                      <>
                        <button onClick={() => updateLease(l.id, {
                          status: "RENEWED",
                          endDate: new Date(new Date(l.endDate).setFullYear(new Date(l.endDate).getFullYear() + 1)).toISOString(),
                        })} disabled={loading === l.id} title="Renew 1 year"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[10.5px] font-semibold text-blue-700 transition-colors">
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
  );
}
