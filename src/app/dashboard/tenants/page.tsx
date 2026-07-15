import { TenantsTopbar, TenantRowActions } from "./TenantsClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { getInitials } from "@/lib/utils";
import { UserCheck, Users, Clock, CheckCircle } from "lucide-react";

async function getTenants() {
  return db.tenant.findMany({
    include: {
      user: true,
      leases: { include: { unit: { include: { property: true } } }, where: { status: "ACTIVE" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

const KYC_VARIANT: Record<string, "success" | "warning" | "error" | "default"> = {
  VERIFIED: "success", PENDING: "warning", REJECTED: "error",
};

export default async function TenantsPage() {
  const tenants = await getTenants();

  const verified = tenants.filter((t) => t.kycStatus === "VERIFIED").length;
  const pending = tenants.filter((t) => t.kycStatus === "PENDING").length;
  const withLease = tenants.filter((t) => t.leases.length > 0).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TenantsTopbar />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Tenants", value: tenants.length, icon: <Users size={16} />, color: "var(--navy)" },
            { label: "KYC Verified", value: verified, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "KYC Pending", value: pending, icon: <Clock size={16} />, color: "var(--gold)" },
            { label: "Active Leases", value: withLease, icon: <UserCheck size={16} />, color: "#3B82F6" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>
                {k.icon}
              </div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-[22px] font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tenants Table */}
        <Card>
          <CardHeader>
            <CardTitle sub={`${tenants.length} registered tenants`}>Tenant Directory</CardTitle>
            <button className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              Export CSV
            </button>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Tenant", "Contact", "Unit", "Property", "KYC", "Employer", "Lease Status", ""].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenants.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-gray-400 py-10 text-[13px]">No tenants yet.</td></tr>
                  ) : tenants.map((t) => {
                    const activeLease = t.leases[0];
                    return (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                        <td className="px-4 py-3 pl-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] flex-shrink-0"
                              style={{ background: "linear-gradient(135deg, var(--gold), #b8960a)", color: "var(--navy)" }}>
                              {getInitials(`${t.user.firstName} ${t.user.lastName}`)}
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-gray-900">{t.user.firstName} {t.user.lastName}</div>
                              <div className="text-[11px] text-gray-400">{t.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{t.user.phone ?? "—"}</td>
                        <td className="px-4 py-3">
                          {activeLease ? (
                            <span className="text-[12px] font-semibold text-gray-900">Unit {activeLease.unit.unitNumber}</span>
                          ) : <span className="text-gray-400 text-[12px]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">
                          {activeLease?.unit.property.name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={KYC_VARIANT[t.kycStatus] ?? "default"}>{t.kycStatus}</Badge>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">{t.employerName ?? "—"}</td>
                        <td className="px-4 py-3">
                          {activeLease ? (
                            <Badge variant="success">ACTIVE</Badge>
                          ) : (
                            <Badge variant="default">NO LEASE</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <TenantRowActions tenant={t} />
                          </div>
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
