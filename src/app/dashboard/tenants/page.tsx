import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/kpi-card";
import { mockTenants } from "@/lib/mock-data";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

export default function TenantsPage() {
  const active = mockTenants.filter((t) => t.paymentStatus !== "OVERDUE").length;
  const overdue = mockTenants.filter((t) => t.paymentStatus === "OVERDUE").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Tenant Management" action={{ label: "Add Tenant" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Active Tenants" value={`${mockTenants.length}`} accentColor="var(--emerald)" />
          <KPICard label="Onboarding" value="8" accentColor="#3B82F6" />
          <KPICard label="Overdue" value={`${overdue}`} accentColor="#EF4444" />
          <KPICard label="Move-outs This Month" value="3" accentColor="var(--gold)" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle sub="312 active tenants · 8 pending onboarding">Tenant Directory</CardTitle>
            <div className="flex gap-2">
              <select className="text-[12px] border border-gray-100 px-3 py-1.5 rounded-lg outline-none text-gray-600 bg-white">
                <option>All Properties</option>
              </select>
              <select className="text-[12px] border border-gray-100 px-3 py-1.5 rounded-lg outline-none text-gray-600 bg-white">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Overdue</option>
              </select>
              <button className="text-[11.5px] font-semibold text-gray-500 border border-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-50">Export</button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Tenant", "Unit / Property", "Lease End", "Monthly Rent", "Payment Status", "KYC", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.5px] border-b border-gray-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockTenants.map((t) => {
                  const colors = ["bg-yellow-100 text-yellow-700", "bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700", "bg-red-100 text-red-700", "bg-purple-100 text-purple-700"];
                  const color = colors[parseInt(t.id.slice(1)) % colors.length];
                  return (
                    <tr key={t.id} className="hover:bg-yellow-50/30 border-b border-gray-100 last:border-0 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] flex-shrink-0 ${color}`}>
                            {getInitials(`${t.firstName} ${t.lastName}`)}
                          </div>
                          <div>
                            <div className="text-[12.5px] font-semibold text-gray-900">{t.firstName} {t.lastName}</div>
                            <div className="text-[11px] text-gray-400">{t.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[12.5px] font-medium text-gray-900">Unit {t.unitNumber}</div>
                        <div className="text-[11px] text-gray-400">{t.propertyName}</div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{formatDate(t.leaseEnd)}</td>
                      <td className="px-4 py-3 text-[12.5px] font-semibold text-gray-900">{formatCurrency(t.monthlyRent)}/mo</td>
                      <td className="px-4 py-3"><Badge variant={statusToBadgeVariant(t.paymentStatus)}>{t.paymentStatus}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={statusToBadgeVariant(t.kycStatus)}>{t.kycStatus}</Badge></td>
                      <td className="px-4 py-3">
                        <button className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View →</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
