import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { Users, Phone, Mail, MessageCircle } from "lucide-react";

export default async function StaffTenantsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const tenants = await db.tenant.findMany({
    include: {
      user: true,
      leases: {
        include: { unit: { include: { property: true } } },
        orderBy: { startDate: "desc" },
        take: 1,
      },
      payments: { where: { status: "OVERDUE" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const active = tenants.filter((t) => t.leases.some((l) => l.status === "ACTIVE"));
  const withOverdue = tenants.filter((t) => t.payments.length > 0);
  const verified = tenants.filter((t) => t.kycStatus === "VERIFIED");

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="Tenants & Accounts" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Tenants", value: tenants.length, color: "var(--navy)" },
            { label: "Active Leases", value: active.length, color: "var(--emerald)" },
            { label: "Overdue Accounts", value: withOverdue.length, color: withOverdue.length > 0 ? "#EF4444" : "var(--emerald)" },
            { label: "KYC Verified", value: verified.length, color: "#3B82F6" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <div className="font-bold text-gray-900 text-[14px]">All Tenants ({tenants.length})</div>
          </div>
          {tenants.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">👤</div>
              <div className="text-[15px] font-bold text-gray-700">No Tenants</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Tenant", "Property · Unit", "Rent", "KYC", "Overdue", "Contact"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => {
                    const lease = t.leases[0];
                    const isActive = lease?.status === "ACTIVE";
                    const overdueAmt = t.payments.reduce((s, p) => s + p.amount, 0);
                    return (
                      <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[var(--navy)] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                              {t.user.firstName?.[0]}{t.user.lastName?.[0]}
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-gray-900">{t.user.firstName} {t.user.lastName}</div>
                              <div className="text-[11px] text-gray-400">{t.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[12px] text-gray-600">
                          {lease ? (
                            <div>
                              <div className="font-semibold">{lease.unit.property.name}</div>
                              <div className="text-gray-400">Unit {lease.unit.unitNumber}</div>
                            </div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-5 py-3 text-[12.5px] font-bold" style={{ color: "var(--navy)" }}>
                          {lease ? formatCurrency(lease.rentAmount) : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.kycStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-700" :
                            t.kycStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"}`}>{t.kycStatus}</span>
                        </td>
                        <td className="px-5 py-3">
                          {overdueAmt > 0 ? (
                            <span className="text-[12px] font-bold text-red-600">{formatCurrency(overdueAmt)}</span>
                          ) : (
                            <span className="text-[12px] text-emerald-600 font-semibold">Clear</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {t.user.phone && (
                              <>
                                <a href={`tel:${t.user.phone}`} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center" title="Call">
                                  <Phone size={11} className="text-blue-600" />
                                </a>
                                <a href={`https://wa.me/${t.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${t.user.firstName}, this is ${user.firstName} from Veethrill Realty.`)}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center" title="WhatsApp">
                                  <MessageCircle size={11} className="text-green-600" />
                                </a>
                              </>
                            )}
                            <a href={`mailto:${t.user.email}`} className="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center" title="Email">
                              <Mail size={11} className="text-purple-600" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
