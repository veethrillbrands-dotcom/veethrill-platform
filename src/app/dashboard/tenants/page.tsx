import { TenantsTopbar, TenantsTable } from "./TenantsClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { db } from "@/lib/db";
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
          </CardHeader>
          <CardBody noPad>
            <div className="px-5 pt-4">
              <TenantsTable tenants={tenants.map((t) => ({
                id: t.id, kycStatus: t.kycStatus, employerName: t.employerName,
                user: { firstName: t.user.firstName, lastName: t.user.lastName, email: t.user.email, phone: t.user.phone },
                activeUnit: t.leases[0]?.unit.unitNumber ?? null,
                activeProperty: t.leases[0]?.unit.property.name ?? null,
              }))} />
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
