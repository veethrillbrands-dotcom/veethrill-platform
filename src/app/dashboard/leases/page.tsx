import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/kpi-card";
import { mockLeases } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export default function LeasesPage() {
  const active = mockLeases.filter((l) => l.status === "ACTIVE").length;
  const expiring = mockLeases.filter((l) => l.status === "EXPIRED").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Lease Management" action={{ label: "New Lease" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Active Leases" value={`${active}`} accentColor="var(--emerald)" />
          <KPICard label="Expiring (30 days)" value="3" accentColor="#EF4444" />
          <KPICard label="Auto-Renewing" value={`${mockLeases.filter((l) => l.autoRenew).length}`} accentColor="var(--gold)" />
          <KPICard label="Renewal Rate" value="78.5%" change={2.3} accentColor="var(--navy)" />
        </div>

        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-yellow-600 flex-shrink-0" />
          <p className="text-[12.5px] text-gray-800 flex-1">
            <strong>3 leases expiring</strong> in the next 30 days. Send renewal offers to avoid vacancies.
          </p>
          <button className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: "var(--gold)", color: "var(--navy)" }}>
            Send Renewals
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle sub="Active lease agreements">Lease Register</CardTitle>
            <select className="text-[12px] border border-gray-100 px-3 py-1.5 rounded-lg outline-none text-gray-600 bg-white">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Expired</option>
              <option>Renewed</option>
            </select>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Tenant", "Unit / Property", "Start Date", "End Date", "Monthly Rent", "Deposit", "Auto-Renew", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.5px] border-b border-gray-100 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockLeases.map((l) => (
                  <tr key={l.id} className="hover:bg-yellow-50/30 border-b border-gray-100 last:border-0 transition-colors">
                    <td className="px-4 py-3 text-[12.5px] font-semibold text-gray-900">{l.tenantName}</td>
                    <td className="px-4 py-3">
                      <div className="text-[12px] font-medium text-gray-900">Unit {l.unitNumber}</div>
                      <div className="text-[11px] text-gray-400">{l.propertyName}</div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{formatDate(l.startDate)}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{formatDate(l.endDate)}</td>
                    <td className="px-4 py-3 text-[12.5px] font-bold text-gray-900">{formatCurrency(l.rentAmount)}/mo</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{formatCurrency(l.depositAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold ${l.autoRenew ? "text-emerald-600" : "text-gray-400"}`}>{l.autoRenew ? "✓ Yes" : "No"}</span>
                    </td>
                    <td className="px-4 py-3"><Badge variant={statusToBadgeVariant(l.status)}>{l.status}</Badge></td>
                    <td className="px-4 py-3">
                      <button className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
