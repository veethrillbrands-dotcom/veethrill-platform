import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { TenantMaintenanceClient } from "./TenantMaintenanceClient";
import { FileText, CreditCard, Wrench, Home } from "lucide-react";

async function getTenantData(clerkId: string) {
  const user = await db.user.findUnique({
    where: { clerkId },
    include: {
      tenant: {
        include: {
          leases: {
            where: { status: "ACTIVE" },
            include: { unit: { include: { property: true } } },
            take: 1,
          },
          payments: { orderBy: { dueDate: "desc" }, take: 10 },
        },
      },
    },
  });
  return user;
}

export default async function TenantHomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getTenantData(userId);
  const tenant = user?.tenant;
  const lease = tenant?.leases[0];
  const payments = tenant?.payments ?? [];

  const overdue = payments.filter((p) => p.status === "OVERDUE");
  const upcoming = payments.find((p) => p.status === "PENDING");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PortalTopbar title="My Dashboard" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        {/* Welcome */}
        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, var(--navy), #1a3a5c)" }}>
          <div className="text-[13px] text-white/60 mb-1">Welcome back</div>
          <div className="text-[22px] font-black">{user?.firstName} {user?.lastName}</div>
          {lease ? (
            <div className="text-[13px] text-white/70 mt-1">
              {lease.unit.property.name} · Unit {lease.unit.unitNumber} · Lease ends {new Date(lease.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          ) : (
            <div className="text-[13px] text-white/50 mt-1">No active lease found</div>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Monthly Rent", value: lease ? formatCurrency(lease.rentAmount) : "—", icon: <Home size={15} />, color: "var(--navy)" },
            { label: "Overdue", value: overdue.length > 0 ? formatCurrency(overdue.reduce((s, p) => s + p.amount, 0)) : "None", icon: <CreditCard size={15} />, color: overdue.length > 0 ? "#EF4444" : "var(--emerald)" },
            { label: "Next Payment", value: upcoming ? formatCurrency(upcoming.amount) : "—", icon: <CreditCard size={15} />, color: "var(--gold)" },
            { label: "KYC Status", value: tenant?.kycStatus ?? "—", icon: <FileText size={15} />, color: tenant?.kycStatus === "VERIFIED" ? "var(--emerald)" : "var(--gold)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-[16px] font-black text-gray-900">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="font-bold text-gray-900 text-[14px]">Recent Payments</div>
            <a href="/portal/tenant/payments" className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {payments.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 text-[12.5px] font-semibold text-gray-900">{p.type}</td>
                    <td className="px-5 py-3 text-[12.5px] text-gray-600">{new Date(p.dueDate).toLocaleDateString("en-GB")}</td>
                    <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                        p.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8 text-[13px]">No payment records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance */}
        <TenantMaintenanceClient tenantId={tenant?.id ?? ""} propertyId={lease?.unit.propertyId ?? ""} unitId={lease?.unitId ?? ""} />

      </div>
    </div>
  );
}
