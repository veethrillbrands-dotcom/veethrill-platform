import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";

async function getLeases() {
  return db.lease.findMany({
    include: {
      unit: { include: { property: true } },
      tenant: { include: { user: true } },
    },
    orderBy: { endDate: "asc" },
  });
}

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  ACTIVE: "success", PENDING: "warning", EXPIRED: "error", TERMINATED: "error", RENEWED: "info",
};

function daysUntil(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

export default async function LeasesPage() {
  const leases = await getLeases();

  const active = leases.filter((l) => l.status === "ACTIVE").length;
  const expiringSoon = leases.filter((l) => l.status === "ACTIVE" && daysUntil(l.endDate) <= 60).length;
  const totalRentRoll = leases.filter((l) => l.status === "ACTIVE").reduce((s, l) => s + l.rentAmount, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Leases" action={{ label: "New Lease" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Leases", value: leases.length, icon: <FileText size={16} />, color: "var(--navy)" },
            { label: "Active", value: active, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Expiring (60d)", value: expiringSoon, icon: <AlertTriangle size={16} />, color: expiringSoon > 0 ? "#EF4444" : "var(--gold)" },
            { label: "Monthly Rent Roll", value: formatCurrency(totalRentRoll), icon: <Clock size={16} />, color: "var(--gold)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>
                {k.icon}
              </div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-[18px] font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Leases Table */}
        <Card>
          <CardHeader>
            <CardTitle sub={`${leases.length} lease agreements`}>Lease Register</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Tenant", "Unit · Property", "Start", "End", "Rent/month", "Deposit", "Auto-renew", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leases.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-gray-400 py-10 text-[13px]">No leases found.</td></tr>
                  ) : leases.map((l) => {
                    const days = daysUntil(l.endDate);
                    const expiring = l.status === "ACTIVE" && days <= 60;
                    return (
                      <tr key={l.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${expiring ? "bg-red-50/30" : ""}`}>
                        <td className="px-4 py-3 pl-5">
                          <div className="text-[13px] font-semibold text-gray-900">{l.tenant.user.firstName} {l.tenant.user.lastName}</div>
                          <div className="text-[11px] text-gray-400">{l.tenant.user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[12px] font-semibold text-gray-900">Unit {l.unit.unitNumber}</div>
                          <div className="text-[11px] text-gray-400">{l.unit.property.name}</div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">{formatDate(l.startDate.toISOString())}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className={`text-[12px] font-semibold ${expiring ? "text-red-600" : "text-gray-600"}`}>
                            {formatDate(l.endDate.toISOString())}
                          </div>
                          {expiring && <div className="text-[10px] text-red-500 font-bold">{days}d left</div>}
                        </td>
                        <td className="px-4 py-3 text-[13px] font-black" style={{ color: "var(--navy)" }}>{formatCurrency(l.rentAmount)}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{formatCurrency(l.depositAmount)}</td>
                        <td className="px-4 py-3">
                          {l.autoRenew ? (
                            <span className="text-[10.5px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Auto ↻</span>
                          ) : (
                            <span className="text-[10.5px] text-gray-400">Manual</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_BADGE[l.status] ?? "default"}>{l.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
