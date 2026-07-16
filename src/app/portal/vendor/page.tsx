import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { VendorWorkOrdersClient } from "./VendorWorkOrdersClient";
import { Wrench, CheckCircle, Clock, FileText } from "lucide-react";

export default async function VendorPortalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId }, include: { vendor: true } });
  if (!user) redirect("/sign-in");

  const vendor = user.vendor;

  const [workOrders, invoices] = await Promise.all([
    vendor
      ? db.workOrder.findMany({
          where: { vendor: { userId: user.id } },
          include: { property: true, unit: true },
          orderBy: { createdAt: "desc" },
        })
      : [],
    db.invoice.findMany({
      where: { vendorId: vendor?.id },
      orderBy: { issuedAt: "desc" },
      take: 10,
    }),
  ]);

  const completed = workOrders.filter((w) => w.status === "COMPLETED").length;
  const open = workOrders.filter((w) => ["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(w.status)).length;
  const totalEarned = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0);

  const serializedOrders = workOrders.map((o) => ({
    ...o,
    raisedAt: o.raisedAt.toISOString(),
    completedAt: o.completedAt?.toISOString() ?? null,
    assignedAt: o.assignedAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    property: { name: o.property.name },
    unit: o.unit ? { unitNumber: o.unit.unitNumber } : null,
  }));

  const STATUS_COLOR: Record<string, string> = {
    APPROVED: "bg-blue-100 text-blue-700", SENT: "bg-yellow-100 text-yellow-700", PAID: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PortalTopbar title="Vendor Dashboard" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, var(--navy), #1a3a5c)" }}>
          <div className="text-[13px] text-white/60">Welcome back</div>
          <div className="text-[22px] font-black mt-0.5">{user.firstName} {user.lastName}</div>
          <div className="text-[13px] text-white/60 mt-1">{vendor?.companyName ?? "Vendor"} · {vendor?.specialization?.join(", ") ?? ""}</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Open Jobs", value: open, icon: <Wrench size={15} />, color: "var(--gold)" },
            { label: "Completed", value: completed, icon: <CheckCircle size={15} />, color: "var(--emerald)" },
            { label: "Total Jobs", value: workOrders.length, icon: <Clock size={15} />, color: "var(--navy)" },
            { label: "Total Earned", value: formatCurrency(totalEarned), icon: <FileText size={15} />, color: "#3B82F6" },
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

        <VendorWorkOrdersClient orders={serializedOrders} />

        {/* Invoices */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">My Invoices</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8 text-[13px]">No invoices yet.</td></tr>
                ) : invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50">
                    <td className="px-5 py-3 text-[12px] font-bold text-gray-900">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-[12px] text-gray-600 truncate max-w-[200px]">{inv.description}</td>
                    <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(inv.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status] ?? "bg-gray-100 text-gray-600"}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
