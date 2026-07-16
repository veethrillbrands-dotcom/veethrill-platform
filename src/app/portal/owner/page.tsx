import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { Building2, CreditCard, Home, FileText } from "lucide-react";

export default async function OwnerPortalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });

  // Show all properties (in a real system, link properties to owners via ownerId)
  const properties = await db.property.findMany({
    include: { units: { include: { leases: { where: { status: "ACTIVE" } } } } },
    orderBy: { createdAt: "desc" },
  });

  const invoices = user
    ? await db.invoice.findMany({
        where: { recipientEmail: user.email, status: { in: ["APPROVED", "SENT", "PAID"] } },
        orderBy: { issuedAt: "desc" }, take: 10,
      })
    : [];

  const totalUnits = properties.reduce((s, p) => s + p.units.length, 0);
  const occupied = properties.reduce((s, p) => s + p.units.filter((u) => u.leases.length > 0).length, 0);
  const monthlyRevenue = properties.reduce((s, p) => s + p.units.filter((u) => u.leases.length > 0).reduce((us, u) => us + u.monthlyRent, 0), 0);

  const STATUS_COLOR: Record<string, string> = {
    APPROVED: "bg-blue-100 text-blue-700", SENT: "bg-yellow-100 text-yellow-700", PAID: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="Owner Dashboard" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, var(--navy), #1a3a5c)" }}>
          <div className="text-[13px] text-white/60">Welcome back</div>
          <div className="text-[22px] font-black mt-0.5">{user?.firstName} {user?.lastName}</div>
          <div className="text-[13px] text-white/60 mt-1">Property Owner · Veethrill Platform</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Properties", value: properties.length, icon: <Building2 size={15} />, color: "var(--navy)" },
            { label: "Total Units", value: totalUnits, icon: <Home size={15} />, color: "#3B82F6" },
            { label: "Occupied", value: occupied, icon: <Home size={15} />, color: "var(--emerald)" },
            { label: "Monthly Revenue", value: formatCurrency(monthlyRevenue), icon: <CreditCard size={15} />, color: "var(--gold)" },
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

        {/* Properties */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">My Properties</div>
          <div className="divide-y divide-gray-50">
            {properties.map((p) => {
              const occ = p.units.filter((u) => u.leases.length > 0).length;
              const rev = p.units.filter((u) => u.leases.length > 0).reduce((s, u) => s + u.monthlyRent, 0);
              return (
                <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-xl flex-shrink-0">🏢</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-gray-900 truncate">{p.name}</div>
                    <div className="text-[11.5px] text-gray-400">{p.city} · {p.units.length} units · {occ} occupied</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(rev)}<span className="text-[10px] text-gray-400 font-normal">/mo</span></div>
                    <div className="text-[10.5px] font-semibold" style={{ color: "var(--emerald)" }}>{p.units.length > 0 ? Math.round((occ / p.units.length) * 100) : 0}% occ.</div>
                  </div>
                </div>
              );
            })}
            {properties.length === 0 && <div className="text-center text-gray-400 py-8 text-[13px]">No properties linked to your account yet.</div>}
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <FileText size={14} className="text-gray-400" />
            <div className="font-bold text-gray-900 text-[14px]">Invoices & Receipts</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50">
                    <td className="px-5 py-3 text-[12px] font-bold text-gray-900">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-[12px] text-gray-600 truncate max-w-[200px]">{inv.description}</td>
                    <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(inv.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status] ?? "bg-gray-100 text-gray-600"}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan={4} className="text-center text-gray-400 py-8 text-[13px]">No invoices yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
